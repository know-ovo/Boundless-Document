export type BoundlessBlockKind = 'live-data' | 'run-js' | 'run-python' | 'sql' | 'chart' | 'model3d' | 'asset';

export type DataMode = 'polling' | 'sse' | 'websocket';

export type DataViewMode = 'json' | 'table' | 'line' | 'bar';

export interface BaseBoundlessBlock {
  id: string;
  kind: BoundlessBlockKind;
  raw: string;
  order: number;
}

export interface LiveDataBlock extends BaseBoundlessBlock {
  kind: 'live-data';
  config: {
    source: string;
    mode: DataMode;
    interval: number;
    view: DataViewMode;
    chart?: DataViewMode;
    x?: string;
    y?: string;
  };
}

export interface RunJsBlock extends BaseBoundlessBlock {
  kind: 'run-js';
  code: string;
  timeoutMs: number;
}

export interface RunPythonBlock extends BaseBoundlessBlock {
  kind: 'run-python';
  code: string;
  timeoutMs: number;
}

export interface Model3dBlock extends BaseBoundlessBlock {
  kind: 'model3d';
  config: {
    src: string;
    poster?: string;
    autoRotate: boolean;
    cameraControls: boolean;
    height: number;
  };
}

export interface AssetBlock extends BaseBoundlessBlock {
  kind: 'asset';
  config: {
    src: string;
    type: 'image' | 'video' | 'audio' | 'pdf' | 'unknown';
    title?: string;
  };
}

export interface SqlBlock extends BaseBoundlessBlock {
  kind: 'sql';
  code: string;
  timeoutMs: number;
  result?: {
    columns: string[];
    rows: unknown[][];
  };
}

export interface ChartBlock extends BaseBoundlessBlock {
  kind: 'chart';
  config: Record<string, unknown>;
}

export type BoundlessBlock =
  | LiveDataBlock
  | RunJsBlock
  | RunPythonBlock
  | SqlBlock
  | ChartBlock
  | Model3dBlock
  | AssetBlock;

export interface DocumentFrontmatter {
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: {
    allowNetwork?: boolean;
    allowedOrigins?: string[];
  };
}

export interface ParsedDocument {
  frontmatter: DocumentFrontmatter;
  markdown: string;
  blocks: BoundlessBlock[];
}
