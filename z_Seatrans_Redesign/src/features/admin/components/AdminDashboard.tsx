'use client'

import { useState } from 'react'
import { 
  User, 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Database, 
  Anchor, 
  Package, 
  Shield,
  LayoutDashboard,
  Cog,
  ListChecks
} from 'lucide-react'
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
import { EditProfileTab } from './EditProfileTab'
import { AddImageTab } from './AddImageTab'
import { ManageImagesTab } from './ManageImagesTab'
import { ManagePorts } from './ManagePorts'
import { ManageImageTypes } from './ManageImageTypes'
import { ManageInquiriesTab } from './ManageInquiriesTab'
import { ManagePosts } from './ManagePosts'
import { ManageCategories } from './ManageCategories'
import { ManageServices } from './ManageServices'
import { ManageFormFields } from './ManageFormFields'

interface AdminPageProps {
  onNavigateHome: () => void
  initialSection?: AdminSection
}

type AdminSection = 'profile' | 'inquiry' | 'add-image' | 'manage-images' | 'services' | 'form-fields' | 'ports' | 'commodities' | 'categories' | 'posts'

export function AdminPage({ onNavigateHome, initialSection = 'profile' }: AdminPageProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection)

  const menuItems = [
    { id: 'profile' as AdminSection, label: 'Edit Profile', icon: User, category: 'Profile' },
    { id: 'inquiry' as AdminSection, label: 'Inquiry History', icon: FileText, category: 'Inquiries' },
    { id: 'add-image' as AdminSection, label: 'Add Image', icon: Upload, category: 'Image Management' },
    { id: 'manage-images' as AdminSection, label: 'Manage Images', icon: ImageIcon, category: 'Image Management' },
    { id: 'services' as AdminSection, label: 'Services', icon: Cog, category: 'Data Management' },
    { id: 'form-fields' as AdminSection, label: 'Form Fields', icon: ListChecks, category: 'Data Management' },
    { id: 'ports' as AdminSection, label: 'Ports', icon: Anchor, category: 'Data Management' },
    { id: 'commodities' as AdminSection, label: 'Commodities', icon: Package, category: 'Data Management' },
    { id: 'categories' as AdminSection, label: 'Categories', icon: Database, category: 'Content Management' },
    { id: 'posts' as AdminSection, label: 'Posts', icon: FileText, category: 'Content Management' },
  ]

  const categories = [
    { name: 'Profile', items: menuItems.filter(item => item.category === 'Profile') },
    { name: 'Inquiries', items: menuItems.filter(item => item.category === 'Inquiries') },
    { name: 'Image Management', items: menuItems.filter(item => item.category === 'Image Management') },
    { name: 'Data Management', items: menuItems.filter(item => item.category === 'Data Management') },
    { name: 'Content Management', items: menuItems.filter(item => item.category === 'Content Management') },
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
                      <span className="font-semibold">Admin Panel</span>
                      <span className="text-xs">Seatrans</span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {categories.map((category) => (
              <div key={category.name} className="mb-4">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {category.name}
                  </h3>
                </div>
                <SidebarMenuSub>
                  {category.items.map((item) => {
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
              </div>
            ))}
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
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {activeSection === 'profile' && <EditProfileTab />}
          {activeSection === 'inquiry' && <ManageInquiriesTab />}
          {activeSection === 'add-image' && <AddImageTab />}
          {activeSection === 'manage-images' && <ManageImagesTab />}
          {activeSection === 'services' && <ManageServices />}
          {activeSection === 'form-fields' && <ManageFormFields />}
          {activeSection === 'ports' && <ManagePorts />}
          {activeSection === 'commodities' && <ManageImageTypes />}
          {activeSection === 'categories' && <ManageCategories />}
          {activeSection === 'posts' && <ManagePosts />}
        </div>
      </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
