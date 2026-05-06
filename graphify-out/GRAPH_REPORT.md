# Graph Report - D:/ZHIYI/无界文档/无界文档  (2026-05-05)

## Corpus Check
- 47 files · ~6,495 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 173 nodes · 230 edges · 13 communities detected
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.82)
- Token cost: 113,360 input · 8,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Desktop App Shell|Desktop App Shell]]
- [[_COMMUNITY_Product Vision & Goals|Product Vision & Goals]]
- [[_COMMUNITY_Desktop App Source|Desktop App Source]]
- [[_COMMUNITY_Runtime Execution Engine|Runtime Execution Engine]]
- [[_COMMUNITY_Database & Python Runtimes|Database & Python Runtimes]]
- [[_COMMUNITY_Markdown Parsing Engine|Markdown Parsing Engine]]
- [[_COMMUNITY_Monorepo Architecture|Monorepo Architecture]]
- [[_COMMUNITY_Code Execution UI|Code Execution UI]]
- [[_COMMUNITY_Block Preview Components|Block Preview Components]]
- [[_COMMUNITY_Tauri Native Shell|Tauri Native Shell]]
- [[_COMMUNITY_Milkdown Editor|Milkdown Editor]]
- [[_COMMUNITY_JS Sandbox Worker|JS Sandbox Worker]]
- [[_COMMUNITY_Data Visualization|Data Visualization]]

## God Nodes (most connected - your core abstractions)
1. `createBlock()` - 10 edges
2. `Literature and Repository Resource Catalog` - 10 edges
3. `App (Desktop Entry Point)` - 9 edges
4. `subscribeToLiveData Function` - 9 edges
5. `Boundless Docs Monorepo` - 9 edges
6. `LandingPage` - 8 edges
7. `SettingsContext` - 7 edges
8. `BoundlessBlock Type Definitions` - 6 edges
9. `Boundless Enhanced Blocks Pattern` - 6 edges
10. `Modular Monorepo (editor/blocks/runtime/shared)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Executable JavaScript Block Feature` --conceptually_related_to--> `runJavaScript Function`  [INFERRED]
  README.md → packages/runtime/src/codeRunner.ts
- `Live Data Block Feature` --conceptually_related_to--> `subscribeToLiveData Function`  [INFERRED]
  README.md → packages/runtime/src/dataSource.ts
- `Observable Framework (Markdown+JS Live Docs)` --semantically_similar_to--> `Boundless Docs Monorepo`  [INFERRED] [semantically similar]
  文献与仓库资源清单.md → package.json
- `Three.js (WebGL/WebGPU 3D Engine)` --semantically_similar_to--> `3D Model Block Feature`  [INFERRED] [semantically similar]
  文献与仓库资源清单.md → README.md
- `Model Viewer (glTF/USDZ Web Component)` --semantically_similar_to--> `3D Model Block Feature`  [INFERRED] [semantically similar]
  文献与仓库资源清单.md → README.md

## Hyperedges (group relationships)
- **Enhanced Block Parse-Render Pipeline** — shared_markdownblocks, shared_types, blocks_previewpanel, concept_boundlessblocks, concept_inline_rendering [EXTRACTED 1.00]
- **Triple Sandbox Runtimes (JS Worker + Pyodide + DuckDB-Wasm)** — runtime_coderunner, runtime_pyodiderunner, runtime_duckdbrunner, runtime_context, concept_sandbox_isolation [EXTRACTED 1.00]
- **Data Subscription: Polling, SSE, WebSocket Transport** — runtime_datasource, shared_types, concept_livedata_modes [EXTRACTED 1.00]
- **Inline Enhanced Code Blocks (live-data, run-js, model3d, asset)** — live_data_feature, runjs_feature, model3d_feature, asset_feature, markdown_base_format, inline_enhancement_principle [INFERRED 0.85]
- **Runtime Sandbox: Web Worker + Polling/SSE/WebSocket Isolation** — run_javascript, js_sandbox_worker, subscribe_to_live_data, polling_data_fetch, sse_data_stream, websocket_data_stream, sandbox_isolation_principle [EXTRACTED 0.95]
- **Monorepo Architecture: editor + blocks + runtime + shared + desktop** — tauri_desktop_app, editor_package, blocks_package, runtime_package, shared_package, boundless_docs_monorepo [EXTRACTED 1.00]

## Communities (27 total, 6 thin omitted)

### Community 0 - "Desktop App Shell"
Cohesion: 0.1
Nodes (33): App (Desktop Entry Point), Default Demo Document, fileService (Tauri File I/O), LandingPage, main.tsx (ReactDOM Root), SettingsContext, SettingsModal, Block Snippet Templates (+25 more)

### Community 1 - "Product Vision & Goals"
Cohesion: 0.15
Nodes (22): AI Integration Goal, Multimedia Asset Block Feature, Multi-person Real-time Collaboration Goal, DuckDB-Wasm (Browser-side SQL Engine), Executable Code Goal, File-Over-App Design Philosophy, Inline Enhancement (Source=Document, Preview=App), Product Landing Page (+14 more)

### Community 2 - "Desktop App Source"
Cohesion: 0.16
Nodes (10): getAccentName(), getAccentRGB(), SettingsProvider(), useSettings(), App(), downloadInBrowser(), isTauri(), openFromBrowser() (+2 more)

### Community 3 - "Runtime Execution Engine"
Cohesion: 0.14
Nodes (16): CodeRunResult Interface, Code Runner Module, DataSnapshot Interface, Data Source Module, DataSubscription Interface, JavaScript Sandbox Web Worker, JupyterLite (Browser-side Jupyter via WASM), LiveDataBlock Shared Type (+8 more)

### Community 4 - "Database & Python Runtimes"
Cohesion: 0.25
Nodes (11): getDuckDBStatus(), loadDuckDBOnce(), notify(), onDuckDBChange(), runSQL(), getPyodideStatus(), loadPyodideOnce(), notify() (+3 more)

### Community 5 - "Markdown Parsing Engine"
Cohesion: 0.27
Nodes (12): createBlock(), extractFrontmatter(), parseBoundlessBlocks(), parseBoundlessDocument(), parseYamlObject(), readAssetType(), readBoolean(), readDataMode() (+4 more)

### Community 6 - "Monorepo Architecture"
Cohesion: 0.25
Nodes (11): Blocks Rendering Package, Boundless Docs Monorepo, Editor Package, Milkdown WYSIWYG Markdown Editor, ProseMirror + Tiptap (Editor Engine), Runtime Package, Shared Types Package, Tauri Desktop Application (+3 more)

## Knowledge Gaps
- **19 isolated node(s):** `Block Snippet Templates`, `Default Demo Document`, `Vite Build Config`, `JS Sandbox Web Worker`, `Live Data Transport Modes (polling / SSE / WebSocket)` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Literature and Repository Resource Catalog` connect `Product Vision & Goals` to `Runtime Execution Engine`, `Monorepo Architecture`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Boundless Docs Monorepo` connect `Monorepo Architecture` to `Product Vision & Goals`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `subscribeToLiveData Function` connect `Runtime Execution Engine` to `Product Vision & Goals`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `subscribeToLiveData Function` (e.g. with `Live Data Block Feature` and `Sandbox Isolation for Code and Data`) actually correct?**
  _`subscribeToLiveData Function` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Boundless Docs Monorepo` (e.g. with `Observable Framework (Markdown+JS Live Docs)` and `Shared TypeScript Base Config`) actually correct?**
  _`Boundless Docs Monorepo` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Block Snippet Templates`, `Default Demo Document`, `Vite Build Config` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Desktop App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._