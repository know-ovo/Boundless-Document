import type { ChartBlock } from '@boundless-docs/shared';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useMemo, useRef } from 'react';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

function parseChartConfig(config: Record<string, unknown>) {
  const type = config.type === 'bar' ? 'bar' : 'line';
  const rawData = config.data;
  let data: number[] = [];
  if (Array.isArray(rawData)) {
    data = rawData.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
  }
  const title = typeof config.title === 'string' ? config.title : undefined;
  return { type, data, title };
}

export function ChartBlockView({ block }: { block: ChartBlock }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { type, data, title } = useMemo(
    () => parseChartConfig(block.config),
    [block.config],
  );

  const option = useMemo(
    () => ({
      title: title ? { text: title, textStyle: { fontSize: 14, color: 'var(--muted)' } } : undefined,
      tooltip: { trigger: 'axis' as const },
      grid: { left: 40, right: 16, top: title ? 40 : 16, bottom: 28 },
      xAxis: {
        type: 'category' as const,
        data: data.map((_, i) => String(i + 1)),
      },
      yAxis: { type: 'value' as const },
      series: [
        {
          type,
          data,
          smooth: type === 'line',
          itemStyle: { color: 'var(--accent, #2F6FEB)' },
        },
      ],
    }),
    [type, data, title],
  );

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;
    const chart = echarts.init(containerRef.current);
    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [option, data.length]);

  if (data.length === 0) {
    return (
      <div className="block-warning">
        没有图表数据。请在 chart 块中提供 `data: [1, 2, 3, ...]`。
      </div>
    );
  }

  return <div className="chart-view" ref={containerRef} style={{ width: '100%', height: 280 }} />;
}
