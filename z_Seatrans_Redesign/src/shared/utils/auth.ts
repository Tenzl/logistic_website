import { RoleGroup, User } from "@/types/dashboard"

const INTERNAL_MARKERS = ["ADMIN", "EMPLOYEE"] as const
const EXTERNAL_MARKERS = ["CUSTOMER"] as const

type RoleGroupResult = RoleGroup | undefined

function normalizeRole(role?: string): string {
  return role?.toUpperCase() ?? ""
}

export function getRoleGroup(user?: User | null): RoleGroupResult {
  if (!user) return undefined

  // Prefer backend-provided roleGroup to avoid front-end divergence.
  if (user.roleGroup) return user.roleGroup

  const role = normalizeRole(user.role)
  if (role && INTERNAL_MARKERS.some((marker) => role.includes(marker))) return "INTERNAL"
  if (role && EXTERNAL_MARKERS.some((marker) => role.includes(marker))) return "EXTERNAL"

  return undefined
}
