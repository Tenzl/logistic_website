import React from 'react'
import { formatCargoNameWithType, normalizeInvoiceNumericFields } from '@/shared/utils/invoiceFormatters'

export type QuoteRow = {
  item?: string
  details?: string
  add?: string
  remark?: string
  amount?: string | number
  mergeItemDetails?: boolean
}

export type QuoteData = {
  to_shipowner?: string
  date?: string
  ref?: string
  mv?: string
  dwt?: string
  grt?: string
  loa?: string
  eta?: string
  cargo_qty_mt?: string
  cargo_name_upper?: string
  cargo_type?: string
  ship_type?: string
  purpose_of_calling?: string
  port_upper?: string
  loading_term?: string
  ocean_frt_rate_usd_per_mt?: string | number
  garbage_cbm_amount?: string | number
  at_anchorage?: string
  at_berth?: string
  total_a?: string
  total_b?: string
  grand_total?: string
  bank_name?: string
  bank_address?: string
  beneficiary?: string
  usd_account?: string
  swift?: string
  berth_hours?: string | number
  anchorage_hours?: string | number
  transport_quarantine?: string | number
  quarantine_cargo_trips?: string | number
  transport_ls?: string | number
  boat_hire_entry?: string | number
  tally_fee?: string | number
  pilotage_miles?: string | number
  pilotage_third_miles?: string | number
  AA_ROWS?: QuoteRow[]
  BB_ROWS?: QuoteRow[]
}

const escapeHtml = (value: unknown) => {
  const raw = value === undefined || value === null || value === '' ? '' : String(value)
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '')
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const formatAmount = (value: unknown) => {
  const num = toNumber(value)
  if (num === null) return escapeHtml(value)
  const rounded = Math.ceil(num * 100) / 100
  return rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const hasText = (value: unknown) => {
  if (value === undefined || value === null) return false
  return String(value).trim() !== ''
}

const isMeaningfulQuoteRow = (row: QuoteRow) => {
  return [row.item, row.details, row.add, row.remark, row.amount].some(hasText)
}

const normalizeCustomRows = (rows: QuoteRow[]) => rows.filter(isMeaningfulQuoteRow)

const normalizePurpose = (value: unknown) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

const shouldShowOceanFrtTax = (purposeOfCalling?: string, frtTaxType?: string) => {
  const normalizedPurpose = normalizePurpose(purposeOfCalling)
  if (normalizedPurpose === 'NHAP_XUAT' || normalizedPurpose === 'CHUYEN_CANG_XUAT') {
    return true
  }
  return (frtTaxType || '').toLowerCase() === 'export'
}

const normalizeCargoType = (value: unknown) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

const isTallyFeeEligibleCargo = (cargoType?: string) => {
  const normalized = normalizeCargoType(cargoType)
  return normalized.includes('IN_BAGS') || normalized.includes('EQUIPMENT')
}

const isTankerShip = (value?: string) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
  return normalized === 'TANKER_SHIP'
}

const getShipQuarantineTrips = (purposeOfCalling?: string) => {
  const normalized = normalizePurpose(purposeOfCalling)
  if (normalized === 'NHAP_XUAT') return 2
  if (normalized === 'NHAP_CHUYEN_CANG' || normalized === 'CHUYEN_CANG_XUAT') return 1
  return 0
}

const buildAARows = (
  rows: QuoteRow[],
  grt?: string | number,
  options?: {
    berthHours?: string | number
    anchorageHours?: string | number
    frtTaxType?: string
    purposeOfCalling?: string
    shipType?: string
    transportQuarantine?: string | number
    boatHire?: string | number
    tallyFee?: string | number
    cargoType?: string
    loa?: string | number
    pilotageMiles?: string | number
    mooringLocation?: 'berth' | 'anchorage'
    cargoQtyMt?: string | number
    quarantineCargoTrips?: string | number
    oceanFrtRateUsdPerMt?: string | number
    garbageCbmAmount?: string | number
  },
): { html: string; total?: string } => {
  const customRows = normalizeCustomRows(rows)

  const renderRow = (row: QuoteRow, index: number) => {
    if (row.mergeItemDetails) {
      return `
      <tr>
        <td class="col-no">${index + 1}</td>
        <td class="col-item" colspan="2"><span class="bold">${escapeHtml(row.item)}</span></td>
        <td class="col-add">${escapeHtml(row.add)}</td>
        <td class="col-remark">${escapeHtml(row.remark)}</td>
        <td class="col-amount">${formatAmount(row.amount)}</td>
      </tr>`
    }

    return `
      <tr>
        <td class="col-no">${index + 1}</td>
        <td class="col-item"><span class="bold">${escapeHtml(row.item)}</span></td>
        <td class="col-details">${escapeHtml(row.details)}</td>
        <td class="col-add">${escapeHtml(row.add)}</td>
        <td class="col-remark">${escapeHtml(row.remark)}</td>
        <td class="col-amount">${formatAmount(row.amount)}</td>
      </tr>`
  }

  if (!customRows.length) {
    const grtDisplay = escapeHtml(grt ?? 'GRT')
    const grtNumeric = toNumber(grt)

    const berthHoursNumeric = toNumber(options?.berthHours)
    const berthHoursValue = berthHoursNumeric === null ? 96 : berthHoursNumeric
    const berthHoursText = `${berthHoursValue} hrs`
    const berthDays = berthHoursValue > 0 ? Math.ceil(berthHoursValue / 24).toFixed(1) : '0.0'
    const berthRemark = `abt. ${berthDays} days`

    const anchorageHoursNumeric = toNumber(options?.anchorageHours)
    const anchorageHoursValue = anchorageHoursNumeric === null ? 24 : anchorageHoursNumeric
    const anchorageHoursText = `${anchorageHoursValue} hrs`
    const anchorageDays = anchorageHoursValue > 0 ? Math.ceil(anchorageHoursValue / 24).toFixed(1) : '0.0'
    const anchorageRemark = anchorageHoursValue ? `abt. ${anchorageDays} days` : ''

    const shipRateFactor = isTankerShip(options?.shipType) ? 0.85 : 1

    const tonnageValue = grtNumeric === null ? null : 0.034 * grtNumeric * 2 * shipRateFactor
    const tonnage = tonnageValue === null ? `0.034*${grtDisplay}*2` : formatAmount(tonnageValue)

    const navigationDueValue = grtNumeric === null ? null : 0.058 * grtNumeric * 2 * shipRateFactor
    const navigationDue = navigationDueValue === null ? `0.058*${grtDisplay}*2` : formatAmount(navigationDueValue)

    const pilotageMilesNumeric = toNumber(options?.pilotageMiles)
    const pilotageMultiplier =
      pilotageMilesNumeric !== null && pilotageMilesNumeric > 1 ? pilotageMilesNumeric : 1
    const pilotageValue = grtNumeric === null ? null : 0.0034 * grtNumeric * 2 * pilotageMultiplier
    const pilotage = pilotageValue === null ? `0.0034*${grtDisplay}*2` : formatAmount(pilotageValue)
    const pilotageMilesText = pilotageMultiplier >= 2 ? `${pilotageMultiplier} miles` : ''

    const loaNumeric = toNumber(options?.loa)
    const pickTugRate = (loa?: number | null) => {
      if (loa === null || loa === undefined) return { amount: undefined }
      if (loa >= 200) return { amount: 9916 }
      if (loa >= 175) return { amount: 6792 }
      if (loa >= 135) return { amount: 3956 }
      if (loa >= 90) return { amount: 2308 }
      return { amount: 1154 }
    }

    const tugRate = pickTugRate(loaNumeric)
    const tugAssistance = tugRate.amount === undefined ? '' : formatAmount(tugRate.amount)
    
    const pickMoorUnmoor = (value?: number | null) => {
      if (value === null || value === undefined) return { amount: undefined }
      if (value < 500) return { amount: 32 }
      if (value <= 1000) return { amount: 50 }
      if (value <= 4000) return { amount: 66 }
      if (value <= 10000) return { amount: 120 }
      if (value <= 15000) return { amount: 140 }
      return { amount: 180 }
    }

    const moorUnmoorRate = pickMoorUnmoor(grtNumeric)
    const moorUnmoor = moorUnmoorRate.amount === undefined ? '' : formatAmount(moorUnmoorRate.amount)
    
    const berthDueValue = grtNumeric === null ? null : 0.0031 * berthHoursValue * grtNumeric
    const berthDue = berthDueValue === null ? `0.0031*${grtDisplay}*${berthHoursValue}` : formatAmount(berthDueValue)
    
    const anchorageFeesValue = grtNumeric === null ? null : 0.0005 * anchorageHoursValue * grtNumeric
    const anchorageFees = anchorageFeesValue === null ? `0.0005*${grtDisplay}*${anchorageHoursValue}` : formatAmount(anchorageFeesValue)
    
    const shipQuarantineTrips = getShipQuarantineTrips(options?.purposeOfCalling)
    const shipQuarantineUnit = grtNumeric !== null && grtNumeric >= 10000 ? 110 : 95
    const shipQuarantineFeeValue = shipQuarantineTrips * shipQuarantineUnit

    const purposeNormalized = normalizePurpose(options?.purposeOfCalling)
    const cargoQtyNumeric = toNumber(options?.cargoQtyMt)
    const cargoTripsNumeric = toNumber(options?.quarantineCargoTrips)
    const cargoQuarantineTrips = cargoTripsNumeric !== null && cargoTripsNumeric > 0 ? cargoTripsNumeric : 1
    const cargoQuarantineFeeValue =
      purposeNormalized === 'MUC_DICH_KHAC' || cargoQtyNumeric === null || cargoQtyNumeric <= 0
        ? 0
        : 100 * cargoQuarantineTrips

    const quarantineFeeValue = shipQuarantineFeeValue + cargoQuarantineFeeValue
    const quarantineFee = formatAmount(quarantineFeeValue)
    
    const showOceanFrtTax = shouldShowOceanFrtTax(options?.purposeOfCalling, options?.frtTaxType)
    const oceanFrtRateInput = toNumber(options?.oceanFrtRateUsdPerMt)
    const oceanFrtRate = oceanFrtRateInput !== null && oceanFrtRateInput > 0 ? oceanFrtRateInput : 16
    const cargoQtyForFrtTax = cargoQtyNumeric !== null && cargoQtyNumeric > 0 ? cargoQtyNumeric : 0
    const oceanFrtTaxValue = oceanFrtRate * cargoQtyForFrtTax * 0.02
    const oceanFrtRateText = oceanFrtRate.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    const oceanFrtQtyText = cargoQtyForFrtTax.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    const oceanFrtTaxDetail = `Frt USD${oceanFrtRateText}/mt x abt ${oceanFrtQtyText}mts x 2%`

    const transportQuarantineNumeric = toNumber(options?.transportQuarantine)
    const hasTransportQuarantine = transportQuarantineNumeric !== null && transportQuarantineNumeric > 0
    const transportQuarantineAmount = hasTransportQuarantine ? transportQuarantineNumeric : undefined

    const mooringLocation = (options?.mooringLocation || '').toLowerCase() === 'anchorage' ? 'anchorage' : 'berth'

    const boatHireNumeric = toNumber(options?.boatHire)
    const hasBoatHire = boatHireNumeric !== null && boatHireNumeric > 0
    const boatHireAmount = hasBoatHire ? boatHireNumeric : undefined

    const tallyFeeNumeric = toNumber(options?.tallyFee)
    const hasTallyFee =
      isTallyFeeEligibleCargo(options?.cargoType) && tallyFeeNumeric !== null && tallyFeeNumeric > 0
    const tallyFeeAmount = hasTallyFee ? tallyFeeNumeric : undefined

    const clearanceFeesValue = 100
    const clearanceFees = formatAmount(clearanceFeesValue)

    const berthDaysNumeric = berthHoursValue / 24
    const garbageCbmNumeric = toNumber(options?.garbageCbmAmount)
    const garbageCbmAmount = garbageCbmNumeric !== null && garbageCbmNumeric > 0 ? garbageCbmNumeric : 1
    const garbageRemovalValue = Math.ceil(berthDaysNumeric / 2) * 17 * garbageCbmAmount
    const garbageCbmAddText = garbageCbmAmount > 1 ? `${garbageCbmAmount} cbm` : ''
    const garbageRemoval = formatAmount(garbageRemovalValue)
    
    const defaultRows: QuoteRow[] = [
      { item: 'Tonnage', details: 'USD 0.034 / GRT x 2 (out)', amount: tonnage },
      { item: 'Navigation due', details: 'USD 0.058 / GRT x 2 (in + out)', amount: navigationDue },
      {
        item: 'Pilotage',
        details: 'USD0.0034 / GRT x 2 (in & out)',
        add: pilotageMilesText,
        amount: pilotage,
      },
      { item: 'Tug assistance charge', details: '(in & out)', amount: tugAssistance },
      { item: 'Moor / Unmooring', details: '', amount: moorUnmoor },
      {
        item: 'Berth due',
        details: 'USD 0.0031 / GRT / hour x',
        add: berthHoursText,
        remark: berthRemark,
        amount: berthDue,
      },
      {
        item: 'Anchorage fees if any',
        details: 'USD 0.0005 / GRT / hour x',
        add: anchorageHoursText,
        remark: anchorageRemark,
        amount: anchorageFees,
      },
      { item: 'Quarantine fee', details: '', amount: quarantineFee },
    ]

    if (showOceanFrtTax) {
      defaultRows.push({
        item: 'Ocean Frt Tax',
        details: oceanFrtTaxDetail,
        amount: oceanFrtTaxValue,
      })
    }

    if (hasTransportQuarantine && transportQuarantineAmount !== undefined) {
      defaultRows.push({
        item: 'Boat hired for quarantine',
        details: '',
        amount: transportQuarantineAmount,
        mergeItemDetails: true,
      })
    }

    if (hasBoatHire && boatHireAmount !== undefined) {
      defaultRows.push({
        item: 'Boat-hire for agency service',
        details: '',
        amount: boatHireAmount,
        mergeItemDetails: true,
      })
    }

    if (hasTallyFee && tallyFeeAmount !== undefined) {
      defaultRows.push({
        item: "Ship's side tally fee",
        details: '',
        amount: tallyFeeAmount,
      })
    }

    defaultRows.push({ item: 'Clearance fees', details: '(In/Outward clearance)', amount: clearanceFees })
    defaultRows.push({
      item: 'Garbage removal fee',
      details: 'USD17/cbm/2 days/time',
      add: garbageCbmAddText,
      amount: garbageRemoval,
    })

    const totalNumeric = defaultRows.reduce((sum, row) => {
      const n = toNumber(row.amount)
      return n === null ? sum : sum + n
    }, 0)

    const html = defaultRows.map(renderRow).join('\n')

    return { html, total: totalNumeric ? formatAmount(totalNumeric) : undefined }
  }

  const totalNumeric = customRows.reduce((sum, row) => {
    const n = toNumber(row.amount)
    return n === null ? sum : sum + n
  }, 0)

  const html = customRows.map(renderRow).join('\n')

  return { html, total: totalNumeric ? formatAmount(totalNumeric) : undefined }
}

const buildBBRows = (
  rows: QuoteRow[],
  grt?: string | number,
  cargoQtyMt?: string | number,
  cargoName?: string,
  cargoType?: string,
  transportLs?: string | number,
): { html: string; total?: string } => {
  const customRows = normalizeCustomRows(rows)

  const formatUsd = (value?: number) =>
    value === undefined
      ? ''
      : `USD${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const pickCargoFee = (name?: string) => {
    const normalized = (name || '').toUpperCase()
    if (normalized.includes('BAG')) return 0.06
    if (normalized.includes('EQUIP')) return 0.1
    if (normalized.includes('BULK')) return 0.05
    return undefined
  }

  const renderRow = (row: QuoteRow, index: number) => {
    const itemHtml = row.item ? `<span class="bold">${escapeHtml(row.item)}</span>` : ''
    const detailsHtml = row.details ? escapeHtml(row.details) : ''
    const detailText = [itemHtml, detailsHtml].filter(Boolean).join(itemHtml && detailsHtml ? ': ' : '')
    return `
      <tr>
        <td class="col-no">${index + 1}</td>
        <td class="col-details" colspan="4"><span class="bold">${detailText}</span></td>
        <td class="col-amount">${formatAmount(row.amount)}</td>
      </tr>`
  }

  
  const cargoRate = pickCargoFee(cargoType || cargoName)
  const cargoQty = toNumber(cargoQtyMt)
  const cargoAmount = cargoRate !== undefined && cargoQty !== null ? cargoRate * cargoQty : undefined

  const transportLsAmount = toNumber(transportLs)

  const grtNumeric = toNumber(grt)
  const pickAgencyFee = (value?: number | null) => {
    if (value === null || value === undefined) return { amount: undefined, label: '' }
    if (value <= 1000) return { amount: undefined, label: '' }
    if (value <= 3000) return { amount: 500, label: '1,001-3,000' }
    if (value <= 6000) return { amount: 600, label: '3,001-6,000' }
    if (value <= 10000) return { amount: 700, label: '6,001-10,000' }
    if (value <= 15000) return { amount: 850, label: '10,001-15,000' }
    if (value <= 25000) return { amount: 1000, label: '15,001-25,000' }
    if (value <= 50000) return { amount: 1150, label: '25,001-50,000' }
    return { amount: 1300, label: '>50,000' }
  }

  const agencyFee = pickAgencyFee(grtNumeric)
  const detailParts = [] as string[]
  if (agencyFee.label) detailParts.push(`On GRT: ${agencyFee.label}`)
  const agencyAmountText = formatUsd(agencyFee.amount)
  if (agencyAmountText) detailParts.push(agencyAmountText)
  const detail = detailParts.join(': ')

  const cargoRateText = cargoRate !== undefined ? `USD${cargoRate.toFixed(2)}/mt` : ''
  const cargoQtyText = cargoQty !== null ? `${cargoQty.toLocaleString('en-US')}mts` : ''
  const cargoDetail = [
    cargoRateText || cargoQtyText ? 'On cargo' : '',
    [cargoRateText, cargoQtyText].filter(Boolean).join(' x '),
  ]
    .filter(Boolean)
    .join(': ')

  if (!customRows.length) {
    const autoRows: QuoteRow[] = []

    if (agencyFee.amount !== undefined || detail) {
      autoRows.push({
        details: detail,
        amount: agencyFee.amount,
      })
    }

    if (cargoRateText || cargoQtyText) {
      autoRows.push({
        details: cargoDetail,
        amount: cargoAmount,
      })
    }

    if (transportLsAmount !== null && transportLsAmount > 0) {
      autoRows.push({
        item: 'Taxi/Courrier/Communication for agency service',
        details: '',
        amount: transportLsAmount,
      })
    }

    const totalNumeric = autoRows.reduce((sum, row) => {
      const n = toNumber(row.amount)
      return n === null ? sum : sum + n
    }, 0)

    return { html: autoRows.map(renderRow).join('\n'), total: totalNumeric ? formatAmount(totalNumeric) : undefined }
  }

  const adjustedRows = customRows.map((row) => {
    const isCargoFee = (row.item || '').toLowerCase().includes('agency fee on cargo')
    const isGrtFee = (row.item || '').toLowerCase().includes('agency fee on grt')
    const isTransportLs = (row.item || '').toLowerCase().includes('transport')
    if (isCargoFee && (row.amount === undefined || row.amount === '')) {
      return { ...row, details: cargoDetail || row.details, amount: cargoAmount ?? row.amount }
    }
    if (isGrtFee && (row.details === undefined || row.details === '')) {
      return { ...row, details: detail || row.details }
    }
    if (isTransportLs && (row.amount === undefined || row.amount === '') && transportLsAmount !== null && transportLsAmount > 0) {
      return { ...row, amount: transportLsAmount }
    }
    return row
  })

  const finalRows = adjustedRows.filter(isMeaningfulQuoteRow)

  const totalNumeric = finalRows.reduce((sum, row) => {
    const n = toNumber(row.amount)
    return n === null ? sum : sum + n
  }, 0)

  return { html: finalRows.map(renderRow).join('\n'), total: totalNumeric ? formatAmount(totalNumeric) : undefined }
}

export const renderQuoteHtml = (template: string, data: QuoteData) => {
  const normalizedData = normalizeInvoiceNumericFields(data)

  const aa = buildAARows(normalizedData.AA_ROWS || [], normalizedData.grt, {
    berthHours: normalizedData.berth_hours,
    anchorageHours: normalizedData.anchorage_hours,
    frtTaxType: normalizedData.loading_term,
    purposeOfCalling: normalizedData.purpose_of_calling,
    shipType: normalizedData.ship_type,
    transportQuarantine: normalizedData.transport_quarantine,
    boatHire: normalizedData.boat_hire_entry,
    tallyFee: normalizedData.tally_fee,
    cargoType: normalizedData.cargo_type,
    loa: normalizedData.loa,
    pilotageMiles: normalizedData.pilotage_miles ?? normalizedData.pilotage_third_miles,
    mooringLocation: (normalizedData.at_anchorage || '').trim() ? 'anchorage' : 'berth',
    cargoQtyMt: normalizedData.cargo_qty_mt,
    quarantineCargoTrips: normalizedData.quarantine_cargo_trips,
    oceanFrtRateUsdPerMt: normalizedData.ocean_frt_rate_usd_per_mt,
    garbageCbmAmount: normalizedData.garbage_cbm_amount,
  })

  const bb = buildBBRows(
    normalizedData.BB_ROWS || [],
    normalizedData.grt,
    normalizedData.cargo_qty_mt,
    normalizedData.cargo_name_upper,
    normalizedData.cargo_type,
    normalizedData.transport_ls,
  )

  const totalAValue = escapeHtml(normalizedData.total_a || aa.total)
  const totalBValue = escapeHtml(normalizedData.total_b || bb.total)
  const totalANum = toNumber(normalizedData.total_a || aa.total)
  const totalBNum = toNumber(normalizedData.total_b || bb.total)
  const grandNumeric =
    totalANum !== null && totalBNum !== null ? totalANum + totalBNum : totalANum !== null ? totalANum : totalBNum
  const grandTotal = normalizedData.grand_total || (grandNumeric ? formatAmount(grandNumeric) : undefined)

  const replacements: Record<string, string> = {
    to_shipowner: escapeHtml(normalizedData.to_shipowner),
    date: escapeHtml(normalizedData.date),
    ref: escapeHtml(normalizedData.ref),
    mv: escapeHtml(normalizedData.mv),
    dwt: escapeHtml(normalizedData.dwt),
    grt: escapeHtml(normalizedData.grt),
    loa: escapeHtml(normalizedData.loa),
    eta: escapeHtml(normalizedData.eta || 'TBN'),
    cargo_qty_mt: escapeHtml(normalizedData.cargo_qty_mt),
    cargo_name_upper: escapeHtml(formatCargoNameWithType(normalizedData.cargo_name_upper, normalizedData.cargo_type)),
    cargo_type: escapeHtml(normalizedData.cargo_type),
    port_upper: escapeHtml(normalizedData.port_upper),
    loading_term: escapeHtml(normalizedData.loading_term),
    at_anchorage: escapeHtml(normalizedData.at_anchorage),
    at_berth: escapeHtml(normalizedData.at_berth),
    total_a: totalAValue,
    total_b: totalBValue,
    grand_total: escapeHtml(grandTotal),
    bank_name: escapeHtml(normalizedData.bank_name),
    bank_address: escapeHtml(normalizedData.bank_address),
    beneficiary: escapeHtml(normalizedData.beneficiary),
    usd_account: escapeHtml(normalizedData.usd_account),
    swift: escapeHtml(normalizedData.swift),
    AA_ROWS: aa.html,
    BB_ROWS: bb.html,
  }

  return template.replace(/{{\s*([A-Za-z0-9_]+)\s*}}/g, (match, key) => {
    const value = replacements[key]
    return value === undefined ? '—' : value
  })
}

interface QuotePreviewProps {
  html: string
  className?: string
}

export function QuotePreview({ html, className }: QuotePreviewProps) {
  return (
    <iframe
      srcDoc={html}
      className={`w-full h-full rounded-lg border bg-white ${className || ''}`}
      title="Quote preview"
    />
  )
}
