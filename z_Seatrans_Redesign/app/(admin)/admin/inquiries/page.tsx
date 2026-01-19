"use client"

import { useRouter } from "next/navigation"

import { ProtectedRoute } from "@/shared/components/auth/ProtectedRoute"
import { MainDashboard } from "@/shared/components/layout/dashboard/MainDashboard"

export default function AdminInquiriesPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRole="INTERNAL">
      <MainDashboard
        roleGroup="INTERNAL"
        initialSection="shipping-agency-inquiries"
        onNavigateHome={() => router.push("/")}
      />
    </ProtectedRoute>
  )
}
