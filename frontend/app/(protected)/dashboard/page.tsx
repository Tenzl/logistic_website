"use client"

import { useRouter } from "next/navigation"

import { ProtectedRoute } from "@/shared/components/auth/ProtectedRoute"
import { MainDashboard } from "@/shared/components/layout/dashboard/MainDashboard"

export default function DashboardPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRole="EXTERNAL">
      <MainDashboard
        roleGroup="EXTERNAL"
        initialSection="profile"
        onNavigateHome={() => router.push("/")}
      />
    </ProtectedRoute>
  )
}
