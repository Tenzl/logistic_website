import { QueryClient, DefaultOptions } from "@tanstack/react-query"

const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in TanStack v5)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  },
}

export const queryClientOptions: DefaultOptions = defaultQueryOptions

export const createQueryClient = () => new QueryClient({ defaultOptions: queryClientOptions })

export const queryKeys = {
  inquiries: (type: string = "all") => ["inquiries", type] as const,
  services: () => ["services"] as const,
  ports: () => ["ports"] as const,
  user: (id: number | string) => ["user", id] as const,
  dashboardAdmin: () => ["dashboard", "admin"] as const,
  dashboardCustomer: () => ["dashboard", "customer"] as const,
}
