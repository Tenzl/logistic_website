'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
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
  ListChecks,
  Calculator,
  Truck
} from 'lucide-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
import { NavUser } from '@/shared/components/ui/nav-user'
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
import { ManageOffices } from './ManageOffices'
import { ShippingAgencyInquiriesTab } from './ShippingAgencyInquiriesTab'
import { FreightForwardingInquiriesTab } from './FreightForwardingInquiriesTab'
import { LogisticsInquiriesTab } from './LogisticsInquiriesTab'
import { CharteringInquiriesTab } from './CharteringInquiriesTab'
import { SpecialRequestInquiriesTab } from './SpecialRequestInquiriesTab'

interface AdminPageProps {
  onNavigateHome: () => void
  initialSection?: AdminSection
}

type AdminSection =
  | 'profile'
  | 'inquiry'
  | 'shipping-agency-inquiries'
  | 'freight-forwarding-inquiries'
  | 'logistics-inquiries'
  | 'chartering-inquiries'
  | 'special-request-inquiries'
  | 'add-image'
  | 'manage-images'
  | 'services'
  | 'ports'
  | 'commodities'
  | 'categories'
  | 'posts'
  | 'offices'

export function AdminPage({ onNavigateHome, initialSection = 'profile' }: AdminPageProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection)
  const { user, isLoading } = useAuth()
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  const adminUser = user
    ? { name: user.fullName || user.username, email: user.email, avatar: '' }
    : { name: 'Admin User', email: 'admin@seatrans.com', avatar: '' }

  const menuItems = [
    { id: 'profile' as AdminSection, label: 'Edit Profile', icon: User, category: 'Profile' },
    { id: 'shipping-agency-inquiries' as AdminSection, label: 'Shipping Agency', icon: ListChecks, category: 'Inquiries' },
    { id: 'freight-forwarding-inquiries' as AdminSection, label: 'Freight Forwarding', icon: Package, category: 'Inquiries' },
    { id: 'logistics-inquiries' as AdminSection, label: 'Logistics', icon: Truck, category: 'Inquiries' },
    { id: 'chartering-inquiries' as AdminSection, label: 'Chartering', icon: Anchor, category: 'Inquiries' },
    { id: 'special-request-inquiries' as AdminSection, label: 'Special Request', icon: FileText, category: 'Inquiries' },
    { id: 'add-image' as AdminSection, label: 'Add Image', icon: Upload, category: 'Image Management' },
    { id: 'manage-images' as AdminSection, label: 'Manage Images', icon: ImageIcon, category: 'Image Management' },
    { id: 'services' as AdminSection, label: 'Services', icon: Cog, category: 'Data Management' },
    { id: 'ports' as AdminSection, label: 'Ports', icon: Anchor, category: 'Data Management' },
    { id: 'offices' as AdminSection, label: 'Offices', icon: LayoutDashboard, category: 'Data Management' },
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
        <Sidebar
          collapsible="offcanvas"
          variant="inset"
          className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  asChild
                  className="bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
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
                  <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">
                    {category.name}
                  </h3>
                </div>
                <SidebarMenuSub>
                  {category.items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.id
                    return (
                      <SidebarMenuSubItem key={item.id}>
                        <SidebarMenuSubButton
                          onClick={() => setActiveSection(item.id)}
                          isActive={isActive}
                          className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                        >
                          <Icon className={`size-4 ${isActive ? '!text-primary-foreground' : ''}`} />
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
          <div className="px-2 pb-2">
            {isLoading ? (
              <div className="text-xs text-muted-foreground px-2 py-3">Loading account...</div>
            ) : (
              <NavUser user={adminUser} />
            )}
          </div>
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
          {activeSection === 'shipping-agency-inquiries' && <ShippingAgencyInquiriesTab />}
          {activeSection === 'freight-forwarding-inquiries' && <FreightForwardingInquiriesTab />}
          {activeSection === 'logistics-inquiries' && <LogisticsInquiriesTab />}
          {activeSection === 'chartering-inquiries' && <CharteringInquiriesTab />}
          {activeSection === 'special-request-inquiries' && <SpecialRequestInquiriesTab />}
          {activeSection === 'add-image' && <AddImageTab />}
          {activeSection === 'manage-images' && <ManageImagesTab />}
          {activeSection === 'services' && <ManageServices />}
          {activeSection === 'ports' && <ManagePorts />}
          {activeSection === 'offices' && <ManageOffices />}
          {activeSection === 'commodities' && <ManageImageTypes />}
          
          {activeSection === 'categories' && <ManageCategories />}
          {activeSection === 'posts' && <ManagePosts />}
        </div>
      </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
