export const snippets = {
  liveData: `\n\n\`\`\`live-data\nsource: https://api.github.com/repos/Milkdown/milkdown\nmode: polling\ninterval: 10000\nview: json\n\`\`\`\n`,
  chartData: `\n\n\`\`\`live-data\nsource: https://raw.githubusercontent.com/vega/vega-datasets/main/data/stocks.json\nmode: polling\ninterval: 30000\nview: line\nx: date\ny: price\n\`\`\`\n`,
  runJs: `\n\n\`\`\`run-js\nconsole.log("生成演示数据")\nreturn Array.from({ length: 6 }, (_, index) => ({\n  time: \`第\${index + 1}秒\`,\n  value: Math.round(Math.random() * 100)\n}))\n\`\`\`\n`,
  runPython: `\n\n\`\`\`run-python\nimport statistics\n\ndata = [12, 8, 15, 23, 7, 19, 11]\nmean = statistics.mean(data)\nmedian = statistics.median(data)\nprint(f"均值: {mean}, 中位数: {median}")\n\`\`\`\n`,
  runSQL: `\n\n\`\`\`sql\nSELECT 1 AS num UNION ALL SELECT 2 UNION ALL SELECT 3\n\`\`\`\n`,
  model3d: `\n\n\`\`\`model3d\nsrc: https://modelviewer.dev/shared-assets/models/Astronaut.glb\nposter: https://modelviewer.dev/shared-assets/models/Astronaut.webp\nautoRotate: true\ncameraControls: true\nheight: 360\n\`\`\`\n`,
  asset: `\n\n\`\`\`asset\nsrc: https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200\ntype: image\ntitle: 多模态图片资源\n\`\`\`\n`,
};
