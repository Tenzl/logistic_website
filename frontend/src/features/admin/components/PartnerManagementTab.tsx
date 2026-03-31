"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Plus, Pencil, Trash2, ChevronDown, FileSpreadsheet } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { toast } from "@/shared/utils/toast"
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

const formatAdditionTypeLabel = (type: PartnerAdditionType): string => {
  if (type === "OTHER_VENDORS") {
    return "OTHER VENDOR"
  }
  return type.replace(/_/g, " ")
}

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

export function PartnerManagementTab() {
  const [rows, setRows] = useState<BookingPartnerListItem[]>([])
  const [loading, setLoading] = useState(false)

  const [q, setQ] = useState("")
  const [customerStatus, setCustomerStatus] = useState<CustomerStatus | "ALL">("ALL")
  const [customerType, setCustomerType] = useState<CustomerType | "ALL">("ALL")
  const [selectedAdditionType, setSelectedAdditionType] = useState<PartnerAdditionType | "ALL">("ALL")

  const [page, setPage] = useState(0)
  const [size] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(initialFormState)

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    address: false,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await partnerManagementService.list({
        page,
        size,
        sort: "updatedAt,desc",
        q,
        customerStatus: customerStatus === "ALL" ? undefined : customerStatus,
        customerType: customerType === "ALL" ? undefined : customerType,
        additionTypes: selectedAdditionType === "ALL" ? [] : [selectedAdditionType],
      })
      setRows(data.items || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (error) {
      toast.error("Failed to load partners", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, selectedAdditionType])

  const onApplyFilters = async () => {
    setPage(0)
    await loadData()
  }

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
        await partnerManagementService.update(editingId, payload)
        toast.success("Partner updated successfully")
      } else {
        await partnerManagementService.create(payload)
        toast.success("Partner created successfully")
      }

      setDialogOpen(false)
      setForm(initialFormState)
      setEditingId(null)
      await loadData()
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
      toast.success("Partner deleted successfully")
      await loadData()
    } catch (error) {
      toast.error("Failed to delete partner", error)
    }
  }

  const columns = useMemo<ColumnDef<BookingPartnerListItem>[]>(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span 
          className="font-medium block truncate w-full" 
          title={row.original.name}
        >
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "customerId",
      header: "Customer ID",
    },
    {
      accessorKey: "additionTypes",
      header: "Additional Types",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.additionTypes?.map((type) => (
            <Badge key={type} variant="outline" className="text-xs">{formatAdditionTypeLabel(type)}</Badge>
          ))}
        </div>
      ),
    },
    { accessorKey: "country", header: "Country" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "contactEmail", header: "Contact Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "fax", header: "Fax" },
    { accessorKey: "trackingUrl", header: "Tracking URL" },
    { accessorKey: "address", header: "Address" },
    {
      accessorKey: "customerStatus",
      header: "Customer Status",
      cell: ({ row }) => row.original.customerStatus ? <Badge>{row.original.customerStatus}</Badge> : "-",
    },
    { accessorKey: "customerType", header: "Customer Type" },
    { accessorKey: "taxNumber", header: "Tax Number" },
    { accessorKey: "updatedBy", header: "Updated By" },
    { 
      accessorKey: "updatedAt", 
      header: "Updated At",
      cell: ({ row }) => row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString('en-CA') : "-" // en-CA gives YYYY-MM-DD format
    },
    { accessorKey: "createdBy", header: "Created By" },
    { 
      accessorKey: "createdAt", 
      header: "Created On",
      cell: ({ row }) => row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('en-CA') : "-"
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
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
  ], [])

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  })

  const stickyClass = (columnId: string, isHeader: boolean = false) => {
    const defaultBg = isHeader ? "bg-background sticky top-0 z-20" : ""
    const stickyBg = isHeader ? "bg-background z-40" : "bg-background z-30"
    if (columnId === "name") return `sticky left-0 ${isHeader ? 'top-0' : ''} ${stickyBg} min-w-[220px] max-w-[220px] shadow-[1px_0_0_0_#e2e8f0]`
    if (columnId === "actions") return `sticky right-0 ${isHeader ? 'top-0' : ''} ${stickyBg} min-w-[120px] shadow-[-1px_0_0_0_#e2e8f0]`
    return defaultBg
  }

  const columnWidthClass = (columnId: string) => {
    if (columnId === "name") return "min-w-[220px] max-w-[220px]"
    if (columnId === "customerId") return "min-w-[190px]"
    if (columnId === "additionTypes") return "min-w-[260px]"
    if (columnId === "country") return "min-w-[140px]"
    if (columnId === "city") return "min-w-[140px]"
    if (columnId === "contactEmail") return "min-w-[240px]"
    if (columnId === "phone") return "min-w-[170px]"
    if (columnId === "fax") return "min-w-[170px]"
    if (columnId === "trackingUrl") return "min-w-[280px]"
    if (columnId === "address") return "min-w-[320px]"
    if (columnId === "customerStatus") return "min-w-[170px]"
    if (columnId === "customerType") return "min-w-[160px]"
    if (columnId === "taxNumber") return "min-w-[190px]"
    if (columnId === "updatedBy" || columnId === "createdBy") return "min-w-[180px]"
    if (columnId === "updatedAt" || columnId === "createdAt") return "min-w-[180px]"
    if (columnId === "actions") return "min-w-[120px]"
    return "min-w-[140px]"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Partner Management</h2>
          <p className="text-sm text-muted-foreground">Manage booking partners profile data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button onClick={onOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <div className="flex gap-1 overflow-x-auto pb-1">
          <Button
            className="h-7 px-2 text-[11px] whitespace-nowrap"
            variant={selectedAdditionType === "ALL" ? "default" : "outline"}
            onClick={() => {
              setSelectedAdditionType("ALL")
              setPage(0)
            }}
          >
            ALL
          </Button>
          {ADDITION_TYPE_OPTIONS.map((type) => (
            <Button
              key={type}
              className="h-7 px-2 text-[11px] whitespace-nowrap"
              variant={selectedAdditionType === type ? "default" : "outline"}
              onClick={() => {
                setSelectedAdditionType(type)
                setPage(0)
              }}
            >
              {formatAdditionTypeLabel(type)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="Search name / customer id / tax number" value={q} onChange={(e) => setQ(e.target.value)} />

          <Select value={customerStatus} onValueChange={(v) => setCustomerStatus(v as CustomerStatus | "ALL")}>
            <SelectTrigger><SelectValue placeholder="Customer Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {CUSTOMER_STATUS_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={customerType} onValueChange={(v) => setCustomerType(v as CustomerType | "ALL")}>
            <SelectTrigger><SelectValue placeholder="Customer Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {CUSTOMER_TYPE_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button variant="secondary" onClick={onApplyFilters}>Apply Filters</Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Total: {totalElements}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
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

      <div className="rounded-md border overflow-auto max-h-[450px] relative [&>div]:!overflow-visible shadow-inner">
        <Table className="w-max min-w-full">
          <TableHeader className="shadow-[0_1px_0_0_#e2e8f0]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`${stickyClass(header.column.id, true)} ${columnWidthClass(header.column.id)} whitespace-nowrap`}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No partners found</TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${stickyClass(cell.column.id)} ${columnWidthClass(cell.column.id)} whitespace-nowrap align-top`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page <= 0} onClick={() => setPage((prev) => prev - 1)}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {page + 1} / {Math.max(totalPages, 1)}</span>
        <Button variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((prev) => prev + 1)}>Next</Button>
      </div>

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
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label>Tax Number</Label>
              <Input value={form.taxNumber} onChange={(e) => setForm((prev) => ({ ...prev, taxNumber: e.target.value }))} />
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
              <Select value={form.customerStatus || "NONE"} onValueChange={(v) => setForm((prev) => ({ ...prev, customerStatus: v === "NONE" ? "" : (v as CustomerStatus) }))}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {CUSTOMER_STATUS_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Customer Type</Label>
              <Select value={form.customerType || "NONE"} onValueChange={(v) => setForm((prev) => ({ ...prev, customerType: v === "NONE" ? "" : (v as CustomerType) }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {CUSTOMER_TYPE_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} /></div>
            <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} /></div>
            <div><Label>Contact Email</Label><Input type="email" value={form.contactEmail} onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} /></div>
            <div><Label>Fax</Label><Input value={form.fax} onChange={(e) => setForm((prev) => ({ ...prev, fax: e.target.value }))} /></div>
            <div><Label>Tracking URL</Label><Input value={form.trackingUrl} onChange={(e) => setForm((prev) => ({ ...prev, trackingUrl: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} /></div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button disabled={saving} onClick={onSave}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PartnerImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImported={loadData}
      />
    </div>
  )
}
