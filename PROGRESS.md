# 开发进度(PROGRESS)

记录 TXT Exporter 插件的开发时间线、决策点和待办。

## v0.1.0 · 2026-06-17(立项)

### 目标

做一个 Obsidian 插件:右键 `.md` 文件 / 文件夹,导出为 `.txt`。

- **文件模式**:选目录 → 直接导出同名 `.txt`
- **文件夹模式**:选目录 → 在该目录下建同名子文件夹 → 递归所有 `.md` 写成 `.txt` 放进去

### 完成

- [x] 项目骨架(`main.ts` / `manifest.json` / `package.json` / `tsconfig.json` / `esbuild.config.mjs` / `.gitignore` / `README.md`)
- [x] 依赖安装:`npm install`(esbuild + obsidian + typescript + @types/node,共 16 个包)
- [x] esbuild 配置调通(加了 `platform: 'node'` 让它认识 `fs` / `path` 内置模块,并把这两个标为 `external`)
- [x] 首次 build 通过(产物 `main.js` 1.9K,minify 后 CJS)
- [x] git init + 首次 commit(main 分支,author 仅本仓库作用域:`linjun <hijustinlin@iCloud.com>`)
- [x] 进度文档(本文件)

### 决策记录

| 决策点 | 选择 | 理由 |
|---|---|---|
| 触发方式 | 右键菜单(`file-menu` event) | 比命令面板直观 |
| 目录选择 | Electron `dialog.showOpenDialog` | 系统原生,桌面端可用 |
| 输出位置 | 任意外部目录(不限制在 vault 内) | 用户需要把 txt 拿出去用(TTS、配音等) |
| 文件夹处理 | 递归所有子目录,输出到同名子目录 | 林君原话:"导出的地方也是用同样名字的文件夹" |
| 内容处理 | 不动 frontmatter、不动 markdown 标记、不动空行 | 林君没要求处理,最简单 |
| 同名冲突 | 直接覆盖,不弹提示 | 一次导出任务内冲突罕见 |
| 仓库 | 暂做本地,不推 GitHub | 林君改主意:"先不 git 了或者本地仓库" |
| 测试 | 暂不装到 vault | 林君:"我不想装到 vault 测试可以吗" |
| 节点协议 | 桌面专属(`isDesktopOnly: true`) | 用了 `electron` API,移动端跑不了 |
| 作者名 | `Lin Jun` | 林君选择 |
| GitHub 仓库名 | `txt-exporter` | 林君选择 |
| 语言 | 中英双语(双标签并列,不是 i18n 动态切换) | 过度设计不必要,双标签最简 |
| 社区插件市场 PR | 我代发 | 林君不会,手动复杂 |

### 待办

- [x] ~~启动 `npm run dev` 持续重打包~~ ✅
- [x] ~~装到 vault 实际测试右键菜单~~ ✅
- [x] ~~加 3 个开关~~ ✅
- [x] ~~i18n 多语言支持~~ ✅（v0.3.0）
- [ ] **在 Obsidian 里实际测一次右键菜单**(林君操作)
- [ ] **切到阿拉伯语设置测一次 RTL 渲染**(林君操作)
- [ ] 决定是否推 GitHub(`gh` CLI 已配,账号 `iamjunjun`)✅
- [ ] 决定是否发布到 Obsidian 社区插件市场
- [ ] 写最小单元测试(可选)

### 代码体量

```
main.ts:        ~70 行(含注释)
manifest.json:  8 行
esbuild 配置:   30 行
其他配置:       < 30 行
```

代码完全够简单,没有过度设计。

---

## 变更日志

### 2026-06-18 (cont.)

- **feat**: v0.4.0
  - 去掉阿拉伯语支持（11 语言）
  - 修复代码块导出：开启"去除 markdown 标记"时，代码块内容不再丢失，只去掉 ``` 标记行
- **chore**: 升级到 v0.4.0（manifest.json + versions.json）

### 2026-06-18 (cont.)

- **feat**: i18n 多语言支持（v0.3.0）
  - 新增 `i18n.ts`：根据 Obsidian 语言设置自动切换界面字符串
  - 支持 12 语言：中文 / 英语 / 日语 / 韩语 / 德语 / 法语 / 西班牙语 / 葡萄牙语 / 阿拉伯语 / 意大利语 / 泰语 / 越南语
  - 未列出的语言 fallback 到英语
  - 阿拉伯语 RTL 处理：所有 ASCII 字面量（`TXT`、`YAML`、`#`、`**`等）和 vars（`{count}`、`{folder}`、`{name}`）手动加 LRM（U+200E）避免 BIDI 错乱
  - 提升 `minAppVersion` 到 `1.8.7`（`getLanguage()` API 自 1.8.7 起可用）
  - 翻译表内嵌编译进 `main.js`（不引入额外文件读取，无运行时依赖）
  - 13 个翻译键：菜单 / Notice (×2) / suffix / 设置面板 header + 4 个开关 (×2)
- **chore**: 升级到 v0.3.0（manifest.json + versions.json）

### 2026-06-18 (cont.)

- **fix**: 去除 inline HTML 标签（v0.2.1）
  - `stripMarkdown` 增加了 `.replace(/<br\s*\/?>/gi, '\n')` 和 `.replace(/<[^>]+>/g, '')`
  - 修复林君报告的 `<font style="color:#DF2A3F;">` 残留问题
  - 同步把 `<span>`、`<mark>`、`<center>` 等也去了
- **chore**: 升级到 v0.2.1（manifest.json + versions.json）

### 2026-06-18

- **feat**: 新增 "保留目录层级" 开关（v0.2.0）

- **init**: 项目立项。完成骨架、依赖、首次 build、首次 commit。
- **feat**: 新增 3 个内容处理开关（设置面板 → TXT Exporter）
  - 去除 frontmatter（默认开）
  - 去除 markdown 标记（默认开）
  - 段间无空行 / 紧凑（默认开）
  - 新增 `ExportSettings` 接口、`PluginSettingTab` 子类、`processContent` / `stripMarkdown` 工具方法
- **chore**: 装到 vault `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/.obsidian/plugins/txt-exporter/`
- **chore**: 启动 `npm run dev` 后台监听（PID 34451），改 `main.ts` 自动重打包
- **chore**: 决定暂不推 GitHub、暂不发布社区插件市场

### 2026-06-18

- **feat**: 新增 "保留目录层级" 开关（v0.2.0）
  - `preserveHierarchy: boolean`，默认 false（保持 v0.1.0 平铺行为）
  - 打开后导出文件夹时保留 vault 原子目录结构
  - 例子：选中 `杜十娘` 导出，开关开 → `target/杜十娘/第二章/第3集.txt`（保留子目录）
- **feat**: 升级到 v0.2.0（`manifest.json` + `versions.json`）
- **chore**: esbuild auto-deploy 同步 manifest.json（之前只 deploy main.js，林君手动 cp 过一次）
- **chore**: README 加 v0.2.0 新功能说明（中英双语）
- **chore**: 推 GitHub + 发 v0.2.0 release
- **chore**: 社区插件市场 PR 仍待林君浏览器点（API 权限问题）
