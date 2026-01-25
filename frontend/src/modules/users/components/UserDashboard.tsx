"use client"

import { useState } from 'react'
import { User as UserIcon, FileText, Shield, LayoutDashboard } from 'lucide-react'
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
} from '@/shared/components/ui/sidebar'
import { Separator } from '@/shared/components/ui/separator'
import { EditProfileTab } from '@/features/admin/components/EditProfileTab'
import { UserInquiryHistoryTab } from './UserInquiryHistoryTab'

interface UserDashboardProps {
  onNavigateHome: () => void
  initialSection?: UserSection
}

type UserSection = 'profile' | 'inquiry'

export function UserDashboard({ onNavigateHome, initialSection = 'profile' }: UserDashboardProps) {
  const [activeSection, setActiveSection] = useState<UserSection>(initialSection)

  const menuItems = [
    { id: 'profile' as UserSection, label: 'Edit Profile', icon: UserIcon },
    { id: 'inquiry' as UserSection, label: 'Inquiry History', icon: FileText },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <a href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Shield className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">User Panel</span>
                      <span className="text-xs">Seatrans</span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuSub>
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <SidebarMenuSubItem key={item.id}>
                      <SidebarMenuSubButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNavigateHome}>
                  <LayoutDashboard className="size-4" />
                  <span>Back to Site</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">User Dashboard</h1>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {activeSection === 'profile' && <EditProfileTab />}
            {activeSection === 'inquiry' && <UserInquiryHistoryTab />}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
