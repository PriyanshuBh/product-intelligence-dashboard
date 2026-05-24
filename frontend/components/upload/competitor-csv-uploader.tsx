'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiUpload } from '@/lib/api';
import { Tags, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CompetitorCsvUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const mut = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('file', file!);
      return apiUpload<{ jobId: string }>('/competitor-prices/upload', fd);
    },
    onSuccess: (d) => {
      toast.success('Competitor prices uploaded.');
      router.push(`/jobs/${d.jobId}`);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'CSV upload failed'),
  });

  return (
    <div className="space-y-6">
      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-surface-muted/40 px-6 py-10 text-center transition-colors',
          file
            ? 'border-[color:var(--success)]/30 bg-[color:var(--success)]/5'
            : 'border-border hover:border-border-strong hover:bg-surface-muted',
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground">
          {file ? (
            <Check className="size-4 text-[color:var(--success)]" />
          ) : (
            <Tags className="size-4" />
          )}
        </span>
        {file ? (
          <div className="space-y-1">
            <p className="text-[13.5px] font-medium text-foreground">{file.name}</p>
            <p className="text-[11.5px] text-muted-foreground">click to replace</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-[13.5px] font-medium text-foreground">
              Upload competitor prices CSV
            </p>
            <p className="text-[11.5px] text-muted-foreground">For market intelligence</p>
          </div>
        )}
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="space-y-2 rounded-xl border border-border bg-surface-muted/60 p-4">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Required columns
        </p>
        <p className="font-mono text-[12px] leading-relaxed text-muted-strong">
          sku_id, platform, competitor_price, competitor_url
        </p>
      </div>

      <button
        disabled={!file || mut.isPending}
        onClick={() => mut.mutate()}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-foreground px-6 text-[14px] font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {mut.isPending ? 'Processing feed…' : 'Import competitor prices'}
      </button>
    </div>
  );
}
