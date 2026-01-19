"use client"

import { Skeleton } from "@/shared/components/ui/skeleton"

export function SectionLoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-[240px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
