import {
  LayoutDashboard,
  FileText,
  Ship,
  Package,
  Users,
  FolderOpen,
  BarChart3,
  Settings,
  ClipboardList,
  MessageSquare,
  Bell,
  User,
  PlusCircle,
  History,
} from "lucide-react"
import { DashboardConfig } from "@/types/dashboard"

/**
 * Dashboard Navigation Configuration for INTERNAL users
 * (Admin, Employee - company staff)
 */
export const internalDashboardConfig: DashboardConfig = {
  navigation: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Inquiry Management",
      url: "/dashboard/inquiries",
      icon: ClipboardList,
      items: [
        {
          title: "All Inquiries",
          url: "/dashboard/inquiries",
        },
        {
          title: "Pending Review",
          url: "/dashboard/inquiries?status=pending",
        },
        {
          title: "In Progress",
          url: "/dashboard/inquiries?status=in-progress",
        },
      ],
    },
    {
      title: "Quotations",
      url: "/dashboard/quotations",
      icon: FileText,
      items: [
        {
          title: "All Quotations",
          url: "/dashboard/quotations",
        },
        {
          title: "Create New",
          url: "/dashboard/quotations/new",
        },
        {
          title: "Sent",
          url: "/dashboard/quotations?status=sent",
        },
      ],
    },
    {
      title: "Shipment Tracking",
      url: "/dashboard/shipments",
      icon: Ship,
      items: [
        {
          title: "Active Shipments",
          url: "/dashboard/shipments?status=active",
        },
        {
          title: "All Shipments",
          url: "/dashboard/shipments",
        },
        {
          title: "Completed",
          url: "/dashboard/shipments?status=completed",
        },
      ],
    },
    {
      title: "Customer Management",
      url: "/dashboard/customers",
      icon: Users,
    },
    {
      title: "Documents",
      url: "/dashboard/documents",
      icon: FolderOpen,
    },
    {
      title: "Reports & Analytics",
      url: "/dashboard/reports",
      icon: BarChart3,
      items: [
        {
          title: "Business Overview",
          url: "/dashboard/reports/overview",
        },
        {
          title: "Revenue Analysis",
          url: "/dashboard/reports/revenue",
        },
        {
          title: "Performance Metrics",
          url: "/dashboard/reports/performance",
        },
      ],
    },
    {
      title: "System Settings",
      url: "/admin",
      icon: Settings,
      items: [
        {
          title: "User Management",
          url: "/admin",
        },
        {
          title: "Posts & Content",
          url: "/admin/posts",
        },
        {
          title: "Office Locations",
          url: "/admin/offices",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Freight Forwarding",
      url: "/services/freight-forwarding",
      icon: Package,
    },
    {
      name: "Shipping Agency",
      url: "/services/shipping-agency",
      icon: Ship,
    },
    {
      name: "Chartering & Broking",
      url: "/services/chartering-broking",
      icon: FileText,
    },
  ],
}

/**
 * Dashboard Navigation Configuration for EXTERNAL users
 * (Customers - clients of the company)
 */
export const externalDashboardConfig: DashboardConfig = {
  navigation: [
    {
      title: "My Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "New Inquiry",
      url: "/dashboard/inquiries/new",
      icon: PlusCircle,
    },
    {
      title: "My Quotations",
      url: "/dashboard/quotations",
      icon: FileText,
      badge: "3",
      items: [
        {
          title: "Pending",
          url: "/dashboard/quotations?status=pending",
        },
        {
          title: "Approved",
          url: "/dashboard/quotations?status=approved",
        },
        {
          title: "All",
          url: "/dashboard/quotations",
        },
      ],
    },
    {
      title: "Track Shipments",
      url: "/dashboard/shipments",
      icon: Ship,
      items: [
        {
          title: "In Transit",
          url: "/dashboard/shipments?status=in-transit",
        },
        {
          title: "All Shipments",
          url: "/dashboard/shipments",
        },
      ],
    },
    {
      title: "My Documents",
      url: "/dashboard/documents",
      icon: FolderOpen,
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: MessageSquare,
      badge: "2",
    },
    {
      title: "Inquiry History",
      url: "/dashboard/history",
      icon: History,
    },
    {
      title: "Profile Settings",
      url: "/dashboard/profile",
      icon: User,
    },
  ],
  projects: [
    {
      name: "Freight Forwarding",
      url: "/services/freight-forwarding",
      icon: Package,
    },
    {
      name: "Shipping Agency",
      url: "/services/shipping-agency",
      icon: Ship,
    },
    {
      name: "Chartering & Broking",
      url: "/services/chartering-broking",
      icon: FileText,
    },
  ],
}

/**
 * Get dashboard configuration based on user's role group
 */
export function getDashboardConfig(roleGroup: "INTERNAL" | "EXTERNAL"): DashboardConfig {
  return roleGroup === "INTERNAL" ? internalDashboardConfig : externalDashboardConfig
}
