# 无界文档 · 架构地图

> 本文档为 graphify 和开发者提供显式的模块依赖关系。

## Dependency Map

```
apps/desktop (Tauri + React 桌面应用)
  → packages/editor    — BlockNoteEditor (WYSIWYG)
  → packages/blocks    — 增强块渲染组件
  → packages/runtime   — 数据订阅 & 代码沙箱
  → packages/shared    — 类型 & Markdown 解析

packages/editor (编辑器封装)
  → packages/shared    — editorSchema 类型依赖

packages/blocks (增强块渲染)
  → packages/shared    — BoundlessBlock 类型定义
  → packages/runtime   — 数据订阅 & 代码执行

packages/runtime (运行时引擎)
  → packages/shared    — DataSource / CodeRunResult 类型

packages/shared (共享类型与工具)
  → (leaf — 无工作区依赖)
```

## Module Responsibilities

| 模块 | 职责 |
|------|------|
| `apps/desktop/src/components/TopBar.tsx` | 顶栏：品牌标识 + 文档路径 + 操作按钮 |
| `apps/desktop/src/components/LandingPage.tsx` | 落地欢迎页（营销/产品展示） |
| `apps/desktop/src/components/SettingsModal.tsx` | 设置面板：主题色/字体/页面宽度 |
| `apps/desktop/src/contexts/SettingsContext.tsx` | 全局设置上下文 state |
| `apps/desktop/src/fileService.ts` | 本地文件打开/保存（Tauri FS API） |
| `apps/desktop/src/snippets.ts` | 增强块模板库（live-data/run-js/model3d/chart/asset） |
| `apps/desktop/src/defaultDocument.ts` | 默认示例文档内容 |
| `packages/editor/src/BlockNoteEditor.tsx` | BlockNote 编辑器 React 组件 |
| `packages/editor/src/schema.ts` | 编辑器 schema 定义 |
| `packages/editor/src/slash-menu.ts` | 斜杠菜单（引用 snippets 模板） |
| `packages/blocks/src/BlockPreviewPanel.tsx` | 增强块预览面板（分发到各 block viewer） |
| `packages/blocks/src/components/AssetBlockView.tsx` | 多媒体资源块渲染 |
| `packages/blocks/src/components/Model3dBlockView.tsx` | 3D 模型块渲染 |
| `packages/blocks/src/components/CodeBlockView.tsx` | 代码执行块渲染 |
| `packages/blocks/src/components/LiveDataBlockView.tsx` | 实时数据块渲染 |
| `packages/blocks/src/components/charts.tsx` | ECharts 图表渲染 |
| `packages/runtime/src/dataSource.ts` | 数据订阅（polling/SSE/WebSocket） |
| `packages/runtime/src/codeRunner.ts` | JS 代码执行（Web Worker 沙箱） |
| `packages/runtime/src/duckDBRunner.ts` | DuckDB-Wasm SQL 执行器 |
| `packages/runtime/src/pyodideRunner.ts` | Pyodide Python 执行器 |
| `packages/runtime/src/jsSandbox.worker.ts` | 隔离 JS Worker 沙箱 |
| `packages/shared/src/types.ts` | 核心类型定义（BoundlessBlock, MarkdownDocument） |
| `packages/shared/src/markdownBlocks.ts` | Markdown 增强块解析器 |
| `packages/shared/src/extensionPoints.ts` | 扩展接口（协作/ AI 对接） |

## Data Flow

```
用户输入 Markdown
  → packages/shared/markdownBlocks.ts (解析代码块)
  → packages/shared/types.ts (类型收窄)
  → packages/blocks/BlockPreviewPanel.tsx (分发渲染)
  → packages/blocks/components/* (具体渲染器)
  → packages/runtime/* (数据/代码/3D 执行)
```

## 设计原则

1. **Markdown 为基** — 所有增强信息以代码块形式嵌入纯文本 Markdown
2. **原地增强** — 增强块在文档原位置渲染，不弹面板不跳转
3. **沙箱隔离** — 代码执行和数据访问在独立 Worker/iframe 中完成
4. **本地优先** — 不依赖云服务，文件保留在本地文件系统
5. **模块化包** — editor/blocks/runtime/shared 独立可引用
