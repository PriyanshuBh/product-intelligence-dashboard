'use client';

import { use, useEffect } from 'react';
import { useJob } from '@/hooks/use-job-polling';
import { JobStatusPill } from '@/components/jobs/job-status-pill';
import { useRouter } from 'next/navigation';
import { PageHeader, Surface, StatusPill } from '@/components/shell';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type JobResult = {
  skuId?: string;
  insertedCount?: number;
  videoUrl?: string;
  extraction?: {
    confidence: number;
    product: {
      productTitle?: string | null;
      brand?: string | null;
    };
  };
} | null;

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: job } = useJob(id);

  useEffect(() => {
    if (job?.status === 'COMPLETED') {
      const res = job.resultJson as JobResult;
      if (res?.skuId) {
        const timer = setTimeout(() => router.push(`/products/${res.skuId}`), 4000);
        return () => clearTimeout(timer);
      } else if (res?.insertedCount !== undefined) {
        const timer = setTimeout(() => router.push('/dashboard'), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [job?.status, job?.resultJson, router]);

  if (!job)
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-full bg-border/60" />
        <div className="h-48 animate-pulse rounded-2xl bg-border/40" />
      </div>
    );

  const result = job.resultJson as JobResult;
  const isRedirecting =
    job.status === 'COMPLETED' && (result?.skuId || result?.insertedCount !== undefined);

  return (
    <div className="space-y-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" />
        All jobs
      </Link>

      <PageHeader
        eyebrow={`Job · ${id.slice(0, 8)}`}
        title={prettyType(job.type)}
        description="Live state, progress and extraction summary for this background job."
        actions={
          <div className="flex items-center gap-2">
            <JobStatusPill status={job.status} />
            {isRedirecting ? (
              <StatusPill tone="success" dot>
                Redirecting in 4s
              </StatusPill>
            ) : null}
          </div>
        }
      />

      <Surface className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="font-medium text-muted-strong">Progress</span>
            <span className="font-mono text-[16px] font-medium tabular-nums text-foreground">
              {job.progress}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                job.status === 'RUNNING' && 'animate-pulse',
              )}
              style={{
                width: `${Math.max(2, job.progress)}%`,
                background:
                  job.status === 'FAILED'
                    ? 'var(--danger)'
                    : job.status === 'COMPLETED'
                      ? 'var(--success)'
                      : 'var(--brand)',
              }}
            />
          </div>
        </div>

        {result?.extraction ? (
          <div className="space-y-4 rounded-xl border border-border bg-surface-muted/60 p-5">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Extraction summary
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <KV label="SKU ID" value={result.skuId} mono />
              <KV
                label="Confidence"
                value={`${(result.extraction.confidence * 100).toFixed(0)}%`}
                accent
              />
              <KV
                label="Extracted title"
                value={result.extraction.product.productTitle}
                wide
              />
              <KV label="Brand" value={result.extraction.product.brand} />
            </div>
          </div>
        ) : null}

        {job.error ? (
          <div className="rounded-xl border border-[color:var(--danger)]/20 bg-[color:var(--danger)]/8 p-5 text-[13px] text-[color:var(--danger)]">
            <p className="mb-1 text-[10.5px] font-medium uppercase tracking-[0.18em]">
              Processing error
            </p>
            <p className="font-mono">{job.error}</p>
          </div>
        ) : null}

        <p className="border-t border-border pt-4 text-[11.5px] text-muted-foreground">
          Initialized at{' '}
          <time className="font-mono tabular-nums">
            {new Date(job.createdAt).toLocaleString()}
          </time>
        </p>
      </Surface>
    </div>
  );
}

function prettyType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function KV({
  label,
  value,
  mono,
  accent,
  wide,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  accent?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={cn('space-y-1', wide && 'col-span-2')}>
      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'text-[13.5px] font-medium text-foreground',
          mono && 'font-mono text-[12.5px]',
          accent && 'text-[color:var(--brand)]',
          wide && 'truncate',
        )}
      >
        {value ?? '—'}
      </p>
    </div>
  );
}
