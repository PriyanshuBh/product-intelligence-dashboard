'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Surface, StatusPill } from '@/components/shell';

type Result = {
  originalTitle: string;
  attributes: Record<string, string>;
  keywords: string[];
  enhancedTitle: string;
  reason: string;
  source: 'gemini' | 'mock';
};

export function EnhancedTitlePanel({
  skuId,
  currentTitle,
}: {
  skuId: string;
  currentTitle: string | null;
}) {
  const qc = useQueryClient();
  const [r, setR] = useState<Result | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      apiFetch<Result>(`/products/${skuId}/enhance-title`, { method: 'POST' }),
    onSuccess: (d) => {
      setR(d);
      toast.success(`Title enhanced via ${d.source === 'gemini' ? 'Gemini' : 'fallback'}.`);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Generation failed'),
  });

  const applyMut = useMutation({
    mutationFn: () =>
      apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({ skuId, productTitle: r?.enhancedTitle }),
      }),
    onSuccess: () => {
      toast.success('Title applied to listing.');
      qc.invalidateQueries({ queryKey: ['product', skuId] });
      setR(null);
    },
    onError: () => toast.error('Failed to apply title'),
  });

  return (
    <Surface className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
              AI title optimizer
            </h2>
            {r?.source ? (
              <StatusPill tone={r.source === 'gemini' ? 'success' : 'warning'}>
                {r.source === 'gemini' ? 'Gemini 2.0' : 'Simulated'}
              </StatusPill>
            ) : null}
          </div>
          <p className="text-[12.5px] text-muted-foreground">
            Rewrite the title using extracted attributes and trending keywords.
          </p>
        </div>
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending || applyMut.isPending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-[12.5px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Sparkles className="size-3.5" />
          {mut.isPending ? 'Optimizing…' : 'Enhance title'}
        </button>
      </div>

      {!r ? (
        <div className="space-y-2 rounded-xl border border-dashed border-border bg-surface-muted/50 p-6 text-center">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Current title
          </p>
          <p className="text-[14px] font-medium italic text-foreground">
            “{currentTitle || '(missing title)'}”
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                New enhanced title
              </p>
              <p className="rounded-lg border border-[color:var(--brand)]/20 bg-brand-soft p-3 text-[14px] font-medium leading-snug text-[color:var(--brand)]">
                {r.enhancedTitle}
              </p>
              <button
                onClick={() => applyMut.mutate()}
                disabled={applyMut.isPending}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-surface-muted disabled:opacity-40"
              >
                <Check className="size-3.5" />
                {applyMut.isPending ? 'Applying…' : 'Apply to listing'}
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                AI rationale
              </p>
              <p className="text-[12.5px] leading-relaxed text-muted-strong">
                {r.reason}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 border-t border-border pt-5 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Detected attributes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(r.attributes).map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11.5px] text-muted-strong"
                  >
                    <span className="font-medium uppercase tracking-wide text-muted-foreground">
                      {k}
                    </span>
                    <span className="font-mono">{v}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Injected keywords
              </p>
              <div className="flex flex-wrap gap-1.5">
                {r.keywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full border border-[color:var(--success)]/20 bg-[color:var(--success)]/10 px-2 py-0.5 text-[11px] font-medium lowercase text-[color:var(--success)]"
                  >
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Surface>
  );
}
