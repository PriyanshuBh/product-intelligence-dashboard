'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Alert } from '@/types';
import { toast } from 'sonner';
import { PageHeader, EmptyState, StatusPill } from '@/components/shell';
import { BellOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Severity = 'HIGH' | 'MEDIUM' | 'LOW';
type Tone = 'danger' | 'warning' | 'info';

const SEVERITY_TONE: Record<Severity, Tone> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'info',
};

export default function AlertsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiFetch<Alert[]>('/alerts'),
    refetchInterval: 5000,
  });

  const dismiss = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/alerts/${id}/dismiss`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Alert dismissed');
      qc.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const active = data?.filter((a) => a.status !== 'DISMISSED') ?? [];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Analysis"
        title="Actionable alerts"
        description="Issues across your catalog that need a human decision — fix them to lift quality scores."
        actions={
          <div className="flex items-center gap-2">
            <StatusPill tone="danger" dot>
              {active.length} active
            </StatusPill>
          </div>
        }
      />

      <div className="space-y-3">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-border bg-surface/60"
            />
          ))
        ) : data?.length === 0 ? (
          <EmptyState
            icon={<BellOff className="size-4" />}
            title="Everything looks optimized"
            description="No active listing or pricing issues detected for your catalog right now."
          />
        ) : (
          data?.map((a) => {
            const dismissed = a.status === 'DISMISSED';
            return (
              <article
                key={a.id}
                className={cn(
                  'group flex items-start justify-between gap-6 rounded-2xl border border-border bg-surface p-5 transition-all',
                  dismissed
                    ? 'opacity-50 grayscale'
                    : 'hover:border-border-strong hover:shadow-[0_2px_12px_-4px_rgb(0_0_0/0.05)]',
                )}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <StatusPill tone={SEVERITY_TONE[a.severity as Severity]} className="mt-0.5 shrink-0">
                    {a.severity}
                  </StatusPill>
                  <div className="min-w-0 space-y-2">
                    <p className="text-[15px] font-medium leading-snug tracking-tight text-foreground">
                      {a.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
                      <span className="font-medium uppercase tracking-[0.14em]">
                        {a.type.replace('_', ' ').toLowerCase()}
                      </span>
                      <span aria-hidden>·</span>
                      <time className="font-mono tabular-nums">
                        {new Date(a.createdAt).toLocaleString()}
                      </time>
                      {a.skuId ? (
                        <>
                          <span aria-hidden>·</span>
                          <span className="font-mono font-medium text-[color:var(--brand)]">
                            {a.skuId}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {!dismissed ? (
                  <button
                    onClick={() => dismiss.mutate(a.id)}
                    className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-[color:var(--danger)]/30 hover:bg-[color:var(--danger)]/8 hover:text-[color:var(--danger)]"
                  >
                    <X className="size-3.5" />
                    Dismiss
                  </button>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
