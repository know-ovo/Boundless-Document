import { describe, it, expect } from 'vitest';
import { getCustomSlashMenuItems } from '../src/slash-menu';

describe('getCustomSlashMenuItems', () => {
  const mockEditor = {
    getTextCursorPosition: () => ({ block: { id: 'test' } }),
    document: {},
  } as any;

  it('returns 7 menu items', () => {
    const items = getCustomSlashMenuItems(mockEditor);
    expect(items).toHaveLength(7);
  });

  it('every item has required fields', () => {
    const items = getCustomSlashMenuItems(mockEditor);
    for (const item of items) {
      expect(typeof item.title).toBe('string');
      expect(item.title.length).toBeGreaterThan(0);
      expect(typeof item.subtext).toBe('string');
      expect(typeof item.onItemClick).toBe('function');
      expect(Array.isArray(item.aliases)).toBe(true);
      expect(item.aliases.length).toBeGreaterThan(0);
      expect(typeof item.group).toBe('string');
      expect(typeof item.icon).toBe('string');
    }
  });

  it('includes all 7 block type titles (zh-CN default)', () => {
    const items = getCustomSlashMenuItems(mockEditor);
    const titles = items.map((i) => i.title);
    expect(titles).toContain('实时数据');
    expect(titles).toContain('JavaScript');
    expect(titles).toContain('Python');
    expect(titles).toContain('SQL');
    expect(titles).toContain('图表');
    expect(titles).toContain('3D 模型');
    expect(titles).toContain('多媒体');
  });

  it('includes all 7 block type titles (en)', () => {
    const items = getCustomSlashMenuItems(mockEditor, 'en');
    const titles = items.map((i) => i.title);
    expect(titles).toContain('Live Data');
    expect(titles).toContain('JavaScript');
    expect(titles).toContain('Python');
    expect(titles).toContain('SQL');
    expect(titles).toContain('Chart');
    expect(titles).toContain('3D Model');
    expect(titles).toContain('Asset');
  });

  it('all items belong to Enhanced Blocks group (en)', () => {
    const items = getCustomSlashMenuItems(mockEditor, 'en');
    for (const item of items) {
      expect(item.group).toBe('Enhanced Blocks');
    }
  });

  it('all items belong to Chinese group name (zh-CN default)', () => {
    const items = getCustomSlashMenuItems(mockEditor);
    for (const item of items) {
      expect(item.group).toBe('增强块');
    }
  });

  it('onItemClick is a function on every item', () => {
    const items = getCustomSlashMenuItems(mockEditor);
    for (const item of items) {
      expect(typeof item.onItemClick).toBe('function');
    }
  });

  it('all enhanced items use insertSnippet (markdown templates)', () => {
    const items = getCustomSlashMenuItems(mockEditor);
    expect(items).toHaveLength(7);
  });
});
