"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { toast } from '@/shared/utils/toast'
import { Loader2, FileText, Eye } from 'lucide-react'
import {
  renderQuoteHtml as renderQuoteHtmlHcm,
  type QuoteData as HcmQuoteData,
  QuotePreview,
} from '@/modules/inquiries/components/common/Quote-hcm'
import {
  renderQuoteHtml as renderQuoteHtmlQn,
  type QuoteData as QnQuoteData,
} from '@/modules/inquiries/components/common/Quote-qn'
import { imageTypeService, type CargoType, type ImageType } from '@/modules/gallery/services/imageTypeService'
import { serviceTypeService } from '@/modules/service-types/services/serviceTypeService'
import { provinceService, type Province } from '@/modules/logistics/services/provinceService'
import { portService, type Port as LogisticsPort } from '@/modules/logistics/services/portService'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

type EpdaCargoType = CargoType
type InvoiceQuoteData = HcmQuoteData & QnQuoteData

const CARGO_TYPE_OPTIONS: { value: EpdaCargoType; label: string }[] = [
  { value: 'IN_BULK', label: 'in bulk' },
  { value: 'IN_BAG_PACK', label: 'in bag/pack' },
]

const AREA_OPTIONS = ['NORTHERN', 'MIDDLE', 'SOUTHERN'] as const
type AreaOption = typeof AREA_OPTIONS[number]

function getCargoTypeLabel(value: EpdaCargoType): string {
  return CARGO_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function CreateInvoiceTab() {
  const [isLoading, setIsLoading] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [cargoTypeCatalog, setCargoTypeCatalog] = useState<ImageType[]>([])
  const [isLoadingCargoCatalog, setIsLoadingCargoCatalog] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [ports, setPorts] = useState<LogisticsPort[]>([])
  const [isLoadingPorts, setIsLoadingPorts] = useState(false)
  
  // Form fields
  const [quoteForm, setQuoteForm] = useState<'HCM' | 'QN'>('HCM')
  const [selectedArea, setSelectedArea] = useState<AreaOption | ''>('')
  const [toShipowner, setToShipowner] = useState('')
  const [mv, setMv] = useState('')
  const [dwt, setDwt] = useState('')
  const [grt, setGrt] = useState('')
  const [loa, setLoa] = useState('')
  const [eta, setEta] = useState('')
  const [cargoType, setCargoType] = useState<EpdaCargoType | ''>('')
  const [cargoQty, setCargoQty] = useState('')
  const [cargoName, setCargoName] = useState('')
  const [frtTaxType, setFrtTaxType] = useState('')
  const [port, setPort] = useState('')
  const [dischargeLoadingLocation, setDischargeLoadingLocation] = useState('')
  const [berthHours, setBerthHours] = useState('96')
  const [anchorageHours, setAnchorageHours] = useState('24')
  const [pilotageThirdMiles, setPilotageThirdMiles] = useState('17')
  const [qnPilotageMiles, setQnPilotageMiles] = useState('1')
  const [boatHireAmount, setBoatHireAmount] = useState('')
  const [tallyFeeAmount, setTallyFeeAmount] = useState('')
  const [transportLs, setTransportLs] = useState('')

  useEffect(() => {
    const loadCargoTypeCatalog = async () => {
      try {
        setIsLoadingCargoCatalog(true)
        const serviceTypes = await serviceTypeService.getAllServiceTypes()
        const shippingAgency = serviceTypes.find((service) => {
          const normalized = (service.name || '').toUpperCase().replace(/[\s-]+/g, '_')
          return normalized === 'SHIPPING_AGENCY'
        })

        if (!shippingAgency?.id) {
          setCargoTypeCatalog([])
          toast.error('Shipping Agency service type not found')
          return
        }

        const imageTypes = await imageTypeService.getImageTypesByServiceType(shippingAgency.id)
        setCargoTypeCatalog(Array.isArray(imageTypes) ? imageTypes : [])
      } catch (error) {
        console.error('Failed to load commodity catalog for EPDA:', error)
        toast.error('Failed to load cargo names from database')
        setCargoTypeCatalog([])
      } finally {
        setIsLoadingCargoCatalog(false)
      }
    }

    void loadCargoTypeCatalog()
  }, [])

  useEffect(() => {
    const loadAreaAndPorts = async () => {
      try {
        setIsLoadingPorts(true)
        const [provinceData, portData] = await Promise.all([
          provinceService.getAllProvinces(),
          portService.getAllPorts(),
        ])
        setProvinces(Array.isArray(provinceData) ? provinceData : [])
        setPorts(Array.isArray(portData) ? portData : [])
      } catch (error) {
        console.error('Failed to load area and ports for EPDA:', error)
        toast.error('Failed to load port list by area')
        setProvinces([])
        setPorts([])
      } finally {
        setIsLoadingPorts(false)
      }
    }

    void loadAreaAndPorts()
  }, [])

  useEffect(() => {
    if (!selectedArea) {
      setQuoteForm('HCM')
      setPort('')
      return
    }

    setQuoteForm(selectedArea === 'MIDDLE' ? 'QN' : 'HCM')
    setPort('')
  }, [selectedArea])

  const portsByArea = useMemo(() => {
    if (!selectedArea) return []

    const provinceIdsInArea = new Set(
      provinces
        .filter((province) => province.area === selectedArea)
        .map((province) => province.id)
    )

    const areaPorts = ports
      .filter((item) => provinceIdsInArea.has(item.provinceId) && item.portOfCall?.trim())
      .sort((a, b) => (a.portOfCall || '').localeCompare(b.portOfCall || ''))

    const seen = new Set<string>()
    return areaPorts.filter((item) => {
      const value = item.portOfCall as string
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  }, [ports, provinces, selectedArea])

  const filteredCargoNames = useMemo(() => {
    if (!cargoType) return []
    return cargoTypeCatalog.filter((item) => item.cargoType === cargoType)
  }, [cargoType, cargoTypeCatalog])

  useEffect(() => {
    if (!cargoType) {
      setCargoName('')
      return
    }

    const stillValid = filteredCargoNames.some((item) => item.name === cargoName)
    if (!stillValid) {
      setCargoName('')
    }
  }, [cargoType, cargoName, filteredCargoNames])

  useEffect(() => {
    if (cargoType === 'IN_BULK') {
      setTallyFeeAmount('')
    }
  }, [cargoType])

  const handlePreview = async () => {
    setIsLoading(true)
    try {
      // Fetch template
      const res = await fetch('/templates/quote.html')
      if (!res.ok) throw new Error('Template not found')
      const template = await res.text()

      const selectedCargo = filteredCargoNames.find((item) => item.name === cargoName)
      const cargoDisplayName = (selectedCargo?.displayName || cargoName || '').trim()

      // Build quote data
      const quoteData: InvoiceQuoteData = {
        to_shipowner: toShipowner,
        date: eta || new Date().toISOString().split('T')[0],
        ref: undefined,
        mv: mv,
        dwt: dwt,
        grt: grt,
        loa: loa,
        eta: eta || 'TBN',
        cargo_qty_mt: cargoQty,
        cargo_name_upper: cargoDisplayName.toUpperCase(),
        cargo_type: cargoType ? getCargoTypeLabel(cargoType) : '',
        port_upper: port.toUpperCase(),
        loading_term: dischargeLoadingLocation,
        at_berth: dischargeLoadingLocation === 'Berth' ? 'X' : undefined,
        at_anchorage: dischargeLoadingLocation === 'Anchorage' ? 'X' : undefined,
        transport_ls: transportLs ? Number(transportLs) : undefined,
        transport_quarantine: undefined,
        boat_hire_entry: boatHireAmount ? Number(boatHireAmount) : undefined,
        tally_fee: cargoType === 'IN_BULK' ? undefined : tallyFeeAmount ? Number(tallyFeeAmount) : undefined,
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
        pilotage_miles: quoteForm === 'QN' ? Number(qnPilotageMiles || '1') : undefined,
        pilotage_third_miles: quoteForm === 'HCM' ? Number(pilotageThirdMiles) : undefined,
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
    setSelectedArea('')
    setQuoteForm('HCM')
    setToShipowner('')
    setMv('')
    setDwt('')
    setGrt('')
    setLoa('')
    setEta('')
    setCargoType('')
    setCargoQty('')
    setCargoName('')
    setFrtTaxType('')
    setPort('')
    setDischargeLoadingLocation('')
    setBerthHours('96')
    setAnchorageHours('24')
    setPilotageThirdMiles('17')
    setQnPilotageMiles('1')
    setBoatHireAmount('')
    setTallyFeeAmount('')
    setTransportLs('')
    setPreviewHtml(null)
    setShowPreview(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create New EPDA</CardTitle>
          <CardDescription>Generate a shipping agency EPDA without an inquiry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Quote Form Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="portArea">SELECT PORT AREA</Label>
                <Select value={selectedArea} onValueChange={(value) => setSelectedArea(value as AreaOption)}>
                  <SelectTrigger id="portArea">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREA_OPTIONS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="portOfCallSelect">PORT OF CALL</Label>
                  {selectedArea && (
                    <p className="text-xs text-muted-foreground">
                      Template: {quoteForm === 'QN' ? 'Quy Nhon (QN)' : 'Ho Chi Minh (HCM)'}
                    </p>
                  )}
                </div>
                <Select
                  value={port}
                  onValueChange={setPort}
                  disabled={!selectedArea || isLoadingPorts}
                >
                  <SelectTrigger id="portOfCallSelect">
                    <SelectValue
                      placeholder={
                        !selectedArea
                          ? 'Select area first'
                          : isLoadingPorts
                            ? 'Loading ports...'
                            : 'Select port of call'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {portsByArea.map((item) => (
                      <SelectItem key={item.id} value={item.portOfCall as string}>
                        {item.portOfCall}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="toShipowner">To (Ship Owner/Company) *</Label>
                <Input
                  id="toShipowner"
                  value={toShipowner}
                  onChange={(e) => setToShipowner(e.target.value)}
                  placeholder="Enter shipowner/company name"
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
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cargoType">Cargo Type *</Label>
                  <Select
                    value={cargoType}
                    onValueChange={(value) => setCargoType(value as EpdaCargoType)}
                  >
                    <SelectTrigger id="cargoType">
                      <SelectValue placeholder="Select cargo type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARGO_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cargoName">Cargo Name *</Label>
                  <Select value={cargoName} onValueChange={setCargoName}>
                    <SelectTrigger id="cargoName">
                      <SelectValue
                        placeholder={
                          isLoadingCargoCatalog
                            ? 'Loading cargo names...'
                            : cargoType
                              ? 'Select cargo name'
                              : 'Select cargo type first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCargoNames.map((item) => (
                        <SelectItem key={item.id} value={item.name}>
                          {item.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Trade */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="frtTaxType">Frt tax type (import/export) *</Label>
                  <p className="text-xs text-muted-foreground">Export may incur freight tax; import may not.</p>
                </div>
                <Select value={frtTaxType} onValueChange={setFrtTaxType}>
                  <SelectTrigger id="frtTaxType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Import">Import</SelectItem>
                    <SelectItem value="Export">Export</SelectItem>
                  </SelectContent>
                </Select>
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

              {quoteForm === 'QN' ? (
                <div className="grid gap-2">
                  <Label htmlFor="qnPilotageMiles">Pilotage Miles</Label>
                  <Input
                    id="qnPilotageMiles"
                    type="number"
                    value={qnPilotageMiles}
                    onChange={(e) => setQnPilotageMiles(e.target.value)}
                    min="1"
                  />
                </div>
              ) : (
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
              )}
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

              {cargoType !== 'IN_BULK' && (
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
              )}

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
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handlePreview}
                disabled={
                  isLoading || 
                  isLoadingCargoCatalog ||
                  isLoadingPorts ||
                  !selectedArea ||
                  !toShipowner || 
                  !mv || 
                  !cargoType || 
                  !cargoName || 
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
