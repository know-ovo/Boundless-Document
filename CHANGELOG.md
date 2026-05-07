# CHANGELOG

## 2026-05-07

### 安全修复

- **CSP 启用**: `tauri.conf.json` 中 `csp` 从 `null` 改为安全策略，保留 Pyodide/DuckDB-Wasm 所需的 `'unsafe-eval'` 和 `'wasm-unsafe-eval'`
- **Yjs WebRTC 默认关闭**: `BlockNoteEditor` 新增 `collaboration` prop，默认 `false`，用户需显式开启才会连接公共 y-webrtc 信令服务器
- **Tauri FS 权限收窄**: `capabilities/default.json` 从 `$HOME/**` 收窄为 `$DOCUMENT/**`、`$DOWNLOAD/**`、`$DESKTOP/**`、`$HOME/*.md`

### Bug 修复

- **文件打开加载内容**: `App.tsx` 中 `handleOpen` 现在将文件内容写入编辑器；`handleSave` 保存实际文档内容

### 文档修正

- README、ARCHITECTURE、LandingPage、landing.html 中 "Milkdown" 统一修正为 "BlockNote"
- 移除 ARCHITECTURE.md 中不存在的 `modelLoader.ts` 引用
- 落地页 GitHub 链接从 `https://github.com` 更新为实际仓库地址

### 仓库清理

- `.gitignore` 新增: `*.bak`、`*.tsbuildinfo`、`graphify-out/`、`.claude/`
- 移除 git 跟踪中的构建产物和工具输出

### 新增

- `LICENSE` — Apache-2.0
- `.editorconfig` — 编辑器配置
- `.nvmrc` — Node.js 22
- `eslint.config.mjs` — TypeScript ESLint
- `.github/workflows/ci.yml` — CI 流水线
- `CHANGELOG.md` — 本文件
