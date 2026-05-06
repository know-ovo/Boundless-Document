import { useSettings, AccentColor, getAccentRGB, getAccentName } from '../contexts/SettingsContext';

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

const COLORS: AccentColor[] = ['cobalt', 'indigo', 'teal', 'orange', 'rose'];

/* ── inline icons ─────────────────────────────────────────────── */
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);
const IconPalette = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.01 17.461 2 12 2z"/></svg>
);
const IconType = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
);
const IconLayout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
);

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const { typography, setTypography, layoutWidth, setLayoutWidth, accentColor, setAccentColor } = useSettings();

  return (
    <>
      {/* Overlay */}
      <div
        className={`od-overlay${opened ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden={!opened}
      />
      {/* Drawer */}
      <div
        className={`od-drawer${opened ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!opened}
      >
        <div className="od-drawer-header">
          <h2>文档设置</h2>
          <button className="tb-btn icon-only" onClick={onClose} title="关闭">
            <IconClose />
          </button>
        </div>

        <div className="od-drawer-body">
          <div className="field-group">
            <label>
              <IconPalette />
              主题色
            </label>
            <div className="od-swatches">
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`od-swatch${accentColor === c ? ' active' : ''}`}
                  style={{ background: `rgb(${getAccentRGB(c)})` }}
                  onClick={() => setAccentColor(c)}
                  title={getAccentName(c)}
                />
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>
              <IconType />
              字体风格
            </label>
            <div className="od-segmented">
              <button className={typography === 'sans' ? 'active' : ''} onClick={() => setTypography('sans')}>
                无衬线
              </button>
              <button className={typography === 'serif' ? 'active' : ''} onClick={() => setTypography('serif')}>
                衬线
              </button>
            </div>
          </div>

          <div className="field-group">
            <label>
              <IconLayout />
              页面宽度
            </label>
            <div className="od-segmented">
              <button className={layoutWidth === 'standard' ? 'active' : ''} onClick={() => setLayoutWidth('standard')}>
                标准居中
              </button>
              <button className={layoutWidth === 'full' ? 'active' : ''} onClick={() => setLayoutWidth('full')}>
                宽屏模式
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
