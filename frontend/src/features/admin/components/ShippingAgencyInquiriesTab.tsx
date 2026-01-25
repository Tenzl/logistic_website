"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { toast } from '@/shared/utils/toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Loader2, Ship, User, CalendarClock, MapPin, Mail, CheckCircle2, Trash2, FileText, Upload, RefreshCw } from 'lucide-react'
import { InvoiceUploadDialog } from '@/modules/inquiries/components/admin/InvoiceUploadDialog'
import { InquiryDocument } from '@/modules/inquiries/services/documentService'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { INQUIRY_STATUS_OPTIONS } from '@/shared/constants/inquiry-status'
import { renderInquiryStatusBadge } from '@/shared/utils/inquiry-helpers'

interface ShippingAgencyInquiry {
  id: number
  serviceTypeId: number
  status: string
  submittedAt: string
  updatedAt: string
  orderId?: number
  processedBy?: string
  userId: number
  fullName?: string
  contactInfo?: string
  phone?: string
  company?: string
  notes?: string
  details?: string
  toName?: string
  mv?: string
  grt?: number | string
  dwt?: number | string
  loa?: number | string
  eta?: string
  cargoType?: string
  cargoName?: string
  cargoNameOther?: string
  cargoQuantity?: number | string
  frtTaxType?: string
  portOfCall?: string
  dischargeLoadingLocation?: string
  boatHireEnabled?: boolean
  boatHireAmount?: number | string
  tallyFeeEnabled?: boolean
  tallyFeeAmount?: number | string
  transportLs?: string
  transportQuarantine?: string
  otherInfo?: string
  quoteForm?: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export function ShippingAgencyInquiriesTab() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [inquiries, setInquiries] = useState<ShippingAgencyInquiry[]>([])
  const [selected, setSelected] = useState<ShippingAgencyInquiry | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const SERVICE_SLUG = 'shipping-agency'
  const ADMIN_BASE = `${API_CONFIG.INQUIRIES.ADMIN_BASE}/${SERVICE_SLUG}`

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: '0', size: '20' })
      const response = await apiClient.get<PageResponse<ShippingAgencyInquiry>>(
        `${ADMIN_BASE}?${params.toString()}`
      )
      const result = await response.json()
      const payload = (result as any).data || result
      setInquiries(payload.content || [])
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Failed to load inquiries'
      toast.error(detail)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatDate = (value?: string) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString()
  }

  const statusOptions = INQUIRY_STATUS_OPTIONS
  const formOptions = ['HCM', 'QN']

  const updateStatus = async (id: number, status: ShippingAgencyInquiry['status']) => {
    try {
      await apiClient.fetch(`${ADMIN_BASE}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setInquiries(prev => prev.map(inq => (inq.id === id ? { ...inq, status } : inq)))
      toast.success('Status updated')
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Failed to update status'
      toast.error(detail)
    }
  }

  const updateForm = async (id: number, form: string) => {
    try {
      await apiClient.fetch(`${ADMIN_BASE}/${id}/form`, {
        method: 'PATCH',
        body: JSON.stringify({ form }),
      })
      setInquiries(prev => prev.map(inq => (inq.id === id ? { ...inq, quoteForm: form } : inq)))
      toast.success('Form updated')
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Failed to update form'
      toast.error(detail)
    }
  }

  const openPdfManager = async (inquiry: ShippingAgencyInquiry) => {
    if (inquiry.status !== 'PROCESSING') {
      await updateStatus(inquiry.id, 'PROCESSING')
    }
    const targetUrl = `/admin/inquiries/shipping-agency/${inquiry.id}/pdf`
    router.push(targetUrl)
  }

  const deleteInquiry = async (id: number) => {
    const confirmed = typeof window === 'undefined' ? true : window.confirm('Delete this inquiry? This cannot be undone.')
    if (!confirmed) return
    try {
      setDeletingId(id)
      await apiClient.delete(`${ADMIN_BASE}/${id}`)
      setInquiries(prev => prev.filter(inq => inq.id !== id))
      setSelected(current => (current?.id === id ? null : current))
      toast.success('Inquiry deleted')
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Failed to delete inquiry'
      toast.error(detail)
    } finally {
      setDeletingId(null)
    }
  }

  const renderBoolean = (value?: boolean) => (value ? 'Yes' : 'No')

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Shipping Agency Inquiries</CardTitle>
            <CardDescription>Latest submissions with vessel and port details</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-60" />
              <p>No shipping agency inquiries yet</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vessel</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-muted-foreground" />
                          <div className="font-medium">{inq.mv || '—'}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">GRT {inq.grt ?? '—'} • DWT {inq.dwt ?? '—'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{inq.fullName || '—'}</div>
                        <div className="text-xs text-muted-foreground">{inq.contactInfo || '—'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3" />
                          {inq.portOfCall || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarClock className="h-3 w-3" />
                          {formatDate(inq.eta)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="inline-flex cursor-pointer">{renderInquiryStatusBadge(inq.status)}</div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[180px]">
                            {statusOptions.map(option => (
                              <DropdownMenuItem
                                key={option}
                                onClick={() => updateStatus(inq.id, option)}
                                className="flex items-center gap-2"
                              >
                                {inq.status === option && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                <span>{option}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              Form: {inq.quoteForm || 'HCM'}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[140px]">
                            {formOptions.map(option => (
                              <DropdownMenuItem
                                key={option}
                                onClick={() => updateForm(inq.id, option)}
                                className="flex items-center gap-2"
                              >
                                {inq.quoteForm === option && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                <span>{option}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <InvoiceUploadDialog
                            inquiryId={inq.id}
                            serviceSlug="shipping-agency"
                            onUploadSuccess={(document: InquiryDocument) => {
                              // Update status to QUOTED when invoice is uploaded
                              updateStatus(inq.id, 'QUOTED')
                            }}
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            onClick={() => openPdfManager(inq)}
                          >
                            <FileText className="h-4 w-4" />
                            Manage PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteInquiry(inq.id)}
                            disabled={deletingId === inq.id}
                            title="Delete inquiry"
                          >
                            {deletingId === inq.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>Profile and vessel information for this submission</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <User className="h-4 w-4" />
                    Customer Profile
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div>Name: {selected.fullName || '—'}</div>
                    <div>Email: {selected.contactInfo || '—'}</div>
                    <div>Phone: {selected.phone || '—'}</div>
                    <div>Company: {selected.company || '—'}</div>
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Ship className="h-4 w-4" />
                    Vessel
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div>To: {selected.toName || '—'}</div>
                    <div>MV: {selected.mv || '—'}</div>
                    <div>ETA: {formatDate(selected.eta)}</div>
                    <div>GRT: {selected.grt ?? '—'}</div>
                    <div>DWT: {selected.dwt ?? '—'}</div>
                    <div>LOA: {selected.loa ?? '—'}</div>
                    <div>Form: {selected.quoteForm || 'HCM'}</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <div className="text-sm font-semibold">Cargo & Port</div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div>Port of Call: {selected.portOfCall || '—'}</div>
                    <div>Discharge/Loading: {selected.dischargeLoadingLocation || '—'}</div>
                    <div>Cargo Type: {selected.cargoType || '—'}</div>
                    <div>Cargo Name: {selected.cargoName || '—'}</div>
                    <div>Cargo Name Other: {selected.cargoNameOther || '—'}</div>
                    <div>Quantity (tons): {selected.cargoQuantity ?? '—'}</div>
                    <div>FRT Tax Type: {selected.frtTaxType || '—'}</div>
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-sm font-semibold">Optional Services</div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div>Boat Hire: {selected.boatHireAmount ?? '—'}</div>
                    <div>Tally Fee: {selected.tallyFeeAmount ?? '—'}</div>
                    <div>Transport LS: {selected.transportLs || '—'}</div>
                    <div>Transport Quarantine: {selected.transportQuarantine || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                <div>Submitted: {formatDate(selected.submittedAt)}</div>
                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  {renderInquiryStatusBadge(selected.status)}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => deleteInquiry(selected.id)}
                  disabled={deletingId === selected.id}
                >
                  {deletingId === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
