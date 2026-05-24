import type { Issue } from '@/types';
import { EmptyState, StatusPill } from '@/components/shell';
import { CheckCircle2 } from 'lucide-react';

type Severity = 'HIGH' | 'MEDIUM' | 'LOW';
type Tone = 'danger' | 'warning' | 'info';

const SEVERITY_TONE: Record<Severity, Tone> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'info',
};

export function IssuesList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="size-4 text-[color:var(--success)]" />}
        title="No quality issues detected"
        description="This listing passes every audit rule. Nice work."
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {issues.map((i) => (
        <li
          key={i.id}
          className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
        >
          <StatusPill tone={SEVERITY_TONE[i.severity as Severity]} className="mt-0.5 shrink-0">
            {i.severity}
          </StatusPill>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[14px] font-medium leading-snug text-foreground">
              {i.message}
            </p>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-muted-strong">Suggested fix · </span>
              {i.suggestedFix}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
