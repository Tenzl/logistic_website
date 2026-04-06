import { useMemo } from "react"
import { useQueryClient, type QueryKey } from "@tanstack/react-query"

import {
  appendListItem,
  invalidateQueryList,
  patchQueryListData,
  removeListItemById,
  upsertListItemById,
} from "@/shared/utils/queryListCache"

/**
 * Bộ thao tác cache list gắn với một queryKey (vd. ports, partners).
 * queryKey nên dùng reference ổn định (vd. queryKeys.ports() sau khi config dùng STATIC_LIST_KEYS).
 */
export function useQueryListCache<T extends { id: number }>(queryKey: QueryKey) {
  const queryClient = useQueryClient()

  return useMemo(
    () => ({
      patchList: (updater: (prev: T[]) => T[]) => patchQueryListData<T>(queryClient, queryKey, updater),
      append: (item: T) => appendListItem(queryClient, queryKey, item),
      removeById: (id: number) => removeListItemById<T>(queryClient, queryKey, id),
      upsertById: (item: T) => upsertListItemById(queryClient, queryKey, item),
      invalidate: () => invalidateQueryList(queryClient, queryKey),
    }),
    [queryClient, queryKey],
  )
}
