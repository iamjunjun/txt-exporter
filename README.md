# TXT Exporter

Obsidian 插件：右键文件/文件夹导出为 TXT。

## 功能

- **右键单个 `.md`** → 弹系统目录选择框 → 选位置 → 导出为同名 `.txt`
- **右键文件夹** → 弹目录选择框 → 在选中位置**建同名子文件夹** → 递归所有子文件夹里的 `.md`，全部写成 `.txt` 放进去
- 非 `.md` 文件不显示此菜单项
- 同名 `.txt` 直接覆盖

## 开发

```bash
npm install          # 装依赖
npm run dev          # 监听模式，改 main.ts 自动重打包
npm run build        # 生产打包（压缩）
```

## 安装到 Obsidian Vault

把 `main.js` 和 `manifest.json` 复制到 vault 的插件目录即可：

```bash
VAULT="/path/to/your/vault"   # ← 改这里
PLUGIN_DIR="$VAULT/.obsidian/plugins/txt-exporter"
mkdir -p "$PLUGIN_DIR"
cp main.js manifest.json "$PLUGIN_DIR"
```

然后在 Obsidian → 设置 → 第三方插件 → 关闭"受限模式" → 启用 TXT Exporter。

## 热重载

开发时改完代码，`npm run dev` 会自动重打包。在 Obsidian 窗口里按 **Cmd+R**（macOS）/ **Ctrl+R**（Windows/Linux）即可重新加载插件，无需重启。

## 文件结构

```
.
├── main.ts                # 插件源码
├── manifest.json          # 插件元数据
├── package.json
├── tsconfig.json
├── esbuild.config.mjs     # 打包脚本
├── .gitignore
└── README.md
```

`main.js` 是打包产物，git 忽略。
