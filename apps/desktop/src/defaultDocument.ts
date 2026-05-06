export const defaultDocument = `---
title: 无界文档 Demo
createdAt: 2026-05-04
permissions:
  allowNetwork: true
---

# 无界文档 Demo

这是一个基于 Markdown 的桌面 Demo。增强块会像图片一样在正文位置渲染成可交互组件。

## 实时数据

\`\`\`live-data
source: https://api.github.com/repos/google/model-viewer
mode: polling
interval: 15000
view: json
\`\`\`

## 可执行代码

\`\`\`run-js
console.log("从 Worker 沙箱执行")
const points = Array.from({ length: 5 }, (_, index) => ({
  time: \`T+\${index}\`,
  value: Math.round(Math.random() * 100)
}))
return points
\`\`\`

## 3D 模型

\`\`\`model3d
src: https://modelviewer.dev/shared-assets/models/Astronaut.glb
poster: https://modelviewer.dev/shared-assets/models/Astronaut.webp
autoRotate: true
cameraControls: true
height: 360
\`\`\`
`;
