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
import { Button } from '@/shared/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { useToast } from '@/shared/hooks/use-toast'
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
import { Loader2, Mail, FileText, CheckCircle2, Trash2, Download, Paperclip } from 'lucide-react'
import { authService } from '@/features/auth/services/authService'
import { documentService, type InquiryDocument } from '@/features/inquiries/services/documentService'

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
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [inquiries, setInquiries] = useState<SpecialRequestInquiry[]>([])
  const [selected, setSelected] = useState<SpecialRequestInquiry | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [documents, setDocuments] = useState<InquiryDocument[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const token = authService.getToken()
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
        const res = await axios.get<PageResponse<SpecialRequestInquiry>>(
          `${API_BASE}/api/admin/inquiries/special-request`,
          {
            params: { page: 0, size: 20 },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        )
        setInquiries(res.data.content)
      } catch (err) {
        const detail = axios.isAxiosError(err)
          ? (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
          : 'Failed to load inquiries'
        toast({ title: 'Error', description: detail, variant: 'destructive' })
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
        `${API_BASE}/api/admin/inquiries/special-request/${id}/status`,
        { status },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      )
      setInquiries(prev => prev.map(inq => (inq.id === id ? { ...inq, status } : inq)))
      toast({ title: 'Success', description: 'Status updated' })
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
        : 'Failed to update status'
      toast({ title: 'Error', description: detail, variant: 'destructive' })
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

  const handleDownloadDocument = async (inquiryId: number, documentId: number, fileName: string) => {
    try {
      const blob = await documentService.downloadDocument(inquiryId, 'special-request', documentId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to download document', variant: 'destructive' })
    }
  }

  const deleteInquiry = async (id: number) => {
    const confirmed = typeof window === 'undefined' ? true : window.confirm('Delete this inquiry? This cannot be undone.')
    if (!confirmed) return
    try {
      setDeletingId(id)
      const token = authService.getToken()
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
      await axios.delete(`${API_BASE}/api/admin/inquiries/special-request/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setInquiries(prev => prev.filter(inq => inq.id !== id))
      setSelected(current => (current?.id === id ? null : current))
      toast({ title: 'Success', description: 'Inquiry deleted' })
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
        : 'Failed to delete inquiry'
      toast({ title: 'Error', description: detail, variant: 'destructive' })
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
                      <TableCell>{renderStatus(inq.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelected(inq)
                            loadDocuments(inq.id)
                          }}>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadDocument(selected.id, doc.id, doc.originalFileName)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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
