import { insertOrUpdateBlockForSlashMenu } from '@blocknote/core';
import { snippets } from './snippets';

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

export function getCustomSlashMenuItems(editor: any) {
  return [
    {
      title: 'Live Data',
      subtext: '实时数据源绑定（轮询/SSE/WebSocket）',
      onItemClick: () => insertSnippet(editor, snippets.liveData),
      aliases: ['live', 'data', 'realtime', 'stream'],
      group: 'Enhanced Blocks',
      icon: '📡',
    },
    {
      title: 'JavaScript',
      subtext: '在浏览器沙箱中执行 JS 代码',
      onItemClick: () => insertSnippet(editor, snippets.runJs),
      aliases: ['js', 'javascript', 'code', 'run'],
      group: 'Enhanced Blocks',
      icon: '📜',
    },
    {
      title: 'Python',
      subtext: '在浏览器中执行 Python 代码（Pyodide）',
      onItemClick: () => insertSnippet(editor, snippets.runPython),
      aliases: ['python', 'py', 'code', 'run'],
      group: 'Enhanced Blocks',
      icon: '🐍',
    },
    {
      title: 'SQL',
      subtext: '浏览器端 SQL 查询（DuckDB-Wasm）',
      onItemClick: () => insertSnippet(editor, snippets.runSQL),
      aliases: ['sql', 'query', 'database', 'db', 'duckdb'],
      group: 'Enhanced Blocks',
      icon: '🗄️',
    },
    {
      title: 'Chart',
      subtext: '渲染 ECharts 交互图表',
      onItemClick: () => insertSnippet(editor, snippets.chartData),
      aliases: ['chart', 'graph', 'plot', 'visualization', 'echarts'],
      group: 'Enhanced Blocks',
      icon: '📊',
    },
    {
      title: '3D Model',
      subtext: '嵌入 glTF/GLB 3D 模型',
      onItemClick: () => insertSnippet(editor, snippets.model3d),
      aliases: ['3d', 'model', 'gltf', 'glb'],
      group: 'Enhanced Blocks',
      icon: '🧊',
    },
    {
      title: 'Asset',
      subtext: '嵌入图片/视频/音频/PDF 等多媒体',
      onItemClick: () => insertSnippet(editor, snippets.asset),
      aliases: ['asset', 'image', 'video', 'audio', 'media', 'file'],
      group: 'Enhanced Blocks',
      icon: '🖼️',
    },
  ];
}
