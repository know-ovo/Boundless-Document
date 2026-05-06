import { describe, it, expect } from 'vitest';
import { editorSchema } from '../src/schema';

describe('editorSchema', () => {
  it('is defined', () => {
    expect(editorSchema).toBeDefined();
  });

  it('is an object', () => {
    expect(typeof editorSchema).toBe('object');
    expect(editorSchema).not.toBeNull();
  });

  it('has at least one extension entry keyed by a non-empty name', () => {
    const keys = Object.keys(editorSchema);
    expect(keys.length).toBeGreaterThan(0);
    // BlockNote/Tiptap schema: keys are extension names, values are configs
    for (const k of keys) {
      expect(typeof k).toBe('string');
      expect(k.length).toBeGreaterThan(0);
      // Value can be object (extension config) or string (inline extension reference)
      expect(['object', 'string']).toContain(typeof editorSchema[k as keyof typeof editorSchema]);
    }
  });
});
