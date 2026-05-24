'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useState } from 'react';
import type { Product } from '@/types';
import { PageHeader, Surface, EmptyState, StatusPill } from '@/components/shell';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['products', q],
    queryFn: () =>
      apiFetch<Product[]>(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Analysis"
        title="Catalog"
        description="Every SKU in your catalog with its current quality score and pricing."
        actions={
          <StatusPill tone="neutral" dot>
            {data?.length ?? 0} listings
          </StatusPill>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/15"
          placeholder="Search by title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Surface padded={false} className="overflow-hidden">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <Th className="w-[140px]">SKU</Th>
              <Th>Title</Th>
              <Th className="w-[120px]">Brand</Th>
              <Th className="w-[120px]">Category</Th>
              <Th className="w-[100px]">Price</Th>
              <Th className="w-[120px] text-right">Quality</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [0, 1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-5 py-4">
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-border/60" />
                  </td>
                </tr>
              ))
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0">
                  <EmptyState
                    title={q ? 'No matches' : 'Catalog is empty'}
                    description={
                      q
                        ? 'Try a different search term or clear the filter.'
                        : 'Ingest products via video or CSV to populate the catalog.'
                    }
                    className="rounded-none border-0"
                  />
                </td>
              </tr>
            ) : (
              data?.map((p) => (
                <tr
                  key={p.skuId}
                  className="group transition-colors hover:bg-surface-muted"
                >
                  <Td>
                    <Link
                      href={`/products/${p.skuId}`}
                      className="font-mono text-[12.5px] font-medium text-[color:var(--brand)] hover:underline"
                    >
                      {p.skuId}
                    </Link>
                  </Td>
                  <Td className="max-w-[280px] truncate font-medium text-foreground">
                    {p.productTitle ?? (
                      <span className="italic text-muted-foreground">(none)</span>
                    )}
                  </Td>
                  <Td className="text-muted-strong">{p.brand ?? '—'}</Td>
                  <Td className="text-muted-strong">{p.category ?? '—'}</Td>
                  <Td className="font-mono tabular-nums text-foreground">
                    {p.price ? `₹${p.price}` : '—'}
                  </Td>
                  <Td className="text-right">
                    <ScorePill value={p.qualityScore} />
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Surface>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-5 py-3 font-medium', className)}>{children}</th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-5 py-3.5 align-middle', className)}>{children}</td>;
}

function ScorePill({ value }: { value: number }) {
  const tone =
    value >= 80
      ? 'success'
      : value >= 60
        ? 'warning'
        : 'danger';
  return (
    <StatusPill tone={tone}>
      <span className="font-mono tabular-nums">{value}%</span>
    </StatusPill>
  );
}
