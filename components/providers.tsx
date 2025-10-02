'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { QUERY_CONFIG } from '@/config/app.config';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_CONFIG.STALE_TIME,
            gcTime: QUERY_CONFIG.CACHE_TIME,
            refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
            refetchOnReconnect: QUERY_CONFIG.REFETCH_ON_RECONNECT,
            refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
            retry: QUERY_CONFIG.RETRY,
            // Add network mode for better performance
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
