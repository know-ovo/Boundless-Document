import { useSettings } from '../contexts/SettingsContext';

interface TopBarProps {
  fileName: string;
  onOpen: () => void;
  onSaveAs: () => void;
  onSave: () => void;
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
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export function TopBar({ fileName, onOpen, onSaveAs, onSave, onSettingsClick, onBackToLanding }: TopBarProps) {
  const { colorScheme, setColorScheme, t } = useSettings();

  return (
    <div className="top-bar">
      <div className="tb-left">
        <button className="tb-btn icon-only" title={t('topbar.back')} onClick={onBackToLanding}>
          <IconArrowLeft />
        </button>
        <button className="tb-btn icon-only" title={t('topbar.forward')}>
          <IconArrowRight />
        </button>
        <span className="tb-status">
          <span className="status-dot" />
          {t('topbar.saved')}
        </span>
      </div>

      <span className="spacer" />

      {/* actions */}
      <div className="btn-group">
        <button className="tb-btn" onClick={onOpen}>
          {t('topbar.open')}
        </button>

        <button className="tb-btn" onClick={onSaveAs}>
          {t('topbar.save')}
        </button>

        <button className="tb-btn primary" onClick={onSave}>
          {t('topbar.share')}
        </button>

        <button
          className="tb-btn icon-only"
          onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
          title={t('topbar.toggleTheme')}
        >
          {colorScheme === 'light' ? <IconMoon /> : <IconSun />}
        </button>

        <button className="tb-btn icon-only" onClick={onSettingsClick} title={t('topbar.settings')}>
          <IconSettings />
        </button>

        <div className="avatar placeholder small">U</div>
      </div>
    </div>
  );
}
