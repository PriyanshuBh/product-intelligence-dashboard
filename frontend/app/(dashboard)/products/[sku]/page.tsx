'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { IssuesList } from '@/components/products/issues-list';
import { PriceComparison } from '@/components/competitors/price-comparison';
import { PriceHistoryChart } from '@/components/competitors/price-history-chart';
import { EnhancedTitlePanel } from '@/components/products/enhanced-title-panel';
import { ManualEntry } from '@/components/upload/manual-entry';
import { Surface, StatusPill } from '@/components/shell';
import type { Product, Issue } from '@/types';
import { useState } from 'react';
import { Edit3, ChevronLeft, Download, ImageOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { downloadPdf } from '@/lib/download-pdf';
import { cn } from '@/lib/utils';

type Detail = Product & { issues: Issue[] };

export default function ProductDetail({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = use(params);
  const [tab, setTab] = useState<'issues' | 'title' | 'market'>('issues');
  const [isEditing, setIsEditing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['product', sku],
    queryFn: () => apiFetch<Detail>(`/products/${sku}`),
  });

  if (isLoading)
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-full bg-border/60" />
        <div className="h-48 animate-pulse rounded-2xl bg-border/40" />
      </div>
    );
  if (!data)
    return (
      <div className="rounded-2xl border border-[color:var(--danger)]/20 bg-[color:var(--danger)]/8 p-5 text-[13px] text-[color:var(--danger)]">
        Product not found.
      </div>
    );

  const downloadReport = async () => {
    if (!data || exporting) return;
    setExporting(true);
    try {
      const { ProductQualityReport } = await import(
        '@/components/reports/quality-report-pdf'
      );
      await downloadPdf(
        <ProductQualityReport product={data} />,
        `${data.skuId}-listing-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setIsEditing(false)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted-strong transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to details
        </button>
        <ManualEntry initialData={data} onSave={() => setIsEditing(false)} />
      </div>
    );
  }

  const scoreTone =
    data.qualityScore >= 80 ? 'success' : data.qualityScore >= 60 ? 'warning' : 'danger';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          All products
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadReport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-medium text-muted-strong transition-colors hover:text-foreground disabled:opacity-40"
          >
            {exporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {exporting ? 'Generating…' : 'Export PDF'}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-foreground px-3 py-1.5 text-[12.5px] font-medium text-background transition-opacity hover:opacity-90"
          >
            <Edit3 className="size-3.5" />
            Edit listing
          </button>
        </div>
      </div>

      <Surface className="!p-0 overflow-hidden">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:gap-8">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt=""
              className="size-36 shrink-0 rounded-xl border border-border bg-surface-muted object-cover"
            />
          ) : (
            <div className="flex size-36 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-muted/60 text-muted-foreground">
              <ImageOff className="size-5" />
              <span className="text-[11px] font-medium uppercase tracking-[0.16em]">
                No image
              </span>
            </div>
          )}

          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[12.5px] font-medium text-[color:var(--brand)]">
                  {data.skuId}
                </span>
                {data.brand ? <span className="text-muted-foreground">·</span> : null}
                {data.brand ? (
                  <span className="text-[12.5px] text-muted-foreground">{data.brand}</span>
                ) : null}
                {data.category ? <span className="text-muted-foreground">·</span> : null}
                {data.category ? (
                  <span className="text-[12.5px] text-muted-foreground">{data.category}</span>
                ) : null}
              </div>
              <h1 className="text-[24px] font-semibold leading-[1.2] tracking-tight text-foreground sm:text-[28px]">
                {data.productTitle ?? (
                  <span className="italic text-muted-foreground">(Untitled listing)</span>
                )}
              </h1>
            </div>

            <dl className="flex flex-wrap items-end gap-x-10 gap-y-4">
              <Stat
                label="List price"
                value={data.price ? `₹${data.price}` : '—'}
              />
              <Stat
                label="MRP"
                value={
                  data.mrp ? (
                    <span className="text-muted-foreground line-through">₹{data.mrp}</span>
                  ) : (
                    '—'
                  )
                }
              />
              <Stat
                label="Quality score"
                value={
                  <span
                    className={cn(
                      scoreTone === 'success' && 'text-[color:var(--success)]',
                      scoreTone === 'warning' && 'text-[color:var(--warning)]',
                      scoreTone === 'danger' && 'text-[color:var(--danger)]',
                    )}
                  >
                    {data.qualityScore}%
                  </span>
                }
                suffix={
                  <StatusPill tone={scoreTone}>
                    {data.issues.length} issue{data.issues.length === 1 ? '' : 's'}
                  </StatusPill>
                }
              />
            </dl>
          </div>
        </div>
      </Surface>

      <div className="space-y-6">
        <div className="flex gap-1 border-b border-border">
          <TabBtn
            active={tab === 'issues'}
            onClick={() => setTab('issues')}
            label="Listing audit"
            count={data.issues.length}
          />
          <TabBtn
            active={tab === 'title'}
            onClick={() => setTab('title')}
            label="AI title enhancement"
          />
          <TabBtn
            active={tab === 'market'}
            onClick={() => setTab('market')}
            label="Market intelligence"
          />
        </div>

        <div>
          {tab === 'issues' && <IssuesList issues={data.issues} />}
          {tab === 'title' && (
            <EnhancedTitlePanel
              skuId={data.skuId}
              currentTitle={data.productTitle}
            />
          )}
          {tab === 'market' && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <PriceComparison skuId={data.skuId} ourPrice={data.price} />
              <PriceHistoryChart skuId={data.skuId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="flex items-baseline gap-2 font-mono text-[22px] font-medium leading-none tabular-nums text-foreground">
        <span>{value}</span>
        {suffix ? <span className="text-[11px]">{suffix}</span> : null}
      </dd>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-colors',
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <span>{label}</span>
      {count !== undefined ? (
        <span
          className={cn(
            'rounded-md px-1.5 py-0.5 font-mono text-[11px] tabular-nums',
            active
              ? 'bg-brand-soft text-[color:var(--brand)]'
              : 'bg-surface-muted text-muted-foreground',
          )}
        >
          {count}
        </span>
      ) : null}
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-px bg-foreground"
        />
      ) : null}
    </button>
  );
}
