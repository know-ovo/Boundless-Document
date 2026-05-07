# CHANGELOG

## 2026-05-07

### 新增

- **未保存确认**：新建文档、打开文件、返回落地页、侧栏拖入文件、从「最近」打开其他路径前，若当前有未保存修改，弹出对话框（保存并继续 / 放弃更改 / 取消）。
- **侧栏**：按文件名或路径 **筛选** 列表；**拖放** `.md` / `.markdown` 到列表区域打开；**最近文件**（最多 8 条，含保存或打开过的磁盘路径，桌面版可用）。
- **快捷键**：`Ctrl+S` / `Cmd+S` 保存（与顶栏一致；打开未保存对话框时不再抢答快捷键）。
- **文件 API**：`readMarkdownFromPath` 供侧栏最近项重新读取（仅 Tauri）。
- **依赖**：`apps/desktop` 直接声明 `@mantine/core`（未保存对话框 Modal）。
- **桌面应用**：侧栏「新建文档」可重置为内置示例正文并重新挂载编辑器。
- **桌面应用**：基于正文快照的 **未保存 / 已保存** 指示；顶栏与底栏状态一致。
- **桌面应用**：状态栏显示 **UTF-8、字数（Unicode 码点）、行数**（不含精确光标列）。
- **桌面应用**：`documentStats.ts` 供状态栏统计正文规模。
- **文件保存**：`saveMarkdownFile` 返回 `SaveMarkdownResult`，可区分 Tauri「另存为」取消与成功写入后的路径。
- **编辑器**：`BlockNoteEditor` 支持可选 `onMarkdownParseError`；解析失败时 `console.warn` 并回调。

### 变更

- **保存**：首次保存成功后同步更新 **文件名**（由路径推断）；成功保存的路径写入「最近」列表。
- **侧栏**区块标题改为「文件与最近」，并补充拖放说明文案。
- `.gitignore` 新增: `*.bak`、`*.tsbuildinfo`、`graphify-out/`、`.claude/`
- 移除 git 跟踪中的构建产物和工具输出
- **顶栏**：主按钮由「分享」改为「保存」；无变更或未保存完成时禁用（由脏状态与保存中状态驱动）。
- **README**：「已实现能力」补充 Python / SQL 增强块；「后续方向」删去已落地的 Pyodide 表述，避免与代码不一致。

### 修复

- **网页版**：从最近打开无路径项时不再误用 Tauri API（列表仅在存在 `path` 时可切换）。
- **文件打开加载内容**: `App.tsx` 中 `handleOpen` 现在将文件内容写入编辑器；`handleSave` 保存实际文档内容
- **保存流程**：保存成功后更新 `filePath`（含首次另存为）；失败时在状态栏展示错误摘要（写入异常时）。

### 安全修复

- **CSP 启用**: `tauri.conf.json` 中 `csp` 从 `null` 改为安全策略，保留 Pyodide/DuckDB-Wasm 所需的 `'unsafe-eval'` 和 `'wasm-unsafe-eval'`
- **Yjs WebRTC 默认关闭**: `BlockNoteEditor` 新增 `collaboration` prop，默认 `false`，用户需显式开启才会连接公共 y-webrtc 信令服务器
- **Tauri FS 权限收窄**: `capabilities/default.json` 从 `$HOME/**` 收窄为 `$DOCUMENT/**`、`$DOWNLOAD/**`、`$DESKTOP/**`、`$HOME/*.md`

### 文档与工程

- README、ARCHITECTURE、LandingPage、landing.html 中 "Milkdown" 统一修正为 "BlockNote"
- 移除 ARCHITECTURE.md 中不存在的 `modelLoader.ts` 引用
- 落地页 GitHub 链接从 `https://github.com` 更新为实际仓库地址
- 补充项目工程文件：`LICENSE`（Apache-2.0）、`.editorconfig`、`.nvmrc`（Node.js 22）、`eslint.config.mjs`、`.github/workflows/ci.yml`、`CHANGELOG.md`
