'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { CompetitorPrice } from '@/types';
import { toast } from 'sonner';
import { useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { Surface, StatusPill } from '@/components/shell';
import { cn } from '@/lib/utils';

export function PriceComparison({
  skuId,
  ourPrice,
}: {
  skuId: string;
  ourPrice: number | null;
}) {
  const qc = useQueryClient();
  const [newPrice, setNewPrice] = useState({ platform: '', price: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['competitor-prices', skuId],
    queryFn: () =>
      apiFetch<CompetitorPrice[]>(`/products/${skuId}/competitor-prices`),
  });

  const refresh = useMutation({
    mutationFn: () =>
      apiFetch<{ jobId: string }>('/competitor-prices/refresh', {
        method: 'POST',
        body: JSON.stringify({ sku: skuId }),
      }),
    onSuccess: () => {
      toast.success('Refresh job queued.');
      setTimeout(
        () =>
          qc.invalidateQueries({ queryKey: ['competitor-prices', skuId] }),
        2000,
      );
    },
  });

  const manualAdd = useMutation({
    mutationFn: () =>
      apiFetch('/competitor-prices', {
        method: 'POST',
        body: JSON.stringify({
          skuId,
          platform: newPrice.platform,
          competitorPrice: Number(newPrice.price),
        }),
      }),
    onSuccess: () => {
      toast.success('Price added.');
      setNewPrice({ platform: '', price: '' });
      qc.invalidateQueries({ queryKey: ['competitor-prices', skuId] });
      qc.invalidateQueries({ queryKey: ['price-history', skuId] });
    },
  });

  const prices = data?.map((c) => c.competitorPrice) ?? [];
  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;
  const avg = prices.length
    ? Math.trunc(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  const gapPct =
    ourPrice && lowest ? ((ourPrice - lowest) / lowest) * 100 : null;

  const recommendation =
    gapPct == null
      ? { tone: 'neutral' as const, label: 'No data' }
      : gapPct > 10
        ? { tone: 'danger' as const, label: 'Lower price' }
        : gapPct < -10
          ? { tone: 'success' as const, label: 'Raise price' }
          : { tone: 'info' as const, label: 'Competitive' };

  return (
    <Surface padded={false} className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="space-y-0.5">
          <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
            Market intelligence
          </h2>
          <p className="text-[12.5px] text-muted-foreground">
            Live competitor pricing for this SKU.
          </p>
        </div>
        <button
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted-strong transition-colors hover:text-foreground disabled:opacity-40"
        >
          <RefreshCw
            className={cn('size-3.5', refresh.isPending && 'animate-spin')}
          />
          {refresh.isPending ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border bg-surface-muted/50 p-4 md:grid-cols-5">
          <Metric label="Our price" value={ourPrice ? `₹${ourPrice}` : '—'} />
          <Metric label="Lowest" value={lowest ? `₹${lowest}` : '—'} />
          <Metric label="Highest" value={highest ? `₹${highest}` : '—'} />
          <Metric label="Average" value={avg ? `₹${avg}` : '—'} />
          <Metric
            label="Gap"
            value={gapPct == null ? '—' : `${gapPct > 0 ? '+' : ''}${gapPct.toFixed(1)}%`}
          />
          <div className="col-span-2 md:col-span-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Recommendation
            </p>
            <div className="mt-1.5">
              <StatusPill tone={recommendation.tone} dot>
                {recommendation.label}
              </StatusPill>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted/50 p-2">
          <input
            placeholder="Platform (e.g. Amazon)"
            className="h-9 flex-1 rounded-lg border border-border bg-surface px-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none"
            value={newPrice.platform}
            onChange={(e) =>
              setNewPrice({ ...newPrice, platform: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="₹"
            className="h-9 w-24 rounded-lg border border-border bg-surface px-2.5 text-[13px] tabular-nums text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none"
            value={newPrice.price}
            onChange={(e) =>
              setNewPrice({ ...newPrice, price: e.target.value })
            }
          />
          <button
            disabled={!newPrice.platform || !newPrice.price || manualAdd.isPending}
            onClick={() => manualAdd.mutate()}
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-foreground px-3 text-[12.5px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-border">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 border-b border-border bg-surface-muted text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Platform</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 text-right font-medium">Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    Fetching market prices…
                  </td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    No market data yet.
                  </td>
                </tr>
              ) : (
                data?.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-muted">
                    <td className="px-3 py-2 font-medium capitalize text-foreground">
                      {c.platform}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums text-foreground">
                      ₹{c.competitorPrice}
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill
                        tone={c.source === 'manual' ? 'warning' : 'neutral'}
                      >
                        {c.source}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[11.5px] text-muted-foreground">
                      {new Date(c.fetchedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Surface>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-[18px] font-medium tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
