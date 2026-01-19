import { LucideIcon } from "lucide-react"

export type RoleGroup = "INTERNAL" | "EXTERNAL"

export interface NavigationItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: NavigationSubItem[]
  badge?: string | number
}

export interface NavigationSubItem {
  title: string
  url: string
}

export interface DashboardConfig {
  navigation: NavigationItem[]
  projects?: ProjectItem[]
}

export interface ProjectItem {
  name: string
  url: string
  icon: LucideIcon
}

export interface User {
  id: number
  email: string
  fullName: string
  nation?: string
  phone?: string
  company?: string
  role?: string
  roleId?: number
  roleGroup?: RoleGroup
}
