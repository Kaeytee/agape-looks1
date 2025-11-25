/**
 * React Query Provider
 * Wraps application with QueryClientProvider for data fetching and caching
 * @module lib/providers/query-provider
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

/**
 * Query Provider Component
 * Provides React Query functionality to all child components
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Create QueryClient instance with default configuration
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 minute by default
            staleTime: 60 * 1000,
            // Retry failed requests once
            retry: 1,
            // Don't refetch on window focus to reduce API calls
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
