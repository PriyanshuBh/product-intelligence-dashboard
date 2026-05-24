'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiUpload } from '@/lib/api';
import { Video, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VideoUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [enhance, setEnhance] = useState(false);

  const mut = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('video', file!);
      fd.append('enhanceTitle', String(enhance));
      return apiUpload<{ jobId: string }>('/upload-video', fd);
    },
    onSuccess: (d) => {
      toast.success('Video uploaded — analysis starting.');
      router.push(`/jobs/${d.jobId}`);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Upload failed'),
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
            <Video className="size-4" />
          )}
        </span>
        {file ? (
          <div className="space-y-1">
            <p className="text-[13.5px] font-medium text-foreground">{file.name}</p>
            <p className="text-[11.5px] text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB · click to replace
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-[13.5px] font-medium text-foreground">
              Choose a product video to analyze
            </p>
            <p className="text-[11.5px] text-muted-foreground">MP4, MOV, WebM · up to ~100 MB</p>
          </div>
        )}
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        type="button"
        onClick={() => setEnhance(!enhance)}
        aria-pressed={enhance}
        className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-strong"
      >
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            enhance
              ? 'bg-[color:var(--brand)] text-accent-foreground'
              : 'bg-surface-muted text-muted-foreground',
          )}
        >
          <Sparkles className="size-4" />
        </span>
        <span className="flex-1 space-y-0.5">
          <span className="block text-[13.5px] font-medium text-foreground">
            AI title optimization
          </span>
          <span className="block text-[12px] text-muted-foreground">
            Let Gemini rewrite the title for higher CTR.
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            'relative h-5 w-9 shrink-0 rounded-full transition-colors',
            enhance ? 'bg-[color:var(--brand)]' : 'bg-border',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 size-4 rounded-full bg-surface shadow-sm transition-all',
              enhance ? 'left-[18px]' : 'left-0.5',
            )}
          />
        </span>
      </button>

      <button
        disabled={!file || mut.isPending}
        onClick={() => mut.mutate()}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-foreground px-6 text-[14px] font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {mut.isPending ? 'Uploading…' : 'Start extraction job'}
      </button>
    </div>
  );
}
