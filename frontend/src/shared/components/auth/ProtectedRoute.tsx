"use client"

import { ReactNode, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/modules/auth/context/AuthContext"
import { getRoleGroup } from "@/shared/utils/auth"
import { RoleGroup } from "@/shared/types/dashboard"
import { SectionLoadingSkeleton } from "../loading/SectionLoadingSkeleton"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: RoleGroup
  redirectTo?: string
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const roleGroup = getRoleGroup(user)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      const redirect = encodeURIComponent(pathname || "/")
      router.push(`${redirectTo}?redirect=${redirect}`)
    }
  }, [isLoading, user, router, pathname, redirectTo])

  if (isLoading) return <SectionLoadingSkeleton />
  if (!user) return null

  // Role guard
  if (requiredRole && roleGroup !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
