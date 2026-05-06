# 编辑器页面视觉统一优化方案

## 目标
消除编辑器页面内所有视觉断层，统一为 warm-canvas + hairline 编辑风格，提升整体精致度。

## 核心改动清单

### 1. TopBar — 替换 Emoji 为 SVG 图标
- 文件：`apps/desktop/src/components/TopBar.tsx`
- 把 `←`、`→`、`🌙`、`⚙️` 替换为内联 SVG 图标
- 移除 `🕔 已保存` 中的 emoji，改为状态圆点

### 2. blocks.css — 硬编码颜色 → CSS 变量
- 文件：`packages/blocks/src/blocks.css`
- 所有 `#111827`、`#0f172a`、`#020617` 等硬编码色替换为 `var(--canvas)`、`var(--surface)`、`var(--ink)` 等
- 按钮样式统一到 `tb-btn` 体系
- 错误/警告提示改用 pastel chips 色系
- 代码块字体改为 `var(--mono)`

### 3. editor.css — 硬编码颜色 → CSS 变量
- 文件：`packages/editor/src/editor.css`
- 同上，全部替换为 CSS 变量

### 4. 设置弹窗 — 改为侧边抽屉
- 文件：`apps/desktop/src/components/SettingsModal.tsx`
- 从居中模态框改为右侧滑入抽屉（Drawer）
- 增加关闭动画过渡

### 5. 右侧面板 — 标题和空状态优化
- 文件：`apps/desktop/src/App.tsx`、`packages/blocks/src/BlockPreviewPanel.tsx`
- `Execution Panel` 改为中文「增强块预览」
- 空状态文案优化，增加图标

### 6. 过渡动画
- 文件：`apps/desktop/src/styles.css`
- 为 sidebar 展开/收起、modal 出现/消失、按钮交互添加过渡动画

### 7. 暗色模式修复
- 确保 blocks.css 和 editor.css 在暗色模式下正确使用 token
