# TXT Exporter

[English](#english) · [中文](#中文)

---

## 中文

### 功能

Obsidian 插件：右键 `.md` 文件或文件夹，导出为纯文本 `.txt`。

- **右键单个 `.md`** → 弹系统目录选择框 → 选位置 → 导出为同名 `.txt`
- **右键文件夹** → 弹目录选择框 → 在选中位置**建同名子文件夹** → 递归所有子文件夹里的 `.md`，全部写成 `.txt` 放进去
- 非 `.md` 文件不显示此菜单项

### 同名冲突提示

v0.4.1 起，导出时如遇同名 `.txt`，弹对话框让用户选择：

- **覆盖** — 直接覆盖原文件
- **重命名** — 自动用 `file (1).txt`、`file (2).txt` 等后缀避开已有文件（v0.4.2 新增）
- **取消** — 退出本次导出

文件夹导出（v0.4.3 起）改为**整体判断**：先检查目标文件夹是否存在，再弹对话框选择**覆盖整个文件夹**、**重命名为 `foldername (1)`**、或**取消**。

### v0.2.0 新增：保留目录层级

设置里有一个"保留目录层级"开关。

- **关闭（默认）**：所有 `.txt` 平铺到同名子目录里（v0.1.0 的行为）
- **打开**：保留 vault 原有的子目录结构，每个文件按原相对路径导出

例子：选中 vault 里的 `杜十娘` 文件夹导出：

```
vault/杜十娘/
├── 楔子.md
├── 第一章.md
└── 第二章/
    ├── 第3集.md
    └── 第4集.md
```

**关闭开关** → 导出到 `target/杜十娘/楔子.txt`、`target/杜十娘/第一章.txt`、`target/杜十娘/第3集.txt`、`target/杜十娘/第4集.txt`（平铺）

**打开开关** → 导出到 `target/杜十娘/楔子.txt`、`target/杜十娘/第一章.txt`、`target/杜十娘/第二章/第3集.txt`、`target/杜十娘/第二章/第4集.txt`（保留子目录）

### v0.2.1 修复：去除 HTML 标签

之前导出时 inline HTML 标签会保留下来（比如 `<font style="color:#DF2A3F;">红色</font>`）。现在 `去除 markdown 标记` 开关打开后，会自动去除所有 HTML 标签（保留文字内容），并把 `<br>` 变换行。

### v0.3.0 新增：多语言（i18n）

界面字符串（右键菜单、Notice 通知、设置面板）会根据 Obsidian 的语言设置**自动切换**，不再中英并列。

支持 11 种语言：

| 语言 | 代码 |
|---|---|
| 中文 | `zh` |
| English | `en` |
| 日本語 | `ja` |
| 한국어 | `ko` |
| Deutsch | `de` |
| Français | `fr` |
| Español | `es` |
| Português | `pt` |
| Italiano | `it` |
| ไทย | `th` |
| Tiếng Việt | `vi` |

未列出的语言 fallback 到英语。

### v0.4.0 修复：代码块导出

之前开启「去除 markdown 标记」时，代码块（```` ``` ````）里的内容会被 markdown 正则误处理（比如 `# include` 的 `#` 被去掉、`<stdio.h>` 被当 HTML 删掉）。

现在代码块内容**完整保留**，只去掉 ```` ``` ```` 标记行。代码块里的 `#`、`**`、`-`、`<tag>` 等都按原文导出。

### v0.4.1 / v0.4.2 / v0.4.3 — 冲突处理

详见上方「同名冲突提示」一节。三次迭代把行为从「直接覆盖」演化为：

- v0.4.1：弹 3 选项对话框（覆盖 / 跳过 / 取消）
- v0.4.2：「跳过」换成「重命名」（默认按钮）
- v0.4.3：文件夹导出改为整体判断，选项精简为 3 个（覆盖 / 重命名 / 取消）

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
| 去除 markdown 标记 | ✅ | 去掉 `#` 标题、`**粗体**`、`[]()` 链接等格式符号（代码块内容保留） |
| 段间无空行（紧凑） | ✅ | 段落之间不留空行，每个段落单独一行 |
| 保留目录层级 | ❌ | 导出文件夹时保留 vault 原子目录结构（默认平铺） |

### 使用

1. 在文件列表中右键任意 `.md` 文件或文件夹
2. 选择 **导出为 TXT**（语言跟随 Obsidian 设置）
3. 弹出系统目录选择框，选择目标位置
4. 如遇同名冲突，根据弹窗提示选择处理方式
5. 完成，右下角弹出 Notice 提示

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

### Same-name conflict dialog

Since v0.4.1, when the destination already contains a `.txt` with the same name, a dialog asks you to choose:

- **Overwrite** — replace the existing file
- **Rename** — auto-suffix with `file (1).txt`, `file (2).txt`, etc. to avoid clobbering (added in v0.4.2)
- **Cancel** — abort the export

Folder export (since v0.4.3) checks the **whole folder** first: if it exists, choose to overwrite it entirely, rename to `foldername (1)`, or cancel.

### v0.2.0 new: preserve directory hierarchy

A "Preserve directory hierarchy" toggle is available in settings.

- **Off (default)**: all `.txt` files are flattened into the same-name subfolder (v0.1.0 behavior)
- **On**: original subdirectory structure is preserved; each file is exported at its original relative path

Example: exporting the vault folder `杜十娘`:

```
vault/杜十娘/
├── 楔子.md
├── 第一章.md
└── 第二章/
    ├── 第3集.md
    └── 第4集.md
```

**Toggle off** → exports to `target/杜十娘/楔子.txt`, `target/杜十娘/第一章.txt`, `target/杜十娘/第3集.txt`, `target/杜十娘/第4集.txt` (flattened)

**Toggle on** → exports to `target/杜十娘/楔子.txt`, `target/杜十娘/第一章.txt`, `target/杜十娘/第二章/第3集.txt`, `target/杜十娘/第二章/第4集.txt` (hierarchy preserved)

### v0.2.1 fix: strip HTML tags

Previously, inline HTML tags (e.g. `<font style="color:#DF2A3F;">red</font>`) were passed through to the exported TXT. Now, when **Strip markdown** is on, all HTML tags are removed (text content preserved), and `<br>` is converted to a newline.

### v0.3.0 new: internationalization (i18n)

UI strings (right-click menu, Notice messages, settings panel) now **automatically switch** to match your Obsidian language setting — no more bilingual "Chinese | English" labels.

11 languages supported: Chinese, English, Japanese, Korean, German, French, Spanish, Portuguese, Italian, Thai, Vietnamese. Any other language falls back to English.

### v0.4.0 fix: code block export

Previously, when **Strip markdown** was on, content inside fenced code blocks (```` ``` ````) was being mangled by markdown regexes (e.g. `# include` lost its `#`, `<stdio.h>` was stripped as HTML).

Code block content is now **fully preserved** — only the ```` ``` ```` marker lines are removed. `#`, `**`, `-`, `<tag>` etc. inside code blocks are exported as-is.

### v0.4.1 / v0.4.2 / v0.4.3 — conflict handling

See "Same-name conflict dialog" above. Three iterations evolved behavior from "silent overwrite" to:

- v0.4.1: 3-option dialog (Overwrite / Skip / Cancel)
- v0.4.2: Skip replaced with Rename (default button)
- v0.4.3: Folder export checks the whole folder; options simplified to 3 (Overwrite / Rename / Cancel)

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
| Strip markdown | ✅ | Remove `#` headings, `**bold**`, `[]()` links, etc. (code block content preserved) |
| Compact (no blank lines between paragraphs) | ✅ | Collapse blank lines between paragraphs |
| Preserve directory hierarchy | ❌ | When exporting a folder, preserve vault's subdirectory structure (default: flatten) |

### Usage

1. Right-click any `.md` file or folder in the file list
2. Choose **Export to TXT** (label follows Obsidian language setting)
3. Pick the destination folder
4. If a same-name conflict occurs, choose how to handle it in the dialog
5. Done — a Notice pops up

### Development

```bash
npm install          # install dependencies
npm run dev          # watch mode: rebuild + auto-deploy to vault on main.ts changes
npm run build        # production build (minified)
```

---

## License

MIT