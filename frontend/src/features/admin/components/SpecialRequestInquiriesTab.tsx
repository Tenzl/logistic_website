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
import { PdfPreviewDialog } from '@/shared/components/PdfPreviewDialog'
import { Loader2, Mail, FileText, CheckCircle2, Trash2, Download, Paperclip, RefreshCw, Eye } from 'lucide-react'
import { documentService, type InquiryDocument } from '@/modules/inquiries/services/documentService'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { INQUIRY_STATUS_OPTIONS } from '@/shared/constants/inquiry-status'
import { renderInquiryStatusBadge } from '@/shared/utils/inquiry-helpers'

interface SpecialRequestInquiry {
  id: number
  fullName?: string
  contactInfo?: string
  phone?: string
  company?: string
  userId?: number
  status: string
  submittedAt: string
  updatedAt: string
  notes?: string
  // Special Request specific fields from backend DTO
  subject?: string
  preferredProvinceId?: number
  preferredProvinceName?: string
  relatedDepartmentId?: number
  relatedDepartmentName?: string
  message?: string
  otherInfo?: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export function SpecialRequestInquiriesTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [inquiries, setInquiries] = useState<SpecialRequestInquiry[]>([])
  const [selected, setSelected] = useState<SpecialRequestInquiry | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [documents, setDocuments] = useState<InquiryDocument[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)

  const SERVICE_SLUG = 'special-request'
  const ADMIN_BASE = `${API_CONFIG.INQUIRIES.ADMIN_BASE}/${SERVICE_SLUG}`

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: '0', size: '20' })
      const response = await apiClient.get<PageResponse<SpecialRequestInquiry>>(
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

  const loadDocuments = async (inquiryId: number) => {
    setLoadingDocuments(true)
    try {
      const docs = await documentService.getDocuments(inquiryId, 'special-request')
      setDocuments(docs)
    } catch (err) {
      console.error('Failed to load documents:', err)
      setDocuments([])
    } finally {
      setLoadingDocuments(false)
    }
  }

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFileName, setPreviewFileName] = useState('')

  const handleDownloadDocument = (inquiryId: number, documentId: number, fileName: string) => {
    try {
      // Use direct URL navigation to support IDM and other download managers
      // This avoids the XHR interception issue that causes CORS errors
      const url = documentService.getDownloadUrl(inquiryId, 'special-request', documentId)
      
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName) // Hint to browser/IDM
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      toast.error('Failed to initiate download')
    }
  }

  const handlePreviewDocument = (inquiryId: number, documentId: number, fileName: string) => {
      // For preview, we still use the direct URL since the backend is public
      // react-pdf can load from a URL
      // Use getPreviewUrl to bypass IDM interception
      const url = documentService.getPreviewUrl(inquiryId, 'special-request', documentId)
      setPreviewUrl(url)
      setPreviewFileName(fileName)
      setPreviewOpen(true)
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
            <CardTitle className="text-xl">Special Request Inquiries</CardTitle>
            <CardDescription>Subject, preferred province, and notes</CardDescription>
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
              <p>No special requests yet</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="font-medium">{inq.subject || '—'}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {inq.relatedDepartmentName || `Dept: ${inq.relatedDepartmentId || '—'}`} • {inq.preferredProvinceName || `Province: ${inq.preferredProvinceId || '—'}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{inq.fullName || '—'}</div>
                        <div className="text-xs text-muted-foreground">{inq.contactInfo || inq.phone || '—'}</div>
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
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelected(inq)
                            loadDocuments(inq.id)
                          }}>
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

      <Dialog open={!!selected} onOpenChange={(open) => {
        if (!open) {
          setSelected(null)
          setDocuments([])
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>Special request information and attachments</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <div className="font-semibold flex items-center gap-2"><Mail className="h-4 w-4" /> Customer</div>
                  <div className="mt-2 space-y-1">
                    <div>Name: {selected.fullName || '—'}</div>
                    <div>Contact: {selected.contactInfo || '—'}</div>
                    <div>Phone: {selected.phone || '—'}</div>
                    <div>Company: {selected.company || '—'}</div>
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Request</div>
                  <div className="mt-2 space-y-1">
                    <div>Subject: {selected.subject || '—'}</div>
                    <div>Province: {selected.preferredProvinceName || (selected.preferredProvinceId ? `ID: ${selected.preferredProvinceId}` : '—')}</div>
                    <div>Department: {selected.relatedDepartmentName || (selected.relatedDepartmentId ? `ID: ${selected.relatedDepartmentId}` : '—')}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-3">
                <div className="font-semibold mb-2">Message</div>
                <div className="whitespace-pre-wrap">{selected.message || '—'}</div>
              </div>

              {selected.otherInfo && (
                <div className="rounded-md border p-3">
                  <div className="font-semibold mb-2">Other Info</div>
                  <div className="whitespace-pre-wrap">{selected.otherInfo}</div>
                </div>
              )}

              <div className="rounded-md border p-3">
                <div className="font-semibold flex items-center gap-2 mb-3">
                  <Paperclip className="h-4 w-4" /> 
                  Attachments ({documents.length})
                </div>
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{doc.originalFileName}</div>
                            <div className="text-xs text-muted-foreground">
                              {documentService.formatFileSize(doc.fileSize)} • {documentService.getDocumentTypeLabel(doc.documentType)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {(doc.mimeType === 'application/pdf' || doc.originalFileName.toLowerCase().endsWith('.pdf')) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePreviewDocument(selected.id, doc.id, doc.originalFileName)}
                              title="View PDF"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadDocument(selected.id, doc.id, doc.originalFileName)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No attachments</div>
                )}
              </div>

              {selected.notes && (
                <div className="rounded-md border p-3">
                  <div className="font-semibold mb-2">Admin Notes</div>
                  <div className="whitespace-pre-wrap">{selected.notes}</div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm border-t pt-3">
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
      
      <PdfPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        url={previewUrl}
        fileName={previewFileName}
      />
    </div>
  )
}
