"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, FileSpreadsheet, Pencil, Plus, Trash2, Users } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  DataTableContent,
  DataTablePagination,
  DataTableSortHeader,
} from "@/shared/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { PartnerImportDialog } from "@/features/admin/components/PartnerImportDialog"
import { partnerManagementService } from "@/features/admin/services/partnerManagementService"
import type {
  BookingPartnerDetail,
  BookingPartnerListItem,
  BookingPartnerUpsertRequest,
  CustomerStatus,
  CustomerType,
  PartnerAdditionType,
} from "@/features/admin/types/partnerManagement.types"
import { queryKeys } from "@/shared/config/react-query.config"
import { useQueryListCache } from "@/shared/hooks/useQueryListCache"
import { toast } from "@/shared/utils/toast"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ADDITION_TYPE_OPTIONS: PartnerAdditionType[] = [
  "CUSTOMER",
  "SHIPPER",
  "CONSIGNEE",
  "NOTIFY_PARTY",
  "CARRIER",
  "CO_LOADER",
  "AIR_LINE",
  "TRUCK_VENDOR",
  "OTHER_VENDORS",
]

const CUSTOMER_STATUS_OPTIONS: CustomerStatus[] = ["LEAD", "WINCLIENT"]
const CUSTOMER_TYPE_OPTIONS: CustomerType[] = ["AGENT", "DIRECT", "OTHER"]

const formatAdditionTypeLabel = (type: PartnerAdditionType): string =>
  type === "OTHER_VENDORS" ? "OTHER VENDOR" : type.replace(/_/g, " ")

// ---------------------------------------------------------------------------
// Form helpers
// ---------------------------------------------------------------------------

type FormState = {
  name: string
  additionTypes: PartnerAdditionType[]
  country: string
  city: string
  contactEmail: string
  phone: string
  fax: string
  trackingUrl: string
  address: string
  customerStatus: CustomerStatus | ""
  customerType: CustomerType | ""
  taxNumber: string
}

const initialFormState: FormState = {
  name: "",
  additionTypes: [],
  country: "",
  city: "",
  contactEmail: "",
  phone: "",
  fax: "",
  trackingUrl: "",
  address: "",
  customerStatus: "",
  customerType: "",
  taxNumber: "",
}

const toUpsertRequest = (form: FormState): BookingPartnerUpsertRequest => ({
  name: form.name,
  additionTypes: form.additionTypes,
  country: form.country || undefined,
  city: form.city || undefined,
  contactEmail: form.contactEmail || undefined,
  phone: form.phone || undefined,
  fax: form.fax || undefined,
  trackingUrl: form.trackingUrl || undefined,
  address: form.address || undefined,
  customerStatus: (form.customerStatus || undefined) as CustomerStatus | undefined,
  customerType: (form.customerType || undefined) as CustomerType | undefined,
  taxNumber: form.taxNumber,
})

const fromDetail = (detail: BookingPartnerDetail): FormState => ({
  name: detail.name || "",
  additionTypes: detail.additionTypes || [],
  country: detail.country || "",
  city: detail.city || "",
  contactEmail: detail.contactEmail || "",
  phone: detail.phone || "",
  fax: detail.fax || "",
  trackingUrl: detail.trackingUrl || "",
  address: detail.address || "",
  customerStatus: (detail.customerStatus || "") as CustomerStatus | "",
  customerType: (detail.customerType || "") as CustomerType | "",
  taxNumber: detail.taxNumber || "",
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PartnerManagementTab() {
  const partnersKey = queryKeys.partners()
  const partnersListCache = useQueryListCache<BookingPartnerListItem>(partnersKey)

  const { data: allRows = [], isLoading: loading } = useQuery({
    queryKey: partnersKey,
    queryFn: () => partnerManagementService.listAll(),
  })

  // TanStack filter state (kept external so UI can read active values)
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ address: false })

  // Derived active filter values for UI button/select highlighting
  const activeAdditionType =
    (columnFilters.find((f) => f.id === "additionTypes")?.value as PartnerAdditionType | undefined) ?? "ALL"
  const activeCustomerStatus =
    (columnFilters.find((f) => f.id === "customerStatus")?.value as string | undefined) ?? "ALL"
  const activeCustomerType =
    (columnFilters.find((f) => f.id === "customerType")?.value as string | undefined) ?? "ALL"

  // Dialog / form state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(initialFormState)

  // ---------------------------------------------------------------------------
  // CRUD handlers
  // ---------------------------------------------------------------------------

  const onOpenCreate = () => {
    setEditingId(null)
    setForm(initialFormState)
    setDialogOpen(true)
  }

  const onOpenEdit = async (id: number) => {
    try {
      const detail = await partnerManagementService.detail(id)
      setEditingId(id)
      setForm(fromDetail(detail))
      setDialogOpen(true)
    } catch (error) {
      toast.error("Failed to load partner detail", error)
    }
  }

  const onToggleAdditionType = (type: PartnerAdditionType, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      additionTypes: checked
        ? [...prev.additionTypes, type]
        : prev.additionTypes.filter((item) => item !== type),
    }))
  }

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Name is required"
    if (form.additionTypes.length === 0) return "At least one Additional Type is required"
    return null
  }

  const onSave = async () => {
    const validationMessage = validateForm()
    if (validationMessage) {
      toast.error(validationMessage)
      return
    }

    try {
      setSaving(true)
      const payload = toUpsertRequest(form)
      if (editingId) {
        const saved = await partnerManagementService.update(editingId, payload)
        partnersListCache.upsertById(saved)
        toast.success("Partner updated successfully")
      } else {
        const saved = await partnerManagementService.create(payload)
        partnersListCache.append(saved)
        toast.success("Partner created successfully")
      }
      setDialogOpen(false)
      setForm(initialFormState)
      setEditingId(null)
    } catch (error) {
      toast.error("Failed to save partner", error)
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm("Delete this partner?")) return
    try {
      await partnerManagementService.delete(id)
      partnersListCache.removeById(id)
      toast.success("Partner deleted successfully")
    } catch (error) {
      toast.error("Failed to delete partner", error)
    }
  }

  // ---------------------------------------------------------------------------
  // Column definitions
  // ---------------------------------------------------------------------------

  const columns = useMemo<ColumnDef<BookingPartnerListItem>[]>(
    () => [
      {
        accessorKey: "name",
        enableGlobalFilter: true,
        header: ({ column }) => <DataTableSortHeader column={column}>Name</DataTableSortHeader>,
        cell: ({ row }) => (
          <span className="font-medium block truncate w-full" title={row.original.name}>
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "customerId",
        enableGlobalFilter: true,
        header: ({ column }) => <DataTableSortHeader column={column}>Customer ID</DataTableSortHeader>,
      },
      {
        accessorKey: "additionTypes",
        header: "Additional Types",
        enableSorting: false,
        enableGlobalFilter: false,
        filterFn: (row, _columnId, filterValue: PartnerAdditionType) => {
          if (!filterValue) return true
          return (row.original.additionTypes ?? []).includes(filterValue)
        },
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.additionTypes?.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {formatAdditionTypeLabel(type)}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "country",
        enableGlobalFilter: false,
        header: ({ column }) => <DataTableSortHeader column={column}>Country</DataTableSortHeader>,
      },
      {
        accessorKey: "city",
        enableGlobalFilter: false,
        header: ({ column }) => <DataTableSortHeader column={column}>City</DataTableSortHeader>,
      },
      {
        accessorKey: "contactEmail",
        enableGlobalFilter: false,
        header: ({ column }) => <DataTableSortHeader column={column}>Contact Email</DataTableSortHeader>,
      },
      { accessorKey: "phone", header: "Phone", enableSorting: false, enableGlobalFilter: false },
      { accessorKey: "fax", header: "Fax", enableSorting: false, enableGlobalFilter: false },
      { accessorKey: "trackingUrl", header: "Tracking URL", enableSorting: false, enableGlobalFilter: false },
      { accessorKey: "address", header: "Address", enableSorting: false, enableGlobalFilter: false },
      {
        accessorKey: "customerStatus",
        enableGlobalFilter: false,
        header: ({ column }) => <DataTableSortHeader column={column}>Customer Status</DataTableSortHeader>,
        filterFn: (row, _columnId, filterValue: string) => {
          if (!filterValue) return true
          return row.original.customerStatus === filterValue
        },
        cell: ({ row }) =>
          row.original.customerStatus ? <Badge>{row.original.customerStatus}</Badge> : "-",
      },
      {
        accessorKey: "customerType",
        enableGlobalFilter: false,
        header: ({ column }) => <DataTableSortHeader column={column}>Customer Type</DataTableSortHeader>,
        filterFn: (row, _columnId, filterValue: string) => {
          if (!filterValue) return true
          return row.original.customerType === filterValue
        },
      },
      {
        accessorKey: "taxNumber",
        enableGlobalFilter: true,
        header: ({ column }) => <DataTableSortHeader column={column}>Tax Number</DataTableSortHeader>,
      },
      { accessorKey: "updatedBy", header: "Updated By", enableSorting: false, enableGlobalFilter: false },
      {
        accessorKey: "updatedAt",
        enableGlobalFilter: false,
        header: ({ column }) => <DataTableSortHeader column={column}>Updated At</DataTableSortHeader>,
        cell: ({ row }) =>
          row.original.updatedAt
            ? new Date(row.original.updatedAt).toLocaleDateString("en-CA")
            : "-",
      },
      { accessorKey: "createdBy", header: "Created By", enableSorting: false, enableGlobalFilter: false },
      {
        accessorKey: "createdAt",
        enableGlobalFilter: false,
        header: ({ column }) => <DataTableSortHeader column={column}>Created On</DataTableSortHeader>,
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString("en-CA")
            : "-",
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onOpenEdit(row.original.id)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // ---------------------------------------------------------------------------
  // Table instance
  // ---------------------------------------------------------------------------

  const table = useReactTable({
    data: allRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter, columnFilters, columnVisibility },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: { pageSize: 20, pageIndex: 0 },
      sorting: [{ id: "updatedAt", desc: true }],
    },
    autoResetPageIndex: true,
    globalFilterFn: (row, columnId, filterValue) => {
      if (!["name", "customerId", "taxNumber"].includes(columnId)) return false
      const value = String(row.getValue(columnId) ?? "").toLowerCase()
      return value.includes(String(filterValue).toLowerCase())
    },
  })

  // ---------------------------------------------------------------------------
  // Layout helpers
  // ---------------------------------------------------------------------------

  const stickyClass = (columnId: string, isHeader = false) => {
    const headerBase = isHeader ? "bg-background sticky top-0 z-20" : ""
    const stickyBg = isHeader ? "bg-background z-40" : "bg-background z-30"
    if (columnId === "name")
      return `sticky left-0 ${isHeader ? "top-0" : ""} ${stickyBg} min-w-[220px] max-w-[220px] shadow-[1px_0_0_0_#e2e8f0]`
    if (columnId === "actions")
      return `sticky right-0 ${isHeader ? "top-0" : ""} ${stickyBg} min-w-[120px] shadow-[-1px_0_0_0_#e2e8f0]`
    return headerBase
  }

  const columnWidthClass = (columnId: string) => {
    const map: Record<string, string> = {
      name: "min-w-[220px] max-w-[220px]",
      customerId: "min-w-[190px]",
      additionTypes: "min-w-[260px]",
      country: "min-w-[140px]",
      city: "min-w-[140px]",
      contactEmail: "min-w-[240px]",
      phone: "min-w-[170px]",
      fax: "min-w-[170px]",
      trackingUrl: "min-w-[280px]",
      address: "min-w-[320px]",
      customerStatus: "min-w-[170px]",
      customerType: "min-w-[160px]",
      taxNumber: "min-w-[190px]",
      updatedBy: "min-w-[180px]",
      createdBy: "min-w-[180px]",
      updatedAt: "min-w-[180px]",
      createdAt: "min-w-[180px]",
      actions: "min-w-[120px]",
    }
    return map[columnId] ?? "min-w-[140px]"
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Partner Management
            </CardTitle>
            <CardDescription>Manage booking partners profile data</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Import Excel
            </Button>
            <Button size="sm" onClick={onOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Partner
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filter bar */}
        <div className="space-y-3 pb-4">
          {/* Addition type tab buttons */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            <Button
              className="h-7 px-2 text-[11px] whitespace-nowrap"
              variant={activeAdditionType === "ALL" ? "default" : "outline"}
              onClick={() => table.getColumn("additionTypes")?.setFilterValue(undefined)}
            >
              ALL
            </Button>
            {ADDITION_TYPE_OPTIONS.map((type) => (
              <Button
                key={type}
                className="h-7 px-2 text-[11px] whitespace-nowrap"
                variant={activeAdditionType === type ? "default" : "outline"}
                onClick={() => table.getColumn("additionTypes")?.setFilterValue(type)}
              >
                {formatAdditionTypeLabel(type)}
              </Button>
            ))}
          </div>

          {/* Search + dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search name / customer id / tax number"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full md:w-[300px]"
            />
            <Select
              value={activeCustomerStatus}
              onValueChange={(v) =>
                table.getColumn("customerStatus")?.setFilterValue(v === "ALL" ? undefined : v)
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Customer Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {CUSTOMER_STATUS_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={activeCustomerType}
              onValueChange={(v) =>
                table.getColumn("customerType")?.setFilterValue(v === "ALL" ? undefined : v)
              }
            >
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {CUSTOMER_TYPE_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns().filter((c) => c.getCanHide()).map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <DataTableContent
          table={table}
          columnCount={columns.length}
          loading={loading}
          emptyMessage="No partners found."
          maxHeight="430px"
          containerClassName="relative [&>div]:!overflow-visible shadow-inner"
          tableClassName="w-max min-w-full"
          columnClassName={(id, type) => {
            const isHeader = type === "header"
            return `${stickyClass(id, isHeader)} ${columnWidthClass(id)} whitespace-nowrap${isHeader ? "" : " align-top"}`
          }}
        />

        <DataTablePagination table={table} persistKey="partners-page" />
      </CardContent>
    </Card>

    {/* Create / Edit dialog */}
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Partner" : "Create Partner"}</DialogTitle>
            <DialogDescription>
              Customer ID is generated automatically by backend on create.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2 pb-3 pl-1 scroll-pb-6">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Tax Number</Label>
              <Input
                value={form.taxNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, taxNumber: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Additional Types *</Label>
              <div className="flex flex-wrap gap-3">
                {ADDITION_TYPE_OPTIONS.map((type) => {
                  const checked = form.additionTypes.includes(type)
                  return (
                    <label key={type} className="inline-flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(state) => onToggleAdditionType(type, state === true)}
                      />
                      {type}
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <Label>Customer Status</Label>
              <Select
                value={form.customerStatus || "NONE"}
                onValueChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    customerStatus: v === "NONE" ? "" : (v as CustomerStatus),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {CUSTOMER_STATUS_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Customer Type</Label>
              <Select
                value={form.customerType || "NONE"}
                onValueChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    customerType: v === "NONE" ? "" : (v as CustomerType),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {CUSTOMER_TYPE_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Country</Label>
              <Input
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Fax</Label>
              <Input
                value={form.fax}
                onChange={(e) => setForm((prev) => ({ ...prev, fax: e.target.value }))}
              />
            </div>
            <div>
              <Label>Tracking URL</Label>
              <Input
                value={form.trackingUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, trackingUrl: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={onSave}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    <PartnerImportDialog
      open={importDialogOpen}
      onOpenChange={setImportDialogOpen}
      onImported={() => void partnersListCache.invalidate()}
    />
  </>
  )
}
