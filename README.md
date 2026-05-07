# 无界文档

无界文档是一个基于 Markdown 的桌面文档 Demo。它的目标是让普通 Markdown 文档具备“实时数据展示、代码执行、3D/多模态内容展示”的能力，同时保留纯文本、可迁移、可继续扩展的文件形态。

当前版本先实现桌面 Demo 的核心能力。增强块在正文里直接渲染，使用体验接近 Markdown 图片：源码里保留可读的代码块配置，预览时替换成实时数据、代码运行结果或 3D 组件。架构上把编辑器、增强块、运行时和共享类型拆成独立包，后续可以继续扩展为 Web 应用、编辑器插件、多人协作和 AI 文档问答。

## 已实现能力

- Markdown 编辑：支持 WYSIWYG 编辑模式，基于 BlockNote 编辑器。
- 正文内嵌预览：增强代码块不会集中到单独面板，而是在文档原位置渲染成组件。
- 实时数据块：通过 `live-data` 代码块展示 HTTP polling、SSE、WebSocket 数据源。
- 可执行代码块：通过 `run-js` 代码块在 Web Worker 沙箱中执行 JavaScript。
- Python 代码块：通过 `run-python` 代码块在 Pyodide（Worker）中执行。
- SQL 查询块：通过 `sql` 代码块在 DuckDB-Wasm 中执行。
- 图表块：通过 `chart` 代码块结合 ECharts 展示。
- 3D 内容块：通过 `model3d` 代码块展示 GLB/glTF 模型。
- 多媒体资源块：通过 `asset` 代码块展示图片、视频、音频、PDF 等资源。
- 本地文件：支持打开和保存 Markdown 文件。
- 示例文档：`docs/examples` 中包含实时数据、代码执行和 3D 展示示例。

变更说明见仓库根目录 [`CHANGELOG.md`](./CHANGELOG.md)。

## 项目结构

```text
apps/
  desktop/              Tauri + React 桌面应用
packages/
  editor/               Markdown 编辑器封装
  blocks/               增强块渲染组件
  runtime/              数据订阅、代码沙箱等运行时能力
  shared/               文档类型、Markdown 块解析、扩展接口
docs/
  examples/             示例文档
  architecture/         架构和扩展边界说明
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

````markdown
```live-data
source: https://api.github.com/repos/google/model-viewer
mode: polling
interval: 15000
view: json
```
````

可执行 JS 块：

````markdown
```run-js
console.log("从 Worker 沙箱执行")
return { message: "Hello Boundless Docs" }
```
````

3D 模型块：

````markdown
```model3d
src: https://modelviewer.dev/shared-assets/models/Astronaut.glb
poster: https://modelviewer.dev/shared-assets/models/Astronaut.webp
autoRotate: true
cameraControls: true
height: 360
```
````

多媒体资源块：

````markdown
```asset
src: ./assets/demo.png
type: image
title: 示例图片
```
````

## 后续方向

- 深化 Yjs / CRDT 多人协作与离线合并（编辑器侧已预留可选 WebRTC 协作路径）。
- 建立文档索引，支持双向链接、块级引用和同步块。
- 增加 AI 问答、自动摘要和相关文档推荐。
- 抽离 Web/插件宿主，复用现有 `packages` 能力。
