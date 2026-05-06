import { createBlock, type BoundlessBlock, type BoundlessBlockKind } from '@boundless-docs/shared';
import ReactMarkdown from 'react-markdown';
import { AssetBlockView } from './components/AssetBlockView';
import { CodeBlockView } from './components/CodeBlockView';
import { LiveDataBlockView } from './components/LiveDataBlockView';
import { Model3dBlockView } from './components/Model3dBlockView';
import { PythonBlockView } from './components/PythonBlockView';
import { SQLBlockView } from './components/SQLBlockView';
import { ChartBlockView } from './components/ChartBlockView';
import './blocks.css';

export interface BlockPreviewPanelProps {
  blocks: BoundlessBlock[];
}

export function BlockPreviewPanel({ blocks }: BlockPreviewPanelProps) {
  return (
    <aside className="preview-panel">
      <header className="preview-header">
        <strong>增强块列表</strong>
        <span>{blocks.length} 个增强块</span>
      </header>
      <div className="preview-list">
        {blocks.length === 0 ? (
          <EmptyState />
        ) : (
          blocks.map((block) => <BlockCard block={block} key={block.id} />)
        )}
      </div>
    </aside>
  );
}

export interface InlineDocumentViewProps {
  markdown: string;
}

export function InlineDocumentView({ markdown }: InlineDocumentViewProps) {
  const parts = splitMarkdownIntoInlineParts(markdown);

  return (
    <article className="inline-document">
      {parts.map((part) =>
        part.type === 'markdown' ? (
          <ReactMarkdown key={part.id}>{part.content}</ReactMarkdown>
        ) : (
          <InlineBlock block={part.block} key={part.id} />
        ),
      )}
    </article>
  );
}

function BlockCard({ block }: { block: BoundlessBlock }) {
  return (
    <article className="block-card">
      <header className="block-card-header">
        <span>{block.kind}</span>
        <code>{block.id}</code>
      </header>
      {block.kind === 'live-data' && <LiveDataBlockView block={block} />}
      {block.kind === 'run-js' && <CodeBlockView block={block} />}
      {block.kind === 'run-python' && <PythonBlockView block={block} />}
      {block.kind === 'sql' && <SQLBlockView block={block} />}
      {block.kind === 'chart' && <ChartBlockView block={block} />}
      {block.kind === 'model3d' && <Model3dBlockView block={block} />}
      {block.kind === 'asset' && <AssetBlockView block={block} />}
    </article>
  );
}

function InlineBlock({ block }: { block: BoundlessBlock }) {
  return (
    <section className="inline-block">
      <header className="inline-block-header">
        <span>{block.kind}</span>
        <code>{block.id}</code>
      </header>
      <BoundlessBlockView block={block} />
    </section>
  );
}

function BoundlessBlockView({ block }: { block: BoundlessBlock }) {
  return (
    <>
      {block.kind === 'live-data' && <LiveDataBlockView block={block} />}
      {block.kind === 'run-js' && <CodeBlockView block={block} />}
      {block.kind === 'run-python' && <PythonBlockView block={block} />}
      {block.kind === 'sql' && <SQLBlockView block={block} />}
      {block.kind === 'chart' && <ChartBlockView block={block} />}
      {block.kind === 'model3d' && <Model3dBlockView block={block} />}
      {block.kind === 'asset' && <AssetBlockView block={block} />}
    </>
  );
}

const IconBox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
);

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <IconBox />
      </div>
      <h3>还没有增强块</h3>
      <p>在 Markdown 里插入代码块后，这里会显示运行结果。</p>
    </div>
  );
}

type InlinePart =
  | { id: string; type: 'markdown'; content: string }
  | { id: string; type: 'block'; block: BoundlessBlock };

const inlineBlockPattern = /^```([\w-]+)\s*\n([\s\S]*?)\n```/gm;
const enhancedKinds = new Set<BoundlessBlockKind>([
  'live-data',
  'run-js',
  'run-python',
  'sql',
  'chart',
  'model3d',
  'asset',
]);

function splitMarkdownIntoInlineParts(markdown: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let lastIndex = 0;
  let blockOrder = 0;
  let partOrder = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineBlockPattern.exec(markdown)) !== null) {
    const kind = match[1] as BoundlessBlockKind;
    if (!enhancedKinds.has(kind)) {
      continue;
    }

    const before = markdown.slice(lastIndex, match.index);
    if (before.trim().length > 0) {
      parts.push({
        id: `markdown-${partOrder}`,
        type: 'markdown',
        content: before,
      });
      partOrder += 1;
    }

    const block = createBlock(kind, match[2].trim(), blockOrder);
    if (block) {
      parts.push({
        id: block.id,
        type: 'block',
        block,
      });
      blockOrder += 1;
    }

    lastIndex = match.index + match[0].length;
  }

  const rest = markdown.slice(lastIndex);
  if (rest.trim().length > 0) {
    parts.push({
      id: `markdown-${partOrder}`,
      type: 'markdown',
      content: rest,
    });
  }

  return parts;
}
