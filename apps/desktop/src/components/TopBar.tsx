import { useSettings } from '../contexts/SettingsContext';

interface TopBarProps {
  fileName: string;
  /** 相对磁盘快照是否有未写入的编辑 */
  dirty: boolean;
  /** 正在写入磁盘 */
  saving?: boolean;
  onOpen: () => void;
  onSave: () => void | Promise<void>;
  onSettingsClick: () => void;
  onBackToLanding: () => void;
}

/* ── inline icons (16×16, stroke 1.5) ─────────────────────────── */
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
);
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
export function TopBar({
  fileName,
  dirty,
  saving,
  onOpen,
  onSave,
  onSettingsClick,
  onBackToLanding,
}: TopBarProps) {
  const { colorScheme, setColorScheme } = useSettings();
  const statusText = saving ? '保存中…' : dirty ? '未保存' : '已保存';

  return (
    <div className="top-bar">
      <div className="tb-left">
        <button className="tb-btn icon-only" title="后退" onClick={onBackToLanding}>
          <IconArrowLeft />
        </button>
        <button className="tb-btn icon-only" title="前进">
          <IconArrowRight />
        </button>
        <span className="tb-status">
          <span className={`status-dot${dirty || saving ? ' dirty' : ''}`} />
          {statusText}
        </span>
      </div>

      <span className="spacer" />

      {/* actions */}
      <div className="btn-group">
        <button className="tb-btn" onClick={onOpen}>
          打开
        </button>

        <button
          className="tb-btn primary"
          onClick={() => void onSave()}
          disabled={saving || !dirty}
          title={!dirty ? '没有需要保存的更改' : '保存到文件'}
        >
          保存
        </button>

        <button
          className="tb-btn icon-only"
          onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
          title="切换主题"
        >
          {colorScheme === 'light' ? <IconMoon /> : <IconSun />}
        </button>

        <button className="tb-btn icon-only" onClick={onSettingsClick} title="设置">
          <IconSettings />
        </button>

        <div className="avatar placeholder small">U</div>
      </div>
    </div>
  );
}
