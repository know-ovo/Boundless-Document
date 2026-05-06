import type { LiveDataBlock } from '@boundless-docs/shared';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useMemo, useRef } from 'react';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

export function ChartView({
  block,
  rows,
}: {
  block: LiveDataBlock;
  rows: Record<string, unknown>[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const xKey = block.config.x ?? Object.keys(rows[0] ?? {})[0];
  const yKey = block.config.y ?? Object.keys(rows[0] ?? {})[1];

  const option = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 36, right: 16, top: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: rows.map((row) => String(row[xKey] ?? '')),
      },
      yAxis: { type: 'value' },
      series: [
        {
          type: block.config.view === 'bar' ? 'bar' : 'line',
          data: rows.map((row) => Number(row[yKey] ?? 0)),
          smooth: true,
        },
      ],
    }),
    [block.config.view, rows, xKey, yKey],
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const chart = echarts.init(containerRef.current);
    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [option]);

  if (rows.length === 0 || !xKey || !yKey) {
    return <div className="block-warning">没有足够的数据生成图表</div>;
  }

  return <div className="chart-view" ref={containerRef} />;
}
