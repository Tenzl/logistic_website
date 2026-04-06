"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
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
import { imageTypeService, type CargoType, type CargoTypeCatalogItem, type ImageType } from '@/modules/gallery/services/imageTypeService'
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
import { CreateInvoiceQnForm } from '@/features/admin/components/invoice/CreateInvoiceQnForm'
import { CreateInvoiceHcmForm } from '@/features/admin/components/invoice/CreateInvoiceHcmForm'
import type { AgencyFeeModeOption } from '@/features/admin/components/invoice/CreateInvoiceVariantForm'
import {
  buildRequiredFields,
  getMissingRequiredFields,
  getRequiredFieldState,
} from '@/features/admin/components/invoice/invoiceValidation'
import { buildInvoiceQuoteData } from '@/features/admin/components/invoice/buildInvoiceQuoteData'

type EpdaCargoType = CargoType

const AREA_OPTIONS = ['NORTHERN', 'MIDDLE', 'SOUTHERN'] as const
type AreaOption = typeof AREA_OPTIONS[number]

const PURPOSE_OPTIONS = [
  { value: 'NHAP_XUAT', label: 'Nhập - Xuất' },
  { value: 'NHAP_CHUYEN_CANG', label: 'Nhập - Chuyển cảng' },
  { value: 'CHUYEN_CANG_XUAT', label: 'Chuyển cảng - Xuất' },
  { value: 'CHUYEN_CANG_CHUYEN_CANG', label: 'Chuyển cảng - Chuyển cảng' },
  { value: 'MUC_DICH_KHAC', label: 'Mục đích khác' },
] as const
type PurposeOption = typeof PURPOSE_OPTIONS[number]['value']

const SHIP_TYPE_OPTIONS = [
  { value: 'BULK_SHIP', label: 'Bulk-ship' },
  { value: 'TANKER_SHIP', label: 'Tanker ship' },
] as const
type ShipTypeOption = typeof SHIP_TYPE_OPTIONS[number]['value']

const FRT_TAX_TYPE_OPTIONS = [
  { value: 'Import', label: 'Import - No freight tax' },
  { value: 'Export - Pls Advise', label: 'Export - Pls Advise' },
  { value: 'Export - Freight rate declaration', label: 'Export - Freight rate declaration' },
] as const
type FrtTaxTypeOption = typeof FRT_TAX_TYPE_OPTIONS[number]['value']

const AGENCY_FEE_MODE_OPTIONS = [
  { value: 'TARRIF_AGENCY', label: 'TARRIF AGENCY' },
  { value: 'AGENCY_IN_LUMPSUM', label: 'AGENCY IN LUMPSUM' },
] as const

const QUARANTINE_CARGO_OPTIONS = [
  { value: 'ONE_LEG', label: 'Chỉ xếp hoặc dở hàng', fee: 100, trips: 1 },
  { value: 'BOTH_LEGS', label: 'Xếp và dở hàng', fee: 200, trips: 2 },
  { value: 'OTHER', label: 'Khác (cấp nước / sửa chữa / crew change ...)', fee: 0, trips: 0 },
] as const
type QuarantineCargoOption = typeof QUARANTINE_CARGO_OPTIONS[number]['value']

const normalizeCargoTypeCode = (value: string) => value.trim().toUpperCase().replace(/[\s-]+/g, '_')

const isTallyFeeEligibleCargo = (value: string) => {
  const normalized = normalizeCargoTypeCode(value)
  return normalized.includes('IN_BAGS') || normalized.includes('EQUIPMENT')
}

const parseNumeric = (value: string) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const normalizePurpose = (value: string) => value.trim().toUpperCase().replace(/[\s-]+/g, '_')

const canEnableFreightTaxByPurpose = (purpose: string) => {
  const normalized = normalizePurpose(purpose)
  return normalized === 'NHAP_XUAT' || normalized === 'CHUYEN_CANG_XUAT'
}

const getShipQuarantineTrips = (purpose: string) => {
  const normalized = normalizePurpose(purpose)
  if (normalized === 'NHAP_XUAT') return 2
  if (normalized === 'NHAP_CHUYEN_CANG' || normalized === 'CHUYEN_CANG_XUAT') return 1
  return 0
}

const formatUsdAmount = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const normalizeFrtTaxType = (value: string) => value.trim().toUpperCase().replace(/[\s-]+/g, '_')

const isExportTotalAmountMode = (value: string) => {
  const normalized = normalizeFrtTaxType(value)
  return normalized === 'EXPORT_FREIGHT_RATE_DECLARATION'
}

const isExportPlsAdviseMode = (value: string) => normalizeFrtTaxType(value) === 'EXPORT_PLS_ADVISE'

const isImportFrtTaxType = (value: string) => normalizeFrtTaxType(value) === 'IMPORT'

export function CreateInvoiceTab() {
  const formNavRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [cargoTypeOptions, setCargoTypeOptions] = useState<CargoTypeCatalogItem[]>([])
  const [cargoTypeCatalog, setCargoTypeCatalog] = useState<ImageType[]>([])
  const [isLoadingCargoCatalog, setIsLoadingCargoCatalog] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [ports, setPorts] = useState<LogisticsPort[]>([])
  const [isLoadingPorts, setIsLoadingPorts] = useState(false)
  
  // Form fields
  const [quoteForm, setQuoteForm] = useState<'HCM' | 'QN'>('HCM')
  const [formCreatedDate, setFormCreatedDate] = useState(() => new Date().toISOString().split('T')[0])
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
  const [frtTaxType, setFrtTaxType] = useState<FrtTaxTypeOption | ''>('')
  const [oceanFrtRateUsdPerMt, setOceanFrtRateUsdPerMt] = useState('')
  const [garbageCbmAmount, setGarbageCbmAmount] = useState('1')
  const [purposeOfCalling, setPurposeOfCalling] = useState<PurposeOption | ''>('')
  const [shipType, setShipType] = useState<ShipTypeOption>('BULK_SHIP')
  const [port, setPort] = useState('')
  const [dischargeLoadingLocation, setDischargeLoadingLocation] = useState('')
  const [berthHours, setBerthHours] = useState('96')
  const [anchorageHours, setAnchorageHours] = useState('24')
  const [pilotageThirdMiles, setPilotageThirdMiles] = useState('17')
  const [qnPilotageMiles, setQnPilotageMiles] = useState('5')
  const [boatHireAmount, setBoatHireAmount] = useState('')
  const [boatHireQuarantineAmount, setBoatHireQuarantineAmount] = useState('')
  const [tallyFeeAmount, setTallyFeeAmount] = useState('')
  const [transportLs, setTransportLs] = useState('')
  const [quarantineCargoMode, setQuarantineCargoMode] = useState<QuarantineCargoOption>('ONE_LEG')
  const [agencyFeeMode, setAgencyFeeMode] = useState<AgencyFeeModeOption>('TARRIF_AGENCY')
  const [agencyDiscountPercent, setAgencyDiscountPercent] = useState('')
  const [agencyLumpsumAmount, setAgencyLumpsumAmount] = useState('')

  const getRequiredState = (value: string | null | undefined) => getRequiredFieldState(value, showValidationErrors)
  const canEnableFreightTaxDeclaration = useMemo(
    () => canEnableFreightTaxByPurpose(purposeOfCalling),
    [purposeOfCalling]
  )

  const requiredFields = useMemo(
    () =>
      buildRequiredFields({
        toShipowner,
        mv,
        dischargeLoadingLocation,
        dwt,
        grt,
        loa,
        cargoQty,
        cargoType,
        cargoName,
        purposeOfCalling,
        frtTaxType,
      }, { requireFrtTaxType: canEnableFreightTaxDeclaration }),
    [toShipowner, mv, dischargeLoadingLocation, dwt, grt, loa, cargoQty, cargoType, cargoName, purposeOfCalling, frtTaxType]
  )

  const missingRequiredFields = useMemo(
    () => getMissingRequiredFields(requiredFields),
    [requiredFields]
  )

  const shipQuarantineFee = useMemo(() => {
    const grtValue = parseNumeric(grt)
    const trips = getShipQuarantineTrips(purposeOfCalling)
    if (!grtValue || trips <= 0) return 0
    const unitRate = grtValue >= 10000 ? 110 : 95
    return unitRate * trips
  }, [grt, purposeOfCalling])

  const cargoQuarantineFee = useMemo(() => {
    const purposeNormalized = normalizePurpose(purposeOfCalling)
    if (purposeNormalized === 'MUC_DICH_KHAC') return 0

    const cargoQtyValue = parseNumeric(cargoQty)
    if (!cargoQtyValue || cargoQtyValue <= 0) return 0

    const selectedOption = QUARANTINE_CARGO_OPTIONS.find((option) => option.value === quarantineCargoMode)
    return selectedOption?.fee ?? 100
  }, [cargoQty, purposeOfCalling, quarantineCargoMode])

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
          setCargoTypeOptions([])
          setCargoTypeCatalog([])
          toast.error('Shipping Agency service type not found')
          return
        }

        const [cargoTypes, imageTypes] = await Promise.all([
          imageTypeService.getCargoTypesByServiceType(shippingAgency.id),
          imageTypeService.getImageTypesByServiceType(shippingAgency.id),
        ])

        setCargoTypeOptions(Array.isArray(cargoTypes) ? cargoTypes : [])
        setCargoTypeCatalog(Array.isArray(imageTypes) ? imageTypes : [])
      } catch (error) {
        console.error('Failed to load cargo type catalog for EPDA:', error)
        toast.error('Failed to load cargo names from database')
        setCargoTypeOptions([])
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
    if (!cargoType || !isTallyFeeEligibleCargo(cargoType)) {
      setTallyFeeAmount('')
    }
  }, [cargoType])

  useEffect(() => {
    if (dischargeLoadingLocation !== 'Anchorage') {
      setBoatHireAmount('')
    }
  }, [dischargeLoadingLocation])

  useEffect(() => {
    if (agencyFeeMode === 'AGENCY_IN_LUMPSUM') {
      setTransportLs('')
      setBoatHireAmount('')
      return
    }

    setAgencyLumpsumAmount('')
  }, [agencyFeeMode])

  useEffect(() => {
    if (!cargoType) return
    const stillValid = cargoTypeOptions.some((item) => item.code === cargoType)
    if (!stillValid) {
      setCargoType('')
    }
  }, [cargoType, cargoTypeOptions])

  useEffect(() => {
    if (!canEnableFreightTaxDeclaration) {
      setFrtTaxType('')
      setOceanFrtRateUsdPerMt('')
    }
  }, [canEnableFreightTaxDeclaration])

  useEffect(() => {
    if (!frtTaxType) {
      setOceanFrtRateUsdPerMt('')
      return
    }

    if (isImportFrtTaxType(frtTaxType)) {
      setOceanFrtRateUsdPerMt('')
      return
    }

    if (isExportPlsAdviseMode(frtTaxType)) {
      setOceanFrtRateUsdPerMt('')
    }
  }, [frtTaxType])

  const handlePreview = async () => {
    setShowValidationErrors(true)
    if (missingRequiredFields.length > 0) {
      toast.error('Vui lòng nhập đầy đủ các trường bắt buộc (*) trước khi xem preview')
      return
    }

    setIsLoading(true)
    try {
      // Fetch template
      const res = await fetch('/templates/quote.html')
      if (!res.ok) throw new Error('Template not found')
      const template = await res.text()

      const quoteData = buildInvoiceQuoteData({
        quoteForm,
        formCreatedDate,
        toShipowner,
        mv,
        dwt,
        grt,
        loa,
        eta,
        cargoQty,
        cargoName,
        cargoType,
        cargoTypeOptions,
        filteredCargoNames,
        shipType,
        port,
        frtTaxType,
        shouldIncludeOceanFrtRate: isExportTotalAmountMode(frtTaxType),
        oceanFrtRateUsdPerMt,
        garbageCbmAmount,
        purposeOfCalling,
        dischargeLoadingLocation,
        transportLs,
        boatHireQuarantineAmount,
        quarantineCargoMode,
        quarantineCargoOptions: QUARANTINE_CARGO_OPTIONS,
        boatHireAmount,
        agencyFeeMode,
        agencyDiscountPercent,
        agencyLumpsumAmount,
        isTallyFeeEligible: Boolean(cargoType && isTallyFeeEligibleCargo(cargoType)),
        tallyFeeAmount,
        berthHours,
        buoyDueHours: quoteForm === 'HCM' && dischargeLoadingLocation === 'Anchorage' ? berthHours : '',
        anchorageHours,
        qnPilotageMiles,
        pilotageThirdMiles,
      })

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
    setShowValidationErrors(false)
    setSelectedArea('')
    setQuoteForm('HCM')
    setFormCreatedDate(new Date().toISOString().split('T')[0])
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
    setOceanFrtRateUsdPerMt('')
    setGarbageCbmAmount('1')
    setPurposeOfCalling('')
    setShipType('BULK_SHIP')
    setPort('')
    setDischargeLoadingLocation('')
    setBerthHours('96')
    setAnchorageHours('24')
    setPilotageThirdMiles('17')
    setQnPilotageMiles('5')
    setBoatHireAmount('')
    setBoatHireQuarantineAmount('')
    setTallyFeeAmount('')
    setTransportLs('')
    setQuarantineCargoMode('ONE_LEG')
    setAgencyFeeMode('TARRIF_AGENCY')
    setAgencyDiscountPercent('')
    setAgencyLumpsumAmount('')
    setPreviewHtml(null)
    setShowPreview(false)
  }

  const handleFormEnterNavigation = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return

    const target = event.target as HTMLElement | null
    if (!(target instanceof HTMLInputElement) || target.disabled || target.readOnly) return

    const container = formNavRef.current
    if (!container) return

    const focusableFields = Array.from(
      container.querySelectorAll<HTMLElement>(
        "input:not([type='hidden']):not([disabled]):not([readonly]), button#eta:not([disabled]), button[role='combobox']:not([disabled])"
      )
    )

    const currentIndex = focusableFields.indexOf(target)
    if (currentIndex < 0) return

    const nextField = focusableFields[currentIndex + 1]
    if (!nextField) return

    event.preventDefault()
    nextField.focus()
  }

  const formValues = {
    toShipowner,
    eta,
    mv,
    dischargeLoadingLocation,
    dwt,
    grt,
    loa,
    cargoQty,
    cargoType,
    cargoName,
    shipType,
    berthHours,
    anchorageHours,
    qnPilotageMiles,
    pilotageThirdMiles,
    garbageCbmAmount,
    purposeOfCalling,
    quarantineCargoMode,
    frtTaxType,
    tallyFeeAmount,
    oceanFrtRateUsdPerMt,
    transportLs,
    boatHireAmount,
    boatHireQuarantineAmount,
    agencyFeeMode,
    agencyDiscountPercent,
    agencyLumpsumAmount,
  }

  const formHandlers = {
    setToShipowner,
    setEta,
    setMv,
    setDischargeLoadingLocation,
    setDwt,
    setGrt,
    setLoa,
    setCargoQty,
    setCargoType: (value: CargoType) => setCargoType(value as EpdaCargoType),
    setCargoName,
    setShipType: (value: 'BULK_SHIP' | 'TANKER_SHIP') => setShipType(value),
    setBerthHours,
    setAnchorageHours,
    setQnPilotageMiles,
    setPilotageThirdMiles,
    setGarbageCbmAmount,
    setPurposeOfCalling: (value: PurposeOption) => setPurposeOfCalling(value),
    setQuarantineCargoMode: (value: QuarantineCargoOption) => setQuarantineCargoMode(value),
    setFrtTaxType: (value: FrtTaxTypeOption) => setFrtTaxType(value),
    setTallyFeeAmount,
    setOceanFrtRateUsdPerMt,
    setTransportLs,
    setBoatHireAmount,
    setBoatHireQuarantineAmount,
    setAgencyFeeMode: (value: AgencyFeeModeOption) => setAgencyFeeMode(value),
    setAgencyDiscountPercent,
    setAgencyLumpsumAmount,
  }

  const formOptions = {
    cargoTypeOptions,
    filteredCargoNames,
    shipTypeOptions: SHIP_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    purposeOptions: PURPOSE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    quarantineCargoOptions: QUARANTINE_CARGO_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    frtTaxTypeOptions: FRT_TAX_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    agencyFeeModeOptions: AGENCY_FEE_MODE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
  }

  const formComputed = {
    isLoadingCargoCatalog,
    isTallyFeeEligibleCargo: Boolean(cargoType && isTallyFeeEligibleCargo(cargoType)),
    shipQuarantineFee: formatUsdAmount(shipQuarantineFee),
    cargoQuarantineFee: formatUsdAmount(cargoQuarantineFee),
    isImportFrtTaxType: isImportFrtTaxType(frtTaxType),
    isExportPlsAdviseMode: isExportPlsAdviseMode(frtTaxType),
    canEnableFreightTaxDeclaration,
    isOceanFreightInputDisabled: !canEnableFreightTaxDeclaration || isExportPlsAdviseMode(frtTaxType) || isImportFrtTaxType(frtTaxType),
    frtHint: !canEnableFreightTaxDeclaration
      ? 'N/A'
      : isImportFrtTaxType(frtTaxType)
      ? '0'
      : isExportPlsAdviseMode(frtTaxType)
        ? 'pls advise'
        : `Frt USD${oceanFrtRateUsdPerMt || '16'}/mt x abt ${cargoQty || '0'}mts x 2%`,
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create New EPDA</CardTitle>
          <CardDescription>Generate a shipping agency EPDA without an inquiry</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={formNavRef}
            onKeyDownCapture={handleFormEnterNavigation}
            className="space-y-6 [&_input]:font-medium [&_[role='combobox']]:font-medium"
          >
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

            {quoteForm === 'QN' ? (
              <CreateInvoiceQnForm
                values={formValues}
                handlers={formHandlers}
                options={formOptions}
                computed={formComputed}
                getRequiredState={getRequiredState}
              />
            ) : (
              <CreateInvoiceHcmForm
                values={formValues}
                handlers={formHandlers}
                options={formOptions}
                computed={formComputed}
                getRequiredState={getRequiredState}
              />
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handlePreview}
                disabled={
                  isLoading || 
                  isLoadingCargoCatalog ||
                  isLoadingPorts
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
            {showValidationErrors && missingRequiredFields.length > 0 && (
              <p className="text-sm text-red-600">
                Vui long nhap cac truong bat buoc: {missingRequiredFields.map((field) => field.label).join(', ')}
              </p>
            )}
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
