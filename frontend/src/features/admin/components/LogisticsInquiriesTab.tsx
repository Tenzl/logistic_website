"use client"

import { useEffect, useState } from 'react'
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
import { Loader2, Package, Mail, Truck, MapPin, CalendarClock, CheckCircle2, Trash2, RefreshCw } from 'lucide-react'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { INQUIRY_STATUS_OPTIONS } from '@/shared/constants/inquiry-status'
import { renderInquiryStatusBadge } from '@/shared/utils/inquiry-helpers'

interface LogisticsInquiry {
  id: number
  serviceTypeId: number
  status: string
  submittedAt: string
  updatedAt: string
  orderId?: number
  processedBy?: string
  userId?: number
  fullName?: string
  email?: string
  phone?: string
  company?: string
  cargoName?: string
  deliveryTerm?: string
  container20?: number
  container40?: number
  loadingPort?: string
  dischargingPort?: string
  shipmentFrom?: string
  shipmentTo?: string
  notes?: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export function LogisticsInquiriesTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [inquiries, setInquiries] = useState<LogisticsInquiry[]>([])
  const [selected, setSelected] = useState<LogisticsInquiry | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const SERVICE_SLUG = 'logistics'
  const ADMIN_BASE = `${API_CONFIG.INQUIRIES.ADMIN_BASE}/${SERVICE_SLUG}`

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: '0', size: '20' })
      const response = await apiClient.get<PageResponse<LogisticsInquiry>>(
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
    // Initial fetch
    fetchData()
  }, [])

  const statusOptions = INQUIRY_STATUS_OPTIONS

  const formatDate = (value?: string) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString()
  }

  const updateStatus = async (id: number, status: string) => {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Logistics Inquiries</CardTitle>
            <CardDescription>Door-to-door and multimodal freight requests</CardDescription>
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
              <p>No logistics inquiries yet</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Shipment Window</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div className="font-medium">{inq.cargoName || '—'}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">20': {inq.container20 ?? 0} • 40': {inq.container40 ?? 0}</div>
                        <div className="text-xs text-muted-foreground">Term: {inq.deliveryTerm || '—'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{inq.fullName || '—'}</div>
                        <div className="text-xs text-muted-foreground">{inq.email || '—'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3" />
                          {inq.loadingPort || '—'} → {inq.dischargingPort || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarClock className="h-3 w-3" />
                          {formatDate(inq.shipmentFrom)} - {formatDate(inq.shipmentTo)}
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelected(inq)}>
                            View
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>Customer and logistics information</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <div className="font-semibold flex items-center gap-2"><Mail className="h-4 w-4" /> Customer</div>
                  <div className="mt-2 space-y-1">
                    <div>Name: {selected.fullName || '—'}</div>
                    <div>Email: {selected.email || '—'}</div>
                    <div>Phone: {selected.phone || '—'}</div>
                    <div>Company: {selected.company || '—'}</div>
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="font-semibold flex items-center gap-2"><Truck className="h-4 w-4" /> Cargo</div>
                  <div className="mt-2 space-y-1">
                    <div>Cargo: {selected.cargoName || '—'}</div>
                    <div>Delivery term: {selected.deliveryTerm || '—'}</div>
                    <div>20': {selected.container20 ?? '—'} • 40': {selected.container40 ?? '—'}</div>
                    <div>Route: {selected.loadingPort || '—'} → {selected.dischargingPort || '—'}</div>
                    <div>Shipment: {formatDate(selected.shipmentFrom)} - {formatDate(selected.shipmentTo)}</div>
                  </div>
                </div>
              </div>

              {selected.notes && (
                <div className="rounded-md border p-3 bg-muted/40">
                  <div className="text-sm font-semibold mb-2">Notes</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selected.notes}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div>Submitted: {formatDate(selected.submittedAt)}</div>
                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  {renderInquiryStatusBadge(selected.status)}
                </div>
              </div>

              <div className="flex justify-end gap-2">
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
