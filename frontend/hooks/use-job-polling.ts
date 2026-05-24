import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Job } from '@/types';

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => apiFetch<Job>(`/jobs/${id}`),
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'PENDING' || s === 'RUNNING' ? 1500 : false;
    },
  });
}

export function useJobsList() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiFetch<Job[]>('/jobs'),
    refetchInterval: 3000,
  });
}