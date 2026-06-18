import { App, Plugin, PluginSettingTab, Setting, TFile, TFolder, Notice } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';
import { remote } from 'electron';
import { I18n } from './i18n';

interface ExportSettings {
  stripFrontmatter: boolean;    // 去除 YAML 头部
  stripMarkdown: boolean;       // 去除 markdown 格式符号
  compact: boolean;             // 段间无空行（紧凑）
  preserveHierarchy: boolean;   // 保留 vault 原目录层级
}

const DEFAULT_SETTINGS: ExportSettings = {
  stripFrontmatter: true,
  stripMarkdown: true,
  compact: true,
  preserveHierarchy: false,
};

export default class TxtExporterPlugin extends Plugin {
  settings: ExportSettings;
  i18n: I18n;

  async onload() {
    await this.loadSettings();
    this.i18n = new I18n();

    // 右键菜单：.md 文件 / 文件夹
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        const isMd = file instanceof TFile && file.extension === 'md';
        const isFolder = file instanceof TFolder;
        if (!isMd && !isFolder) return;

        menu.addItem(item =>
          item
            .setTitle(this.i18n.t('menu.title'))
            .setIcon('file-text')
            .onClick(async () => {
              if (file instanceof TFile) await this.exportFile(file);
              else await this.exportFolder(file);
            })
        );
      })
    );

    // 设置面板
    this.addSettingTab(new TxtExporterSettingTab(this.app, this));
  }

  // ---------- 配置持久化 ----------
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }

  // ---------- 工具方法 ----------
  async pickFolder(): Promise<string | null> {
    const result = await remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      { properties: ['openDirectory', 'createDirectory'] }
    );
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  }

  // 根据设置处理内容
  processContent(raw: string): string {
    let s = raw;
    if (this.settings.stripFrontmatter) {
      s = s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    }
    if (this.settings.stripMarkdown) {
      s = this.stripMarkdown(s);
    }
    if (this.settings.compact) {
      s = s
        .split('\n')
        .filter(line => line.trim() !== '')
        .join('\n');
    }
    return s;
  }

  // 简易 markdown 剥离
  stripMarkdown(md: string): string {
    // 1. 先把代码块内容提取出来保护，避免被后续 markdown 正则误处理
    const codeBlocks: string[] = [];
    let s = md.replace(/```[\w]*\n([\s\S]*?)```/g, (_match, content) => {
      codeBlocks.push(content);
      return `\u0000CB${codeBlocks.length - 1}\u0000`;
    });

    // 2. 处理其他 markdown
    s = s
      .replace(/`([^`]+)`/g, '$1')                          // 行内代码
      .replace(/<br\s*\/?>/gi, '\n')                        // <br> → 换行
      .replace(/<[^>]+>/g, '')                              // 其他 HTML 标签（<font color>、<span>、<mark> 等）
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')                 // 图片
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')              // 链接
      .replace(/^#+\s*/gm, '')                              // 标题
      .replace(/\*\*([^*]+)\*\*/g, '$1')                    // 粗体
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')                        // 斜体
      .replace(/_([^_]+)_/g, '$1')
      .replace(/^>\s*/gm, '')                               // 引用
      .replace(/^[\-\*]\s+/gm, '')                          // 无序列表
      .replace(/^\d+\.\s+/gm, '');                          // 有序列表

    // 3. 把代码块内容换回来
    for (let i = 0; i < codeBlocks.length; i++) {
      s = s.replace(`\u0000CB${i}\u0000`, codeBlocks[i]);
    }

    return s;
  }

  // ---------- 工具：找下一个可用文件名 ----------
  nextAvailablePath(dir: string, basename: string, ext: string): string {
    let n = 1;
    while (true) {
      const candidate = path.join(dir, `${basename} (${n})${ext}`);
      if (!fs.existsSync(candidate)) return candidate;
      n++;
    }
  }

  // ---------- 工具：找下一个可用文件夹名 ----------
  nextAvailableFolder(parentDir: string, basename: string): string {
    let n = 1;
    while (true) {
      const candidate = path.join(parentDir, `${basename} (${n})`);
      if (!fs.existsSync(candidate)) return candidate;
      n++;
    }
  }

  // ---------- 导出主流程 ----------
  async exportFile(file: TFile) {
    const target = await this.pickFolder();
    if (!target) return;

    let outPath = path.join(target, `${file.basename}.txt`);

    // 同名冲突检查
    if (fs.existsSync(outPath)) {
      const t = this.i18n.t.bind(this.i18n);
      const result = await remote.dialog.showMessageBox(
        remote.getCurrentWindow(),
        {
          type: 'warning',
          title: 'TXT Exporter',
          message: t('dialog.conflictSingle', { name: `${file.basename}.txt` }),
          detail: outPath,
          buttons: [t('dialog.overwrite'), t('dialog.rename'), t('dialog.cancel')],
          defaultId: 1,
          cancelId: 2,
        }
      );
      if (result.response === 2) return; // 取消
      if (result.response === 1) {       // 重命名
        outPath = this.nextAvailablePath(target, file.basename, '.txt');
      }
      // response === 0: 覆盖，继续
    }

    const content = this.processContent(await this.app.vault.cachedRead(file));
    await fs.promises.writeFile(outPath, content, 'utf-8');
    new Notice(this.i18n.t('notice.exportedFile', { name: path.basename(outPath) }));
  }

  async exportFolder(folder: TFolder) {
    const target = await this.pickFolder();
    if (!target) return;

    let subDir = path.join(target, folder.name);

    // 文件夹整体冲突检查
    if (fs.existsSync(subDir)) {
      const t = this.i18n.t.bind(this.i18n);
      const result = await remote.dialog.showMessageBox(
        remote.getCurrentWindow(),
        {
          type: 'warning',
          title: 'TXT Exporter',
          message: t('dialog.conflictFolder', { name: folder.name }),
          detail: subDir,
          buttons: [t('dialog.overwrite'), t('dialog.rename'), t('dialog.cancel')],
          defaultId: 1,  // 重命名（最安全）
          cancelId: 2,
        }
      );
      if (result.response === 2) return; // 取消
      if (result.response === 1) {       // 重命名整个文件夹
        subDir = this.nextAvailableFolder(target, folder.name);
      }
      // response === 0: 覆盖，里面的同名文件直接覆盖
    }

    await fs.promises.mkdir(subDir, { recursive: true });

    // 递归收集所有 .md
    const collect = (f: TFolder): TFile[] => {
      const out: TFile[] = [];
      for (const c of f.children) {
        if (c instanceof TFile && c.extension === 'md') {
          out.push(c);
        } else if (c instanceof TFolder) {
          out.push(...collect(c));
        }
      }
      return out;
    };
    const mdFiles = collect(folder);

    // 写入（选了"覆盖"则直接覆盖子文件，无需再检查冲突）
    for (const f of mdFiles) {
      const content = this.processContent(await this.app.vault.cachedRead(f));

      let outPath: string;
      if (this.settings.preserveHierarchy) {
        const rel = f.path.substring(folder.path.length + 1);
        const relDir = path.dirname(rel);
        const outDir = relDir === '.' ? subDir : path.join(subDir, relDir);
        await fs.promises.mkdir(outDir, { recursive: true });
        outPath = path.join(outDir, `${f.basename}.txt`);
      } else {
        outPath = path.join(subDir, `${f.basename}.txt`);
      }

      await fs.promises.writeFile(outPath, content, 'utf-8');
    }

    const suffix = this.settings.preserveHierarchy
      ? this.i18n.t('suffix.preserveHierarchy') : '';
    new Notice(this.i18n.t('notice.exportedFolder', {
      count: mdFiles.length, folder: path.basename(subDir), suffix,
    }));
  }
}

// ---------- 设置面板 ----------
class TxtExporterSettingTab extends PluginSettingTab {
  plugin: TxtExporterPlugin;

  constructor(app: App, plugin: TxtExporterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const t = (key: string) => this.plugin.i18n.t(key);
    containerEl.empty();

    containerEl.createEl('h2', { text: 'TXT Exporter' });
    containerEl.createEl('p', { text: t('settings.header') });

    new Setting(containerEl)
      .setName(t('settings.stripFrontmatter.name'))
      .setDesc(t('settings.stripFrontmatter.desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.stripFrontmatter)
        .onChange(async (value) => {
          this.plugin.settings.stripFrontmatter = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('settings.stripMarkdown.name'))
      .setDesc(t('settings.stripMarkdown.desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.stripMarkdown)
        .onChange(async (value) => {
          this.plugin.settings.stripMarkdown = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('settings.compact.name'))
      .setDesc(t('settings.compact.desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.compact)
        .onChange(async (value) => {
          this.plugin.settings.compact = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('settings.preserveHierarchy.name'))
      .setDesc(t('settings.preserveHierarchy.desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.preserveHierarchy)
        .onChange(async (value) => {
          this.plugin.settings.preserveHierarchy = value;
          await this.plugin.saveSettings();
        }));
  }
}