"use client"

import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, AlertCircle, Clock, Eye, FileText, RefreshCw, MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { authService } from '@/modules/auth/services/authService'
import { documentService } from '@/modules/inquiries/services/documentService'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { QuoteData, QuoteRow, QuotePreview, renderQuoteHtml as renderQuoteHtmlHcm } from '@/modules/inquiries/components/common/Quote-hcm'
import { renderQuoteHtml as renderQuoteHtmlQn } from '@/modules/inquiries/components/common/Quote-qn'
import { formatInvoiceDate, formatCheckMark, formatCargoDescription } from '@/shared/utils/invoiceFormatters'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { InquiryDataTable } from './history/InquiryDataTable'
import {
  getSchemaForService,
  getServiceSlugFromInquiry,
  getFieldValue,
  InquiryFieldSchema,
} from './history/serviceInquirySchemas'
import { InquiryStatus, STATUS_QUOTED, STATUS_COMPLETED, STATUS_BADGE_CONFIG } from '@/shared/constants/inquiry-status'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

interface Inquiry {
  id: number
  fullName: string
  contactInfo: string
  status: InquiryStatus
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

  const fetchInquiries = async () => {
    setIsLoading(true)
    try {
      const user = authService.getUser()
      if (!user?.id) {
        setMessage('Please log in to view your inquiries.')
        setInquiries([])
        return
      }

      const response = await apiClient.get<PageResponse<Inquiry>>(
        `${API_CONFIG.INQUIRIES.USER_HISTORY(user.id)}?page=0&size=20`
      )

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized')
        }
        throw new Error('Failed to fetch inquiries')
      }
      const data: PageResponse<Inquiry> = await response.json()
      const payload = (data as any).data || data
      setInquiries(payload.content || payload || [])
      setMessage(null) // Clear any previous error messages on success
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

  useEffect(() => {
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
      date: pickValue(map, ['quote_date', 'date'], formatInvoiceDate(inquiry.submittedAt)),
      ref: pickValue(map, ['ref', 'reference', 'quotation_ref'], `INQ-${inquiry.id}`),
      mv: inquiry.mv,
      dwt: inquiry.dwt?.toString(),
      grt: inquiry.grt?.toString(),
      loa: inquiry.loa?.toString(),
      eta: inquiry.eta ? formatInvoiceDate(inquiry.eta) : 'TBN',
      cargo_qty_mt: inquiry.cargoQuantity?.toString(),
      cargo_name_upper: formatCargoDescription(inquiry.cargoName, inquiry.cargoType),
      cargo_type: inquiry.cargoType?.toUpperCase(),
      port_upper: (inquiry.portOfCall || inquiry.loadingPort || inquiry.dischargingPort)?.toUpperCase(),
      loading_term: inquiry.dischargeLoadingLocation || inquiry.deliveryTerm,
      transport_ls: inquiry.transportLs,
      at_anchorage: inquiry.dischargeLoadingLocation?.toLowerCase().includes('anchorage') ? 'x' : formatCheckMark(pickValue(map, ['at_anchorage', 'anchorage'])),
      at_berth: inquiry.dischargeLoadingLocation?.toLowerCase().includes('berth') ? 'x' : formatCheckMark(pickValue(map, ['at_berth', 'berth'])),
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
    // Fetch the main template (single template for both QN and HCM)
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
      // Choose the correct renderer based on quoteForm
      const renderer = (inquiry.quoteForm || '').toUpperCase() === 'QN' ? renderQuoteHtmlQn : renderQuoteHtmlHcm
      const html = renderer(template, buildQuoteData(inquiry))
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
    const config = STATUS_BADGE_CONFIG[status]
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const formatDate = (value: string) => new Date(value).toLocaleString()

  const handleDeleteInquiries = async (ids: number[]) => {
    try {
      // Call API to delete inquiries
      const response = await apiClient.delete(`${API_CONFIG.INQUIRIES.BASE}/batch`, {
        body: JSON.stringify({ ids }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete inquiries')
      }
      
      // Remove deleted inquiries from state
      setInquiries(prev => prev.filter(inq => !ids.includes(inq.id)))
      setMessage('Successfully deleted selected inquiries')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error deleting inquiries:', error)
      setMessage('Failed to delete inquiries. Please try again.')
      setTimeout(() => setMessage(null), 3000)
    }
  }

  // Define columns for DataTable (following table-09 pattern)
  const columns: ColumnDef<Inquiry>[] = [
    {
      accessorKey: 'serviceType',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Service
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => renderService(row.original),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'submittedAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm whitespace-nowrap">
          {formatDate(row.original.submittedAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const inq = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetailInquiry(inq)}>
                <FileText className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {(inq.status === STATUS_QUOTED || inq.status === STATUS_COMPLETED) && (
                <DropdownMenuItem onClick={() => handleViewQuote(inq)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Invoice
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const renderDetails = (inquiry: Inquiry) => {
    // Get service-specific schema
    const serviceSlug = getServiceSlugFromInquiry(inquiry)
    const schema = getSchemaForService(serviceSlug || '')

    // Build field list from schema
    const fields: Array<[string, string]> = []
    
    for (const fieldDef of schema) {
      const value = getFieldValue(inquiry, fieldDef.key)
      
      // Skip if value is undefined, null, or empty string
      if (value === undefined || value === null || value === '') {
        continue
      }
      
      // Format value using schema formatter
      const formattedValue = fieldDef.format ? fieldDef.format(value) : String(value)
      
      // Skip if formatted value is empty
      if (!formattedValue) {
        continue
      }
      
      fields.push([fieldDef.label, formattedValue])
    }

    if (fields.length === 0) return <span className="text-muted-foreground">No details provided</span>

    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map(([key, value]) => (
          <div key={key} className="rounded-md border p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{key}</p>
            <p className="text-sm mt-1 break-words">{value}</p>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Inquiry History</CardTitle>
            <CardDescription>View submissions you have sent to Seatrans.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInquiries}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Reload
          </Button>
        </div>
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
          <InquiryDataTable
            columns={columns}
            data={inquiries}
            searchKey="fullName"
            searchPlaceholder="Search by name..."
            onDelete={handleDeleteInquiries}
          />
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
