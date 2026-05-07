import { describe, expect, it } from 'vitest';
import { getDocumentStats } from '../src/documentStats';

describe('getDocumentStats', () => {
  it('counts empty document as one line and zero chars', () => {
    expect(getDocumentStats('')).toEqual({ lines: 1, chars: 0 });
  });

  it('counts unicode code points and lines', () => {
    expect(getDocumentStats('a\n你好')).toEqual({ lines: 2, chars: 4 });
  });
});
