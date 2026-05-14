import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MantineProvider, createTheme, colorsTuple } from '@mantine/core';
import { BlockNoteEditor } from '@boundless-docs/editor';
import { BlockPreviewPanel } from '@boundless-docs/blocks';
import { parseBoundlessBlocks, parseBoundlessDocument } from '@boundless-docs/shared';
import { RuntimeProvider } from '@boundless-docs/runtime';
import { defaultDocument } from './defaultDocument';
import { openMarkdownFile, saveMarkdownFile, downloadMarkdownFile } from './fileService';
import { useSettings, getAccentRGB } from './contexts/SettingsContext';
import { TopBar } from './components/TopBar';
import { SettingsModal } from './components/SettingsModal';
import { LandingPage } from './components/LandingPage';
import { RuntimeStatusCard } from './components/RuntimeStatusCard';
import '@mantine/core/styles.css';
import './styles.css';

// ── Tab types ──────────────────────────────────────────────

interface Tab {
  id: number;
  fileName: string;
  filePath?: string;
  markdown: string;   // current editor body (no frontmatter)
}

let nextTabId = 1;

function makeTab(fileName: string, markdown: string, filePath?: string): Tab {
  return { id: nextTabId++, fileName, filePath, markdown };
}

function generateUntitledName(tabs: Tab[], base: string): string {
  let name = base;
  let n = 1;
  while (tabs.some((t) => t.fileName === name)) {
    name = `${base}-${n}`;
    n++;
  }
  return name;
}

// ── StatusBar ──────────────────────────────────────────────

function StatusBar() {
  const { t } = useSettings();
  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-dot" />
        <span>{t('status.saved')}</span>
        <span>{t('status.markdown')}</span>
      </div>
      <div className="status-right">
        <span>UTF-8</span>
        <span>{t('status.chars')} 0</span>
        <span>{t('status.lines')} 1, {t('status.cols')} 1</span>
      </div>
    </div>
  );
}

// ── Save dialog ────────────────────────────────────────────

function SaveDialog({
  opened,
  defaultName,
  onConfirm,
  onCancel,
  t,
}: {
  opened: boolean;
  defaultName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  t: (path: string) => string;
}) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (opened) {
      setName(defaultName);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [opened, defaultName]);

  if (!opened) return null;

  return (
    <>
      <div className="od-overlay open" onClick={onCancel} />
      <div className="od-drawer open" style={{ zIndex: 210 }} role="dialog" aria-modal="true">
        <div className="od-drawer-header">
          <h2>{t('saveDialog.title')}</h2>
        </div>
        <div className="od-drawer-body">
          <div className="field-group">
            <label>{t('saveDialog.label')}</label>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('saveDialog.placeholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) onConfirm(name.trim());
                if (e.key === 'Escape') onCancel();
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="tb-btn primary" onClick={() => name.trim() && onConfirm(name.trim())}>
              {t('saveDialog.confirm')}
            </button>
            <button className="tb-btn" onClick={onCancel}>
              {t('saveDialog.cancel')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── App ────────────────────────────────────────────────────

interface AppProps { initialDocument?: string }

export function App({ initialDocument = defaultDocument }: AppProps) {
  const { colorScheme, accentColor, typography, layoutWidth, sidebarOpen, language, t } = useSettings();

  const initTab = makeTab(
    t('common.untitled'),
    parseBoundlessDocument(initialDocument).markdown,
  );

  const [showLanding, setShowLanding] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([initTab]);
  const [activeTabId, setActiveTabId] = useState(initTab.id);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId],
  );

  const [liveMarkdown, setLiveMarkdown] = useState(() => activeTab.markdown);

  // Sync liveMarkdown when active tab changes
  useEffect(() => {
    setLiveMarkdown(activeTab.markdown);
  }, [activeTab.id]);

  // Persist liveMarkdown into active tab on change
  const updateActiveTabMarkdown = useCallback(
    (md: string) => {
      setLiveMarkdown(md);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, markdown: md } : t)),
      );
    },
    [activeTabId],
  );

  const enhancedBlocks = useMemo(
    () => parseBoundlessBlocks(liveMarkdown),
    [liveMarkdown],
  );

  const editorMountKey = `${activeTabId}`;

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

  // ── actions ──────────────────────────────────────────────

  const handleOpen = async () => {
    const doc = await openMarkdownFile();
    if (!doc) return;
    const body = parseBoundlessDocument(doc.content).markdown;
    const tab = makeTab(doc.name, body, doc.path);
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
    setShowLanding(false);
  };

  const handleShare = async () => {
    await saveMarkdownFile(liveMarkdown, activeTab.filePath);
  };

  const handleSaveAs = () => {
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = (name: string) => {
    setSaveDialogOpen(false);
    const baseName = name.endsWith('.md') ? name.slice(0, -3) : name;
    downloadMarkdownFile(liveMarkdown, name);
    // Update the tab's file name
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, fileName: baseName, filePath: name } : t)),
    );
  };

  const handleNewDoc = () => {
    const untitled = generateUntitledName(tabs, t('common.untitled'));
    const tab = makeTab(untitled, '');
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  };

  const handleSwitchTab = (tabId: number) => {
    if (tabId === activeTabId) return;
    // liveMarkdown sync is handled by useEffect + updateActiveTabMarkdown
    setActiveTabId(tabId);
  };

  const handleCloseTab = (tabId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return; // keep at least 1 tab
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (tabId === activeTabId) {
        // switch to neighbour
        const idx = prev.findIndex((t) => t.id === tabId);
        const newIdx = Math.min(idx, next.length - 1);
        setActiveTabId(next[newIdx].id);
      }
      return next;
    });
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
                  <span className="brand">{t('sidebar.brandOpen')}<em>{t('sidebar.brandClose')}</em></span>
                </div>
              </div>
              <div className="sidebar-actions">
                <button className="tb-btn primary full-width" onClick={handleNewDoc}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14m-7-7h14" />
                  </svg>
                  {t('sidebar.newDoc')}
                </button>
                <div className="search-input-wrapper">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input type="text" placeholder={t('sidebar.search')} className="search-input" />
                </div>
              </div>
              <div className="sidebar-header">{t('sidebar.fileBrowser')}</div>
              <div className="sidebar-list">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`sidebar-item${tab.id === activeTabId ? ' active' : ''}`}
                    onClick={() => handleSwitchTab(tab.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter') handleSwitchTab(tab.id);
                    }}
                  >
                    <span className="dot md" />
                    <span className="name">{tab.fileName}</span>
                    <span className="meta_file">.md</span>
                    {tabs.length > 1 && (
                      <button
                        className="tb-btn icon-only"
                        style={{ padding: '2px 4px', marginLeft: 'auto', opacity: 0.5 }}
                        onClick={(e) => handleCloseTab(tab.id, e)}
                        title="Close"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <div className="sidebar-empty" style={{ marginTop: 8 }}>
                  {t('sidebar.emptyHint1')}<span className="keystroke">{t('sidebar.open')}</span>{t('sidebar.emptyHint2')}<br/>
                  {t('sidebar.emptyHint3')}
                </div>
              </div>
            </aside>
          )}

          {/* 2. Main Content Area */}
          <main className="app-main">
            <header className="app-topbar">
              <TopBar
                fileName={activeTab.fileName}
                onOpen={handleOpen}
                onSaveAs={handleSaveAs}
                onSave={handleShare}
                onSettingsClick={() => setSettingsOpened(true)}
                onBackToLanding={() => setShowLanding(true)}
              />
            </header>

            <div className={`app-editor-area${layoutWidth === 'full' ? ' wide' : ''}`}>
              <div className="editor-surface">
                <BlockNoteEditor
                  key={editorMountKey}
                  initialMarkdown={activeTab.markdown}
                  onMarkdownChange={updateActiveTabMarkdown}
                  language={language}
                />
              </div>
            </div>
            <StatusBar />
          </main>

          {/* 3. Right Panel */}
          <aside className="app-panel">
            <div className="panel-header">
              <h3>{t('panel.title')}</h3>
            </div>
            <div className="panel-content">
              <RuntimeStatusCard />
              <BlockPreviewPanel blocks={enhancedBlocks} />
            </div>
          </aside>
        </div>

        <SettingsModal opened={settingsOpened} onClose={() => setSettingsOpened(false)} />

        <SaveDialog
          opened={saveDialogOpen}
          defaultName={`${activeTab.fileName}.md`}
          onConfirm={handleSaveConfirm}
          onCancel={() => setSaveDialogOpen(false)}
          t={t}
        />
      </RuntimeProvider>
    </MantineProvider>
  );
}
