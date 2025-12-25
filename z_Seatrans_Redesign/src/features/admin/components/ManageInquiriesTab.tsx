'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, Eye, Trash2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Label } from '@/shared/components/ui/label'
import axios from 'axios'
import { authService } from '@/features/auth/services/authService'

interface Inquiry {
  id: number
  fullName: string
  contactInfo: string
  status: 'PENDING' | 'PROCESSING' | 'QUOTED' | 'COMPLETED' | 'CANCELLED'
  submittedAt: string
  updatedAt: string
  details?: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export function ManageInquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [page])

  const fetchInquiries = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get<PageResponse<Inquiry>>('http://localhost:8080/api/admin/inquiries', {
        params: { page, size: 20 },
        headers: {
          ...authService.getAuthHeader(),
        },
      })
      const data = response.data
      setInquiries(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      setMessage({ type: 'error', text: 'Failed to load inquiries' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return

    setIsDeleting(true)
    try {
      await axios.delete(`http://localhost:8080/api/admin/inquiries/${id}`, {
        headers: {
          ...authService.getAuthHeader(),
        },
      })
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== id))
      setMessage({ type: 'success', text: 'Inquiry deleted successfully' })
      setSelectedInquiry(null)
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      setMessage({ type: 'error', text: 'Failed to delete inquiry' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await axios.patch(`http://localhost:8080/api/admin/inquiries/${id}/status`, { status }, {
        headers: {
          ...authService.getAuthHeader(),
        },
      })
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status: status as Inquiry['status'] } : inquiry
      ))
      // Keep dialog state in sync with table updates
      setSelectedInquiry(prev => prev && prev.id === id ? { ...prev, status: status as Inquiry['status'] } : prev)
      setMessage({ type: 'success', text: 'Status updated successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error updating status:', error)
      setMessage({ type: 'error', text: 'Failed to update status' })
    }
  }

  const getStatusBadge = (status: Inquiry['status']) => {
    const variants: Record<Inquiry['status'], { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      PENDING: { variant: 'destructive', label: 'Pending' },
      PROCESSING: { variant: 'secondary', label: 'Processing' },
      QUOTED: { variant: 'default', label: 'Quoted' },
      COMPLETED: { variant: 'default', label: 'Completed' },
      CANCELLED: { variant: 'outline', label: 'Cancelled' }
    }
    const config = variants[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatKey = (key: string) =>
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim()

  const parseDetails = (details?: string) => {
    if (!details) return []
    try {
      const parsed = typeof details === 'string' ? JSON.parse(details) : details
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed as Record<string, unknown>)
      }
      return []
    } catch (error) {
      console.warn('Failed to parse inquiry details', error)
      return []
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Inquiries</h2>
        <p className="text-muted-foreground">
          Review and respond to customer inquiries
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Inquiries ({inquiries.length})</CardTitle>
          <CardDescription>
            Manage customer inquiries and contact requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inquiries yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.fullName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {inquiry.contactInfo}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(inquiry.submittedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInquiry(inquiry)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Inquiry Details</DialogTitle>
                                <DialogDescription>
                                  Review inquiry information and update status
                                </DialogDescription>
                              </DialogHeader>
                              {selectedInquiry && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Full Name</Label>
                                      <p className="text-sm mt-1">{selectedInquiry.fullName}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Contact</Label>
                                      <p className="text-sm mt-1 break-all">{selectedInquiry.contactInfo}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Status</Label>
                                      <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Date</Label>
                                      <p className="text-sm mt-1">{formatDate(selectedInquiry.submittedAt)}</p>
                                    </div>
                                  </div>

                                  {(() => {
                                    const detailEntries = parseDetails(selectedInquiry.details)
                                    return (
                                      <div className="space-y-3 pt-2">
                                        <Label className="text-sm font-medium">Details</Label>
                                        {detailEntries.length > 0 ? (
                                          <div className="grid sm:grid-cols-2 gap-3">
                                            {detailEntries.map(([key, value]) => (
                                              <div key={key} className="rounded-md border p-3 bg-muted/30">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">{formatKey(key)}</p>
                                                <p className="text-sm mt-1 break-words">{value === '' || value === null || value === undefined ? '—' : String(value)}</p>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-muted-foreground italic">No detail data.</p>
                                        )}
                                      </div>
                                    )
                                  })()}

                                  <div className="flex justify-between pt-4 border-t">
                                    <div className="flex gap-2 flex-wrap">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(selectedInquiry.id, 'PROCESSING')}
                                        disabled={selectedInquiry.status === 'PROCESSING'}
                                      >
                                        Mark Processing
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(selectedInquiry.id, 'QUOTED')}
                                        disabled={selectedInquiry.status === 'QUOTED'}
                                      >
                                        Mark Quoted
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(selectedInquiry.id, 'COMPLETED')}
                                        disabled={selectedInquiry.status === 'COMPLETED'}
                                      >
                                        Mark Completed
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(selectedInquiry.id, 'CANCELLED')}
                                        disabled={selectedInquiry.status === 'CANCELLED'}
                                      >
                                        Mark Cancelled
                                      </Button>
                                    </div>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDelete(selectedInquiry.id)}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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
    </div>
  )
}
