# Frontend UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the desktop app's frontend to a minimalist, modern design with Mantine UI, featuring a responsive layout, warm beige background, customizable accent colors, and typography settings.

**Architecture:** Use Mantine's `AppShell` for layout management (Header, Navbar, Main). Manage global settings (theme, accent color, typography) using React state/context integrated with `MantineProvider`. Settings modal controls these states.

**Tech Stack:** React, Mantine v7, CSS Modules / Global CSS, Vite, TypeScript.

---

### Task 1: Setup Global Settings Context

**Files:**
- Create: `apps/desktop/src/contexts/SettingsContext.tsx`
- Modify: `apps/desktop/src/main.tsx:1-20` (Wrap App in Provider)

- [ ] **Step 1: Define settings types and context**

```typescript
// apps/desktop/src/contexts/SettingsContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

export type AccentColor = 'indigo' | 'teal' | 'orange' | 'red';
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

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColor] = useState<AccentColor>('indigo');
  const [typography, setTypography] = useState<Typography>('sans');
  const [layoutWidth, setLayoutWidth] = useState<LayoutWidth>('standard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SettingsContext.Provider value={{
      colorScheme, setColorScheme,
      accentColor, setAccentColor,
      typography, setTypography,
      layoutWidth, setLayoutWidth,
      sidebarOpen, setSidebarOpen
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
```

- [ ] **Step 2: Wrap App in SettingsProvider**

```typescript
// Modify apps/desktop/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { SettingsProvider } from "./contexts/SettingsContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
);
```

- [ ] **Step 3: Run typecheck**
Run: `npm run typecheck --prefix apps/desktop`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add apps/desktop/src/contexts/SettingsContext.tsx apps/desktop/src/main.tsx
git commit -m "feat(ui): add global settings context"
```

### Task 2: Configure Mantine Theme

**Files:**
- Modify: `apps/desktop/src/App.tsx:1-40`
- Modify: `apps/desktop/src/styles.css:1-20`

- [ ] **Step 1: Apply Mantine Theme based on Settings**

```typescript
// Modify apps/desktop/src/App.tsx
import { useState } from 'react';
import { MantineProvider, createTheme, colorsTuple } from '@mantine/core';
import { BlockNoteEditor } from '@boundless-docs/editor';
import { RuntimeProvider } from '@boundless-docs/runtime';
import { openMarkdownFile, saveMarkdownFile } from './fileService';
import { useSettings } from './contexts/SettingsContext';
import '@mantine/core/styles.css';
import './styles.css';

export function App() {
  const [filePath, setFilePath] = useState<string | undefined>();
  const [fileName, setFileName] = useState('未命名');
  const { colorScheme, accentColor, typography } = useSettings();

  const theme = createTheme({
    primaryColor: accentColor,
    fontFamily: typography === 'sans' 
      ? 'Inter, system-ui, -apple-system, "Microsoft YaHei", sans-serif'
      : 'Georgia, "Times New Roman", Times, serif',
    colors: {
      // Define a custom beige color palette if needed, or use Mantine defaults
      beige: colorsTuple('#FAF9F6'), 
    },
    // Force light/dark mode override here if necessary, though Mantine often handles it via data-attributes on html/body
  });

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      <RuntimeProvider>
        {/* We will replace this div with AppShell in the next task */}
        <div className="app-shell" style={{background: colorScheme === 'light' ? '#FAF9F6' : undefined}}>
           {/* content truncated for brevity, we will rewrite it anyway */}
           <p>Testing Theme</p>
        </div>
      </RuntimeProvider>
    </MantineProvider>
  );
}
```

- [ ] **Step 2: Add global CSS overrides**

```css
/* Modify apps/desktop/src/styles.css */
body {
  margin: 0;
  background-color: var(--mantine-color-body);
}

/* Warm base for light mode */
:root[data-mantine-color-scheme="light"] {
  --mantine-color-body: #FAF9F6; /* Beige */
}

/* Base resets */
h1:focus, p:focus {
  outline: none;
}
```

- [ ] **Step 3: Run typecheck**
Run: `npm run typecheck --prefix apps/desktop`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add apps/desktop/src/App.tsx apps/desktop/src/styles.css
git commit -m "style: configure mantine theme with beige base and dynamic settings"
```

### Task 3: Implement AppShell Layout

**Files:**
- Modify: `apps/desktop/src/App.tsx`
- Create: `apps/desktop/src/components/TopBar.tsx`

- [ ] **Step 1: Create TopBar component**

```typescript
// apps/desktop/src/components/TopBar.tsx
import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core';
import { useSettings } from '../contexts/SettingsContext';

interface TopBarProps {
  fileName: string;
  onOpen: () => void;
  onSave: () => void;
  onSettingsClick: () => void;
}

export function TopBar({ fileName, onOpen, onSave, onSettingsClick }: TopBarProps) {
  const { sidebarOpen, setSidebarOpen, colorScheme, setColorScheme } = useSettings();

  return (
    <Group h="100%" px="md" justify="space-between" style={{ borderBottom: '1px solid transparent', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'}}>
      <Group>
        <ActionIcon variant="subtle" color="gray" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </ActionIcon>
        <Text fw={700} c="primary"></Text>
        <Text size="sm" c="dimmed">/ {fileName}</Text>
      </Group>

      <Group gap="sm">
        <Button variant="subtle" color="gray" size="xs" onClick={onOpen}>打开</Button>
        <Button variant="light" size="xs" onClick={onSave}>保存</Button>
        <Tooltip label="切换主题">
          <ActionIcon variant="subtle" color="gray" onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}>
            {colorScheme === 'light' ? '🌙' : '☀️'}
          </ActionIcon>
        </Tooltip>
        <ActionIcon variant="subtle" color="gray" onClick={onSettingsClick}>
          ⚙️
        </ActionIcon>
      </Group>
    </Group>
  );
}
```

- [ ] **Step 2: Rewrite App.tsx using AppShell**

```typescript
// Modify apps/desktop/src/App.tsx
import { useState } from 'react';
import { MantineProvider, createTheme, colorsTuple, AppShell, Container } from '@mantine/core';
import { BlockNoteEditor } from '@boundless-docs/editor';
import { RuntimeProvider } from '@boundless-docs/runtime';
import { openMarkdownFile, saveMarkdownFile } from './fileService';
import { useSettings } from './contexts/SettingsContext';
import { TopBar } from './components/TopBar';
import '@mantine/core/styles.css';
import './styles.css';

export function App() {
  const [filePath, setFilePath] = useState<string | undefined>();
  const [fileName, setFileName] = useState('未命名');
  const [settingsOpened, setSettingsOpened] = useState(false);
  const { colorScheme, accentColor, typography, layoutWidth, sidebarOpen } = useSettings();

  const theme = createTheme({
    primaryColor: accentColor,
    fontFamily: typography === 'sans' 
      ? 'Inter, system-ui, -apple-system, "Microsoft YaHei", sans-serif'
      : 'Georgia, "Times New Roman", Times, serif',
  });

  const handleOpen = async () => {
    const doc = await openMarkdownFile();
    if (!doc) return;
    setFileName(doc.name);
    setFilePath(doc.path);
  };

  const handleSave = async () => {
    await saveMarkdownFile('<!-- boundless-doc -->\n\n# 新文档', filePath);
  };

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      <RuntimeProvider>
        <AppShell
          header={{ height: 50 }}
          navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !sidebarOpen, desktop: !sidebarOpen } }}
          padding="md"
        >
          <AppShell.Header style={{ background: 'transparent', borderBottom: 'none' }}>
            <TopBar 
              fileName={fileName} 
              onOpen={handleOpen} 
              onSave={handleSave} 
              onSettingsClick={() => setSettingsOpened(true)} 
            />
          </AppShell.Header>

          <AppShell.Navbar p="md" style={{ borderRight: '1px solid rgba(0,0,0,0.05)', background: colorScheme === 'light' ? '#fdfdfc' : undefined }}>
            <div style={{ color: '#888', fontSize: 13 }}>文件目录 (开发中...)</div>
          </AppShell.Navbar>

          <AppShell.Main>
            <Container size={layoutWidth === 'full' ? '100%' : 800} pt="xl">
              <BlockNoteEditor />
            </Container>
          </AppShell.Main>
        </AppShell>

        {/* Settings Modal placeholder */}
        {settingsOpened && (
          <div style={{position:'absolute', top: 50, right: 20, padding: 20, background: 'white', border: '1px solid #ccc', zIndex: 1000}}>
             Settings Modal (TBD)
             <button onClick={() => setSettingsOpened(false)}>Close</button>
          </div>
        )}
      </RuntimeProvider>
    </MantineProvider>
  );
}
```

- [ ] **Step 3: Run typecheck**
Run: `npm run typecheck --prefix apps/desktop`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add apps/desktop/src/components/TopBar.tsx apps/desktop/src/App.tsx
git commit -m "feat(ui): implement AppShell layout and TopBar"
```

### Task 4: Implement Settings Modal

**Files:**
- Create: `apps/desktop/src/components/SettingsModal.tsx`
- Modify: `apps/desktop/src/App.tsx`

- [ ] **Step 1: Create SettingsModal component**

```typescript
// apps/desktop/src/components/SettingsModal.tsx
import { Modal, Stack, SegmentedControl, Text, ColorSwatch, Group, useMantineTheme } from '@mantine/core';
import { useSettings, AccentColor } from '../contexts/SettingsContext';

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const { typography, setTypography, layoutWidth, setLayoutWidth, accentColor, setAccentColor } = useSettings();
  const theme = useMantineTheme();

  const colors: AccentColor[] = ['indigo', 'teal', 'orange', 'red'];

  return (
    <Modal opened={opened} onClose={onClose} title="文档设置" centered overlayProps={{ backgroundOpacity: 0.2 }}>
      <Stack gap="lg">
        <div>
          <Text size="sm" fw={500} mb={5}>主题色</Text>
          <Group gap="xs">
            {colors.map((c) => (
              <ColorSwatch 
                key={c} 
                color={theme.colors[c][6]} 
                onClick={() => setAccentColor(c)}
                style={{ cursor: 'pointer', border: accentColor === c ? '2px solid black' : 'none' }}
              />
            ))}
          </Group>
        </div>

        <div>
          <Text size="sm" fw={500} mb={5}>字体风格</Text>
          <SegmentedControl
            fullWidth
            value={typography}
            onChange={(val) => setTypography(val as any)}
            data={[
              { label: '无衬线体 (现代)', value: 'sans' },
              { label: '衬线体 (阅读)', value: 'serif' },
            ]}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb={5}>页面宽度</Text>
          <SegmentedControl
            fullWidth
            value={layoutWidth}
            onChange={(val) => setLayoutWidth(val as any)}
            data={[
              { label: '标准居中', value: 'standard' },
              { label: '宽屏模式', value: 'full' },
            ]}
          />
        </div>
      </Stack>
    </Modal>
  );
}
```

- [ ] **Step 2: Integrate SettingsModal in App.tsx**

```typescript
// Modify apps/desktop/src/App.tsx (Replace placeholder)
// Add import:
import { SettingsModal } from './components/SettingsModal';

// Replace the placeholder div at the bottom of App() with:
<SettingsModal opened={settingsOpened} onClose={() => setSettingsOpened(false)} />
```

- [ ] **Step 3: Run typecheck**
Run: `npm run typecheck --prefix apps/desktop`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add apps/desktop/src/components/SettingsModal.tsx apps/desktop/src/App.tsx
git commit -m "feat(ui): add settings modal for customization"
```
