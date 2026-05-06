import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export type AccentColor = 'cobalt' | 'indigo' | 'teal' | 'orange' | 'rose';
export type Typography = 'sans' | 'serif';
export type LayoutWidth = 'standard' | 'full';

interface SettingsState {
  colorScheme: 'light' | 'dark';
  accentColor: AccentColor;
  typography: Typography;
  layoutWidth: LayoutWidth;
  sidebarOpen: boolean;
}

interface SettingsContextType extends SettingsState {
  setColorScheme: (val: 'light' | 'dark') => void;
  setAccentColor: (val: AccentColor) => void;
  setTypography: (val: Typography) => void;
  setLayoutWidth: (val: LayoutWidth) => void;
  setSidebarOpen: (val: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const ACCENT_MAP: Record<AccentColor, { rgb: string; name: string }> = {
  cobalt:  { rgb: '47,111,235', name: '钴蓝' },
  indigo:  { rgb: '79,70,228', name: '靛青' },
  teal:    { rgb: '13,148,136', name: '青绿' },
  orange:  { rgb: '234,88,12',  name: '暖橙' },
  rose:    { rgb: '225,29,72',  name: '玫红' },
};

export function getAccentRGB(color: AccentColor): string {
  return ACCENT_MAP[color].rgb;
}

export function getAccentName(color: AccentColor): string {
  return ACCENT_MAP[color].name;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColor] = useState<AccentColor>('cobalt');
  const [typography, setTypography] = useState<Typography>('sans');
  const [layoutWidth, setLayoutWidth] = useState<LayoutWidth>('standard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const contextValue = useMemo(() => ({
    colorScheme, setColorScheme,
    accentColor, setAccentColor,
    typography, setTypography,
    layoutWidth, setLayoutWidth,
    sidebarOpen, setSidebarOpen
  }), [colorScheme, accentColor, typography, layoutWidth, sidebarOpen]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
