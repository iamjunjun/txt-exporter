import { App, Plugin, PluginSettingTab, Setting, TFile, TFolder, Notice } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';
import { remote } from 'electron';

interface ExportSettings {
  stripFrontmatter: boolean;  // 去除 YAML 头部
  stripMarkdown: boolean;     // 去除 markdown 格式符号
  compact: boolean;           // 段间无空行（紧凑）
}

const DEFAULT_SETTINGS: ExportSettings = {
  stripFrontmatter: true,
  stripMarkdown: true,
  compact: true,
};

export default class TxtExporterPlugin extends Plugin {
  settings: ExportSettings;

  async onload() {
    await this.loadSettings();

    // 右键菜单：.md 文件 / 文件夹
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        const isMd = file instanceof TFile && file.extension === 'md';
        const isFolder = file instanceof TFolder;
        if (!isMd && !isFolder) return;

        menu.addItem(item =>
          item
            .setTitle('导出为 TXT')
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
    new Notice(`已导出：${file.basename}.txt`);
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
      const outPath = path.join(subDir, `${f.basename}.txt`);
      await fs.promises.writeFile(outPath, content, 'utf-8');
    }

    new Notice(`已导出 ${mdFiles.length} 个文件 → ${folder.name}/`);
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
    containerEl.empty();

    containerEl.createEl('h2', { text: 'TXT Exporter' });
    containerEl.createEl('p', {
      text: '配置导出 txt 时的内容处理。右键文件/文件夹即可触发导出。',
    });

    new Setting(containerEl)
      .setName('去除 frontmatter')
      .setDesc('导出时移除 YAML 头部元数据（--- ... ---）')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.stripFrontmatter)
        .onChange(async (value) => {
          this.plugin.settings.stripFrontmatter = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('去除 markdown 标记')
      .setDesc('去掉 # 标题、**粗体**、[]() 链接等格式符号')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.stripMarkdown)
        .onChange(async (value) => {
          this.plugin.settings.stripMarkdown = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('段间无空行（紧凑）')
      .setDesc('段落之间不留空行，每个段落单独一行')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.compact)
        .onChange(async (value) => {
          this.plugin.settings.compact = value;
          await this.plugin.saveSettings();
        }));
  }
}
