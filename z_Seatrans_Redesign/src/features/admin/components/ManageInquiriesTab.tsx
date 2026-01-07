'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, Mail, AlertCircle, FileText, CheckCircle2, Download, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import axios from 'axios'
import { authService } from '@/features/auth/services/authService'
import { documentService, InquiryDocument } from '@/features/inquiries/services/documentService'
import { InvoiceUploadDialog } from '@/features/inquiries/components/InvoiceUploadDialog'

interface Inquiry {
  id: number
  fullName: string
  contactInfo: string
  phone?: string
  company?: string
  status: 'PENDING' | 'PROCESSING' | 'QUOTED' | 'COMPLETED' | 'CANCELLED'
  submittedAt: string
  updatedAt: string
  details?: string
  serviceSlug?: string
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
  const [isLoading, setIsLoading] = useState(true)
  const [detailInquiry, setDetailInquiry] = useState<Inquiry | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [previewDocument, setPreviewDocument] = useState<InquiryDocument | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [templateHtml, setTemplateHtml] = useState<string | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleDocumentUpload = (document: InquiryDocument) => {
    setInquiries(prev => prev.map(inquiry =>
      inquiry.id === document.inquiryId && document.documentType === 'INVOICE'
        ? { ...inquiry, status: 'QUOTED' }
        : inquiry
    ))
    setMessage({ type: 'success', text: 'Document uploaded successfully' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDocumentDelete = (documentId: number) => {
    setMessage({ type: 'success', text: 'Document deleted successfully' })
    setTimeout(() => setMessage(null), 3000)
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  const fetchInquiries = async () => {
    setIsLoading(true)
    try {
      const token = authService.getToken()
      const response = await axios.get<PageResponse<Inquiry>>(`${API_BASE}/api/admin/inquiries`, {
        params: { page: 0, size: 10 },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = response.data
      setInquiries(data.content)
    } catch (err) {
      // Surface backend message to help diagnose 400 errors (e.g., validation/token issues)
      if (axios.isAxiosError(err)) {
        console.error('Failed to fetch inquiries:', err.response?.status, err.response?.data || err.message)
        const detail = (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
        setMessage({ type: 'error', text: detail || 'Failed to load inquiries' })
      } else {
        console.error('Failed to fetch inquiries:', err)
        setMessage({ type: 'error', text: 'Failed to load inquiries' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: number, status: Inquiry['status']) => {
    try {
      const token = authService.getToken()
      await axios.patch(`${API_BASE}/api/admin/inquiries/${id}/status`, { status }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setInquiries(prev => prev.map(inquiry => inquiry.id === id ? { ...inquiry, status } : inquiry))
      setMessage({ type: 'success', text: 'Status updated successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Failed to update status:', err.response?.status, err.response?.data || err.message)
        const detail = (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
        setMessage({ type: 'error', text: detail || 'Failed to update status' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update status' })
      }
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = typeof window !== 'undefined' ? window.confirm('Delete this inquiry? This action cannot be undone.') : true
    if (!confirmed) return
    try {
      setDeletingId(id)
      const token = authService.getToken()
      await axios.delete(`/api/admin/inquiries/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setInquiries(prev => prev.filter(inq => inq.id !== id))
      setMessage({ type: 'success', text: 'Inquiry deleted' })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Failed to delete inquiry:', err.response?.status, err.response?.data || err.message)
        const detail = (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
        setMessage({ type: 'error', text: detail || 'Failed to delete inquiry' })
      } else {
        console.error('Failed to delete inquiry:', err)
        setMessage({ type: 'error', text: 'Failed to delete inquiry' })
      }
    } finally {
      setDeletingId(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const loadTemplate = async () => {
    if (templateHtml) return templateHtml
    const res = await fetch('/templates/quote.html')
    const text = await res.text()
    setTemplateHtml(text)
    return text
  }

  const handlePreviewPdf = async (inquiry: Inquiry) => {
    try {
      const html = await loadTemplate()
      if (!html) return
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
      }
    } catch (err) {
      console.error('Failed to preview quote template', err)
      setMessage({ type: 'error', text: 'Could not load quote template' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const getStatusBadge = (status: Inquiry['status']) => {
    const variants: Record<Inquiry['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'secondary',
      PROCESSING: 'default',
      QUOTED: 'outline',
      COMPLETED: 'default',
      CANCELLED: 'destructive'
    }

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const renderDetails = (raw?: string) => {
    if (!raw) return <span className="text-muted-foreground">No details provided</span>
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      const entries = Object.entries(parsed)
      if (!entries.length) return <span className="text-muted-foreground">No details provided</span>

      const formatKey = (key: string) =>
        key
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

      return (
        <div className="grid sm:grid-cols-2 gap-3">
          {entries.map(([key, value]) => (
            <div key={key} className="rounded-md border p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{formatKey(key)}</p>
              <p className="text-sm mt-1 break-words">{value === '' || value === null || value === undefined ? '—' : String(value)}</p>
            </div>
          ))}
        </div>
      )
    } catch (err) {
      return <span className="text-muted-foreground">{raw}</span>
    }
  }

  const statusOptions: Inquiry['status'][] = ['PENDING', 'PROCESSING', 'QUOTED', 'COMPLETED', 'CANCELLED']

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Customer Inquiries</CardTitle>
            <CardDescription>Manage incoming inquiries and documents</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : inquiries.length === 0 ? (
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="inline-flex cursor-pointer">{getStatusBadge(inquiry.status)}</div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[180px]">
                            {statusOptions.map((statusOption) => (
                              <DropdownMenuItem
                                key={statusOption}
                                onClick={() => handleStatusChange(inquiry.id, statusOption)}
                                className="flex items-center gap-2"
                              >
                                {inquiry.status === statusOption && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                <span>{statusOption}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(inquiry.submittedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailInquiry(inquiry)}
                            className="gap-2"
                            title="View details"
                          >
                            <FileText className="h-4 w-4" />
                            Details
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePreviewPdf(inquiry)}
                            className="gap-2"
                            title="View PDF template"
                          >
                            <Download className="h-4 w-4" />
                            View PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(inquiry.id)}
                            disabled={deletingId === inquiry.id}
                            title="Delete inquiry"
                          >
                            {deletingId === inquiry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                          <InvoiceUploadDialog
                            inquiryId={inquiry.id}
                            serviceSlug={inquiry.serviceSlug || 'general'}
                            documents={[]}
                            onUploadSuccess={handleDocumentUpload}
                            onDeleteSuccess={handleDocumentDelete}
                          />
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

      {/* Details Dialog */}
      <Dialog open={!!detailInquiry} onOpenChange={(open) => {
        if (!open) {
          setDetailInquiry(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>Information submitted for this inquiry</DialogDescription>
          </DialogHeader>
          {detailInquiry && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="text-sm"><span className="font-semibold">Name:</span> {detailInquiry.fullName}</div>
                <div className="text-sm"><span className="font-semibold">Email:</span> {detailInquiry.contactInfo}</div>
                <div className="text-sm"><span className="font-semibold">Phone:</span> {detailInquiry.phone || '—'}</div>
                <div className="text-sm"><span className="font-semibold">Company:</span> {detailInquiry.company || '—'}</div>
              </div>
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold mb-2">Provided Details</h4>
                {renderDetails(detailInquiry.details)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      {previewDocument && (
        <Dialog open={!!previewDocument} onOpenChange={(open) => {
          if (!open) {
            setPreviewDocument(null)
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl)
              setPreviewUrl(null)
            }
          }
        }}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{previewDocument.originalFileName}</DialogTitle>
              <DialogDescription>
                <div className="flex gap-4 text-xs text-gray-600 mt-2">
                  <span>{documentService.getDocumentTypeLabel(previewDocument.documentType)}</span>
                  <span>•</span>
                  <span>{documentService.formatFileSize(previewDocument.fileSize)}</span>
                  <span>•</span>
                  <span>{new Date(previewDocument.uploadedAt).toLocaleString()}</span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0">
              {loadingPreview ? (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : previewUrl ? (
                <iframe src={previewUrl} className="w-full h-full rounded-lg border" title="PDF Preview" />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={async () => {
                try {
                  if (previewDocument) {
                    const inquiry = inquiries.find(inq => inq.id === previewDocument.inquiryId)
                    const serviceSlug = inquiry?.serviceSlug || 'general'
                    const blob = await documentService.downloadDocument(previewDocument.inquiryId, serviceSlug, previewDocument.id)
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = previewDocument.originalFileName
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }
                } catch (err) {
                  setMessage({ type: 'error', text: 'Failed to download document' })
                }
              }} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" onClick={() => {
                setPreviewDocument(null)
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl)
                  setPreviewUrl(null)
                }
              }}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
