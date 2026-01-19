import { lazy } from "react"
import type React from "react"
import {
  User,
  Calculator,
  ListChecks,
  Package,
  Truck,
  Anchor,
  FileText,
  Upload,
  Image as ImageIcon,
  Cog,
  LayoutDashboard,
  Database,
} from "lucide-react"

import { RoleGroup } from "@/types/dashboard"

// Role strings from backend
export type SectionRole = "ADMIN" | "EMPLOYEE" | "CUSTOMER"

export type DashboardSection =
  | "profile"
  | "create-invoice"
  | "shipping-agency-inquiries"
  | "freight-forwarding-inquiries"
  | "logistics-inquiries"
  | "chartering-inquiries"
  | "special-request-inquiries"
  | "add-image"
  | "manage-images"
  | "services"
  | "ports"
  | "offices"
  | "commodities"
  | "categories"
  | "posts"
  | "inquiry"

export interface SectionConfig {
  id: DashboardSection
  label: string
  icon: React.ComponentType<{ className?: string }>
  component: React.LazyExoticComponent<React.ComponentType<any>>
  roles: SectionRole[]
  roleGroups: RoleGroup[] // allow sharing sections (e.g., profile) across groups
  category: string
  title: string
  description?: string
}

// Lazy loaded components
const EditProfileTab = lazy(() => import("@/features/admin/components/EditProfileTab").then(m => ({ default: m.EditProfileTab })))
const CreateInvoiceTab = lazy(() => import("@/features/admin/components/CreateInvoiceTab").then(m => ({ default: m.CreateInvoiceTab })))
const ShippingAgencyInquiriesTab = lazy(() => import("@/features/admin/components/ShippingAgencyInquiriesTab").then(m => ({ default: m.ShippingAgencyInquiriesTab })))
const FreightForwardingInquiriesTab = lazy(() => import("@/features/admin/components/FreightForwardingInquiriesTab").then(m => ({ default: m.FreightForwardingInquiriesTab })))
const LogisticsInquiriesTab = lazy(() => import("@/features/admin/components/LogisticsInquiriesTab").then(m => ({ default: m.LogisticsInquiriesTab })))
const CharteringInquiriesTab = lazy(() => import("@/features/admin/components/CharteringInquiriesTab").then(m => ({ default: m.CharteringInquiriesTab })))
const SpecialRequestInquiriesTab = lazy(() => import("@/features/admin/components/SpecialRequestInquiriesTab").then(m => ({ default: m.SpecialRequestInquiriesTab })))
const AddImageTab = lazy(() => import("@/features/admin/components/AddImageTab").then(m => ({ default: m.AddImageTab })))
const ManageImagesTab = lazy(() => import("@/features/admin/components/ManageImagesTab").then(m => ({ default: m.ManageImagesTab })))
const ManageServices = lazy(() => import("@/features/admin/components/ManageServices").then(m => ({ default: m.ManageServices })))
const ManagePorts = lazy(() => import("@/features/admin/components/ManagePorts").then(m => ({ default: m.ManagePorts })))
const ManageOffices = lazy(() => import("@/features/admin/components/ManageOffices").then(m => ({ default: m.ManageOffices })))
const ManageImageTypes = lazy(() => import("@/features/admin/components/ManageImageTypes").then(m => ({ default: m.ManageImageTypes })))
const ManageCategories = lazy(() => import("@/features/admin/components/ManageCategories").then(m => ({ default: m.ManageCategories })))
const ManagePosts = lazy(() => import("@/features/admin/components/ManagePosts").then(m => ({ default: m.ManagePosts })))

const UserInquiryHistoryTab = lazy(() => import("@/features/user/components/UserInquiryHistoryTab").then(m => ({ default: m.UserInquiryHistoryTab })))

export const SECTION_REGISTRY: Record<DashboardSection, SectionConfig> = {
  profile: {
    id: "profile",
    label: "Edit Profile",
    icon: User,
    component: EditProfileTab,
    roles: ["ADMIN", "EMPLOYEE", "CUSTOMER"],
    roleGroups: ["INTERNAL", "EXTERNAL"],
    category: "Profile",
    title: "Edit Profile",
  },
  "create-invoice": {
    id: "create-invoice",
    label: "Create Invoice",
    icon: Calculator,
    component: CreateInvoiceTab,
    roles: ["ADMIN"],
    roleGroups: ["INTERNAL"],
    category: "Invoices",
    title: "Create Invoice",
  },
  "shipping-agency-inquiries": {
    id: "shipping-agency-inquiries",
    label: "Shipping Agency",
    icon: ListChecks,
    component: ShippingAgencyInquiriesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Inquiries",
    title: "Shipping Agency Inquiries",
  },
  "freight-forwarding-inquiries": {
    id: "freight-forwarding-inquiries",
    label: "Freight Forwarding",
    icon: Package,
    component: FreightForwardingInquiriesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Inquiries",
    title: "Freight Forwarding Inquiries",
  },
  "logistics-inquiries": {
    id: "logistics-inquiries",
    label: "Logistics",
    icon: Truck,
    component: LogisticsInquiriesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Inquiries",
    title: "Logistics Inquiries",
  },
  "chartering-inquiries": {
    id: "chartering-inquiries",
    label: "Chartering",
    icon: Anchor,
    component: CharteringInquiriesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Inquiries",
    title: "Chartering Inquiries",
  },
  "special-request-inquiries": {
    id: "special-request-inquiries",
    label: "Special Request",
    icon: FileText,
    component: SpecialRequestInquiriesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Inquiries",
    title: "Special Request Inquiries",
  },
  "add-image": {
    id: "add-image",
    label: "Add Image",
    icon: Upload,
    component: AddImageTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Image Management",
    title: "Add Image",
  },
  "manage-images": {
    id: "manage-images",
    label: "Manage Images",
    icon: ImageIcon,
    component: ManageImagesTab,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Image Management",
    title: "Manage Images",
  },
  services: {
    id: "services",
    label: "Services",
    icon: Cog,
    component: ManageServices,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Data Management",
    title: "Manage Services",
  },
  ports: {
    id: "ports",
    label: "Ports",
    icon: Anchor,
    component: ManagePorts,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Data Management",
    title: "Manage Ports",
  },
  offices: {
    id: "offices",
    label: "Offices",
    icon: LayoutDashboard,
    component: ManageOffices,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Data Management",
    title: "Manage Offices",
  },
  commodities: {
    id: "commodities",
    label: "Commodities",
    icon: Package,
    component: ManageImageTypes,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Data Management",
    title: "Manage Commodities",
  },
  categories: {
    id: "categories",
    label: "Categories",
    icon: Database,
    component: ManageCategories,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Content Management",
    title: "Manage Categories",
  },
  posts: {
    id: "posts",
    label: "Posts",
    icon: FileText,
    component: ManagePosts,
    roles: ["ADMIN", "EMPLOYEE"],
    roleGroups: ["INTERNAL"],
    category: "Content Management",
    title: "Manage Posts",
  },
  inquiry: {
    id: "inquiry",
    label: "Inquiry History",
    icon: FileText,
    component: UserInquiryHistoryTab,
    roles: ["CUSTOMER"],
    roleGroups: ["EXTERNAL"],
    category: "Inquiries",
    title: "Inquiry History",
  },
}

export function getSectionConfig(section: DashboardSection): SectionConfig | undefined {
  return SECTION_REGISTRY[section]
}

export function listSectionsByRole(role: SectionRole): SectionConfig[] {
  return Object.values(SECTION_REGISTRY).filter((section) => section.roles.includes(role))
}

export function listSectionsByRoleGroup(roleGroup: RoleGroup): SectionConfig[] {
  return Object.values(SECTION_REGISTRY).filter((section) => section.roleGroups.includes(roleGroup))
}

export function canAccessSection(section: DashboardSection, role: SectionRole): boolean {
  const config = getSectionConfig(section)
  if (!config) return false
  return config.roles.includes(role)
}
