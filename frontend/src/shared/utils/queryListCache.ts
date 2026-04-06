import type { QueryClient, QueryKey } from "@tanstack/react-query"

/**
 * Cập nhật mảng trong React Query cache mà không refetch.
 * Dùng sau mutation khi API trả về entity đủ để đồng bộ UI.
 */
export function patchQueryListData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: (prev: T[]) => T[],
): void {
  queryClient.setQueryData<T[]>(queryKey, (old) => updater(old ?? []))
}

/** Thêm một phần tử cuối danh sách (vd. POST create) */
export function appendListItem<T>(queryClient: QueryClient, queryKey: QueryKey, item: T): void {
  patchQueryListData<T>(queryClient, queryKey, (rows) => [...rows, item])
}

/** Xóa theo id (vd. DELETE) */
export function removeListItemById<T extends { id: number }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: number,
): void {
  patchQueryListData<T>(queryClient, queryKey, (rows) => rows.filter((r) => r.id !== id))
}

/**
 * Thay thế phần tử cùng id hoặc append nếu chưa có (vd. PUT trả về bản ghi đầy đủ).
 */
export function upsertListItemById<T extends { id: number }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  item: T,
): void {
  patchQueryListData<T>(queryClient, queryKey, (rows) => {
    const idx = rows.findIndex((r) => r.id === item.id)
    if (idx === -1) return [...rows, item]
    const next = [...rows]
    next[idx] = item
    return next
  })
}

export function invalidateQueryList(queryClient: QueryClient, queryKey: QueryKey): Promise<void> {
  return queryClient.invalidateQueries({ queryKey })
}
