import { subscribeToLiveData, type DataSnapshot } from '@boundless-docs/runtime';
import type { LiveDataBlock } from '@boundless-docs/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChartView } from './charts';

export function LiveDataBlockView({ block }: { block: LiveDataBlock }) {
  const [snapshot, setSnapshot] = useState<DataSnapshot>({
    status: 'idle',
    value: null,
  });
  const [paused, setPaused] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToLiveData> | null>(null);

  useEffect(() => {
    const subscription = subscribeToLiveData(block, setSnapshot);
    subscriptionRef.current = subscription;
    return () => {
      subscription.dispose();
      subscriptionRef.current = null;
    };
  }, [block]);

  const rows = useMemo(() => normalizeRows(snapshot.value), [snapshot.value]);

  return (
    <div className="live-data-block">
      <div className="block-meta">
        <span>模式：{block.config.mode}</span>
        <span>状态：{snapshot.status}</span>
        {snapshot.updatedAt && <span>更新：{new Date(snapshot.updatedAt).toLocaleTimeString()}</span>}
      </div>
      <div className="block-actions">
        <button
          type="button"
          onClick={() => {
            if (paused) {
              subscriptionRef.current?.resume();
            } else {
              subscriptionRef.current?.pause();
            }
            setPaused((current) => !current);
          }}
        >
          {paused ? '继续' : '暂停'}
        </button>
        <a href={block.config.source} target="_blank" rel="noreferrer">
          打开数据源
        </a>
      </div>
      {snapshot.error && <div className="block-error">{snapshot.error}</div>}
      {block.config.view === 'table' && <TableView rows={rows} />}
      {(block.config.view === 'line' || block.config.view === 'bar') && (
        <ChartView block={block} rows={rows} />
      )}
      {block.config.view === 'json' && <JsonView value={snapshot.value} />}
    </div>
  );
}

function JsonView({ value }: { value: unknown }) {
  return <pre className="json-view">{JSON.stringify(value, null, 2)}</pre>;
}

function TableView({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = Object.keys(rows[0] ?? {});
  if (rows.length === 0) {
    return <div className="block-warning">暂无可表格化的数据</div>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${index}-${JSON.stringify(row)}`}>
              {columns.map((column) => <td key={column}>{String(row[column] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeRows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }
  if (isRecord(value)) {
    const nestedArray = Object.values(value).find(Array.isArray);
    if (Array.isArray(nestedArray)) {
      return nestedArray.filter(isRecord);
    }
    return [value];
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
