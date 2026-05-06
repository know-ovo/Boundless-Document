import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings, getAccentRGB, getAccentName, type AccentColor } from '../src/contexts/SettingsContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe('SettingsContext', () => {
  it('provides default values', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.colorScheme).toBe('light');
    expect(result.current.accentColor).toBe('cobalt');
    expect(result.current.typography).toBe('sans');
    expect(result.current.layoutWidth).toBe('standard');
    expect(result.current.sidebarOpen).toBe(true);
  });

  it('setColorScheme toggles between light and dark', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setColorScheme('dark'));
    expect(result.current.colorScheme).toBe('dark');
    act(() => result.current.setColorScheme('light'));
    expect(result.current.colorScheme).toBe('light');
  });

  it('setAccentColor changes accent', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setAccentColor('teal'));
    expect(result.current.accentColor).toBe('teal');
    act(() => result.current.setAccentColor('rose'));
    expect(result.current.accentColor).toBe('rose');
  });

  it('setTypography switches font family', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setTypography('serif'));
    expect(result.current.typography).toBe('serif');
  });

  it('setLayoutWidth switches width mode', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setLayoutWidth('full'));
    expect(result.current.layoutWidth).toBe('full');
  });

  it('setSidebarOpen toggles sidebar', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setSidebarOpen(false));
    expect(result.current.sidebarOpen).toBe(false);
  });

  it('throws when useSettings is called outside provider', () => {
    expect(() => {
      const { result } = renderHook(() => useSettings());
      // Access result to trigger the error
      void result.current;
    }).toThrow('useSettings must be used within SettingsProvider');
  });
});

describe('getAccentRGB', () => {
  it('returns RGB strings for all 5 colors', () => {
    const colors: AccentColor[] = ['cobalt', 'indigo', 'teal', 'orange', 'rose'];
    for (const c of colors) {
      const rgb = getAccentRGB(c);
      expect(rgb).toMatch(/^\d{1,3},\d{1,3},\d{1,3}$/);
    }
  });
});

describe('getAccentName', () => {
  it('returns Chinese names', () => {
    expect(getAccentName('cobalt')).toBe('钴蓝');
    expect(getAccentName('teal')).toBe('青绿');
    expect(getAccentName('rose')).toBe('玫红');
  });
});
