import { describe, it, expect } from 'vitest';
import {
  parseBoundlessDocument,
  extractFrontmatter,
  parseBoundlessBlocks,
  createBlock,
} from '../src/markdownBlocks';

/* ─── extractFrontmatter ───────────────────────────────── */
describe('extractFrontmatter', () => {
  it('returns empty frontmatter for plain markdown', () => {
    const { frontmatter, markdown } = extractFrontmatter('# Hello\n\nWorld');
    expect(frontmatter).toEqual({});
    expect(markdown).toBe('# Hello\n\nWorld');
  });

  it('parses YAML frontmatter delimited by ---', () => {
    const { frontmatter, markdown } = extractFrontmatter(
      '---\ntitle: My Doc\ncreatedAt: "2026-05-05"\n---\n\n# Content'
    );
    expect(frontmatter.title).toBe('My Doc');
    expect(frontmatter.createdAt).toBe('2026-05-05');
    // frontmatter parser consumes the delimiter, a single trailing newline may remain
    expect(markdown.trimStart()).toBe('# Content');
  });

  it('handles malformed YAML gracefully', () => {
    const { frontmatter } = extractFrontmatter('---\n{invalid: yaml:\n---\n\nbody');
    expect(frontmatter).toEqual({});
  });

  it('ignores --- that is not at the very start', () => {
    const { frontmatter } = extractFrontmatter('text\n---\ntitle: x\n---\n');
    expect(frontmatter).toEqual({});
  });
});

/* ─── parseBoundlessBlocks ─────────────────────────────── */
describe('parseBoundlessBlocks', () => {
  it('returns empty array for markdown with no fenced blocks', () => {
    expect(parseBoundlessBlocks('# Heading\n\nParagraph.')).toEqual([]);
  });

  it('ignores fenced blocks with unknown language kinds', () => {
    const blocks = parseBoundlessBlocks('```python\nprint(1)\n```');
    expect(blocks).toEqual([]);
  });

  it('preserves block order from top to bottom', () => {
    const blocks = parseBoundlessBlocks(
      '```live-data\nsource: a\n```\n```run-js\n1+1\n```\n```model3d\nsrc: x.glb\n```'
    );
    expect(blocks).toHaveLength(3);
    expect(blocks[0].order).toBe(0);
    expect(blocks[1].order).toBe(1);
    expect(blocks[2].order).toBe(2);
  });

  it('assigns sequential order even when unknown blocks are skipped', () => {
    const blocks = parseBoundlessBlocks(
      '```live-data\nsource: a\n```\n```bash\necho\n```\n```run-js\n1\n```'
    );
    expect(blocks).toHaveLength(2);
    expect(blocks[0].kind).toBe('live-data');
    expect(blocks[0].order).toBe(0);
    expect(blocks[1].kind).toBe('run-js');
    expect(blocks[1].order).toBe(1);
  });
});

/* ─── createBlock — live-data ──────────────────────────── */
describe('createBlock – live-data', () => {
  it('defaults mode to polling when unspecified', () => {
    const b = createBlock('live-data', 'source: https://x.com/api', 0);
    expect(b).not.toBeNull();
    expect(b!.kind).toBe('live-data');
    if (b && b.kind === 'live-data') {
      expect(b.config.mode).toBe('polling');
      expect(b.config.source).toBe('https://x.com/api');
      expect(b.config.interval).toBe(5000);
      expect(b.config.view).toBe('json');
    }
  });

  it('accepts SSE mode', () => {
    const b = createBlock('live-data', 'source: https://x\nmode: sse\ninterval: 2000', 0);
    if (b && b.kind === 'live-data') {
      expect(b.config.mode).toBe('sse');
      expect(b.config.interval).toBe(2000);
    }
  });

  it('accepts WebSocket mode', () => {
    const b = createBlock('live-data', 'source: wss://x\nmode: websocket\nview: table', 0);
    if (b && b.kind === 'live-data') {
      expect(b.config.mode).toBe('websocket');
      expect(b.config.view).toBe('table');
    }
  });

  it('falls back to empty string for missing source', () => {
    const b = createBlock('live-data', '', 0);
    if (b && b.kind === 'live-data') {
      expect(b.config.source).toBe('');
    }
  });

  it('clamps invalid mode to polling', () => {
    const b = createBlock('live-data', 'source: a\nmode: grpc', 0);
    if (b && b.kind === 'live-data') {
      expect(b.config.mode).toBe('polling');
    }
  });
});

/* ─── createBlock — run-js / run-python ────────────────── */
describe('createBlock – run-js / run-python', () => {
  it('stores raw content as code for run-js', () => {
    const b = createBlock('run-js', 'console.log(1)', 0);
    if (b && b.kind === 'run-js') {
      expect(b.code).toBe('console.log(1)');
      expect(b.timeoutMs).toBe(3000);
    }
  });

  it('stores raw content as code for run-python', () => {
    const b = createBlock('run-python', 'print(1)', 0);
    if (b && b.kind === 'run-python') {
      expect(b.code).toBe('print(1)');
      expect(b.timeoutMs).toBe(5000);
    }
  });
});

/* ─── createBlock — model3d ────────────────────────────── */
describe('createBlock – model3d', () => {
  it('extracts src, autoRotate, cameraControls, height', () => {
    const b = createBlock('model3d', 'src: a.glb\nautoRotate: false\ncameraControls: false\nheight: 500', 0);
    expect(b).not.toBeNull();
    if (b && b.kind === 'model3d') {
      expect(b.config.src).toBe('a.glb');
      expect(b.config.autoRotate).toBe(false);
      expect(b.config.cameraControls).toBe(false);
      expect(b.config.height).toBe(500);
    }
  });

  it('defaults autoRotate and cameraControls to true', () => {
    const b = createBlock('model3d', 'src: x.glb', 0);
    if (b && b.kind === 'model3d') {
      expect(b.config.autoRotate).toBe(true);
      expect(b.config.cameraControls).toBe(true);
      expect(b.config.height).toBe(360);
    }
  });

  it('defaults empty src when missing', () => {
    const b = createBlock('model3d', '', 0);
    if (b && b.kind === 'model3d') {
      expect(b.config.src).toBe('');
    }
  });
});

/* ─── createBlock — asset ──────────────────────────────── */
describe('createBlock – asset', () => {
  it('detects image type from extension', () => {
    const b = createBlock('asset', 'src: photo.png', 0);
    if (b && b.kind === 'asset') {
      expect(b.config.type).toBe('image');
    }
  });

  it('detects video type from extension', () => {
    const b = createBlock('asset', 'src: clip.mp4', 0);
    if (b && b.kind === 'asset') {
      expect(b.config.type).toBe('video');
    }
  });

  it('respects explicit type override', () => {
    const b = createBlock('asset', 'src: file.bin\ntype: pdf', 0);
    if (b && b.kind === 'asset') {
      expect(b.config.type).toBe('pdf');
    }
  });

  it('returns unknown for unrecognized extension', () => {
    const b = createBlock('asset', 'src: data.xyz', 0);
    if (b && b.kind === 'asset') {
      expect(b.config.type).toBe('unknown');
    }
  });

  it('defaults empty src', () => {
    const b = createBlock('asset', '', 0);
    if (b && b.kind === 'asset') {
      expect(b.config.src).toBe('');
      expect(b.config.type).toBe('unknown');
    }
  });
});

/* ─── createBlock — sql / chart ────────────────────────── */
describe('createBlock – sql / chart', () => {
  it('stores raw content as code for sql', () => {
    const b = createBlock('sql', 'SELECT 1', 0);
    if (b && b.kind === 'sql') {
      expect(b.code).toBe('SELECT 1');
    }
  });

  it('parses YAML config for chart', () => {
    const b = createBlock('chart', 'type: bar\ndata: [1,2,3]', 0);
    if (b && b.kind === 'chart') {
      expect(b.config).toHaveProperty('type', 'bar');
    }
  });

  it('returns null for unknown kind', () => {
    expect(createBlock('unknown' as any, '', 0)).toBeNull();
  });
});

/* ─── parseBoundlessDocument integration ───────────────── */
describe('parseBoundlessDocument – integration', () => {
  it('parses live-data, run-js, model3d, asset all in one doc', () => {
    const doc = parseBoundlessDocument(`---
title: Test
---
\`\`\`live-data
source: x
\`\`\`
\`\`\`run-js
1+1
\`\`\`
\`\`\`model3d
src: m.glb
\`\`\`
\`\`\`asset
src: img.png
\`\`\``);
    expect(doc.frontmatter.title).toBe('Test');
    expect(doc.blocks).toHaveLength(4);
    expect(doc.blocks.map((b) => b.kind)).toEqual([
      'live-data', 'run-js', 'model3d', 'asset',
    ]);
  });

  it('returns empty blocks and frontmatter for empty string', () => {
    const doc = parseBoundlessDocument('');
    expect(doc.frontmatter).toEqual({});
    expect(doc.markdown).toBe('');
    expect(doc.blocks).toEqual([]);
  });

  it('ignores malformed fenced blocks (missing closing fence)', () => {
    const doc = parseBoundlessDocument('```live-data\nsource: a\n');
    expect(doc.blocks).toEqual([]);
  });
});
