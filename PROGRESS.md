# 开发进度（PROGRESS）

记录 TXT Exporter 插件的开发时间线、决策点和待办。

## v0.1.0 · 2026-06-17（立项）

### 目标

做一个 Obsidian 插件：右键 `.md` 文件 / 文件夹，导出为 `.txt`。

- **文件模式**：选目录 → 直接导出同名 `.txt`
- **文件夹模式**：选目录 → 在该目录下建同名子文件夹 → 递归所有 `.md` 写成 `.txt` 放进去

### 完成

- [x] 项目骨架（`main.ts` / `manifest.json` / `package.json` / `tsconfig.json` / `esbuild.config.mjs` / `.gitignore` / `README.md`）
- [x] 依赖安装：`npm install`（esbuild + obsidian + typescript + @types/node，共 16 个包）
- [x] esbuild 配置调通（加了 `platform: 'node'` 让它认识 `fs` / `path` 内置模块，并把这两个标为 `external`）
- [x] 首次 build 通过（产物 `main.js` 1.9K，minify 后 CJS）
- [x] git init + 首次 commit（main 分支，author 仅本仓库作用域：`linjun <hijustinlin@iCloud.com>`）
- [x] 进度文档（本文件）

### 决策记录

| 决策点 | 选择 | 理由 |
|---|---|---|
| 触发方式 | 右键菜单（`file-menu` event） | 比命令面板直观 |
| 目录选择 | Electron `dialog.showOpenDialog` | 系统原生，桌面端可用 |
| 输出位置 | 任意外部目录（不限制在 vault 内） | 用户需要把 txt 拿出去用（TTS、配音等） |
| 文件夹处理 | 递归所有子目录，输出到同名子目录 | 林君原话："导出的地方也是用同样名字的文件夹" |
| 内容处理 | 不动 frontmatter、不动 markdown 标记、不动空行 | 林君没要求处理，最简单 |
| 同名冲突 | 直接覆盖，不弹提示 | 一次导出任务内冲突罕见 |
| 仓库 | 暂做本地，不推 GitHub | 林君改主意："先不 git 了或者本地仓库" |
| 测试 | 暂不装到 vault | 林君："我不想装到 vault 测试可以吗" |
| 节点协议 | 桌面专属（`isDesktopOnly: true`） | 用了 `electron` API，移动端跑不了 |

### 待办

- [ ] 启动 `npm run dev` 持续重打包，验证热重载
- [ ] 装到 vault 实际测试右键菜单（需林君提供 vault 路径或手动 `cp`）
- [ ] 决定是否要加以下开关：
  - 是否去除 frontmatter
  - 是否去除 markdown 标记（标题、链接、图片等）
  - 是否段间无空行（紧凑模式）
- [ ] 决定是否推 GitHub（`gh` CLI 已配，账号 `iamjunjun`，可一条命令 `gh repo create`）
- [ ] 决定是否发布到 Obsidian 社区插件市场
- [ ] 写最小单元测试（可选）

### 代码体量

```
main.ts:        ~70 行（含注释）
manifest.json:  8 行
esbuild 配置:   30 行
其他配置:       < 30 行
```

代码完全够简单，没有过度设计。

---

## 变更日志

### 2026-06-17

- **init**: 项目立项。完成骨架、依赖、首次 build、首次 commit。
