"use client"

import { useRouter } from "next/navigation"

import { ProtectedRoute } from "@/shared/components/auth/ProtectedRoute"
import { MainDashboard } from "@/shared/components/layout/dashboard/MainDashboard"

export default function AdminPostsPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredRole="INTERNAL">
      <MainDashboard
        roleGroup="INTERNAL"
        initialSection="posts"
        onNavigateHome={() => router.push("/")}
      />
    </ProtectedRoute>
  )
}
