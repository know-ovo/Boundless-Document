import { insertOrUpdateBlockForSlashMenu } from '@blocknote/core';
import { snippets } from './snippets';

type MenuLang = 'zh-CN' | 'en';

const t = {
  'zh-CN': {
    group: '增强块',
    liveData:   { title: '实时数据', desc: '实时数据源绑定（轮询/SSE/WebSocket）' },
    javascript: { title: 'JavaScript', desc: '在浏览器沙箱中执行 JS 代码' },
    python:     { title: 'Python', desc: '在浏览器中执行 Python 代码（Pyodide）' },
    sql:        { title: 'SQL', desc: '浏览器端 SQL 查询（DuckDB-Wasm）' },
    chart:      { title: '图表', desc: '渲染 ECharts 交互图表' },
    model3d:    { title: '3D 模型', desc: '嵌入 glTF/GLB 3D 模型' },
    asset:      { title: '多媒体', desc: '嵌入图片/视频/音频/PDF 等多媒体' },
  },
  en: {
    group: 'Enhanced Blocks',
    liveData:   { title: 'Live Data', desc: 'Bind live data sources (polling/SSE/WebSocket)' },
    javascript: { title: 'JavaScript', desc: 'Execute JS code in browser sandbox' },
    python:     { title: 'Python', desc: 'Execute Python code in browser (Pyodide)' },
    sql:        { title: 'SQL', desc: 'Browser-side SQL queries (DuckDB-Wasm)' },
    chart:      { title: 'Chart', desc: 'Render interactive ECharts charts' },
    model3d:    { title: '3D Model', desc: 'Embed glTF/GLB 3D models' },
    asset:      { title: 'Asset', desc: 'Embed images/video/audio/PDF media' },
  },
};

/**
 * Close the slash-trigger block, then insert markdown-derived blocks (fenced run-python, etc.).
 */
function insertSnippet(editor: any, snippet: string) {
  insertOrUpdateBlockForSlashMenu(editor, { type: 'paragraph' });
  const md = snippet.trim();
  if (!md) return;
  let blocks: unknown[];
  try {
    blocks = editor.tryParseMarkdownToBlocks(md);
  } catch {
    return;
  }
  if (!Array.isArray(blocks) || blocks.length === 0) return;
  const { block } = editor.getTextCursorPosition();
  editor.insertBlocks(blocks as any[], block, 'after');
}

export function getCustomSlashMenuItems(editor: any, language?: MenuLang) {
  const d = t[language === 'en' ? 'en' : 'zh-CN'];
  return [
    {
      title: d.liveData.title,
      subtext: d.liveData.desc,
      onItemClick: () => insertSnippet(editor, snippets.liveData),
      aliases: ['live', 'data', 'realtime', 'stream'],
      group: d.group,
      icon: '📡',
    },
    {
      title: d.javascript.title,
      subtext: d.javascript.desc,
      onItemClick: () => insertSnippet(editor, snippets.runJs),
      aliases: ['js', 'javascript', 'code', 'run'],
      group: d.group,
      icon: '📜',
    },
    {
      title: d.python.title,
      subtext: d.python.desc,
      onItemClick: () => insertSnippet(editor, snippets.runPython),
      aliases: ['python', 'py', 'code', 'run'],
      group: d.group,
      icon: '🐍',
    },
    {
      title: d.sql.title,
      subtext: d.sql.desc,
      onItemClick: () => insertSnippet(editor, snippets.runSQL),
      aliases: ['sql', 'query', 'database', 'db', 'duckdb'],
      group: d.group,
      icon: '🗄️',
    },
    {
      title: d.chart.title,
      subtext: d.chart.desc,
      onItemClick: () => insertSnippet(editor, snippets.chartData),
      aliases: ['chart', 'graph', 'plot', 'visualization', 'echarts'],
      group: d.group,
      icon: '📊',
    },
    {
      title: d.model3d.title,
      subtext: d.model3d.desc,
      onItemClick: () => insertSnippet(editor, snippets.model3d),
      aliases: ['3d', 'model', 'gltf', 'glb'],
      group: d.group,
      icon: '🧊',
    },
    {
      title: d.asset.title,
      subtext: d.asset.desc,
      onItemClick: () => insertSnippet(editor, snippets.asset),
      aliases: ['asset', 'image', 'video', 'audio', 'media', 'file'],
      group: d.group,
      icon: '🖼️',
    },
  ];
}
