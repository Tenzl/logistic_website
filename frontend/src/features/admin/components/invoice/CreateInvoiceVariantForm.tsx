import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { DatePicker } from '@/shared/components/ui/date-picker'
import type { CargoType, CargoTypeCatalogItem, ImageType } from '@/modules/gallery/services/imageTypeService'

export type FormVariant = 'QN' | 'HCM'

export type PurposeOption =
  | 'NHAP_XUAT'
  | 'NHAP_CHUYEN_CANG'
  | 'CHUYEN_CANG_XUAT'
  | 'CHUYEN_CANG_CHUYEN_CANG'
  | 'MUC_DICH_KHAC'

export type ShipTypeOption = 'BULK_SHIP' | 'TANKER_SHIP'

export type FrtTaxTypeOption = 'Import' | 'Export - Pls Advise' | 'Export - Freight rate declaration'

export type QuarantineCargoOption = 'ONE_LEG' | 'BOTH_LEGS' | 'OTHER'
export type AgencyFeeModeOption = 'TARRIF_AGENCY' | 'AGENCY_IN_LUMPSUM'

export interface SelectOption {
  value: string
  label: string
}

export interface InvoiceVariantFormProps {
  variant: FormVariant
  values: {
    toShipowner: string
    eta: string
    mv: string
    dischargeLoadingLocation: string
    dwt: string
    grt: string
    loa: string
    cargoQty: string
    cargoType: CargoType | ''
    cargoName: string
    shipType: ShipTypeOption
    berthHours: string
    anchorageHours: string
    qnPilotageMiles: string
    pilotageThirdMiles: string
    garbageCbmAmount: string
    purposeOfCalling: PurposeOption | ''
    quarantineCargoMode: QuarantineCargoOption
    frtTaxType: FrtTaxTypeOption | ''
    tallyFeeAmount: string
    oceanFrtRateUsdPerMt: string
    transportLs: string
    boatHireAmount: string
    boatHireQuarantineAmount: string
    agencyFeeMode: AgencyFeeModeOption
    agencyDiscountPercent: string
    agencyLumpsumAmount: string
  }
  handlers: {
    setToShipowner: (value: string) => void
    setEta: (value: string) => void
    setMv: (value: string) => void
    setDischargeLoadingLocation: (value: string) => void
    setDwt: (value: string) => void
    setGrt: (value: string) => void
    setLoa: (value: string) => void
    setCargoQty: (value: string) => void
    setCargoType: (value: CargoType) => void
    setCargoName: (value: string) => void
    setShipType: (value: ShipTypeOption) => void
    setBerthHours: (value: string) => void
    setAnchorageHours: (value: string) => void
    setQnPilotageMiles: (value: string) => void
    setPilotageThirdMiles: (value: string) => void
    setGarbageCbmAmount: (value: string) => void
    setPurposeOfCalling: (value: PurposeOption) => void
    setQuarantineCargoMode: (value: QuarantineCargoOption) => void
    setFrtTaxType: (value: FrtTaxTypeOption) => void
    setTallyFeeAmount: (value: string) => void
    setOceanFrtRateUsdPerMt: (value: string) => void
    setTransportLs: (value: string) => void
    setBoatHireAmount: (value: string) => void
    setBoatHireQuarantineAmount: (value: string) => void
    setAgencyFeeMode: (value: AgencyFeeModeOption) => void
    setAgencyDiscountPercent: (value: string) => void
    setAgencyLumpsumAmount: (value: string) => void
  }
  options: {
    cargoTypeOptions: CargoTypeCatalogItem[]
    filteredCargoNames: ImageType[]
    shipTypeOptions: SelectOption[]
    purposeOptions: SelectOption[]
    quarantineCargoOptions: SelectOption[]
    frtTaxTypeOptions: SelectOption[]
    agencyFeeModeOptions: SelectOption[]
  }
  computed: {
    isLoadingCargoCatalog: boolean
    isTallyFeeEligibleCargo: boolean
    shipQuarantineFee: string
    cargoQuarantineFee: string
    canEnableFreightTaxDeclaration: boolean
    isImportFrtTaxType: boolean
    isExportPlsAdviseMode: boolean
    isOceanFreightInputDisabled: boolean
    frtHint: string
  }
  getRequiredState: (value: string | null | undefined) => { labelClass: string; fieldClass: string }
}

export function CreateInvoiceVariantForm({
  variant,
  values,
  handlers,
  options,
  computed,
  getRequiredState,
}: InvoiceVariantFormProps) {
  const disabledFieldTextClass = 'disabled:text-muted-foreground disabled:placeholder:text-muted-foreground'
  const isBoatHireForAgencyEnabled = values.dischargeLoadingLocation === 'Anchorage'
  const isHcmAnchorage = variant === 'HCM' && values.dischargeLoadingLocation === 'Anchorage'
  const normalizeCargoType = (value: string) => value.trim().toUpperCase().replace(/[\s-]+/g, '_')
  const grtNumeric = Number(values.grt)
  const cargoQtyNumeric = Number(values.cargoQty)
  const discountNumeric = Number(values.agencyDiscountPercent)
  const agencyDiscountPercent = Number.isFinite(discountNumeric)
    ? Math.min(100, Math.max(0, discountNumeric))
    : 0
  const agencyDiscountFactor = (100 - agencyDiscountPercent) / 100
  const subAgencyPercent = agencyDiscountFactor * 100
  const subAgencyPercentDisplay = subAgencyPercent.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  const subAgencySuffix = agencyDiscountPercent === 0
    ? ''
    : ` x ${subAgencyPercentDisplay}%(sub-agency)`

  const getAgencyFeeByGrt = (grt: number): { amount: number; label: string } => {
    if (grt <= 1000) return { amount: 0, label: '0 - 1,000' }
    if (grt <= 3000) return { amount: 500, label: '1,001 - 3,000' }
    if (grt <= 6000) return { amount: 600, label: '3,001 - 6,000' }
    if (grt <= 10000) return { amount: 700, label: '6,001 - 10,000' }
    if (grt <= 15000) return { amount: 850, label: '10,001 - 15,000' }
    if (grt <= 25000) return { amount: 1000, label: '15,001 - 25,000' }
    if (grt <= 50000) return { amount: 1150, label: '25,001 - 50,000' }
    return { amount: 1300, label: '50,001+' }
  }

  const agencyFeeByGrt = Number.isFinite(grtNumeric) && grtNumeric > 0
    ? getAgencyFeeByGrt(grtNumeric)
    : { amount: 0, label: '0 - 1,000' }
  const cargoQtyForDisplay = Number.isFinite(cargoQtyNumeric) && cargoQtyNumeric > 0 ? cargoQtyNumeric : 0
  const normalizedCargoType = normalizeCargoType(values.cargoType || '')
  const isEquipmentCargo = normalizedCargoType.includes('EQUIPMENT')
  const isInBagsCargo = normalizedCargoType.includes('IN_BAGS')
  const onCargoRate = isEquipmentCargo ? 0.1 : isInBagsCargo ? 0.06 : 0.05
  const onCargoBaseAmount = onCargoRate * cargoQtyForDisplay

  const onGrtLabel = `On GRT: ${agencyFeeByGrt.label}`
  const onGrtAmountDisplay = `USD ${agencyFeeByGrt.amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}${subAgencySuffix}`
  const onCargoAmountDisplay = `USD ${onCargoBaseAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}${subAgencySuffix}`
  const onCargoLabel = isEquipmentCargo
    ? `Equipment: USD 0.1/MT X ${cargoQtyForDisplay} MTS`
    : `On Cargo: USD${onCargoRate.toFixed(2)}/MT X ${cargoQtyForDisplay}MTS`

  return (
    <>
      <div className="rounded-lg border p-4 space-y-6">
        <h3 className="text-sm font-bold tracking-wide uppercase text-primary">General Information</h3>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="toShipowner" className={getRequiredState(values.toShipowner).labelClass}>
              To (Ship Owner/Company) *
            </Label>
            <Input
              id="toShipowner"
              value={values.toShipowner}
              onChange={(e) => handlers.setToShipowner(e.target.value)}
              placeholder="Enter shipowner/company name"
              className={getRequiredState(values.toShipowner).fieldClass}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mv" className={getRequiredState(values.mv).labelClass}>
              M/V (Vessel Name) *
            </Label>
            <Input
              id="mv"
              value={values.mv}
              onChange={(e) => handlers.setMv(e.target.value)}
              placeholder="Enter vessel name"
              className={getRequiredState(values.mv).fieldClass}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="eta">ETA (Date)</Label>
            <DatePicker id="eta" value={values.eta} onChange={handlers.setEta} placeholder="TBN" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dischargeLoadingLocation" className={getRequiredState(values.dischargeLoadingLocation).labelClass}>
              Discharge/Loading at *
            </Label>
            <Select value={values.dischargeLoadingLocation} onValueChange={handlers.setDischargeLoadingLocation}>
              <SelectTrigger id="dischargeLoadingLocation" className={getRequiredState(values.dischargeLoadingLocation).fieldClass}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Berth">Berth</SelectItem>
                <SelectItem value="Anchorage">Anchorage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dwt" className={getRequiredState(values.dwt).labelClass}>
              DWT (tons) *
            </Label>
            <Input
              id="dwt"
              type="number"
              value={values.dwt}
              onChange={(e) => handlers.setDwt(e.target.value)}
              placeholder="Dead Weight Tonnage"
              className={getRequiredState(values.dwt).fieldClass}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="grt" className={getRequiredState(values.grt).labelClass}>
              GRT (tons) *
            </Label>
            <Input
              id="grt"
              type="number"
              value={values.grt}
              onChange={(e) => handlers.setGrt(e.target.value)}
              placeholder="Gross Register Tonnage"
              className={getRequiredState(values.grt).fieldClass}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="loa" className={getRequiredState(values.loa).labelClass}>
              LOA (meters) *
            </Label>
            <div className="relative">
              <Input
                id="loa"
                type="number"
                value={values.loa}
                onChange={(e) => handlers.setLoa(e.target.value)}
                placeholder="Length Overall"
                className={`pr-8 ${getRequiredState(values.loa).fieldClass}`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">M</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cargoQty" className={getRequiredState(values.cargoQty).labelClass}>
              Quantity (tons) *
            </Label>
            <Input
              id="cargoQty"
              type="number"
              value={values.cargoQty}
              onChange={(e) => handlers.setCargoQty(e.target.value)}
              placeholder="e.g., 15000"
              className={getRequiredState(values.cargoQty).fieldClass}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="shipType">Ship Type</Label>
            <Select value={values.shipType} onValueChange={(value) => handlers.setShipType(value as ShipTypeOption)}>
              <SelectTrigger id="shipType">
                <SelectValue placeholder="Select ship type" />
              </SelectTrigger>
              <SelectContent>
                {options.shipTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cargoType" className={getRequiredState(values.cargoType).labelClass}>
              Cargo Type *
            </Label>
            <Select
              value={values.cargoType}
              onValueChange={(value) => handlers.setCargoType(value as CargoType)}
              disabled={computed.isLoadingCargoCatalog || options.cargoTypeOptions.length === 0}
            >
              <SelectTrigger
                id="cargoType"
                className={`${getRequiredState(values.cargoType).fieldClass} disabled:text-muted-foreground`}
              >
                <SelectValue
                  placeholder={
                    computed.isLoadingCargoCatalog
                      ? 'Loading cargo types...'
                      : options.cargoTypeOptions.length > 0
                        ? 'Select cargo type'
                        : 'No cargo type found'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.cargoTypeOptions.map((option) => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.displayLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cargoName" className={getRequiredState(values.cargoName).labelClass}>
              Cargo Name *
            </Label>
            <Select value={values.cargoName} onValueChange={handlers.setCargoName}>
              <SelectTrigger id="cargoName" className={getRequiredState(values.cargoName).fieldClass}>
                <SelectValue
                  placeholder={
                    computed.isLoadingCargoCatalog
                      ? 'Loading cargo names...'
                      : values.cargoType
                        ? 'Select cargo name'
                        : 'Select cargo type first'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.filteredCargoNames.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-1 gap-4" />
      </div>

      <div className="rounded-lg border p-4 space-y-6">
        <h3 className="text-sm font-bold tracking-wide uppercase text-primary">Port Dues and Charges</h3>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="berthHours">{isHcmAnchorage ? 'Buoy Due (hours)' : 'Berth Due (hours)'}</Label>
            <Input
              id="berthHours"
              type="number"
              value={values.berthHours}
              onChange={(e) => handlers.setBerthHours(e.target.value)}
              min="0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="anchorageHours">Anchorage Fee (Hours)</Label>
            <Input
              id="anchorageHours"
              type="number"
              value={values.anchorageHours}
              onChange={(e) => handlers.setAnchorageHours(e.target.value)}
              min="0"
            />
          </div>

          {variant === 'QN' ? (
            <div className="grid gap-2">
              <Label htmlFor="qnPilotageMiles">Pilotage Miles</Label>
              <Input
                id="qnPilotageMiles"
                type="number"
                value={values.qnPilotageMiles}
                onChange={(e) => handlers.setQnPilotageMiles(e.target.value)}
                min="1"
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="pilotageThirdMiles">Pilotage 3rd Miles</Label>
              <Input
                id="pilotageThirdMiles"
                type="number"
                value={values.pilotageThirdMiles}
                onChange={(e) => handlers.setPilotageThirdMiles(e.target.value)}
                min="1"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="garbageCbmAmount">Amount of cbm of garbage</Label>
            <Input
              id="garbageCbmAmount"
              type="number"
              value={values.garbageCbmAmount}
              onChange={(e) => handlers.setGarbageCbmAmount(e.target.value)}
              placeholder="Current 1"
              min="1"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="purposeOfCalling" className={getRequiredState(values.purposeOfCalling).labelClass}>
              Purpose of calling *
            </Label>
            <Select value={values.purposeOfCalling} onValueChange={(value) => handlers.setPurposeOfCalling(value as PurposeOption)}>
              <SelectTrigger id="purposeOfCalling" className={getRequiredState(values.purposeOfCalling).fieldClass}>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                {options.purposeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quarantineCargoMode">Quarantine for cargo</Label>
            <Select
              value={values.quarantineCargoMode}
              onValueChange={(value) => handlers.setQuarantineCargoMode(value as QuarantineCargoOption)}
            >
              <SelectTrigger id="quarantineCargoMode">
                <SelectValue placeholder="Select cargo quarantine mode" />
              </SelectTrigger>
              <SelectContent>
                {options.quarantineCargoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="frtTaxType"
              className={
                computed.canEnableFreightTaxDeclaration
                  ? getRequiredState(values.frtTaxType).labelClass
                  : 'text-muted-foreground'
              }
            >
              Freight tax declaration *
            </Label>
            <Select
              value={values.frtTaxType}
              onValueChange={(value) => handlers.setFrtTaxType(value as FrtTaxTypeOption)}
              disabled={!computed.canEnableFreightTaxDeclaration}
            >
              <SelectTrigger
                id="frtTaxType"
                className={`${getRequiredState(values.frtTaxType).fieldClass} disabled:text-muted-foreground`}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {options.frtTaxTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="quarantineShipFeeDisplay" className="text-muted-foreground">Quarantine for ship (USD)</Label>
            <Input
              id="quarantineShipFeeDisplay"
              value={computed.shipQuarantineFee}
              readOnly
              disabled
              className={disabledFieldTextClass}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quarantineCargoFeeDisplay" className="text-muted-foreground">Quarantine for cargo (USD)</Label>
            <Input
              id="quarantineCargoFeeDisplay"
              value={computed.cargoQuarantineFee}
              readOnly
              disabled
              className={disabledFieldTextClass}
            />
          </div>

          <div className="grid gap-2">
            <p className="text-xs text-muted-foreground">{computed.frtHint}</p>
            <Input
              id="oceanFrtRateUsdPerMt"
              type="number"
              value={values.oceanFrtRateUsdPerMt}
              onChange={(e) => handlers.setOceanFrtRateUsdPerMt(e.target.value)}
              placeholder={
                computed.isExportPlsAdviseMode
                  ? 'PLEASE ADVICE'
                  : computed.isImportFrtTaxType
                    ? '0'
                    : 'Please enter amount, current 16 USD'
              }
              min="0"
              aria-label="Frt amount (USD/mt)"
              disabled={computed.isOceanFreightInputDisabled}
              className={disabledFieldTextClass}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="boatHireQuarantineAmount">Boat hired for quarantine (USD)</Label>
            <Input
              id="boatHireQuarantineAmount"
              type="number"
              value={values.boatHireQuarantineAmount}
              onChange={(e) => handlers.setBoatHireQuarantineAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="tallyFeeAmount"
              className={computed.isTallyFeeEligibleCargo ? '' : 'text-muted-foreground'}
            >
              Ship's side tally fee (USD)
            </Label>
            <Input
              id="tallyFeeAmount"
              type="number"
              value={values.tallyFeeAmount}
              onChange={(e) => handlers.setTallyFeeAmount(e.target.value)}
              placeholder={computed.isTallyFeeEligibleCargo ? '0' : 'Nil'}
              disabled={!computed.isTallyFeeEligibleCargo}
              className={disabledFieldTextClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-sm font-bold tracking-wide uppercase text-primary">Agency fees and expenses</h3>
          <div className="w-full md:w-72">
            <Select
              value={values.agencyFeeMode}
              onValueChange={(value) => handlers.setAgencyFeeMode(value as AgencyFeeModeOption)}
            >
              <SelectTrigger id="agencyFeeMode">
                <SelectValue placeholder="Select agency fee mode" />
              </SelectTrigger>
              <SelectContent>
                {options.agencyFeeModeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {values.agencyFeeMode === 'AGENCY_IN_LUMPSUM' ? (
          <div className="grid md:grid-cols-1 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="agencyLumpsumAmount">
                USD {values.agencyLumpsumAmount || '0'} in LUMPSUM including transportation
              </Label>
              <Input
                id="agencyLumpsumAmount"
                type="number"
                value={values.agencyLumpsumAmount}
                onChange={(e) => handlers.setAgencyLumpsumAmount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="agencyDiscountPercent">Discount (%)</Label>
              <Input
                id="agencyDiscountPercent"
                type="number"
                min="0"
                max="100"
                value={values.agencyDiscountPercent}
                onChange={(e) => handlers.setAgencyDiscountPercent(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agencyOnGrtDisplay" className="text-muted-foreground">{onGrtLabel}</Label>
              <Input
                id="agencyOnGrtDisplay"
                value={onGrtAmountDisplay}
                readOnly
                disabled
                className={disabledFieldTextClass}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agencyOnCargoDisplay" className="text-muted-foreground">{onCargoLabel}</Label>
              <Input
                id="agencyOnCargoDisplay"
                value={onCargoAmountDisplay}
                readOnly
                disabled
                className={disabledFieldTextClass}
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="boatHireAmount"
                className={isBoatHireForAgencyEnabled ? '' : 'text-muted-foreground'}
              >
                Boat hired for agency service (USD)
              </Label>
              <Input
                id="boatHireAmount"
                type="number"
                value={values.boatHireAmount}
                onChange={(e) => handlers.setBoatHireAmount(e.target.value)}
                placeholder={isBoatHireForAgencyEnabled ? '0' : 'Enable when Discharge/Loading at is Anchorage'}
                disabled={!isBoatHireForAgencyEnabled}
                className={disabledFieldTextClass}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transportLs">Taxi/Courrier/Communication for agency service</Label>
              <Input
                id="transportLs"
                type="number"
                value={values.transportLs}
                onChange={(e) => handlers.setTransportLs(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="grid gap-2" />
          </div>
        )}
      </div>
    </>
  )
}
