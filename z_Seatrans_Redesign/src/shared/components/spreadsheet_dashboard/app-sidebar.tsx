"use client"

import * as React from "react"
import {
  Truck,
  Ship,
  Anchor,
  Package,
  FileText,
  Warehouse,
} from "lucide-react"

import { NavMain } from "@/shared/components/spreadsheet_dashboard/nav-main"
import { NavUser } from "@/shared/components/spreadsheet_dashboard/nav-user"
import { TeamSwitcher } from "@/shared/components/spreadsheet_dashboard/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/components/ui/sidebar"
import { FileUploadDialog } from "@/features/admin/components/FileUploadDialog"
import { useFileManagement } from "@/features/admin/hooks/useFileManagement"
import { ServiceName } from "@/features/admin/types/spreadsheet-file.types"

const serviceIcons = {
  "Freight Forwarding": Truck,
  "Chartering & Broking": Ship,
  "Ship Management": Anchor,
  "Port Operations": Package,
  "Customs Clearance": FileText,
  "Warehousing": Warehouse,
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onFileSelect?: (fileId: number, fileName: string) => void
}

export function AppSidebar({ onFileSelect, ...props }: AppSidebarProps) {
  const { files, deleteFile, loading, refreshFiles } = useFileManagement()
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [selectedService, setSelectedService] = React.useState<ServiceName | undefined>()
  const [refreshKey, setRefreshKey] = React.useState(0)

  const handleAddFile = (serviceName: string) => {
    setSelectedService(serviceName as ServiceName)
    setUploadDialogOpen(true)
  }

  const handleDeleteFile = async (fileId: number, serviceName: string) => {
    await deleteFile(fileId, serviceName)
    // Force re-render để cập nhật UI ngay lập tức
    setRefreshKey(prev => prev + 1)
  }

  const handleUploadSuccess = () => {
    // Refresh toàn bộ files để cập nhật sidebar
    refreshFiles()
    // Force re-render
    setRefreshKey(prev => prev + 1)
  }

  const handleFileClick = (fileId: number, fileName: string) => {
    onFileSelect?.(fileId, fileName)
  }

  // Transform files data into navigation structure
  // refreshKey đảm bảo component re-render khi có thay đổi
  const navMainItems = React.useMemo(() => {
    return Object.keys(serviceIcons).map((serviceName) => ({
      title: serviceName,
      icon: serviceIcons[serviceName as keyof typeof serviceIcons],
      isActive: false,
      items: (files[serviceName] || []).map((file) => ({
        id: file.id,
        title: file.originalFileName,
      })),
    }))
  }, [files, refreshKey])

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={[
            {
              name: "Seatrans Admin",
              logo: Ship,
              plan: "Enterprise",
            },
          ]} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain 
            items={navMainItems} 
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onFileClick={handleFileClick}
          />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={{
            name: "Admin User",
            email: "admin@seatrans.com",
            avatar: "/avatars/admin.jpg",
          }} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
        defaultService={selectedService}
      />
    </>
  )
}
