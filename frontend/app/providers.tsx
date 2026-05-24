'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { BackendListener } from '@/components/shell';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 5000 } } }));
  return (
    <QueryClientProvider client={client}>
      <BackendListener />
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}