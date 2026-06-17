import { App, Plugin, TFile, TFolder, Notice } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';
import { remote } from 'electron';

export default class TxtExporterPlugin extends Plugin {
  async onload() {
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
              if (file instanceof TFile) {
                await this.exportFile(file);
              } else {
                await this.exportFolder(file);
              }
            })
        );
      })
    );
  }

  // 弹出系统目录选择框
  async pickFolder(): Promise<string | null> {
    const result = await remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      { properties: ['openDirectory', 'createDirectory'] }
    );
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  }

  // 导出单个文件
  async exportFile(file: TFile) {
    const target = await this.pickFolder();
    if (!target) return;

    const content = await this.app.vault.cachedRead(file);
    const outPath = path.join(target, `${file.basename}.txt`);
    await fs.promises.writeFile(outPath, content, 'utf-8');
    new Notice(`已导出：${file.basename}.txt`);
  }

  // 导出整个文件夹（递归子文件夹，输出到同名子目录）
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
      const content = await this.app.vault.cachedRead(f);
      const outPath = path.join(subDir, `${f.basename}.txt`);
      await fs.promises.writeFile(outPath, content, 'utf-8');
    }

    new Notice(`已导出 ${mdFiles.length} 个文件 → ${folder.name}/`);
  }
}
