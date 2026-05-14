# 无界文档

无界文档是一个基于 Markdown 的桌面文档 Demo。它的目标是让普通 Markdown 文档具备“实时数据展示、代码执行、3D/多模态内容展示”的能力，同时保留纯文本、可迁移、可继续扩展的文件形态。

当前版本先实现桌面 Demo 的核心能力。增强块在正文里直接渲染，使用体验接近 Markdown 图片：源码里保留可读的代码块配置，预览时替换成实时数据、代码运行结果或 3D 组件。架构上把编辑器、增强块、运行时和共享类型拆成独立包，后续可以继续扩展为 Web 应用、编辑器插件、多人协作和 AI 文档问答。

## 已实现能力

- Markdown 编辑：支持源码编辑模式，并接入 Milkdown 作为 WYSIWYG Markdown 编辑器基础。
- 正文内嵌预览：增强代码块不会集中到单独面板，而是在文档原位置渲染成组件。
- 实时数据块：通过 `live-data` 代码块展示 HTTP polling、SSE、WebSocket 数据源。
- 可执行代码块：通过 `run-js` 代码块在 Web Worker 沙箱中执行 JavaScript。
- 3D 内容块：通过 `model3d` 代码块展示 GLB/glTF 模型。
- 多媒体资源块：通过 `asset` 代码块展示图片、视频、音频、PDF 等资源。
- 本地文件：支持打开和保存 Markdown 文件。
- 示例文档：`docs/examples` 中包含实时数据、代码执行和 3D 展示示例。

## 项目结构

```text
Boundless-Document/
├── apps/desktop/                  ← Tauri 桌面应用入口
│   ├── src/                       ← React 应用代码
│   │   ├── App.tsx                ← 主应用组件（编辑器 + 侧栏 + 面板 + 状态栏）
│   │   ├── main.tsx               ← React 入口
│   │   ├── styles.css             ← 全局设计系统（CSS 变量级联）
│   │   ├── defaultDocument.ts     ← 默认示例文档
│   │   ├── documentStats.ts       ← 字数/行数统计
│   │   ├── fileService.ts         ← 文件 I/O 抽象（Tauri + 浏览器回退）
│   │   ├── snippets.ts            ← 增强块模板（从 editor 包重导出）
│   │   ├── components/
│   │   │   ├── LandingPage.tsx    ← 营销落地页
│   │   │   ├── TopBar.tsx         ← 编辑器工具栏
│   │   │   ├── SettingsModal.tsx  ← 设置抽屉
│   │   │   ├── RuntimeStatusCard.tsx       ← 运行时状态指示
│   │   │   └── UnsavedChangesModal.tsx     ← 未保存确认对话框
│   │   └── contexts/
│   │       └── SettingsContext.tsx ← 全局设置 Context
│   └── src-tauri/                 ← Rust/Tauri 后端
│       ├── Cargo.toml
│       ├── tauri.conf.json
│       ├── capabilities/default.json
│       └── src/{main,lib}.rs
│
├── packages/
│   ├── shared/                    ← 共享类型 + Markdown 解析器
│   │   └── src/
│   │       ├── types.ts           ← 7 种增强块类型定义
│   │       ├── markdownBlocks.ts  ← Markdown → 增强块 解析引擎
│   │       └── extensionPoints.ts ← 未来扩展接口（协作/AI）
│   │
│   ├── editor/                    ← Markdown 编辑器封装
│   │   └── src/
│   │       ├── BlockNoteEditor.tsx ← BlockNote React 组件（含 Yjs 协作）
│   │       ├── schema.ts          ← BlockNote Schema 定义
│   │       ├── slash-menu.ts      ← 7 个自定义斜杠菜单项
│   │       └── snippets.ts        ← 增强块 Markdown 片段模板
│   │
│   ├── runtime/                   ← 运行时引擎（沙箱执行）
│   │   └── src/
│   │       ├── RuntimeContext.tsx  ← React Context（Pyodide + DuckDB 状态）
│   │       ├── codeRunner.ts      ← JS 沙箱入口
│   │       ├── pyodideRunner.ts   ← Python/Pyodide 入口
│   │       ├── duckDBRunner.ts    ← SQL/DuckDB-Wasm 入口
│   │       ├── dataSource.ts      ← 数据订阅引擎（polling/SSE/WebSocket）
│   │       ├── jsSandbox.worker.ts ← JS Worker 沙箱（含自定义序列化）
│   │       └── sandbox/
│   │           ├── sandboxRunner.ts ← Worker 池 + 任务队列
│   │           ├── python.worker.ts ← Pyodide Worker
│   │           ├── sql.worker.ts    ← DuckDB-Wasm Worker
│   │           └── types.ts         ← 沙箱请求/响应类型
│   │
│   └── blocks/                    ← 增强块渲染 UI 组件
│       └── src/
│           ├── BlockPreviewPanel.tsx ← 预览面板 + 内嵌文档视图
│           ├── blocks.css           ← 块组件样式
│           ├── model-viewer.d.ts    ← <model-viewer> 类型声明
│           └── components/
│               ├── LiveDataBlockView.tsx  ← 实时数据块
│               ├── CodeBlockView.tsx      ← JS 执行块
│               ├── PythonBlockView.tsx    ← Python 执行块
│               ├── SQLBlockView.tsx       ← SQL 查询块
│               ├── ChartBlockView.tsx     ← ECharts 图表块
│               ├── Model3dBlockView.tsx   ← 3D 模型块
│               ├── AssetBlockView.tsx     ← 多媒体资源块
│               └── charts.tsx             ← ECharts 辅助组件
│
└── docs/                           ← 文档与示例
    ├── architecture/ARCHITECTURE.md
    └── examples/（3 个示例 .md）

```

## 环境要求

运行 Web 预览需要：

- Node.js 22 或更高版本
- npm 11 或更高版本

运行 Tauri 桌面版还需要：

- Rust
- Cargo
- Windows 上的 Tauri 相关系统依赖

如果只是先看 Demo，可以先运行 Web 版；如果要打包真正的桌面应用，再安装 Rust/Cargo。

## 安装依赖

在项目根目录运行：

```bash
npm install
```

## 开发运行

启动 Web 开发预览：

```bash
npm run dev
```

默认会启动 Vite 开发服务器，然后在浏览器中访问终端提示的地址。

启动 Tauri 桌面开发版：

```bash
npm run tauri:dev
```

注意：该命令需要本机已经安装 Rust/Cargo。

## 编译构建

构建 Web 版本：

```bash
npm run build
```

构建产物会输出到：

```text
apps/desktop/dist
```

预览 Web 构建产物：

```bash
npm run preview
```

打包 Tauri 桌面应用：

```bash
npm run tauri:build
```

注意：该命令同样需要 Rust/Cargo。当前机器如果没有安装 Rust，会在执行 Tauri 命令时报 `rustc` 或 `cargo` 找不到。

## 类型检查

```bash
npm run typecheck
```

## 增强块示例

实时数据块：

```markdown
```live-data
source: https://api.github.com/repos/google/model-viewer
mode: polling
interval: 15000
view: json
```
```

可执行 JS 块：

```markdown
```run-js
console.log("从 Worker 沙箱执行")
return { message: "Hello Boundless Docs" }
```
```

3D 模型块：

```markdown
```model3d
src: https://modelviewer.dev/shared-assets/models/Astronaut.glb
poster: https://modelviewer.dev/shared-assets/models/Astronaut.webp
autoRotate: true
cameraControls: true
height: 360
```
```

多媒体资源块：

```markdown
```asset
src: ./assets/demo.png
type: image
title: 示例图片
```
```

## 后续方向

- 接入 Pyodide/JupyterLite，支持 Python 代码块。
- 接入 Yjs，实现多人实时协作和离线合并。
- 建立文档索引，支持双向链接、块级引用和同步块。
- 增加 AI 问答、自动摘要和相关文档推荐。
- 抽离 Web/插件宿主，复用现有 `packages` 能力。

