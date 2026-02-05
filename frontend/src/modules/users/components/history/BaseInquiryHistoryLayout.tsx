"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, AlertCircle, RefreshCw, FileText, ArrowUpDown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { QuotePreview } from '@/modules/inquiries/components/common/Quote-hcm'
import { InquiryDataTable } from './InquiryDataTable'
import { InquiryDetailDrawer } from './InquiryDetailDrawer'
import { useInquiryData } from './useInquiryData'
import { useInvoicePreview } from './useInvoicePreview'
import {
  getSchemaForService,
  getServiceSlugFromInquiry,
} from './serviceInquirySchemas'
import { INQUIRY_STATUS_OPTIONS, STATUS_PROCESSING, STATUS_QUOTED, STATUS_BADGE_CONFIG, InquiryStatus } from '@/shared/constants/inquiry-status'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

interface BaseInquiryHistoryLayoutProps {
  serviceType?: string
  serviceLabel?: string
  isAdmin?: boolean
  title?: string
  description?: string
}

export function BaseInquiryHistoryLayout({
  serviceType,
  serviceLabel,
  isAdmin = false,
  title = 'Inquiry History',
  description = 'View and manage your inquiry submissions',
}: BaseInquiryHistoryLayoutProps) {
  const router = useRouter()

  const { inquiries, isLoading, error, fetchInquiries, deleteInquiries, updateStatus, updateForm, formUpdatingId } = useInquiryData({
    serviceType,
    isAdmin,
  })
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)
  const [pdfOpeningId, setPdfOpeningId] = useState<number | null>(null)
  
  const { quoteHtml, isLoading: loadingQuote, generateInvoicePreview, clearPreview } = useInvoicePreview()
  
  const [detailInquiry, setDetailInquiry] = useState<any | null>(null)
  const [quoteInquiry, setQuoteInquiry] = useState<any | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  const getStatusBadge = (status: string) => {
    const config = STATUS_BADGE_CONFIG[status as InquiryStatus] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const formatDate = (value: string) => new Date(value).toLocaleString()

  const renderService = (inquiry: any) => {
    const label = inquiry.serviceType?.displayName || inquiry.serviceType?.name || serviceLabel || 'Service'
    return <span className="font-medium">{label}</span>
  }

  const handleViewQuote = async (inquiry: any) => {
    setQuoteInquiry(inquiry)
    try {
      await generateInvoicePreview(inquiry)
    } catch (err) {
      console.error('Failed to load quote preview:', err)
    }
  }

  const handleManagePdf = async (inquiry: any) => {
    const slug = getServiceSlugFromInquiry(inquiry) || serviceType

    if (slug === 'shipping-agency' && isAdmin) {
      setPdfOpeningId(inquiry.id)
      try {
        if (inquiry.status !== STATUS_PROCESSING) {
          await updateStatus(inquiry.id, STATUS_PROCESSING, slug)
        }
        router.push(`/admin/inquiries/${slug}/${inquiry.id}/pdf`)
      } catch (err) {
        console.error('Failed to open PDF manager', err)
      } finally {
        setPdfOpeningId(null)
      }
      return
    }

    handleViewQuote(inquiry)
  }

  const handleOpenDetail = (inquiry: any) => {
    setDetailInquiry(inquiry)
  }

  const handleDeleteInquiries = async (ids: number[]) => {
    try {
      await deleteInquiries(ids)
    } catch (error) {
      console.error('Error deleting inquiries:', error)
    }
  }

  const handleDetailClose = () => {
    setDetailInquiry(null)
  }

  const handleViewInvoiceFromDetail = () => {
    if (detailInquiry) {
      handleViewQuote(detailInquiry)
      setDetailInquiry(null)
    }
  }

  // Define columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const inq = row.original
        const name = inq.fullName || inq.contactName || inq.name || inq.toName || '—'
        return <span className="font-medium">{name}</span>
      },
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
      cell: ({ row }) => {
        const inq = row.original
        const options = INQUIRY_STATUS_OPTIONS
        const current = inq.status
        if (!isAdmin) {
          return getStatusBadge(current)
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2" disabled={statusUpdatingId === inq.id}>
                {statusUpdatingId === inq.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  getStatusBadge(current)
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {options.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  disabled={statusUpdatingId === inq.id || opt === current}
                  onSelect={async () => {
                    if (opt === current) return
                    try {
                      setStatusUpdatingId(inq.id)
                      await updateStatus(inq.id, opt, getServiceSlugFromInquiry(inq) || serviceType)
                    } catch (err) {
                      console.error('Failed to update status', err)
                    } finally {
                      setStatusUpdatingId(null)
                    }
                  }}
                >
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (serviceType === 'shipping-agency') {
    columns.push(
      {
        accessorKey: 'portOfCall',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Port
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const val = row.original.portOfCall || row.original.loadingPort || row.original.dischargingPort || '—'
          return <span className="text-sm">{val}</span>
        },
      }
    )
    
    // Form column only for admin
    if (isAdmin) {
      columns.push({
        id: 'form',
        header: 'Form',
        cell: ({ row }) => {
          const inq = row.original
          const current = (inq.quoteForm || '').toUpperCase() || 'HCM'
          const options = ['HCM', 'QN']
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={formUpdatingId === inq.id} className="px-2">
                  {formUpdatingId === inq.id ? <Loader2 className="h-4 w-4 animate-spin" /> : current}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {options.map(opt => (
                  <DropdownMenuItem
                    key={opt}
                    disabled={formUpdatingId === inq.id || opt === current}
                    onSelect={async () => {
                      if (opt === current) return
                      try {
                        await updateForm(inq.id, opt, getServiceSlugFromInquiry(inq) || serviceType)
                      } catch (err) {
                        console.error('Failed to update form', err)
                      }
                    }}
                  >
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      })
    }
  }
  
  columns.push(
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
        const slug = getServiceSlugFromInquiry(inq) || serviceType
        const isShippingAgency = slug === 'shipping-agency'

        // Admin actions
        if (isAdmin) {
          if (!isShippingAgency) {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDetail(inq)}
                className="gap-2"
              >
                View Details
              </Button>
            )
          }
          // Shipping agency: both View Details and Manage PDF
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDetail(inq)}
                className="gap-2"
              >
                View Details
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleManagePdf(inq)}
                className="gap-2"
                disabled={pdfOpeningId === inq.id}
              >
                {pdfOpeningId === inq.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Manage PDF
              </Button>
            </div>
          )
        }

        // User actions
        if (isShippingAgency) {
          // Shipping agency: View Invoice only available when status is QUOTED
          const isQuoted = inq.status === STATUS_QUOTED
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDetail(inq)}
                className="gap-2"
              >
                View Details
              </Button>
              {isQuoted && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewQuote(inq)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Invoice
                </Button>
              )}
            </div>
          )
        }

        // Other services: only View Details
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDetail(inq)}
            className="gap-2"
          >
            View Details
          </Button>
        )
      },
    }
  )

  const detailSchema = detailInquiry 
    ? getSchemaForService(getServiceSlugFromInquiry(detailInquiry) || serviceType || '')
    : []

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
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
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : inquiries.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No inquiries yet.
            </div>
          ) : (
            <InquiryDataTable
              columns={columns}
              data={inquiries}
              searchKey={isAdmin ? "fullName" : undefined}
              searchPlaceholder="Search by name..."
              onDelete={handleDeleteInquiries}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <InquiryDetailDrawer
        inquiry={detailInquiry}
        schema={detailSchema}
        open={!!detailInquiry}
        onOpenChange={(open) => !open && handleDetailClose()}
        onViewInvoice={handleViewInvoiceFromDetail}
        serviceLabel={detailInquiry ? renderService(detailInquiry).props.children : undefined}
        serviceSlug={detailInquiry ? getServiceSlugFromInquiry(detailInquiry) || serviceType : serviceType}
        isAdmin={isAdmin}
      />

      {/* Invoice Preview Dialog */}
      {quoteInquiry && (
        <Dialog 
          open={!!quoteInquiry} 
          onOpenChange={(open) => {
            if (!open) {
              setQuoteInquiry(null)
              clearPreview()
            }
          }}
        >
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>Invoice Preview</DialogTitle>
              <DialogDescription>
                Invoice for {renderService(quoteInquiry)}
              </DialogDescription>
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
                      
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      
                      iframe.contentWindow?.focus()
                      iframe.contentWindow?.print()
                      
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
                      clearPreview()
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
