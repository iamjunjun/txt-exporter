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
    return md
      .replace(/```[\s\S]*?```/g, '')                      // 代码块
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
  }

  // ---------- 导出主流程 ----------
  async exportFile(file: TFile) {
    const target = await this.pickFolder();
    if (!target) return;

    const content = this.processContent(await this.app.vault.cachedRead(file));
    const outPath = path.join(target, `${file.basename}.txt`);
    await fs.promises.writeFile(outPath, content, 'utf-8');
    new Notice(this.i18n.t('notice.exportedFile', { name: `${file.basename}.txt` }));
  }

  async exportFolder(folder: TFolder) {
    const target = await this.pickFolder();
    if (!target) return;

    const subDir = path.join(target, folder.name);
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

    // 写入
    for (const f of mdFiles) {
      const content = this.processContent(await this.app.vault.cachedRead(f));

      let outPath: string;
      if (this.settings.preserveHierarchy) {
        // 保留 vault 原层级：计算相对 folder 路径
        const rel = f.path.substring(folder.path.length + 1);
        const relDir = path.dirname(rel);
        const outDir = relDir === '.' ? subDir : path.join(subDir, relDir);
        await fs.promises.mkdir(outDir, { recursive: true });
        outPath = path.join(outDir, `${f.basename}.txt`);
      } else {
        // 平铺
        outPath = path.join(subDir, `${f.basename}.txt`);
      }

      await fs.promises.writeFile(outPath, content, 'utf-8');
    }

    const suffix = this.settings.preserveHierarchy
      ? this.i18n.t('suffix.preserveHierarchy')
      : '';
    new Notice(this.i18n.t('notice.exportedFolder', {
      count: mdFiles.length,
      folder: folder.name,
      suffix,
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