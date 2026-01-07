import React from 'react'

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
  port_upper?: string
  loading_term?: string
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
  transport_ls?: string | number
  boat_hire_entry?: string | number
  tally_fee?: string | number
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

const buildAARows = (
  rows: QuoteRow[],
  grt?: string | number,
  options?: {
    berthHours?: string | number
    anchorageHours?: string | number
    frtTaxType?: string
    transportQuarantine?: string | number
    boatHire?: string | number
    tallyFee?: string | number
    loa?: string | number
  },
): { html: string; total?: string } => {
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

  if (!rows.length) {
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

    const tonnageValue = grtNumeric === null ? null : 0.034 * grtNumeric * 2
    const tonnage = tonnageValue === null ? `0.034*${grtDisplay}*2` : formatAmount(tonnageValue)

    const navigationDueValue = grtNumeric === null ? null : 0.058 * grtNumeric * 2
    const navigationDue = navigationDueValue === null ? `0.058*${grtDisplay}*2` : formatAmount(navigationDueValue)

    const pilotageValue = grtNumeric === null ? null : 0.0034 * grtNumeric * 2
    const pilotage = pilotageValue === null ? `0.0034*${grtDisplay}*2` : formatAmount(pilotageValue)

    const loaNumeric = toNumber(options?.loa)
    const pickTugRate = (loa?: number | null) => {
      if (loa === null || loa === undefined) return { amount: undefined }
      if (loa >= 175) return { amount: 9916 }
      if (loa >= 135) return { amount: 6792 }
      if (loa >= 90) return { amount: 3956 }
      if (loa >= 80) return { amount: 2308 }
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

    const quarantineFeeValue = 220
    const quarantineFee = formatAmount(quarantineFeeValue)

    const showOceanFrtTax = (options?.frtTaxType || '').toLowerCase() === 'export'
    const oceanFrtTax = 'PLS ADVISE'

    const transportQuarantineNumeric = toNumber(options?.transportQuarantine)
    const hasTransportQuarantine = transportQuarantineNumeric !== null && transportQuarantineNumeric > 0
    const transportQuarantineAmount = hasTransportQuarantine ? transportQuarantineNumeric : undefined

    const boatHireNumeric = toNumber(options?.boatHire)
    const hasBoatHire = boatHireNumeric !== null && boatHireNumeric > 0
    const boatHireAmount = hasBoatHire ? boatHireNumeric : undefined

    const tallyFeeNumeric = toNumber(options?.tallyFee)
    const hasTallyFee = tallyFeeNumeric !== null && tallyFeeNumeric > 0
    const tallyFeeAmount = hasTallyFee ? tallyFeeNumeric : undefined

    const clearanceFeesValue = 100
    const clearanceFees = formatAmount(clearanceFeesValue)

    const berthDaysNumeric = berthHoursValue / 24
    const garbageRemovalValue = Math.ceil(berthDaysNumeric / 2) * 17
    const garbageRemoval = formatAmount(garbageRemovalValue)

    const defaultRows: QuoteRow[] = [
      { item: 'Tonnage', details: 'USD 0.034 / GRT x 2 (out)', amount: tonnage },
      { item: 'Navigation due', details: 'USD 0.058 / GRT x 2 (in + out)', amount: navigationDue },
      { item: 'Pilotage', details: 'USD0.0034 / GRT x 2 (in & out)', amount: pilotage },
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
      { item: 'Quarantine fee', details: '(In+Out)', amount: quarantineFee },
    ]

    if (showOceanFrtTax) {
      defaultRows.push({
        item: 'Ocean Frt Tax',
        details: 'Total Frt x 2% tax rate',
        remark: 'PLS ADVISE',
        amount: oceanFrtTax,
      })
    }

    if (hasTransportQuarantine && transportQuarantineAmount !== undefined) {
      defaultRows.push({
        item: 'Transport for entry quarantine formality',
        details: '',
        amount: transportQuarantineAmount,
        mergeItemDetails: true,
      })
    }

    if (hasBoatHire && boatHireAmount !== undefined) {
      defaultRows.push({
        item: "Boat-hire for entry quarantine",
        details: '',
        amount: boatHireAmount,
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
    defaultRows.push({ item: 'Garbage removal fee', details: 'USD17/cbm/2 days/time', amount: garbageRemoval })

    const totalNumeric = defaultRows.reduce((sum, row) => {
      const n = toNumber(row.amount)
      return n === null ? sum : sum + n
    }, 0)

    const html = defaultRows.map(renderRow).join('\n')

    return { html, total: totalNumeric ? formatAmount(totalNumeric) : undefined }
  }

  const totalNumeric = rows.reduce((sum, row) => {
    const n = toNumber(row.amount)
    return n === null ? sum : sum + n
  }, 0)

  const html = rows.map(renderRow).join('\n')

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
        <td class="col-details"><span class="bold">${detailText}</span></td>
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

  if (!rows.length) {
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
        item: 'Transport/Communication in L/S',
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

  const adjustedRows = rows.map((row) => {
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

  const totalNumeric = adjustedRows.reduce((sum, row) => {
    const n = toNumber(row.amount)
    return n === null ? sum : sum + n
  }, 0)

  return { html: adjustedRows.map(renderRow).join('\n'), total: totalNumeric ? formatAmount(totalNumeric) : undefined }
}

export const renderQuoteHtml = (template: string, data: QuoteData) => {
  const aa = buildAARows(data.AA_ROWS || [], data.grt, {
    berthHours: data.berth_hours,
    anchorageHours: data.anchorage_hours,
    frtTaxType: data.loading_term,
    transportQuarantine: data.transport_quarantine,
    boatHire: data.boat_hire_entry,
    tallyFee: data.tally_fee,
    loa: data.loa,
  })

  const bb = buildBBRows(
    data.BB_ROWS || [],
    data.grt,
    data.cargo_qty_mt,
    data.cargo_name_upper,
    data.cargo_type,
    data.transport_ls,
  )

  const totalAValue = escapeHtml(data.total_a || aa.total)
  const totalBValue = escapeHtml(data.total_b || bb.total)
  const totalANum = toNumber(data.total_a || aa.total)
  const totalBNum = toNumber(data.total_b || bb.total)
  const grandNumeric =
    totalANum !== null && totalBNum !== null ? totalANum + totalBNum : totalANum !== null ? totalANum : totalBNum
  const grandTotal = data.grand_total || (grandNumeric ? formatAmount(grandNumeric) : undefined)

  const replacements: Record<string, string> = {
    to_shipowner: escapeHtml(data.to_shipowner),
    date: escapeHtml(data.date),
    ref: escapeHtml(data.ref),
    mv: escapeHtml(data.mv),
    dwt: escapeHtml(data.dwt),
    grt: escapeHtml(data.grt),
    loa: escapeHtml(data.loa),
    eta: escapeHtml(data.eta),
    cargo_qty_mt: escapeHtml(data.cargo_qty_mt),
    cargo_name_upper: escapeHtml(data.cargo_name_upper),
    cargo_type: escapeHtml(data.cargo_type),
    port_upper: escapeHtml(data.port_upper),
    loading_term: escapeHtml(data.loading_term),
    at_anchorage: escapeHtml(data.at_anchorage),
    at_berth: escapeHtml(data.at_berth),
    total_a: totalAValue,
    total_b: totalBValue,
    grand_total: escapeHtml(grandTotal),
    bank_name: escapeHtml(data.bank_name),
    bank_address: escapeHtml(data.bank_address),
    beneficiary: escapeHtml(data.beneficiary),
    usd_account: escapeHtml(data.usd_account),
    swift: escapeHtml(data.swift),
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
