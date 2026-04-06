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

/** Cùng reference mỗi lần gọi — an toàn cho useMemo/useCallback với queryKey */
const STATIC_LIST_KEYS = {
  ports: ["ports"],
  provinces: ["provinces"],
  partners: ["partners"],
} as const

export const queryKeys = {
  inquiries: (type: string = "all") => ["inquiries", type] as const,
  services: () => ["services"] as const,
  ports: () => STATIC_LIST_KEYS.ports,
  provinces: () => STATIC_LIST_KEYS.provinces,
  partners: () => STATIC_LIST_KEYS.partners,
  user: (id: number | string) => ["user", id] as const,
  dashboardAdmin: () => ["dashboard", "admin"] as const,
  dashboardCustomer: () => ["dashboard", "customer"] as const,
}
