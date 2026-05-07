import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MantineProvider, createTheme, colorsTuple } from '@mantine/core';
import { BlockNoteEditor } from '@boundless-docs/editor';
import { BlockPreviewPanel } from '@boundless-docs/blocks';
import { parseBoundlessBlocks, parseBoundlessDocument } from '@boundless-docs/shared';
import { RuntimeProvider } from '@boundless-docs/runtime';
import { defaultDocument } from './defaultDocument';
import {
  openMarkdownFile,
  saveMarkdownFile,
  readMarkdownFromPath,
  type OpenedDocument,
} from './fileService';
import { useSettings, getAccentRGB } from './contexts/SettingsContext';
import { TopBar } from './components/TopBar';
import { SettingsModal } from './components/SettingsModal';
import { LandingPage } from './components/LandingPage';
import { RuntimeStatusCard } from './components/RuntimeStatusCard';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
import { getDocumentStats } from './documentStats';
import '@mantine/core/styles.css';
import './styles.css';

type SaveOutcome = 'saved' | 'cancelled' | 'failed';

type PendingOp =
  | { type: 'new' }
  | { type: 'open-picker' }
  | { type: 'landing' }
  | { type: 'apply-doc'; doc: OpenedDocument }
  | { type: 'load-path'; path: string };

interface StatusBarProps {
  markdown: string;
  dirty: boolean;
  saveError: string | null;
  isSaving: boolean;
}

function StatusBar({ markdown, dirty, saveError, isSaving }: StatusBarProps) {
  const { lines, chars } = useMemo(() => getDocumentStats(markdown), [markdown]);
  const dotDirty = Boolean(saveError) || dirty || isSaving;

  return (
    <div className="status-bar">
      <div className="status-left">
        {saveError ? (
          <span className="status-error" title={saveError}>
            保存失败：{saveError}
          </span>
        ) : (
          <>
            <span className={`status-dot${dotDirty ? ' dirty' : ''}`} />
            <span>{isSaving ? '保存中…' : dirty ? '未保存' : '已保存'}</span>
          </>
        )}
        <span>Markdown</span>
      </div>
      <div className="status-right">
        <span>UTF-8</span>
        <span>字数 {chars}</span>
        <span>行 {lines}</span>
      </div>
    </div>
  );
}

interface SidebarRow {
  path?: string;
  name: string;
  current: boolean;
}

interface AppProps { initialDocument?: string }

export function App({ initialDocument = defaultDocument }: AppProps) {
  const [showLanding, setShowLanding] = useState(true);
  const [filePath, setFilePath] = useState<string | undefined>();
  const [fileName, setFileName] = useState('未命名');
  const [docContent, setDocContent] = useState(initialDocument);
  const [docSession, setDocSession] = useState(0);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [sidebarDragOver, setSidebarDragOver] = useState(false);
  const [recentFiles, setRecentFiles] = useState<Array<{ path: string; name: string }>>([]);
  const [pendingOp, setPendingOp] = useState<PendingOp | null>(null);
  const [confirmSaving, setConfirmSaving] = useState(false);
  const pendingRef = useRef<PendingOp | null>(null);
  pendingRef.current = pendingOp;
  const { colorScheme, accentColor, typography, layoutWidth, sidebarOpen } = useSettings();

  const parsedDoc = useMemo(() => parseBoundlessDocument(docContent), [docContent]);
  const [liveMarkdown, setLiveMarkdown] = useState(() => parsedDoc.markdown);
  const [lastSavedMarkdown, setLastSavedMarkdown] = useState(() => parsedDoc.markdown);

  useEffect(() => {
    setLiveMarkdown(parsedDoc.markdown);
  }, [parsedDoc.markdown]);

  useEffect(() => {
    const { markdown } = parseBoundlessDocument(docContent);
    setLastSavedMarkdown(markdown);
    setSaveError(null);
  }, [docContent]);

  const dirty = liveMarkdown !== lastSavedMarkdown;

  const enhancedBlocks = useMemo(
    () => parseBoundlessBlocks(liveMarkdown),
    [liveMarkdown],
  );

  const handleMarkdownChange = useCallback((md: string) => {
    setLiveMarkdown(md);
  }, []);

  const editorMountKey = `${docSession}:${fileName}:${docContent.length}`;

  const applyDocument = useCallback((doc: OpenedDocument) => {
    setFileName(doc.name);
    setFilePath(doc.path);
    setDocContent(doc.content);
    setDocSession((n) => n + 1);
    setSaveError(null);
    setShowLanding(false);
    const docPath = doc.path;
    if (docPath) {
      setRecentFiles((prev) => {
        const rest = prev.filter((r) => r.path !== docPath);
        return [{ path: docPath, name: doc.name }, ...rest].slice(0, 8);
      });
    }
  }, []);

  const saveDocument = useCallback(async (): Promise<SaveOutcome> => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const result = await saveMarkdownFile(liveMarkdown, filePath);
      if (result.cancelled) {
        setIsSaving(false);
        return 'cancelled';
      }
      const savedPath = result.path;
      if (savedPath) {
        setFilePath(savedPath);
        const name = savedPath.split(/[\\/]/).pop() ?? fileName;
        setFileName(name);
        setRecentFiles((prev) => {
          const rest = prev.filter((r) => r.path !== savedPath);
          return [{ path: savedPath, name }, ...rest].slice(0, 8);
        });
      }
      setLastSavedMarkdown(liveMarkdown);
      setIsSaving(false);
      return 'saved';
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
      setIsSaving(false);
      return 'failed';
    }
  }, [liveMarkdown, filePath, fileName]);

  const executePending = useCallback(
    async (op: PendingOp) => {
      switch (op.type) {
        case 'new':
          setDocContent(defaultDocument);
          setFileName('未命名');
          setFilePath(undefined);
          setDocSession((n) => n + 1);
          setSaveError(null);
          break;
        case 'open-picker': {
          const doc = await openMarkdownFile();
          if (doc) applyDocument(doc);
          break;
        }
        case 'landing':
          setShowLanding(true);
          break;
        case 'apply-doc':
          applyDocument(op.doc);
          break;
        case 'load-path': {
          try {
            const content = await readMarkdownFromPath(op.path);
            const name = op.path.split(/[\\/]/).pop() ?? op.path;
            applyDocument({ path: op.path, name, content });
          } catch (e) {
            setSaveError(e instanceof Error ? e.message : String(e));
          }
          break;
        }
      }
    },
    [applyDocument],
  );

  const startPending = useCallback(
    (op: PendingOp) => {
      if (!dirty) {
        void executePending(op);
        return;
      }
      setPendingOp(op);
    },
    [dirty, executePending],
  );

  const handleRequestNew = useCallback(() => {
    startPending({ type: 'new' });
  }, [startPending]);

  const handleRequestOpen = useCallback(() => {
    startPending({ type: 'open-picker' });
  }, [startPending]);

  const handleRequestLanding = useCallback(() => {
    startPending({ type: 'landing' });
  }, [startPending]);

  const handleSelectRecentPath = useCallback(
    (path: string) => {
      if (path === filePath) return;
      startPending({ type: 'load-path', path });
    },
    [filePath, startPending],
  );

  const handleDroppedMarkdownFile = useCallback(
    async (file: File) => {
      if (!/\.(md|markdown)$/i.test(file.name)) {
        setSaveError('请拖入 .md 或 .markdown 文件');
        return;
      }
      const content = await file.text();
      const doc: OpenedDocument = { name: file.name, content };
      if (!dirty) {
        applyDocument(doc);
        return;
      }
      setPendingOp({ type: 'apply-doc', doc });
    },
    [applyDocument, dirty],
  );

  const handleConfirmCancel = useCallback(() => {
    setPendingOp(null);
    setConfirmSaving(false);
  }, []);

  const handleConfirmDiscard = useCallback(() => {
    const op = pendingOp;
    if (!op) return;
    setPendingOp(null);
    void executePending(op);
  }, [pendingOp, executePending]);

  const handleConfirmSave = useCallback(async () => {
    const op = pendingOp;
    if (!op) return;
    setConfirmSaving(true);
    try {
      const outcome = await saveDocument();
      if (outcome !== 'saved') return;
      setPendingOp(null);
      await executePending(op);
    } finally {
      setConfirmSaving(false);
    }
  }, [pendingOp, saveDocument, executePending]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (pendingRef.current) return;
        if (!dirty || isSaving) return;
        void saveDocument();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, isSaving, saveDocument]);

  const sidebarRows = useMemo((): SidebarRow[] => {
    const rows: SidebarRow[] = [{ path: filePath, name: fileName, current: true }];
    for (const r of recentFiles) {
      if (r.path === filePath) continue;
      rows.push({ path: r.path, name: r.name, current: false });
    }
    const q = sidebarQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.path?.toLowerCase().includes(q) ?? false),
    );
  }, [filePath, fileName, recentFiles, sidebarQuery]);

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
          {sidebarOpen && (
            <aside className="app-sidebar editor-sidebar">
              <div className="sidebar-brand">
                <div className="sidebar-profile">
                  <div className="avatar placeholder">U</div>
                  <span className="brand">无界<em>文档</em></span>
                </div>
              </div>
              <div className="sidebar-actions">
                <button type="button" className="tb-btn primary full-width" onClick={handleRequestNew}>
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
                  <input
                    type="search"
                    value={sidebarQuery}
                    onChange={(e) => setSidebarQuery(e.target.value)}
                    placeholder="按文件名或路径筛选…"
                    className="search-input"
                    aria-label="筛选侧栏文件列表"
                  />
                </div>
              </div>
              <div className="sidebar-header">文件与最近</div>
              <div
                className={`sidebar-list${sidebarDragOver ? ' drop-target' : ''}`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.types.includes('Files')) setSidebarDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.types.includes('Files')) {
                    e.dataTransfer.dropEffect = 'copy';
                    setSidebarDragOver(true);
                  }
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setSidebarDragOver(false);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setSidebarDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) void handleDroppedMarkdownFile(f);
                }}
              >
                {sidebarRows.length === 0 ? (
                  <div className="sidebar-empty">
                    没有匹配「{sidebarQuery}」的条目。<br />
                    清空搜索或修改关键词。
                  </div>
                ) : (
                  sidebarRows.map((row) => (
                    <div
                      key={row.current ? 'current' : row.path ?? row.name}
                      className={`sidebar-item${row.current ? ' active' : ''}`}
                      onClick={() => {
                        if (row.current || !row.path) return;
                        handleSelectRecentPath(row.path);
                      }}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' && row.path && !row.current) {
                          handleSelectRecentPath(row.path);
                        }
                      }}
                      role={row.path && !row.current ? 'button' : undefined}
                      tabIndex={row.path && !row.current ? 0 : undefined}
                      style={{
                        cursor: row.current || !row.path ? 'default' : 'pointer',
                      }}
                    >
                      <span className={`dot ${row.path ? 'md' : 'yaml'}`} />
                      <span className="name" title={row.path ?? row.name}>
                        {row.name}
                      </span>
                      <span className="meta_file">.md</span>
                    </div>
                  ))
                )}
                <div className="sidebar-empty" style={{ marginTop: 8 }}>
                  将 Markdown 文件<strong>拖入上方区域</strong>即可打开。
                  {filePath ? null : (
                    <>
                      <br />
                      桌面版保存后可出现在「最近」列表中。
                    </>
                  )}
                </div>
              </div>
            </aside>
          )}

          <main className="app-main">
            <header className="app-topbar">
              <TopBar
                fileName={fileName}
                dirty={dirty}
                saving={isSaving}
                onOpen={handleRequestOpen}
                onSave={() => void saveDocument()}
                onSettingsClick={() => setSettingsOpened(true)}
                onBackToLanding={handleRequestLanding}
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
            <StatusBar
              markdown={liveMarkdown}
              dirty={dirty}
              saveError={saveError}
              isSaving={isSaving}
            />
          </main>

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

        <UnsavedChangesModal
          opened={pendingOp !== null}
          saving={confirmSaving}
          onSaveAndContinue={handleConfirmSave}
          onDiscard={handleConfirmDiscard}
          onCancel={handleConfirmCancel}
        />
        <SettingsModal opened={settingsOpened} onClose={() => setSettingsOpened(false)} />
      </RuntimeProvider>
    </MantineProvider>
  );
}
