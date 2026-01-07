"use client"

import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
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
import { Loader2, Package, Mail, Truck, MapPin, CalendarClock, CheckCircle2, Trash2 } from 'lucide-react'
import { authService } from '@/features/auth/services/authService'

interface FreightInquiry {
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
  additionalInfo?: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export function FreightForwardingInquiriesTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inquiries, setInquiries] = useState<FreightInquiry[]>([])
  const [selected, setSelected] = useState<FreightInquiry | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = authService.getToken()
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
        const res = await axios.get<PageResponse<FreightInquiry>>(
          `${API_BASE}/api/admin/inquiries/freight-forwarding`,
          {
            params: { page: 0, size: 20 },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        )
        setInquiries(res.data.content)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail = (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
          setError(detail || 'Failed to load inquiries')
        } else {
          setError('Failed to load inquiries')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const statusOptions: string[] = ['PENDING', 'PROCESSING', 'QUOTED', 'COMPLETED', 'CANCELLED']

  const renderStatus = (status?: string) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  const formatDate = (value?: string) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString()
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = authService.getToken()
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      await axios.patch(
        `${API_BASE}/api/admin/inquiries/freight-forwarding/${id}/status`,
        { status },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      )
      setInquiries(prev => prev.map(inq => (inq.id === id ? { ...inq, status } : inq)))
      setMessage({ type: 'success', text: 'Status updated' })
      setTimeout(() => setMessage(null), 2500)
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
        : 'Failed to update status'
      setMessage({ type: 'error', text: detail })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const deleteInquiry = async (id: number) => {
    const confirmed = typeof window === 'undefined' ? true : window.confirm('Delete this inquiry? This cannot be undone.')
    if (!confirmed) return
    try {
      setDeletingId(id)
      const token = authService.getToken()
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      await axios.delete(`${API_BASE}/api/admin/inquiries/freight-forwarding/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setInquiries(prev => prev.filter(inq => inq.id !== id))
      setSelected(current => (current?.id === id ? null : current))
      setMessage({ type: 'success', text: 'Inquiry deleted' })
      setTimeout(() => setMessage(null), 2500)
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
        : 'Failed to delete inquiry'
      setMessage({ type: 'error', text: detail })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Freight Forwarding Inquiries</CardTitle>
            <CardDescription>Container counts, ports, and shipment windows</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-4">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-60" />
              <p>No freight forwarding inquiries yet</p>
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
                      <TableCell>{renderStatus(inq.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelected(inq)}>
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-primary">Status</Button>
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
            <DialogDescription>Profile and freight information</DialogDescription>
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
                    <div>Notes: {selected.additionalInfo || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>Submitted: {formatDate(selected.submittedAt)}</div>
                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  {renderStatus(selected.status)}
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
