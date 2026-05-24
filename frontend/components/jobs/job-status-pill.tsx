import type { JobStatus } from '@/types';
import { StatusPill } from '@/components/shell';

const TONE: Record<JobStatus, Parameters<typeof StatusPill>[0]['tone']> = {
  PENDING: 'neutral',
  RUNNING: 'info',
  COMPLETED: 'success',
  FAILED: 'danger',
  PARTIALLY_COMPLETED: 'warning',
};

const LABEL: Record<JobStatus, string> = {
  PENDING: 'Pending',
  RUNNING: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  PARTIALLY_COMPLETED: 'Partial',
};

export function JobStatusPill({ status }: { status: JobStatus }) {
  return (
    <StatusPill tone={TONE[status]} dot={status === 'RUNNING'}>
      {LABEL[status]}
    </StatusPill>
  );
}
