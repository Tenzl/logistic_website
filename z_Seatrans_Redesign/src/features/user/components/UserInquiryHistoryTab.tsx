"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, AlertCircle, Clock, Eye, Download, FileText } from 'lucide-react'
import { authService } from '@/features/auth/services/authService'
import { documentService } from '@/features/inquiries/services/documentService'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { QuoteData, QuoteRow, QuotePreview, renderQuoteHtml } from '@/features/inquiries/components/QuotePreview'

interface Inquiry {
  id: number
  fullName: string
  contactInfo: string
  status: 'PENDING' | 'PROCESSING' | 'QUOTED' | 'COMPLETED' | 'CANCELLED'
  submittedAt: string
  details?: string
  
  // Shipping Agency fields
  toName?: string
  mv?: string
  eta?: string
  dwt?: number
  grt?: number
  loa?: number
  cargoType?: string
  cargoName?: string
  cargoQuantity?: number
  portOfCall?: string
  dischargeLoadingLocation?: string
  transportLs?: string
  boatHireAmount?: number
  tallyFeeAmount?: number
  quoteForm?: string
  berthHours?: number
  anchorageHours?: number
  pilotage3rdMiles?: number
  
  // Chartering fields
  loadingPort?: string
  dischargingPort?: string
  laycanFrom?: string
  laycanTo?: string
  
  // Freight/Logistics fields
  deliveryTerm?: string
  container20ft?: number
  container40ft?: number
  shipmentFrom?: string
  shipmentTo?: string
  
  // Special Request fields
  subject?: string
  message?: string
  
  serviceType?: {
    id: number
    name?: string
    displayName?: string
  }
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export function UserInquiryHistoryTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [detailInquiry, setDetailInquiry] = useState<Inquiry | null>(null)
  const [downloadingDoc, setDownloadingDoc] = useState<number | null>(null)
  const [quoteInquiry, setQuoteInquiry] = useState<Inquiry | null>(null)
  const [quoteTemplate, setQuoteTemplate] = useState<string | null>(null)
  const [quoteHtml, setQuoteHtml] = useState<string | null>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

  // Helper to get service slug from inquiry
  const getServiceSlug = (inquiry: Inquiry): string => {
    const serviceName = inquiry.serviceType?.name?.toLowerCase() || ''
    // Map service type names to slugs
    if (serviceName.includes('shipping') || serviceName.includes('agency')) return 'shipping-agency'
    if (serviceName.includes('charter')) return 'chartering'
    if (serviceName.includes('freight')) return 'freight-forwarding'
    if (serviceName.includes('logistic')) return 'total-logistic'
    if (serviceName.includes('special')) return 'special-request'
    return 'shipping-agency' // default fallback
  }

  useEffect(() => {
    const fetchInquiries = async () => {
      setIsLoading(true)
      try {
        const headers = {
          ...authService.getAuthHeader(),
        }

        // If the user is not authenticated, short-circuit with a friendly message
        if (!headers.Authorization) {
          setMessage('Please log in to view your inquiries.')
          setInquiries([])
          return
        }

        // Get current user to fetch their inquiries
        const user = authService.getUser()
        if (!user?.id) {
          setMessage('Please log in to view your inquiries.')
          setInquiries([])
          return
        }

        const response = await fetch(`${API_BASE_URL}/inquiries/user/${user.id}?page=0&size=20`, {
          headers,
          credentials: 'include',
        })
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized')
          }
          throw new Error('Failed to fetch inquiries')
        }
        const data: PageResponse<Inquiry> = await response.json()
        setInquiries(data.content || [])
      } catch (error) {
        console.error('Error fetching inquiries:', error)
        if ((error as Error).message === 'Unauthorized') {
          setMessage('Please log in again to view your inquiries.')
          authService.logout()
        } else {
          setMessage('Could not load inquiries. Please try again later.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchInquiries()
  }, [])

  const normalizeKey = (key: string) => key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')

  const normalizeDetails = (raw?: string) => {
    if (!raw) return {} as Record<string, unknown>
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      return Object.entries(parsed).reduce<Record<string, unknown>>((acc, [k, v]) => {
        acc[normalizeKey(k)] = v
        return acc
      }, {})
    } catch (err) {
      console.warn('Could not parse inquiry details', err)
      return {} as Record<string, unknown>
    }
  }

  const pickValue = (map: Record<string, unknown>, keys: string[], fallback?: string) => {
    for (const key of keys) {
      const value = map[normalizeKey(key)]
      if (value !== undefined && value !== null && value !== '') {
        return String(value)
      }
    }
    return fallback
  }

  const formatYesNo = (value?: unknown) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
    if (['yes', 'y', 'true', '1'].includes(normalized)) return 'Yes'
    if (['no', 'n', 'false', '0'].includes(normalized)) return 'No'
    return value ? String(value) : undefined
  }

  const buildRows = (value?: unknown) => {
    if (Array.isArray(value)) {
      return value as QuoteRow[]
    }
    return [] as QuoteRow[]
  }

  const buildQuoteData = (inquiry: Inquiry): QuoteData => {
    // Parse details JSON for quote-specific fields (AA_ROWS, BB_ROWS, totals, bank info)
    const map = normalizeDetails(inquiry.details)

    const data: QuoteData = {
      to_shipowner: inquiry.toName || inquiry.fullName,
      date: pickValue(map, ['quote_date', 'date'], new Date(inquiry.submittedAt).toLocaleDateString()),
      ref: pickValue(map, ['ref', 'reference', 'quotation_ref'], `INQ-${inquiry.id}`),
      mv: inquiry.mv,
      dwt: inquiry.dwt?.toString(),
      grt: inquiry.grt?.toString(),
      loa: inquiry.loa?.toString(),
      eta: inquiry.eta || 'TBN',
      cargo_qty_mt: inquiry.cargoQuantity?.toString(),
      cargo_name_upper: inquiry.cargoName?.toUpperCase(),
      cargo_type: inquiry.cargoType?.toUpperCase(),
      port_upper: (inquiry.portOfCall || inquiry.loadingPort || inquiry.dischargingPort)?.toUpperCase(),
      loading_term: inquiry.dischargeLoadingLocation || inquiry.deliveryTerm,
      transport_ls: inquiry.transportLs,
      at_anchorage: inquiry.dischargeLoadingLocation?.toLowerCase().includes('anchorage') ? 'Yes' : pickValue(map, ['at_anchorage', 'anchorage']),
      at_berth: inquiry.dischargeLoadingLocation?.toLowerCase().includes('berth') ? 'Yes' : pickValue(map, ['at_berth', 'berth']),
      total_a: pickValue(map, ['total_a', 'aa_total']),
      total_b: pickValue(map, ['total_b', 'bb_total']),
      grand_total: pickValue(map, ['grand_total', 'total']),
      bank_name: pickValue(map, ['bank_name']),
      bank_address: pickValue(map, ['bank_address']),
      beneficiary: pickValue(map, ['beneficiary']),
      usd_account: pickValue(map, ['usd_account', 'account_number']),
      swift: pickValue(map, ['swift', 'swift_code']),
      AA_ROWS: buildRows(map['aa_rows']),
      BB_ROWS: buildRows(map['bb_rows']),
      // Map hours from database with fallback to defaults
      berth_hours: inquiry.berthHours ?? 96,
      anchorage_hours: inquiry.anchorageHours ?? 24,
      pilotage_third_miles: inquiry.pilotage3rdMiles ?? 17,
    }

    return data
  }

  const ensureQuoteTemplate = async () => {
    if (quoteTemplate) return quoteTemplate
    const res = await fetch('/templates/quote.html')
    if (!res.ok) throw new Error('Template not found')
    const text = await res.text()
    setQuoteTemplate(text)
    return text
  }

  const handleViewQuote = async (inquiry: Inquiry) => {
    setQuoteInquiry(inquiry)
    setLoadingQuote(true)
    try {
      const template = await ensureQuoteTemplate()
      const html = renderQuoteHtml(template, buildQuoteData(inquiry))
      setQuoteHtml(html)
    } catch (err) {
      console.error('Failed to load quote preview:', err)
      setMessage('Không tải được mẫu báo giá. Vui lòng thử lại.')
      setQuoteInquiry(null)
      setQuoteHtml(null)
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setLoadingQuote(false)
    }
  }

  const handleQuickDownload = async (inquiry: Inquiry) => {
    try {
      setDownloadingDoc(inquiry.id)
      const serviceSlug = getServiceSlug(inquiry)
      const docs = await documentService.getDocuments(inquiry.id, serviceSlug)
      const target = docs.find(d => d.documentType === 'INVOICE') || docs[0]
      if (!target) {
        setMessage('No documents available to download')
        setTimeout(() => setMessage(null), 3000)
        return
      }
      const blob = await documentService.downloadDocument(inquiry.id, serviceSlug, target.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = target.originalFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download document:', err)
      setMessage('Failed to download document')
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setDownloadingDoc(null)
    }
  }

  const getStatusBadge = (status: Inquiry['status']) => {
    const variants: Record<Inquiry['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PENDING: { variant: 'destructive', label: 'Pending' },
      PROCESSING: { variant: 'secondary', label: 'Processing' },
      QUOTED: { variant: 'default', label: 'Quoted' },
      COMPLETED: { variant: 'default', label: 'Completed' },
      CANCELLED: { variant: 'outline', label: 'Cancelled' },
    }
    const config = variants[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (value: string) => new Date(value).toLocaleString()

  const renderDetails = (inquiry: Inquiry) => {
    const formatKey = (key: string) =>
      key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .trim()

    const allFields = [
      ['MV', inquiry.mv],
      ['DWT', inquiry.dwt],
      ['GRT', inquiry.grt],
      ['LOA', inquiry.loa],
      ['ETA', inquiry.eta || 'TBN'],
      ['Cargo Type', inquiry.cargoType],
      ['Cargo Name', inquiry.cargoName],
      ['Cargo Quantity', inquiry.cargoQuantity],
      ['Port of Call', inquiry.portOfCall],
      ['Loading Port', inquiry.loadingPort],
      ['Discharging Port', inquiry.dischargingPort],
      ['Discharge/Loading Location', inquiry.dischargeLoadingLocation],
      ['Delivery Term', inquiry.deliveryTerm],
      ['20ft Containers', inquiry.container20ft],
      ['40ft Containers', inquiry.container40ft],
      ['Subject', inquiry.subject],
      ['Message', inquiry.message],
    ]
    
    const fields = allFields.filter((field): field is [string, string | number] => {
      const [, value] = field
      return value !== undefined && value !== null && value !== ''
    })

    if (fields.length === 0) return <span className="text-muted-foreground">No details provided</span>

    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map(([key, value]) => (
          <div key={key} className="rounded-md border p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{key}</p>
            <p className="text-sm mt-1 break-words">{String(value)}</p>
          </div>
        ))}
      </div>
    )
  }

  const renderService = (inq: Inquiry) => {
    const label = inq.serviceType?.displayName || inq.serviceType?.name || 'Service'
    return <span className="font-medium">{label}</span>
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Your Inquiry History</CardTitle>
        <CardDescription>View submissions you have sent to Seatrans.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : message ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : inquiries.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-10 w-10 mx-auto mb-3" />
            No inquiries yet.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inq) => (
                  <TableRow key={inq.id}>
                    <TableCell className="whitespace-nowrap">{renderService(inq)}</TableCell>
                    <TableCell className="whitespace-nowrap">{getStatusBadge(inq.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{formatDate(inq.submittedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailInquiry(inq)}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Details
                        </Button>
                        {(inq.status === 'QUOTED' || inq.status === 'COMPLETED') && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleViewQuote(inq)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Invoice
                          </Button>
                        )}
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
            <div className="text-sm text-muted-foreground">{renderService(detailInquiry)}</div>
            <div className="text-sm">Status: {getStatusBadge(detailInquiry.status)}</div>
            <div className="text-sm">Submitted: {formatDate(detailInquiry.submittedAt)}</div>
            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold mb-2">Provided Details</h4>
              {renderDetails(detailInquiry)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Quote split-view dialog */}
    {quoteInquiry && (
      <Dialog open={!!quoteInquiry} onOpenChange={(open) => {
        if (!open) {
          setQuoteInquiry(null)
          setQuoteHtml(null)
        }
      }}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>Invoice for {renderService(quoteInquiry)}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-4 min-h-[70vh]">
              <div className="flex-1 min-h-[70vh] rounded-md border overflow-hidden bg-white">
                {loadingQuote ? (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : quoteHtml ? (
                  <QuotePreview html={quoteHtml} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-muted-foreground">
                    <FileText className="h-10 w-10 mr-2" />
                    No invoice available
                  </div>
                )}
              </div>
            </div>

            {quoteHtml && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!quoteHtml) return
                    
                    // Create hidden iframe for printing
                    const iframe = document.createElement('iframe')
                    iframe.style.position = 'fixed'
                    iframe.style.right = '0'
                    iframe.style.bottom = '0'
                    iframe.style.width = '0'
                    iframe.style.height = '0'
                    iframe.style.border = 'none'
                    document.body.appendChild(iframe)
                    
                    const iframeDoc = iframe.contentWindow?.document
                    if (!iframeDoc) {
                      document.body.removeChild(iframe)
                      return
                    }
                    
                    iframeDoc.open()
                    iframeDoc.write(quoteHtml)
                    iframeDoc.close()
                    
                    // Wait for content to load
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    
                    // Print from iframe
                    iframe.contentWindow?.focus()
                    iframe.contentWindow?.print()
                    
                    // Clean up after print dialog closes
                    setTimeout(() => {
                      document.body.removeChild(iframe)
                    }, 1000)
                  }}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Save PDF
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuoteInquiry(null)
                    setQuoteHtml(null)
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}
