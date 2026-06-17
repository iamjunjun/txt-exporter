# TXT Exporter

[English](#english) · [中文](#中文)

---

## 中文

### 功能

Obsidian 插件：右键 `.md` 文件或文件夹，导出为纯文本 `.txt`。

- **右键单个 `.md`** → 弹系统目录选择框 → 选位置 → 导出为同名 `.txt`
- **右键文件夹** → 弹目录选择框 → 在选中位置**建同名子文件夹** → 递归所有子文件夹里的 `.md`，全部写成 `.txt` 放进去
- 非 `.md` 文件不显示此菜单项
- 同名 `.txt` 直接覆盖

### 安装

#### 方式 1：Obsidian 社区插件市场（推荐）

设置 → 第三方插件 → 浏览 → 搜索 "TXT Exporter" → 安装 → 启用

#### 方式 2：手动安装

把 `main.js` 和 `manifest.json` 复制到 vault 的插件目录：

```bash
VAULT="/path/to/your/vault"
PLUGIN_DIR="$VAULT/.obsidian/plugins/txt-exporter"
mkdir -p "$PLUGIN_DIR"
cp main.js manifest.json "$PLUGIN_DIR"
```

然后设置 → 第三方插件 → 关闭"受限模式" → 启用 TXT Exporter。

### 设置

设置 → 第三方插件 → TXT Exporter → 选项：

| 选项 | 默认 | 作用 |
|---|---|---|
| 去除 frontmatter | ✅ | 移除 YAML 头部元数据（`--- ... ---`） |
| 去除 markdown 标记 | ✅ | 去掉 `#` 标题、`**粗体**`、`[]()` 链接等格式符号 |
| 段间无空行（紧凑） | ✅ | 段落之间不留空行，每个段落单独一行 |

### 使用

1. 在文件列表中右键任意 `.md` 文件或文件夹
2. 选择 **导出为 TXT | Export to TXT**
3. 弹出系统目录选择框，选择目标位置
4. 完成，右下角弹出 Notice 提示

### 开发

```bash
npm install          # 装依赖
npm run dev          # 监听模式，改 main.ts 自动重打包 + 自动部署到 vault
npm run build        # 生产打包（压缩）
```

---

## English

### Features

Obsidian plugin: right-click a `.md` file or folder to export as plain text `.txt`.

- **Right-click a single `.md`** → system folder picker → choose destination → export as same-name `.txt`
- **Right-click a folder** → system folder picker → a **same-name subfolder** is created at the destination → all `.md` files in nested folders are recursively exported as `.txt`
- Non-`.md` files do not show this menu item
- Same-name `.txt` files are overwritten

### Installation

#### Option 1: Obsidian Community Plugin Store (recommended)

Settings → Community plugins → Browse → search "TXT Exporter" → Install → Enable

#### Option 2: Manual install

Copy `main.js` and `manifest.json` into the vault's plugin folder:

```bash
VAULT="/path/to/your/vault"
PLUGIN_DIR="$VAULT/.obsidian/plugins/txt-exporter"
mkdir -p "$PLUGIN_DIR"
cp main.js manifest.json "$PLUGIN_DIR"
```

Then Settings → Community plugins → turn off Restricted mode → enable TXT Exporter.

### Settings

Settings → Community plugins → TXT Exporter → Options:

| Option | Default | Effect |
|---|---|---|
| Strip frontmatter | ✅ | Remove YAML frontmatter (`--- ... ---`) |
| Strip markdown | ✅ | Remove `#` headings, `**bold**`, `[]()` links, etc. |
| Compact (no blank lines between paragraphs) | ✅ | Collapse blank lines between paragraphs |

### Usage

1. Right-click any `.md` file or folder in the file list
2. Choose **导出为 TXT | Export to TXT**
3. Pick the destination folder
4. Done — a Notice pops up

### Development

```bash
npm install          # install dependencies
npm run dev          # watch mode: rebuild + auto-deploy to vault on main.ts changes
npm run build        # production build (minified)
```

---

## License

MIT
