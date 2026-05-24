'use client';

import { useState } from 'react';
import { VideoUploader } from '@/components/upload/video-uploader';
import { CsvUploader } from '@/components/upload/csv-uploader';
import { ManualEntry } from '@/components/upload/manual-entry';
import { CompetitorCsvUploader } from '@/components/upload/competitor-csv-uploader';
import { PageHeader, Surface, StatusPill } from '@/components/shell';
import { Film, FileSpreadsheet, PenLine, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabKey = 'video' | 'csv' | 'manual' | 'competitor';

const TABS: { key: TabKey; label: string; description: string; icon: typeof Film }[] = [
  { key: 'video', label: 'Video', description: 'Extract attributes from a product video', icon: Film },
  { key: 'csv', label: 'Products CSV', description: 'Bulk upload a product feed', icon: FileSpreadsheet },
  { key: 'manual', label: 'Manual entry', description: 'Add or correct a single SKU', icon: PenLine },
  { key: 'competitor', label: 'Competitor CSV', description: 'Track competitor pricing data', icon: Tags },
];

export default function UploadPage() {
  const [tab, setTab] = useState<TabKey>('video');
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Inventory"
        title="Ingest products & data"
        description="Extract intelligence from product videos, bulk upload CSV feeds, or enter listings manually."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="info" dot>
              Real-time job polling
            </StatusPill>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Ingest method" className="flex flex-col gap-1">
          {TABS.map((t) => {
            const isActive = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  'group flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all',
                  isActive
                    ? 'border-border-strong bg-surface shadow-[0_1px_0_0_var(--border)]'
                    : 'border-transparent bg-transparent hover:border-border hover:bg-surface/60',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    isActive
                      ? 'border-[color:var(--brand)]/20 bg-brand-soft text-[color:var(--brand)]'
                      : 'border-border bg-surface text-muted-foreground group-hover:text-foreground',
                  )}
                >
                  <t.icon className="size-3.5" />
                </span>
                <span className="flex-1 space-y-0.5">
                  <span className="block text-[13.5px] font-medium text-foreground">
                    {t.label}
                  </span>
                  <span className="block text-[12px] leading-snug text-muted-foreground">
                    {t.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <Surface padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Method
              </p>
              <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                {active.label}
              </h2>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {String(TABS.findIndex((t) => t.key === tab) + 1).padStart(2, '0')} /{' '}
              {String(TABS.length).padStart(2, '0')}
            </span>
          </div>
          <div className="p-6 md:p-8">
            {tab === 'video' && <VideoUploader />}
            {tab === 'csv' && <CsvUploader />}
            {tab === 'manual' && <ManualEntry />}
            {tab === 'competitor' && <CompetitorCsvUploader />}
          </div>
        </Surface>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FootNote eyebrow="AI-driven" body="Vision model parses titles, brand and category from product videos." />
        <FootNote eyebrow="Real-time" body="Jobs poll every few seconds — no refresh required." />
        <FootNote eyebrow="Verified" body="Every listing runs through the audit pipeline on ingest." />
      </div>
    </div>
  );
}

function FootNote({ eyebrow, body }: { eyebrow: string; body: string }) {
  return (
    <div className="space-y-1.5 rounded-xl border border-border bg-surface p-4">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-[color:var(--brand)]">
        {eyebrow}
      </p>
      <p className="text-[13px] leading-snug text-muted-strong">{body}</p>
    </div>
  );
}
