'use client';

import Link from 'next/link';
import { useJobsList } from '@/hooks/use-job-polling';
import { JobStatusPill } from '@/components/jobs/job-status-pill';
import { PageHeader, Surface, EmptyState, StatusPill } from '@/components/shell';
import { cn } from '@/lib/utils';

export default function JobsPage() {
  const { data, isLoading } = useJobsList();
  const running = data?.filter((j) => j.status === 'RUNNING').length ?? 0;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Inventory"
        title="Processing jobs"
        description="Asynchronous ingest, audit and extraction tasks running across your catalog."
        actions={
          running > 0 ? (
            <StatusPill tone="info" dot>
              {running} running
            </StatusPill>
          ) : (
            <StatusPill tone="neutral">All clear</StatusPill>
          )
        }
      />

      <Surface padded={false} className="overflow-hidden">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <th className="w-[110px] px-5 py-3 font-medium">Job</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="w-[140px] px-5 py-3 font-medium">Status</th>
              <th className="w-[200px] px-5 py-3 font-medium">Progress</th>
              <th className="w-[140px] px-5 py-3 text-right font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-5 py-4">
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-border/60" />
                  </td>
                </tr>
              ))
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState
                    title="No jobs yet"
                    description="Jobs appear here when you ingest data, run audits or queue extractions."
                    className="rounded-none border-0"
                  />
                </td>
              </tr>
            ) : (
              data?.map((j) => (
                <tr key={j.id} className="group transition-colors hover:bg-surface-muted">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/jobs/${j.id}`}
                      className="font-mono text-[12.5px] font-medium text-[color:var(--brand)] hover:underline"
                    >
                      {j.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-medium capitalize text-foreground">
                    {j.type.replace('_', ' ').toLowerCase()}
                  </td>
                  <td className="px-5 py-3.5">
                    <JobStatusPill status={j.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <ProgressBar value={j.progress} status={j.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-muted-foreground">
                    {new Date(j.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Surface>
    </div>
  );
}

function ProgressBar({ value, status }: { value: number; status: string }) {
  const color =
    status === 'FAILED'
      ? 'var(--danger)'
      : status === 'COMPLETED'
        ? 'var(--success)'
        : 'var(--brand)';
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            status === 'RUNNING' && 'animate-pulse',
          )}
          style={{ width: `${Math.max(2, value)}%`, background: color }}
        />
      </div>
      <span className="w-9 text-right font-mono text-[11.5px] tabular-nums text-muted-foreground">
        {value}%
      </span>
    </div>
  );
}
