'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Download, ArrowUpRight, Loader2 } from 'lucide-react';
import { PageHeader, Surface, StatCard, EmptyState, StatusPill } from '@/components/shell';
import { downloadPdf } from '@/lib/download-pdf';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Summary = {
  totalProducts: number;
  issueCounts: { HIGH: number; MEDIUM: number; LOW: number };
  avgQualityScore: number;
  missingImageCount: number;
  invalidPriceCount: number;
  weakListings: { skuId: string; productTitle: string | null; qualityScore: number }[];
};

export default function DashboardPage() {
  const [exporting, setExporting] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['quality-summary'],
    queryFn: () => apiFetch<Summary>('/dashboard/quality-summary'),
    refetchInterval: 5000,
  });

  const downloadReport = async () => {
    if (!data || exporting) return;
    setExporting(true);
    try {
      const { CatalogQualityReport } = await import(
        '@/components/reports/quality-report-pdf'
      );
      await downloadPdf(
        <CatalogQualityReport data={data} />,
        `catalog-quality-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Analysis"
        title="Listing quality overview"
        description="A live read on catalog health, recent extraction issues and your weakest listings."
        actions={
          <button
            onClick={downloadReport}
            disabled={!data || exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-foreground px-3.5 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {exporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {exporting ? 'Generating…' : 'Download PDF'}
          </button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-[color:var(--danger)]/20 bg-[color:var(--danger)]/8 p-5 text-[13px] text-[color:var(--danger)]">
          Failed to load dashboard:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total products"
          value={isLoading ? '—' : data?.totalProducts.toLocaleString() ?? 0}
          hint="Ingested SKUs in catalog"
        />
        <StatCard
          label="Avg quality"
          value={isLoading ? '—' : `${Math.round(data?.avgQualityScore ?? 0)}%`}
          hint="Target ≥ 80%"
          tone={data && data.avgQualityScore >= 70 ? 'success' : 'warning'}
        />
        <StatCard
          label="High-sev issues"
          value={isLoading ? '—' : data?.issueCounts.HIGH ?? 0}
          tone={data?.issueCounts.HIGH ? 'danger' : 'default'}
          hint="Action required"
        />
        <StatCard
          label="Missing images"
          value={isLoading ? '—' : data?.missingImageCount ?? 0}
          hint="Listings without media"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Surface padded={false} className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="space-y-0.5">
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
                Weakest listings
              </h2>
              <p className="text-[12.5px] text-muted-foreground">
                Lowest scoring SKUs — fixing these moves the average the most.
              </p>
            </div>
            <StatusPill tone="neutral">
              {data?.weakListings.length ?? 0} shown
            </StatusPill>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-border" />
                    <div className="h-3 w-48 animate-pulse rounded-full bg-border/60" />
                  </div>
                  <div className="h-4 w-10 animate-pulse rounded-full bg-border" />
                </div>
              ))}
            </div>
          ) : data?.weakListings.length === 0 ? (
            <EmptyState
              title="No weak listings yet"
              description="Run an ingest job to start scoring your catalog."
              className="rounded-none border-0"
            />
          ) : (
            <ul className="divide-y divide-border">
              {data?.weakListings.map((p) => (
                <li key={p.skuId}>
                  <Link
                    href={`/products/${p.skuId}`}
                    className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-muted"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-mono text-[12.5px] font-medium text-[color:var(--brand)]">
                        {p.skuId}
                      </p>
                      <p className="truncate text-[13.5px] text-foreground">
                        {p.productTitle ?? (
                          <span className="italic text-muted-foreground">(missing title)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreMeter value={p.qualityScore} />
                      <ArrowUpRight className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <Surface className="space-y-5">
          <div className="space-y-0.5">
            <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
              Issue distribution
            </h2>
            <p className="text-[12.5px] text-muted-foreground">By severity, last 7 days.</p>
          </div>
          <div className="space-y-4">
            <IssueRow
              label="High severity"
              count={data?.issueCounts.HIGH ?? 0}
              total={(data?.totalProducts ?? 0) * 2}
              tone="danger"
            />
            <IssueRow
              label="Medium severity"
              count={data?.issueCounts.MEDIUM ?? 0}
              total={(data?.totalProducts ?? 0) * 2}
              tone="warning"
            />
            <IssueRow
              label="Low severity"
              count={data?.issueCounts.LOW ?? 0}
              total={(data?.totalProducts ?? 0) * 2}
              tone="info"
            />
            <IssueRow
              label="Invalid pricing"
              count={data?.invalidPriceCount ?? 0}
              total={(data?.totalProducts ?? 0) * 2}
              tone="neutral"
            />
          </div>
        </Surface>
      </section>
    </div>
  );
}

function ScoreMeter({ value }: { value: number }) {
  const color =
    value >= 80
      ? 'var(--success)'
      : value >= 60
        ? 'var(--warning)'
        : 'var(--danger)';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-14 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(4, Math.min(100, value))}%`,
            background: color,
          }}
        />
      </div>
      <span
        className="w-9 text-right font-mono text-[12.5px] font-medium tabular-nums"
        style={{ color }}
      >
        {value}%
      </span>
    </div>
  );
}

function IssueRow({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: 'danger' | 'warning' | 'info' | 'neutral';
}) {
  const pct = total > 0 ? Math.min(100, (count / total) * 100) : 0;
  const bg =
    tone === 'danger'
      ? 'bg-[color:var(--danger)]'
      : tone === 'warning'
        ? 'bg-[color:var(--warning)]'
        : tone === 'info'
          ? 'bg-[color:var(--brand)]'
          : 'bg-muted';

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-[12.5px]">
        <span className="text-muted-strong">{label}</span>
        <span className="font-mono font-medium tabular-nums text-foreground">
          {count}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border/70">
        <div
          className={cn('h-full rounded-full', bg)}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  );
}
