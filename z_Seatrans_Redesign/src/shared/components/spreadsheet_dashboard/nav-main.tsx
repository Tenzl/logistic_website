"use client"

import * as React from "react"
import { Plus, Trash2, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/components/ui/sidebar"
import { Button } from "@/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"

export function NavMain({
  items,
  onAddFile,
  onDeleteFile,
  onFileClick,
}: {
  items: {
    title: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      id: number
      title: string
    }[]
  }[]
  onAddFile?: (serviceName: string) => void
  onDeleteFile?: (fileId: number, serviceName: string) => void
  onFileClick?: (fileId: number, fileName: string) => void
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [fileToDelete, setFileToDelete] = React.useState<{ id: number; name: string; service: string } | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, fileId: number, fileName: string, serviceName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setFileToDelete({ id: fileId, name: fileName, service: serviceName })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (fileToDelete && onDeleteFile) {
      onDeleteFile(fileToDelete.id, fileToDelete.service)
    }
    setDeleteDialogOpen(false)
    setFileToDelete(null)
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Services</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <div className="flex items-center w-full">
                  <CollapsibleTrigger asChild className="flex-1">
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddFile?.(item.title)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items && item.items.length > 0 ? (
                      item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.id}>
                          <SidebarMenuSubButton 
                            onClick={() => onFileClick?.(subItem.id, subItem.title)}
                            className="group/item"
                          >
                            <span className="flex-1">{subItem.title}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              onClick={(e) => handleDeleteClick(e, subItem.id, subItem.title, item.title)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))
                    ) : (
                      <SidebarMenuSubItem>
                        <div className="px-2 py-1.5 text-sm text-muted-foreground italic">
                          No files uploaded
                        </div>
                      </SidebarMenuSubItem>
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
