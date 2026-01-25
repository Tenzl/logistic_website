"use client"

import { Suspense } from "react"
import {
  canAccessSection,
  DashboardSection,
  getSectionConfig,
  SectionRole,
} from "@/shared/config/dashboard-registry"
import { SectionErrorBoundary, SectionSuspenseFallback } from "@/shared/components/error/SectionErrorBoundary"

interface DashboardContentProps {
  section: DashboardSection
  userRole: SectionRole
}

export function DashboardContent({ section, userRole }: DashboardContentProps) {
  const config = getSectionConfig(section)

  if (!config) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Section not found.
      </div>
    )
  }

  if (!canAccessSection(section, userRole)) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground">You do not have permission to view this section.</p>
      </div>
    )
  }

  const Component = config.component

  return (
    <SectionErrorBoundary sectionId={section}>
      <Suspense fallback={<SectionSuspenseFallback />}>
        <Component />
      </Suspense>
    </SectionErrorBoundary>
  )
}
