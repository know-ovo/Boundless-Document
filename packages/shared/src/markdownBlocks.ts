import YAML from 'yaml';
import type {
  AssetBlock,
  BoundlessBlock,
  BoundlessBlockKind,
  ChartBlock,
  DataMode,
  DataViewMode,
  DocumentFrontmatter,
  LiveDataBlock,
  Model3dBlock,
  ParsedDocument,
  RunJsBlock,
  RunPythonBlock,
  SqlBlock,
} from './types';

const enhancedKinds = new Set<BoundlessBlockKind>([
  'live-data',
  'run-js',
  'run-python',
  'sql',
  'chart',
  'model3d',
  'asset',
]);

const fencedBlockPattern = /^```([\w-]+)\s*\n([\s\S]*?)\n```/gm;
const frontmatterPattern = /^---\n([\s\S]*?)\n---\n?/;

export function parseBoundlessDocument(content: string): ParsedDocument {
  const { frontmatter, markdown } = extractFrontmatter(content);
  return {
    frontmatter,
    markdown,
    blocks: parseBoundlessBlocks(markdown),
  };
}

export function extractFrontmatter(content: string): {
  frontmatter: DocumentFrontmatter;
  markdown: string;
} {
  const match = content.match(frontmatterPattern);
  if (!match) {
    return { frontmatter: {}, markdown: content };
  }

  return {
    frontmatter: parseYamlObject<DocumentFrontmatter>(match[1]),
    markdown: content.slice(match[0].length),
  };
}

export function parseBoundlessBlocks(markdown: string): BoundlessBlock[] {
  const blocks: BoundlessBlock[] = [];
  let match: RegExpExecArray | null;
  let order = 0;

  while ((match = fencedBlockPattern.exec(markdown)) !== null) {
    const kind = match[1] as BoundlessBlockKind;
    const raw = match[2].trim();
    if (!enhancedKinds.has(kind)) {
      continue;
    }

    const block = createBlock(kind, raw, order);
    if (block) {
      blocks.push(block);
      order += 1;
    }
  }

  return blocks;
}

export function createBlock(
  kind: BoundlessBlockKind,
  raw: string,
  order: number,
): BoundlessBlock | null {
  const id = `${kind}-${order + 1}`;

  if (kind === 'live-data') {
    const config = parseYamlObject<Record<string, unknown>>(raw);
    const view = readDataViewMode(config.view ?? config.chart);
    return {
      id,
      kind,
      raw,
      order,
      config: {
        source: readString(config.source, ''),
        mode: readDataMode(config.mode),
        interval: readNumber(config.interval, 5000),
        view,
        chart: view,
        x: readOptionalString(config.x),
        y: readOptionalString(config.y),
      },
    } satisfies LiveDataBlock;
  }

  if (kind === 'run-js') {
    return {
      id,
      kind,
      raw,
      order,
      code: raw,
      timeoutMs: 3000,
    } satisfies RunJsBlock;
  }

  if (kind === 'run-python') {
    return {
      id,
      kind,
      raw,
      order,
      code: raw,
      timeoutMs: 5000,
    } satisfies RunPythonBlock;
  }

  if (kind === 'model3d') {
    const config = parseYamlObject<Record<string, unknown>>(raw);
    return {
      id,
      kind,
      raw,
      order,
      config: {
        src: readString(config.src, ''),
        poster: readOptionalString(config.poster),
        autoRotate: readBoolean(config.autoRotate, true),
        cameraControls: readBoolean(config.cameraControls, true),
        height: readNumber(config.height, 360),
      },
    } satisfies Model3dBlock;
  }

  if (kind === 'asset') {
    const config = parseYamlObject<Record<string, unknown>>(raw);
    const src = readString(config.src, '');
    return {
      id,
      kind,
      raw,
      order,
      config: {
        src,
        type: readAssetType(config.type, src),
        title: readOptionalString(config.title),
      },
    } satisfies AssetBlock;
  }

  if (kind === 'sql') {
    return {
      id,
      kind,
      raw,
      order,
      code: raw,
      timeoutMs: 10000,
    } satisfies SqlBlock;
  }

  if (kind === 'chart') {
    const config = parseYamlObject<Record<string, unknown>>(raw);
    return {
      id,
      kind,
      raw,
      order,
      config,
    } satisfies ChartBlock;
  }

  return null;
}

function parseYamlObject<T extends object>(raw: string): T {
  try {
    const value = YAML.parse(raw);
    return value && typeof value === 'object' ? (value as T) : ({} as T);
  } catch {
    return {} as T;
  }
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return fallback;
}

function readDataMode(value: unknown): DataMode {
  return value === 'sse' || value === 'websocket' ? value : 'polling';
}

function readDataViewMode(value: unknown): DataViewMode {
  return value === 'table' || value === 'line' || value === 'bar' ? value : 'json';
}

function readAssetType(value: unknown, src: string): AssetBlock['config']['type'] {
  if (value === 'image' || value === 'video' || value === 'audio' || value === 'pdf') {
    return value;
  }

  const extension = src.split('.').pop()?.toLowerCase();
  if (!extension) {
    return 'unknown';
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
    return 'image';
  }
  if (['mp4', 'webm', 'mov'].includes(extension)) {
    return 'video';
  }
  if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return 'audio';
  }
  return extension === 'pdf' ? 'pdf' : 'unknown';
}
