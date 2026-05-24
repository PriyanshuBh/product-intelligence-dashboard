'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Surface, EmptyState } from '@/components/shell';
import { LineChart as LineChartIcon } from 'lucide-react';

type Row = {
  id: number;
  skuId: string;
  platform: string;
  price: number;
  recordedAt: string;
};

// Restrained palette tuned to the design system's accent + status hues.
const SERIES_COLORS = [
  'oklch(48% 0.18 265)', // accent
  'oklch(60% 0.13 155)', // success
  'oklch(58% 0.19 22)', // danger
  'oklch(72% 0.13 75)', // warning
  'oklch(55% 0.12 320)',
  'oklch(55% 0.12 200)',
];

export function PriceHistoryChart({ skuId }: { skuId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['price-history', skuId],
    queryFn: () => apiFetch<Row[]>(`/products/${skuId}/price-history`),
  });

  return (
    <Surface padded={false} className="flex h-full min-h-[400px] flex-col overflow-hidden">
      <div className="space-y-0.5 border-b border-border px-5 py-4">
        <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
          Competitive price trends
        </h2>
        <p className="text-[12.5px] text-muted-foreground">
          Recent price points across platforms.
        </p>
      </div>

      <div className="flex-1 p-5">
        {isLoading ? (
          <div className="h-full min-h-[300px] animate-pulse rounded-xl bg-surface-muted/60" />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<LineChartIcon className="size-4" />}
            title="No price history yet"
            description="Refresh competitor prices to build a trend."
            className="h-full"
          />
        ) : (
          <ChartBody data={data} />
        )}
      </div>
    </Surface>
  );
}

function ChartBody({ data }: { data: Row[] }) {
  const byTime = new Map<string, Record<string, number | string>>();
  for (const r of data) {
    const t = new Date(r.recordedAt).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
    });
    if (!byTime.has(t)) byTime.set(t, { time: t });
    byTime.get(t)![r.platform] = r.price;
  }

  const series = [...byTime.values()];
  const platforms = [...new Set(data.map((r) => r.platform))];

  return (
    <div className="h-full min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={series}
          margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="2 4"
            vertical={false}
            stroke="oklch(92.5% 0.003 75)"
          />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'oklch(55% 0.008 240)' }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'oklch(55% 0.008 240)' }}
            tickFormatter={(v) => `₹${v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid oklch(92.5% 0.003 75)',
              background: 'oklch(100% 0 0)',
              boxShadow: '0 8px 24px -10px rgb(0 0 0 / 0.12)',
              fontSize: 12,
            }}
            itemStyle={{ fontSize: 12 }}
            cursor={{ stroke: 'oklch(85% 0.005 75)', strokeWidth: 1 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: 12,
              paddingTop: 16,
              color: 'oklch(40% 0.008 240)',
            }}
          />
          {platforms.map((p, i) => (
            <Line
              key={p}
              type="monotone"
              dataKey={p}
              stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
              strokeWidth={1.75}
              dot={{ r: 2.5, strokeWidth: 0 }}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
