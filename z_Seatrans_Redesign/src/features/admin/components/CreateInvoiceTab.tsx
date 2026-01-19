"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { toast } from '@/shared/utils/toast'
import { Loader2, FileText, Eye } from 'lucide-react'
import { renderQuoteHtml as renderQuoteHtmlHcm, QuoteData, QuotePreview } from '@/modules/inquiries/components/common/Quote-hcm'
import { renderQuoteHtml as renderQuoteHtmlQn } from '@/modules/inquiries/components/common/Quote-qn'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

export function CreateInvoiceTab() {
  const [isLoading, setIsLoading] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  // Form fields
  const [quoteForm, setQuoteForm] = useState<'HCM' | 'QN'>('HCM')
  const [toShipowner, setToShipowner] = useState('')
  const [mv, setMv] = useState('')
  const [dwt, setDwt] = useState('')
  const [grt, setGrt] = useState('')
  const [loa, setLoa] = useState('')
  const [eta, setEta] = useState('')
  const [cargoType, setCargoType] = useState('')
  const [cargoQty, setCargoQty] = useState('')
  const [cargoName, setCargoName] = useState('')
  const [cargoNameOther, setCargoNameOther] = useState('')
  const [frtTaxType, setFrtTaxType] = useState('')
  const [port, setPort] = useState('')
  const [dischargeLoadingLocation, setDischargeLoadingLocation] = useState('')
  const [berthHours, setBerthHours] = useState('96')
  const [anchorageHours, setAnchorageHours] = useState('24')
  const [pilotageThirdMiles, setPilotageThirdMiles] = useState('17')
  const [boatHireAmount, setBoatHireAmount] = useState('')
  const [tallyFeeAmount, setTallyFeeAmount] = useState('')
  const [transportLs, setTransportLs] = useState('')
  const [transportQuarantine, setTransportQuarantine] = useState('')

  const handlePreview = async () => {
    setIsLoading(true)
    try {
      // Fetch template
      const res = await fetch('/templates/quote.html')
      if (!res.ok) throw new Error('Template not found')
      const template = await res.text()

      // Build quote data
      const quoteData: QuoteData = {
        to_shipowner: toShipowner,
        date: eta || new Date().toISOString().split('T')[0],
        ref: undefined,
        mv: mv,
        dwt: dwt,
        grt: grt,
        loa: loa,
        eta: eta || 'TBN',
        cargo_qty_mt: cargoQty,
        cargo_name_upper: (cargoName === 'OTHER' ? cargoNameOther : cargoName).toUpperCase(),
        cargo_type: cargoType,
        port_upper: port.toUpperCase(),
        loading_term: dischargeLoadingLocation,
        at_berth: dischargeLoadingLocation === 'Berth' ? 'X' : undefined,
        at_anchorage: dischargeLoadingLocation === 'Anchorage' ? 'X' : undefined,
        transport_ls: transportLs ? Number(transportLs) : undefined,
        transport_quarantine: transportQuarantine ? Number(transportQuarantine) : undefined,
        boat_hire_entry: boatHireAmount ? Number(boatHireAmount) : undefined,
        tally_fee: tallyFeeAmount ? Number(tallyFeeAmount) : undefined,
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
        berth_hours: Number(berthHours),
        anchorage_hours: Number(anchorageHours),
        pilotage_third_miles: Number(pilotageThirdMiles),
      }

      // Render HTML
      const renderer = quoteForm === 'QN' ? renderQuoteHtmlQn : renderQuoteHtmlHcm
      const html = renderer(template, quoteData)
      
      setPreviewHtml(html)
      setShowPreview(true)
    } catch (err) {
      console.error('Failed to generate preview:', err)
      toast.error('Failed to generate invoice preview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePdf = async () => {
    if (!previewHtml) return

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
    iframeDoc.write(previewHtml)
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
  }

  const handleReset = () => {
    setToShipowner('')
    setMv('')
    setDwt('')
    setGrt('')
    setLoa('')
    setEta('')
    setCargoType('')
    setCargoQty('')
    setCargoName('')
    setCargoNameOther('')
    setFrtTaxType('')
    setPort('')
    setDischargeLoadingLocation('')
    setBerthHours('96')
    setAnchorageHours('24')
    setPilotageThirdMiles('17')
    setBoatHireAmount('')
    setTallyFeeAmount('')
    setTransportLs('')
    setTransportQuarantine('')
    setPreviewHtml(null)
    setShowPreview(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create New Invoice</CardTitle>
          <CardDescription>Generate a shipping agency invoice without an inquiry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Quote Form Selection */}
            <div className="grid gap-2">
              <Label htmlFor="quoteForm">Quote Form Type</Label>
              <Select value={quoteForm} onValueChange={(value) => setQuoteForm(value as 'HCM' | 'QN')}>
                <SelectTrigger id="quoteForm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HCM">Ho Chi Minh (HCM)</SelectItem>
                  <SelectItem value="QN">Quy Nhon (QN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="toShipowner">To (Ship Owner/Company) *</Label>
                <Input
                  id="toShipowner"
                  value={toShipowner}
                  onChange={(e) => setToShipowner(e.target.value)}
                  placeholder="Enter recipient name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="eta">ETA (Date)</Label>
                <DatePicker
                  id="eta"
                  value={eta}
                  onChange={(date) => setEta(date)}
                  placeholder="Select ETA date"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mv">M/V (Vessel Name) *</Label>
                <Input
                  id="mv"
                  value={mv}
                  onChange={(e) => setMv(e.target.value)}
                  placeholder="Enter vessel name"
                  required
                />
              </div>
            </div>

            {/* Vessel Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dwt">DWT (tons)</Label>
                <Input
                  id="dwt"
                  type="number"
                  value={dwt}
                  onChange={(e) => setDwt(e.target.value)}
                  placeholder="Dead Weight Tonnage"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="grt">GRT (tons)</Label>
                <Input
                  id="grt"
                  type="number"
                  value={grt}
                  onChange={(e) => setGrt(e.target.value)}
                  placeholder="Gross Register Tonnage"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="loa">LOA (meters)</Label>
                <Input
                  id="loa"
                  type="number"
                  value={loa}
                  onChange={(e) => setLoa(e.target.value)}
                  placeholder="Length Overall"
                />
              </div>
            </div>

            {/* Cargo Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cargoType">Cargo Type *</Label>
                <Select value={cargoType} onValueChange={setCargoType}>
                  <SelectTrigger id="cargoType">
                    <SelectValue placeholder="Select cargo type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN BULK">IN BULK</SelectItem>
                    <SelectItem value="IN BAGS">IN BAGS</SelectItem>
                    <SelectItem value="IN EQUIPMENT">IN EQUIPMENT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cargoName">Cargo Name *</Label>
                <Select value={cargoName} onValueChange={setCargoName}>
                  <SelectTrigger id="cargoName">
                    <SelectValue placeholder="Select cargo name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WOOD PELLET">WOOD PELLET</SelectItem>
                    <SelectItem value="WOODCHIP">WOODCHIP</SelectItem>
                    <SelectItem value="EQUIPMENT">EQUIPMENT</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {cargoName === 'OTHER' && (
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="cargoNameOther">Cargo name (if OTHER) *</Label>
                  <Input
                    id="cargoNameOther"
                    value={cargoNameOther}
                    onChange={(e) => setCargoNameOther(e.target.value)}
                    placeholder="Enter cargo name"
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="cargoQty">Quantity (tons) *</Label>
                <Input
                  id="cargoQty"
                  type="number"
                  value={cargoQty}
                  onChange={(e) => setCargoQty(e.target.value)}
                  placeholder="e.g., 15000"
                  required
                />
              </div>
            </div>

            {/* Trade & Port */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="frtTaxType">Frt tax type (import/export) *</Label>
                <Select value={frtTaxType} onValueChange={setFrtTaxType}>
                  <SelectTrigger id="frtTaxType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Import">Import</SelectItem>
                    <SelectItem value="Export">Export</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Export may incur freight tax; import may not.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="port">Port of Call *</Label>
                <Input
                  id="port"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="e.g., Quy Nhon, HCM..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dischargeLoadingLocation">Discharge/Loading at *</Label>
                <Select value={dischargeLoadingLocation} onValueChange={setDischargeLoadingLocation}>
                  <SelectTrigger id="dischargeLoadingLocation">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Berth">Berth</SelectItem>
                    <SelectItem value="Anchorage">Anchorage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Service Options */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="boatHireAmount">Boat-hire for entry quarantine (USD)</Label>
                <Input
                  id="boatHireAmount"
                  type="number"
                  value={boatHireAmount}
                  onChange={(e) => setBoatHireAmount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tallyFeeAmount">Ship's side tally fee (USD)</Label>
                <Input
                  id="tallyFeeAmount"
                  type="number"
                  value={tallyFeeAmount}
                  onChange={(e) => setTallyFeeAmount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transportLs">Transport/Communication in L/S (optional)</Label>
                <Input
                  id="transportLs"
                  type="number"
                  value={transportLs}
                  onChange={(e) => setTransportLs(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transportQuarantine">Transport for entry quarantine formality (optional)</Label>
                <Input
                  id="transportQuarantine"
                  type="number"
                  value={transportQuarantine}
                  onChange={(e) => setTransportQuarantine(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Hours Configuration */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="berthHours">Berth Hours</Label>
                <Input
                  id="berthHours"
                  type="number"
                  value={berthHours}
                  onChange={(e) => setBerthHours(e.target.value)}
                  min="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="anchorageHours">Anchorage Hours</Label>
                <Input
                  id="anchorageHours"
                  type="number"
                  value={anchorageHours}
                  onChange={(e) => setAnchorageHours(e.target.value)}
                  min="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pilotageThirdMiles">Pilotage 3rd Miles</Label>
                <Input
                  id="pilotageThirdMiles"
                  type="number"
                  value={pilotageThirdMiles}
                  onChange={(e) => setPilotageThirdMiles(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handlePreview}
                disabled={
                  isLoading || 
                  !toShipowner || 
                  !mv || 
                  !cargoType || 
                  !cargoName || 
                  (cargoName === 'OTHER' && !cargoNameOther) ||
                  !cargoQty || 
                  !frtTaxType ||
                  !port || 
                  !dischargeLoadingLocation
                }
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview Invoice
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset Form
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Review the generated invoice before saving
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-4 min-h-[70vh]">
              <div className="flex-1 min-h-[70vh] rounded-md border overflow-hidden bg-white">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : previewHtml ? (
                  <QuotePreview html={previewHtml} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-muted-foreground">
                    <FileText className="h-10 w-10 mr-2" />
                    No preview available
                  </div>
                )}
              </div>
            </div>

            {previewHtml && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleSavePdf} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Save PDF
                </Button>
                <Button variant="secondary" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
