"use client"

import React, { useEffect, useMemo, useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"
import { ChevronRight, Database, FileText, Image as ImageIcon, ListChecks, ReceiptText, User as UserIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"
import Image from "next/image"

import { useAuth } from "@/modules/auth/context/AuthContext"
import { DashboardContent } from "@/shared/components/layout/dashboard/DashboardContent"
import {
  canAccessSection,
  DashboardSection,
  getSectionConfig,
  listSectionsByRoleGroup,
  SectionRole,
} from "@/shared/config/dashboard-registry"
import { NavUser } from "@/shared/components/ui/nav-user"
import { createQueryClient } from "@/shared/config/react-query.config"
import { getRoleGroup } from "@/shared/utils/auth"
import { RoleGroup } from "@/types/dashboard"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/shared/components/ui/sidebar"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"

interface MainDashboardProps {
  initialSection?: DashboardSection
  roleGroup?: RoleGroup
  onNavigateHome?: () => void
}

interface CategoryGroup {
  name: string
  items: { id: DashboardSection; label: string }[]
}

type CategoryIcon = LucideIcon | string

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  Profile: UserIcon,
  Invoices: ReceiptText,
  Inquiries: ListChecks,
  "Image Management": ImageIcon,
  "Data Management": Database,
  "Content Management": FileText,
}

function mapUserRole(role?: string, roleGroup?: RoleGroup): SectionRole | undefined {
  const upper = role?.toUpperCase()
  if (upper?.includes("ADMIN")) return "ADMIN"
  if (upper?.includes("EMPLOYEE")) return "EMPLOYEE"
  if (upper?.includes("CUSTOMER")) return "CUSTOMER"

  // Removed risky fallback: if role is unclear, return undefined
  // instead of assuming EMPLOYEE for INTERNAL or CUSTOMER for EXTERNAL
  return undefined
}

function buildCategories(sections: ReturnType<typeof listSectionsByRoleGroup>): CategoryGroup[] {
  const order: Record<string, number> = {
    Profile: 0,
    Invoices: 1,
    Inquiries: 2,
    "Image Management": 3,
    "Data Management": 4,
    "Content Management": 5,
  }

  const grouped = sections.reduce<Record<string, { id: DashboardSection; label: string }[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push({ id: s.id, label: s.label })
    return acc
  }, {})

  return Object.entries(grouped)
    .sort((a, b) => (order[a[0]] ?? 99) - (order[b[0]] ?? 99))
    .map(([name, items]) => ({ name, items }))
}

const CategoryButton = React.forwardRef<
  HTMLButtonElement,
  {
    category: CategoryGroup
    icon?: CategoryIcon
    onOpenSection: (sectionId: DashboardSection) => void
  } & React.ComponentProps<typeof SidebarMenuButton>
>(({ category, icon, onOpenSection, onClick, ...props }, ref) => {
  const { state, setOpen } = useSidebar()

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    // Preserve CollapsibleTrigger toggle
    onClick?.(event)
    if (state === "collapsed" && category.items.length > 0) {
      onOpenSection(category.items[0].id)
      setOpen(true)
    }
  }

  const renderIcon = () => {
    if (!icon) return null
    if (typeof icon === "string") {
      return <Image src={icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
    }
    const IconComponent = icon
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <SidebarMenuButton ref={ref} tooltip={category.name} onClick={handleClick} {...props}>
      {renderIcon()}
      <span className="font-semibold">{category.name}</span>
      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-sidebar-accent px-1 text-xs font-medium tabular-nums text-sidebar-accent-foreground">
        {category.items.length}
      </span>
      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
    </SidebarMenuButton>
  )
})
CategoryButton.displayName = "CategoryButton"

export function MainDashboard({ initialSection, roleGroup: roleGroupOverride, onNavigateHome }: MainDashboardProps) {
  const { user } = useAuth()
  const roleGroup = roleGroupOverride ?? getRoleGroup(user as any)
  const userRole = mapUserRole(user?.role, roleGroup)

  const sections = useMemo(() => {
    if (!roleGroup) return []
    return listSectionsByRoleGroup(roleGroup).filter((s) => (userRole ? s.roles.includes(userRole) : true))
  }, [roleGroup, userRole])

  const defaultSection = useMemo(() => {
    if (initialSection && sections.some((s) => s.id === initialSection)) return initialSection
    return sections[0]?.id
  }, [initialSection, sections])

  const queryClient = useMemo(() => createQueryClient(), [])

  if (!roleGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">No role detected</h2>
          <p className="text-muted-foreground text-sm">Please log in again or contact support.</p>
        </div>
      </div>
    )
  }

  const categories = buildCategories(sections)

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">No accessible sections</h2>
          <p className="text-muted-foreground text-sm">Your account has no assigned permissions.</p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <DashboardShell
          categories={categories}
          sections={sections}
          userRole={userRole}
          defaultSection={defaultSection}
          onNavigateHome={onNavigateHome}
          user={user}
        />
      </SidebarProvider>
    </QueryClientProvider>
  )
}

function DashboardShell({
  categories,
  sections,
  userRole,
  defaultSection,
  onNavigateHome,
  user,
}: {
  categories: CategoryGroup[]
  sections: ReturnType<typeof listSectionsByRoleGroup>
  userRole?: SectionRole
  defaultSection?: DashboardSection
  onNavigateHome?: () => void
  user?: any
}) {
  const { state: sidebarState } = useSidebar()
  const [activeSection, setActiveSection] = useState<DashboardSection | undefined>(defaultSection)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    categories.forEach((cat) => {
      initial[cat.name] = false
    })
    return initial
  })

  // Sync activeSection with defaultSection when sections change
  useEffect(() => {
    if (!activeSection && defaultSection) {
      setActiveSection(defaultSection)
    } else if (activeSection && !sections.some((s) => s.id === activeSection)) {
      // If current activeSection is no longer valid, reset to defaultSection
      setActiveSection(defaultSection)
    }
  }, [defaultSection, activeSection, sections])

  useEffect(() => {
    if (sidebarState === "collapsed") {
      setExpandedCategories((prev) =>
        Object.keys(prev).reduce<Record<string, boolean>>((acc, key) => {
          acc[key] = false
          return acc
        }, {})
      )
    }
  }, [sidebarState])

  // Get section label for display
  const activeSectionLabel = activeSection ? getSectionConfig(activeSection)?.label : undefined

  return (
    <div className="flex h-screen w-full">
      <Sidebar collapsible="icon" variant="inset" className="border-r bg-sidebar text-sidebar-foreground">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="bg-sidebar-accent hover:bg-sidebar-accent">
                <div className="flex items-center gap-2">
                  <Image
                    src="/landing-image/footer_Logo.png"
                    alt="Seatrans Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <div className="flex flex-col leading-none">
                    <span className="font-bold text-primary">Dashboard</span>
                    <span className="text-xs text-muted-foreground">Seatrans</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {categories.map((category) => {
              const icon = CATEGORY_ICONS[category.name]
              const isOpen = expandedCategories[category.name] ?? true
              return (
                <Collapsible
                  key={category.name}
                  open={isOpen}
                  onOpenChange={(open) => setExpandedCategories((prev) => ({ ...prev, [category.name]: open }))}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <CategoryButton
                        category={category}
                        icon={icon}
                        onOpenSection={setActiveSection}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {category.items.map((item) => (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton
                              onClick={() => setActiveSection(item.id)}
                              isActive={activeSection === item.id}
                              className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                            >
                              <span>{item.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          {user && (
            <NavUser
              user={{
                name: user.fullName || user.email || "User",
                email: user.email || "",
                avatar: "",
              }}
            />
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-primary">Dashboard</h1>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-muted-foreground">{activeSectionLabel || "Select a section"}</span>
          </div>
          <div className="ml-auto">
            {onNavigateHome && (
              <Button variant="ghost" size="sm" onClick={onNavigateHome}>
                Home
              </Button>
            )}
          </div>
        </header>

        <div className="flex flex-1 min-h-0 flex-col gap-4 p-4 md:p-6 overflow-y-auto hide-scrollbar">
          {userRole && activeSection ? (
            <DashboardContent section={activeSection} userRole={userRole} />
          ) : (
            <div className="text-sm text-muted-foreground">Missing role mapping for this user.</div>
          )}
        </div>
      </SidebarInset>
    </div>
  )
}

export default MainDashboard
