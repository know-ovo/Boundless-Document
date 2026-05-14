export type Language = 'zh-CN' | 'en';

type TranslationDict = Record<string, Record<string, string>>;

const zh: TranslationDict = {
  sidebar: {
    brandOpen: '无界',
    brandClose: '文档',
    newDoc: '新建文档',
    search: '搜索...',
    fileBrowser: '文件浏览',
    emptyHint1: '点击',
    emptyHint2: '选择 .md 文件，',
    emptyHint3: '或拖拽文件到这里。',
    open: '打开',
  },
  topbar: {
    back: '后退',
    forward: '前进',
    saved: '已保存',
    open: '打开',
    save: '保存',
    share: '分享',
    toggleTheme: '切换主题',
    settings: '设置',
  },
  status: {
    saved: '已保存',
    chars: '字数',
    lines: '行',
    cols: '列',
    markdown: 'Markdown',
  },
  settings: {
    title: '文档设置',
    close: '关闭',
    themeColor: '主题色',
    fontStyle: '字体风格',
    sansSerif: '无衬线',
    serif: '衬线',
    pageWidth: '页面宽度',
    standardWidth: '标准居中',
    fullWidth: '宽屏模式',
    uiLanguage: '界面语言',
    langZhCN: '简体中文',
    langEn: 'English',
  },
  panel: {
    title: '增强块预览',
  },
  runtime: {
    python: 'Python (Pyodide)',
    sql: 'SQL (DuckDB)',
    load: 'Load',
  },
  slashMenu: {
    groupName: '增强块',
    liveDataTitle: '实时数据',
    liveDataDesc: '实时数据源绑定（轮询/SSE/WebSocket）',
    jsTitle: 'JavaScript',
    jsDesc: '在浏览器沙箱中执行 JS 代码',
    pythonTitle: 'Python',
    pythonDesc: '在浏览器中执行 Python 代码（Pyodide）',
    sqlTitle: 'SQL',
    sqlDesc: '浏览器端 SQL 查询（DuckDB-Wasm）',
    chartTitle: '图表',
    chartDesc: '渲染 ECharts 交互图表',
    model3dTitle: '3D 模型',
    model3dDesc: '嵌入 glTF/GLB 3D 模型',
    assetTitle: '多媒体',
    assetDesc: '嵌入图片/视频/音频/PDF 等多媒体',
  },
  saveDialog: {
    title: '保存文件',
    label: '文件名',
    placeholder: '输入文件名...',
    confirm: '下载',
    cancel: '取消',
  },
  common: {
    untitled: '未命名',
    open: '打开',
  },
};

const en: TranslationDict = {
  sidebar: {
    brandOpen: 'Boundless',
    brandClose: 'Docs',
    newDoc: 'New Document',
    search: 'Search...',
    fileBrowser: 'File Browser',
    emptyHint1: 'Click ',
    emptyHint2: ' to open a .md file, ',
    emptyHint3: 'or drag a file here.',
    open: 'Open',
  },
  topbar: {
    back: 'Back',
    forward: 'Forward',
    saved: 'Saved',
    open: 'Open',
    save: 'Save',
    share: 'Share',
    toggleTheme: 'Toggle Theme',
    settings: 'Settings',
  },
  status: {
    saved: 'Saved',
    chars: 'Chars',
    lines: 'Lines',
    cols: 'Cols',
    markdown: 'Markdown',
  },
  settings: {
    title: 'Document Settings',
    close: 'Close',
    themeColor: 'Theme Color',
    fontStyle: 'Font Style',
    sansSerif: 'Sans Serif',
    serif: 'Serif',
    pageWidth: 'Page Width',
    standardWidth: 'Standard',
    fullWidth: 'Full Width',
    uiLanguage: 'UI Language',
    langZhCN: '简体中文',
    langEn: 'English',
  },
  panel: {
    title: 'Enhanced Blocks',
  },
  runtime: {
    python: 'Python (Pyodide)',
    sql: 'SQL (DuckDB)',
    load: 'Load',
  },
  slashMenu: {
    groupName: 'Enhanced Blocks',
    liveDataTitle: 'Live Data',
    liveDataDesc: 'Bind live data sources (polling/SSE/WebSocket)',
    jsTitle: 'JavaScript',
    jsDesc: 'Execute JS code in browser sandbox',
    pythonTitle: 'Python',
    pythonDesc: 'Execute Python code in browser (Pyodide)',
    sqlTitle: 'SQL',
    sqlDesc: 'Browser-side SQL queries (DuckDB-Wasm)',
    chartTitle: 'Chart',
    chartDesc: 'Render interactive ECharts charts',
    model3dTitle: '3D Model',
    model3dDesc: 'Embed glTF/GLB 3D models',
    assetTitle: 'Asset',
    assetDesc: 'Embed images/video/audio/PDF media',
  },
  saveDialog: {
    title: 'Save File',
    label: 'File Name',
    placeholder: 'Enter file name...',
    confirm: 'Download',
    cancel: 'Cancel',
  },
  common: {
    untitled: 'Untitled',
    open: 'Open',
  },
};

const dicts: Record<Language, TranslationDict> = { 'zh-CN': zh, en };

export function t(lang: Language, path: string): string {
  const parts = path.split('.');
  let node: unknown = dicts[lang];
  for (const p of parts) {
    if (typeof node !== 'object' || node === null) return path;
    node = (node as Record<string, unknown>)[p];
  }
  return typeof node === 'string' ? node : path;
}
