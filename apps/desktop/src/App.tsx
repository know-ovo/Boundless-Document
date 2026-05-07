import { useState, useEffect, useMemo, useCallback } from 'react';
import { MantineProvider, createTheme, colorsTuple } from '@mantine/core';
import { BlockNoteEditor } from '@boundless-docs/editor';
import { BlockPreviewPanel } from '@boundless-docs/blocks';
import { parseBoundlessBlocks, parseBoundlessDocument } from '@boundless-docs/shared';
import { RuntimeProvider } from '@boundless-docs/runtime';
import { defaultDocument } from './defaultDocument';
import { openMarkdownFile, saveMarkdownFile } from './fileService';
import { useSettings, getAccentRGB } from './contexts/SettingsContext';
import { TopBar } from './components/TopBar';
import { SettingsModal } from './components/SettingsModal';
import { LandingPage } from './components/LandingPage';
import { RuntimeStatusCard } from './components/RuntimeStatusCard';
import '@mantine/core/styles.css';
import './styles.css';

function StatusBar() {
  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-dot" />
        <span>已保存</span>
        <span>Markdown</span>
      </div>
      <div className="status-right">
        <span>UTF-8</span>
        <span>字数 0</span>
        <span>行 1, 列 1</span>
      </div>
    </div>
  );
}

interface AppProps { initialDocument?: string }

export function App({ initialDocument = defaultDocument }: AppProps) {
  const [showLanding, setShowLanding] = useState(true);
  const [filePath, setFilePath] = useState<string | undefined>();
  const [fileName, setFileName] = useState('未命名');
  const [docContent, setDocContent] = useState(initialDocument);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const { colorScheme, accentColor, typography, layoutWidth, sidebarOpen } = useSettings();

  const parsedDoc = useMemo(() => parseBoundlessDocument(docContent), [docContent]);
  const [liveMarkdown, setLiveMarkdown] = useState(() => parsedDoc.markdown);
  useEffect(() => {
    setLiveMarkdown(parsedDoc.markdown);
  }, [parsedDoc.markdown]);

  const enhancedBlocks = useMemo(
    () => parseBoundlessBlocks(liveMarkdown),
    [liveMarkdown],
  );

  const handleMarkdownChange = useCallback((md: string) => {
    setLiveMarkdown(md);
  }, []);

  const editorMountKey = `${fileName}:${docContent.length}`;

  // inject accent into CSS variable
  useEffect(() => {
    const rgb = getAccentRGB(accentColor);
    document.documentElement.style.setProperty('--accent', `rgb(${rgb})`);
  }, [accentColor]);

  const theme = useMemo(() => createTheme({
    primaryColor: accentColor === 'cobalt' ? 'blue' : accentColor,
    fontFamily: typography === 'sans'
      ? '-apple-system, BlinkMacSystemFont, "Inter Tight", "SF Pro Display", "Segoe UI", system-ui, sans-serif'
      : 'Charter, Georgia, "Times New Roman", "Noto Serif SC", serif',
    colors: { cobalt: colorsTuple('#2f6feb') },
  }), [accentColor, typography]);

  const handleOpen = async () => {
    const doc = await openMarkdownFile();
    if (!doc) return;
    setFileName(doc.name);
    setFilePath(doc.path);
    setDocContent(doc.content);
    setShowLanding(false);
  };

  const handleSave = async () => {
    await saveMarkdownFile(liveMarkdown, filePath);
  };

  // ── LANDING ──────────────────────────────────────────────
  if (showLanding) {
    return (
      <MantineProvider theme={theme} forceColorScheme={colorScheme}>
        <LandingPage onEnter={() => setShowLanding(false)} />
      </MantineProvider>
    );
  }

  // ── EDITOR ───────────────────────────────────────────────
  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      <RuntimeProvider>
        <div className="app-container">
          {/* 1. Left Sidebar */}
          {sidebarOpen && (
            <aside className="app-sidebar editor-sidebar">
              <div className="sidebar-brand">
                <div className="sidebar-profile">
                  <div className="avatar placeholder">U</div>
                  <span className="brand">无界<em>文档</em></span>
                </div>
              </div>
              <div className="sidebar-actions">
                <button className="tb-btn primary full-width">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14m-7-7h14" />
                  </svg>
                  新建文档
                </button>
                <div className="search-input-wrapper">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input type="text" placeholder="搜索..." className="search-input" />
                </div>
              </div>
              <div className="sidebar-header">文件浏览</div>
              <div className="sidebar-list">
                {fileName !== '未命名' ? (
                  <div className="sidebar-item active">
                    <span className="dot md" />
                    <span className="name">{fileName}</span>
                    <span className="meta_file">.md</span>
                  </div>
                ) : (
                  <div className="sidebar-empty">
                    点击 <span className="keystroke">打开</span> 选择 .md 文件，<br/>
                    或拖拽文件到这里。
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* 2. Main Content Area */}
          <main className="app-main">
            <header className="app-topbar">
              <TopBar
                fileName={fileName}
                onOpen={handleOpen}
                onSave={handleSave}
                onSettingsClick={() => setSettingsOpened(true)}
                onBackToLanding={() => setShowLanding(true)}
              />
            </header>

            <div className={`app-editor-area${layoutWidth === 'full' ? ' wide' : ''}`}>
              <div className="editor-surface">
                <BlockNoteEditor
                  key={editorMountKey}
                  initialMarkdown={parsedDoc.markdown}
                  onMarkdownChange={handleMarkdownChange}
                />
              </div>
            </div>
            <StatusBar />
          </main>

          {/* 3. Right Panel (Execution/Enhancements) */}
          <aside className="app-panel">
            <div className="panel-header">
              <h3>增强块预览</h3>
            </div>
            <div className="panel-content">
              <RuntimeStatusCard />
              <BlockPreviewPanel blocks={enhancedBlocks} />
            </div>
          </aside>
        </div>

        <SettingsModal opened={settingsOpened} onClose={() => setSettingsOpened(false)} />
      </RuntimeProvider>
    </MantineProvider>
  );
}
