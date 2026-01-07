'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { QuoteData, renderQuoteHtml as renderQuoteHtmlHcm } from '@/features/inquiries/components/Quote-hcm'
import { renderQuoteHtml as renderQuoteHtmlQn } from '@/features/inquiries/components/Quote-qn'
import { formatInvoiceDate, formatCheckMark, formatCargoDescription } from '@/shared/utils/invoiceFormatters'
import { authService } from '@/features/auth/services/authService'
import { AlertCircle, ArrowLeft, Download, FileText, Loader2, RefreshCw } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { useToast } from '@/shared/hooks/use-toast'

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
  berthHours?: number
  anchorageHours?: number
  pilotage3rdMiles?: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

const formatDate = (value?: string, fallback = '—') => {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString()
}

const toStringOrDash = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? '—' : String(value)

const mapToQuoteData = (inquiry: ShippingAgencyInquiry): QuoteData => {
  const cargoName = inquiry.cargoNameOther || inquiry.cargoName || inquiry.cargoType
  const port = inquiry.portOfCall || inquiry.dischargeLoadingLocation
  const dlLocation = (inquiry.dischargeLoadingLocation || '').trim().toLowerCase()
  const atAnchorage = dlLocation.includes('anchorage') ? 'x' : ''
  const atBerth = dlLocation.includes('berth') ? 'x' : ''

  return {
    to_shipowner: inquiry.toName || inquiry.company || inquiry.fullName,
    date: formatInvoiceDate(inquiry.submittedAt),
    ref: `CHHH_QN`,
    mv: inquiry.mv,
    dwt: inquiry.dwt !== undefined && inquiry.dwt !== null ? String(inquiry.dwt) : undefined,
    grt: inquiry.grt !== undefined && inquiry.grt !== null ? String(inquiry.grt) : undefined,
    loa: inquiry.loa !== undefined && inquiry.loa !== null ? String(inquiry.loa) : undefined,
    eta: inquiry.eta ? formatInvoiceDate(inquiry.eta) : 'TBN',
    cargo_qty_mt: inquiry.cargoQuantity !== undefined && inquiry.cargoQuantity !== null ? String(inquiry.cargoQuantity) : undefined,
    cargo_name_upper: formatCargoDescription(cargoName, inquiry.cargoType),
    cargo_type: inquiry.cargoType ? inquiry.cargoType.toUpperCase() : undefined,
    port_upper: port ? port.toUpperCase() : undefined,
    loading_term: inquiry.frtTaxType,
    transport_ls: inquiry.transportLs,
    transport_quarantine: inquiry.transportQuarantine,
    boat_hire_entry: inquiry.boatHireAmount,
    tally_fee: inquiry.tallyFeeAmount,
    at_anchorage: atAnchorage,
    at_berth: atBerth,
    total_a: undefined,
    total_b: undefined,
    grand_total: undefined,
    bank_name: undefined,
    bank_address: undefined,
    beneficiary: undefined,
    usd_account: undefined,
    swift: undefined,
    AA_ROWS: [],
    BB_ROWS: [],
  }
}

export default function ShippingAgencyPdfPage() {
  const { toast } = useToast()
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const inquiryId = params?.id

  const [inquiry, setInquiry] = useState<ShippingAgencyInquiry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<string | null>(null)
  const [quoteHtml, setQuoteHtml] = useState<string | null>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [quoteForm, setQuoteForm] = useState<'HCM' | 'QN'>('HCM')
  const [pendingForm, setPendingForm] = useState<'HCM' | 'QN'>('HCM')
  const [berthHours, setBerthHours] = useState<number>(96)
  const [berthHoursInput, setBerthHoursInput] = useState('96')
  const [anchorageHours, setAnchorageHours] = useState<number>(24)
  const [anchorageHoursInput, setAnchorageHoursInput] = useState('24')
  const [pilotageThirdMiles, setPilotageThirdMiles] = useState<number>(17)
  const [pilotageThirdMilesInput, setPilotageThirdMilesInput] = useState('17')
  const [isEditing, setIsEditing] = useState(false)
  const [showBackAlert, setShowBackAlert] = useState(false)

  const fetchInquiry = useCallback(async (id: string) => {
    setIsLoading(true)
    setQuoteHtml(null)
    setError(null)
    try {
      const token = authService.getToken()
      const res = await axios.get<ShippingAgencyInquiry>(`${API_BASE}/api/admin/inquiries/shipping-agency/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setInquiry(res.data)
      const formValue = (res.data.quoteForm || '').toUpperCase() === 'QN' ? 'QN' : 'HCM'
      setQuoteForm(formValue)
      setPendingForm(formValue)
      
      // Load hours from database, fallback to defaults
      const berth = res.data.berthHours ?? 96
      const anchorage = res.data.anchorageHours ?? 24
      const pilotage = res.data.pilotage3rdMiles ?? 17
      
      setBerthHours(berth)
      setBerthHoursInput(String(berth))
      setAnchorageHours(anchorage)
      setAnchorageHoursInput(String(anchorage))
      setPilotageThirdMiles(pilotage)
      setPilotageThirdMilesInput(String(pilotage))
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to load shipping agency inquiry', err)
      const detail = axios.isAxiosError(err)
        ? (err.response?.data as any)?.message || (err.response?.data as any)?.error || err.message
        : 'Failed to load inquiry'
      setError(detail || 'Failed to load inquiry')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!inquiryId) return
    fetchInquiry(String(inquiryId))
  }, [fetchInquiry, inquiryId])

  const ensureTemplate = async () => {
    if (template) return template
    const res = await fetch('/templates/quote.html')
    if (!res.ok) throw new Error('Template not found')
    const text = await res.text()
    setTemplate(text)
    return text
  }

  useEffect(() => {
    if (!inquiry) return
    const buildQuote = async () => {
      setLoadingQuote(true)
      try {
        const tpl = await ensureTemplate()
        const renderer = quoteForm === 'QN' ? renderQuoteHtmlQn : renderQuoteHtmlHcm
        const html = renderer(tpl, {
          ...mapToQuoteData(inquiry),
          berth_hours: berthHours,
          anchorage_hours: anchorageHours,
          pilotage_third_miles: pilotageThirdMiles,
        })
        setQuoteHtml(html)
      } catch (err) {
        console.error('Failed to build quote preview', err)
        setError('Could not render quote preview')
        setQuoteHtml(null)
      } finally {
        setLoadingQuote(false)
      }
    }

    buildQuote()
  }, [inquiry, berthHours, anchorageHours, pilotageThirdMiles, quoteForm])

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'secondary',
      PROCESSING: 'default',
      QUOTED: 'outline',
      COMPLETED: 'default',
      CANCELLED: 'destructive',
    }
    const variant = status ? variants[status] || 'outline' : 'secondary'
    return <Badge variant={variant}>{status || 'Unknown'}</Badge>
  }

  const renderBoolean = (value?: boolean, amount?: number) => {
    if (value === undefined || value === null) return 'No'
    const suffix = amount ? ` (${amount})` : ''
    return value ? `Yes${suffix}` : 'No'
  }

  const persistQuoteForm = async (form: 'HCM' | 'QN') => {
    if (!inquiryId) return
    const token = authService.getToken()
    await axios.patch(
      `${API_BASE}/api/admin/inquiries/shipping-agency/${inquiryId}/form`,
      { form },
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    )
  }

  const transferToUser = async () => {
    if (!quoteHtml || !inquiryId) return
    
    try {
      // Update status to QUOTED
      const token = authService.getToken()
      await axios.patch(
        `${API_BASE}/api/admin/inquiries/shipping-agency/${inquiryId}/status`,
        { status: 'QUOTED' },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      )
      
      // Update local state
      setInquiry(prev => (prev ? { ...prev, status: 'QUOTED' } : prev))
      
      // Show success notification
      toast({ title: 'Success', description: 'Status updated to QUOTED' })
      
      // TODO: PDF Export (temporarily disabled)
      /*
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
      */
    } catch (error) {
      console.error('Failed to export quote:', error)
      toast({ title: 'Error', description: 'Failed to export quote', variant: 'destructive' })
    }
  }

  const applyHours = async () => {
    if (!isEditing) return
    const nextBerth = Number(berthHoursInput)
    const nextAnchorage = Number(anchorageHoursInput)
    const nextPilotageThird = Number(pilotageThirdMilesInput)

    // Validate inputs
    const validBerth = Number.isFinite(nextBerth) && nextBerth >= 0
    const validAnchorage = Number.isFinite(nextAnchorage) && nextAnchorage >= 0
    const validPilotage = Number.isFinite(nextPilotageThird) && nextPilotageThird >= 0

    if (!validBerth) {
      setBerthHoursInput(String(berthHours))
    }
    if (!validAnchorage) {
      setAnchorageHoursInput(String(anchorageHours))
    }
    if (!validPilotage) {
      setPilotageThirdMilesInput(String(pilotageThirdMiles))
    }

    // Save hours to database
    try {
      const token = authService.getToken()
      await axios.patch(
        `${API_BASE}/api/admin/inquiries/shipping-agency/${inquiryId}/hours`,
        {
          berthHours: validBerth ? nextBerth : berthHours,
          anchorageHours: validAnchorage ? nextAnchorage : anchorageHours,
          pilotage3rdMiles: validPilotage ? nextPilotageThird : pilotageThirdMiles,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      )

      // Update local state after successful save
      if (validBerth) setBerthHours(nextBerth)
      if (validAnchorage) setAnchorageHours(nextAnchorage)
      if (validPilotage) setPilotageThirdMiles(nextPilotageThird)
    } catch (err) {
      console.error('Failed to save hours', err)
      setError('Could not save hours to database')
    }

    const nextForm = pendingForm
    const shouldUpdateForm = nextForm !== quoteForm
    if (shouldUpdateForm) {
      try {
        await persistQuoteForm(nextForm)
        setQuoteForm(nextForm)
        setInquiry(prev => (prev ? { ...prev, quoteForm: nextForm } : prev))
      } catch (err) {
        console.error('Failed to update form', err)
        setError('Could not update form')
      }
    }

    setIsEditing(false)
  }

  const startEdit = async () => {
    // If status is not PROCESSING, update it
    if (inquiry && inquiry.status !== 'PROCESSING') {
      try {
        const token = authService.getToken()
        await axios.patch(
          `${API_BASE}/api/admin/inquiries/shipping-agency/${inquiryId}/status`,
          { status: 'PROCESSING' },
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
        )
        setInquiry((prev) => (prev ? { ...prev, status: 'PROCESSING' } : prev))
      } catch (err) {
        console.error('Failed to update status to PROCESSING', err)
        // Non-blocking error, user can still edit
      }
    }

    setPendingForm(quoteForm)
    setBerthHoursInput(String(berthHours))
    setAnchorageHoursInput(String(anchorageHours))
    setPilotageThirdMilesInput(String(pilotageThirdMiles))
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setPendingForm(quoteForm)
    setBerthHoursInput(String(berthHours))
    setAnchorageHoursInput(String(anchorageHours))
    setPilotageThirdMilesInput(String(pilotageThirdMiles))
    setIsEditing(false)
  }

  const handleBack = () => {
    if (inquiry?.status === 'PROCESSING') {
      setShowBackAlert(true)
    } else {
      navigateBack()
    }
  }

  const navigateBack = () => {
    if (typeof window !== 'undefined' && window.opener) {
      window.close()
    } else {
      router.push('/admin')
    }
  }

  const confirmBackTransfer = async () => {
    // Perform transfer then navigate back
    if (!inquiryId) return
    try {
      const token = authService.getToken()
      await axios.patch(
        `${API_BASE}/api/admin/inquiries/shipping-agency/${inquiryId}/status`,
        { status: 'QUOTED' },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      )
      toast({ title: 'Success', description: 'Transferred to User (QUOTED)' })
      navigateBack()
    } catch (error) {
      console.error('Failed to transfer on back:', error)
      toast({ title: 'Error', description: 'Failed to transfer', variant: 'destructive' })
      navigateBack() // Still go back even if transfer fails? Or stay? Probably safer to go back or let user retry manually. User asked to "switch to quoted... in case admin forgot".
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Shipping Agency Inquiry</p>
            <p className="text-lg font-semibold">Manage PDF</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-2">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => inquiryId && fetchInquiry(String(inquiryId))}
              >
                <RefreshCw className="h-4 w-4" />
                Reload
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>PDF split view</CardTitle>
            <CardDescription>Left: user submission. Right: A4 quote mapped from the inquiry.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !inquiry ? (
              <div className="text-center text-muted-foreground py-16">
                <p>No inquiry data available.</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-4 min-h-[70vh]">
                <div className="w-full lg:w-80 shrink-0 rounded-md border bg-muted/40 p-3 space-y-3 overflow-auto">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Inquiry #{inquiry.id}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Status:</span> {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="text-sm"><span className="font-medium">Submitted:</span> {formatDate(inquiry.submittedAt)}</p>
                    <p className="text-sm"><span className="font-medium">Updated:</span> {formatDate(inquiry.updatedAt)}</p>
                    {inquiry.orderId && (
                      <p className="text-sm"><span className="font-medium">Order:</span> {inquiry.orderId}</p>
                    )}
                    {inquiry.processedBy && (
                      <p className="text-sm"><span className="font-medium">Processed by:</span> {inquiry.processedBy}</p>
                    )}
                  </div>

                  <div className="border-t pt-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Customer</p>
                    <p className="text-sm"><span className="font-medium">Name:</span> {toStringOrDash(inquiry.fullName)}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {toStringOrDash(inquiry.contactInfo)}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {toStringOrDash(inquiry.phone)}</p>
                    <p className="text-sm"><span className="font-medium">Company:</span> {toStringOrDash(inquiry.company)}</p>
                  </div>

                  <div className="border-t pt-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Vessel</p>
                    <p className="text-sm"><span className="font-medium">To:</span> {toStringOrDash(inquiry.toName)}</p>
                    <p className="text-sm"><span className="font-medium">MV:</span> {toStringOrDash(inquiry.mv)}</p>
                    <p className="text-sm"><span className="font-medium">ETA:</span> {formatDate(inquiry.eta, 'TBN')}</p>
                    <p className="text-sm"><span className="font-medium">GRT:</span> {toStringOrDash(inquiry.grt)}</p>
                    <p className="text-sm"><span className="font-medium">DWT:</span> {toStringOrDash(inquiry.dwt)}</p>
                    <p className="text-sm"><span className="font-medium">LOA:</span> {toStringOrDash(inquiry.loa)}</p>
                  </div>

                  <div className="border-t pt-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Cargo & Port</p>
                    <p className="text-sm"><span className="font-medium">Port of Call:</span> {toStringOrDash(inquiry.portOfCall)}</p>
                    <p className="text-sm"><span className="font-medium">Discharge/Loading:</span> {toStringOrDash(inquiry.dischargeLoadingLocation)}</p>
                    <p className="text-sm"><span className="font-medium">Cargo Type:</span> {toStringOrDash(inquiry.cargoType)}</p>
                    <p className="text-sm"><span className="font-medium">Cargo Name:</span> {toStringOrDash(inquiry.cargoName)}</p>
                    <p className="text-sm"><span className="font-medium">Cargo Other:</span> {toStringOrDash(inquiry.cargoNameOther)}</p>
                    <p className="text-sm"><span className="font-medium">Quantity (tons):</span> {toStringOrDash(inquiry.cargoQuantity)}</p>
                    <p className="text-sm"><span className="font-medium">FRT Tax Type:</span> {toStringOrDash(inquiry.frtTaxType)}</p>
                  </div>

                  <div className="border-t pt-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Optional services</p>
                    <p className="text-sm"><span className="font-medium">Boat hire:</span> {toStringOrDash(inquiry.boatHireAmount)}</p>
                    <p className="text-sm"><span className="font-medium">Tally fee:</span> {toStringOrDash(inquiry.tallyFeeAmount)}</p>
                    <p className="text-sm"><span className="font-medium">Transport LS:</span> {toStringOrDash(inquiry.transportLs)}</p>
                    <p className="text-sm"><span className="font-medium">Transport quarantine:</span> {toStringOrDash(inquiry.transportQuarantine)}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="text-sm text-foreground">A4 quote preview</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide">Berth hrs</span>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="1"
                          value={berthHoursInput}
                          onChange={(e) => setBerthHoursInput(e.target.value)}
                          className="h-8 w-24"
                          disabled={!isEditing}
                        />
                        <span className="text-xs text-muted-foreground">hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide">Anchorage hrs</span>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="1"
                          value={anchorageHoursInput}
                          onChange={(e) => setAnchorageHoursInput(e.target.value)}
                          className="h-8 w-24"
                          disabled={!isEditing}
                        />
                        <span className="text-xs text-muted-foreground">hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide">Pilotage 3rd miles</span>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={1}
                          step="1"
                          value={pilotageThirdMilesInput}
                          onChange={(e) => setPilotageThirdMilesInput(e.target.value)}
                          className="h-8 w-24"
                          disabled={!isEditing}
                        />
                        <span className="text-xs text-muted-foreground">miles</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 px-3" onClick={isEditing ? cancelEdit : startEdit}>
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                      <Button size="sm" className="h-8 px-3" onClick={applyHours} disabled={!isEditing}>
                        Apply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
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
                        disabled={!quoteHtml || loadingQuote}
                      >
                        <FileText className="h-4 w-4" />
                        Save PDF
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={transferToUser}
                        disabled={!quoteHtml || loadingQuote}
                      >
                        {loadingQuote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Transfer to User
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[65vh] rounded-md border overflow-hidden bg-white">
                    {loadingQuote ? (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : quoteHtml ? (
                      <iframe
                        srcDoc={quoteHtml}
                        className="w-full h-full border-0"
                        title="Quote Preview"
                        style={{ minHeight: '800px' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100 text-muted-foreground">
                        <FileText className="h-6 w-6 mr-2" />
                        No quote data yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showBackAlert} onOpenChange={setShowBackAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inquiry Status is PROCESSING</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to transfer this inquiry to the user (Status: QUOTED) before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={navigateBack}>No, just leave</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBackTransfer} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              Yes, Transfer to User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
