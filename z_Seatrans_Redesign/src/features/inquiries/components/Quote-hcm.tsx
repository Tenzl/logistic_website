import React from 'react'

export type QuoteRow = {
  no?: string | number
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
    mooringLocation?: 'berth' | 'anchorage'
    pilotageThirdMiles?: string | number
  },
): { html: string; total?: string } => {
  const renderRow = (row: QuoteRow, index: number) => {
    const no = escapeHtml(row.no ?? index + 1)
    if (row.mergeItemDetails) {
      return `
      <tr>
        <td class="col-no">${no}</td>
        <td class="col-item" colspan="2"><span class="bold">${escapeHtml(row.item)}</span></td>
        <td class="col-add">${escapeHtml(row.add)}</td>
        <td class="col-remark">${escapeHtml(row.remark)}</td>
        <td class="col-amount">${formatAmount(row.amount)}</td>
      </tr>`
    }

    return `
      <tr>
        <td class="col-no">${no}</td>
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

    const navigationDueValue = grtNumeric === null ? null : 0.1 * grtNumeric * 2
    const navigationDue = navigationDueValue === null ? `0.1*${grtDisplay}*2` : formatAmount(navigationDueValue)

    const pilotageFirstMiles = 10
    const pilotageSecondMiles = 20
    const pilotageThirdMilesNumeric = toNumber(options?.pilotageThirdMiles)
    const pilotageThirdMiles = pilotageThirdMilesNumeric === null ? 17 : pilotageThirdMilesNumeric

    const pilotageFirstValue =
      grtNumeric === null ? null : 0.0034 * grtNumeric * 2 * pilotageFirstMiles
    const pilotageFirst =
      pilotageFirstValue === null
        ? `0.0034*${grtDisplay}*2*${pilotageFirstMiles}`
        : formatAmount(pilotageFirstValue)

    const pilotageSecondValue =
      grtNumeric === null ? null : 0.0022 * grtNumeric * 2 * pilotageSecondMiles
    const pilotageSecond =
      pilotageSecondValue === null
        ? `0.0022*${grtDisplay}*2*${pilotageSecondMiles}`
        : formatAmount(pilotageSecondValue)

    const pilotageThirdValue =
      grtNumeric === null ? null : 0.0015 * grtNumeric * 2 * pilotageThirdMiles
    const pilotageThird =
      pilotageThirdValue === null
        ? `0.0015*${grtDisplay}*2*${pilotageThirdMiles}`
        : formatAmount(pilotageThirdValue)

    const loaNumeric = toNumber(options?.loa)
    const pickTugRate = (loa?: number | null) => {
      if (loa === null || loa === undefined) return { amount: undefined }
      if (loa >= 205) return { amount: 2800 }
      if (loa >= 190) return { amount: 2600 }
      if (loa >= 175) return { amount: 2400 }
      if (loa >= 160) return { amount: 2180 }
      if (loa >= 145) return { amount: 1960 }
      if (loa >= 120) return { amount: 1490 }
      if (loa >= 95) return { amount: 1020 }
      if (loa >= 80) return { amount: 510 }
      return { amount: undefined }
    }

    const tugRate = pickTugRate(loaNumeric)
    const tugAssistance = tugRate.amount === undefined ? '' : formatAmount(tugRate.amount)
    const mooringLocation = (options?.mooringLocation || '').toLowerCase() === 'anchorage' ? 'anchorage' : 'berth'
    const pickMoorUnmoor = (value?: number | null) => {
      if (value === null || value === undefined) return { amount: undefined }
      if (mooringLocation === 'anchorage') {
        if (value <= 4000) return { amount: 180 }
        if (value < 10000) return { amount: 240 }
        if (value < 15000) return { amount: 330 }
        if (value < 20000) return { amount: 380 }
        return { amount: 440 }
      }

      if (value <= 4000) return { amount: 74 }
      if (value < 10000) return { amount: 110 }
      if (value < 15000) return { amount: 144 }
      if (value < 20000) return { amount: 180 }
      return { amount: 220 }
    }

    const moorUnmoorRate = pickMoorUnmoor(grtNumeric)
    const moorUnmoor = moorUnmoorRate.amount === undefined ? '' : formatAmount(moorUnmoorRate.amount)
    
    const berthDueValue = grtNumeric === null ? null : 0.0031 * berthHoursValue * grtNumeric
    const berthDue = berthDueValue === null ? `0.0031*${grtDisplay}*${berthHoursValue}` : formatAmount(berthDueValue)

    const buoyDueValue = grtNumeric === null ? null : 0.0013 * anchorageHoursValue * grtNumeric
    const buoyDue = buoyDueValue === null ? `0.0013*${grtDisplay}*${anchorageHoursValue}` : formatAmount(buoyDueValue)

    const anchorageFeesValue = grtNumeric === null ? null : 0.0005 * anchorageHoursValue * grtNumeric
    const anchorageFees =
      anchorageFeesValue === null ? `0.0005*${grtDisplay}*${anchorageHoursValue}` : formatAmount(anchorageFeesValue)
    
    const quarantineFeeValue = 95
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

    const clearanceFeesValue = 50
    const clearanceFees = formatAmount(clearanceFeesValue)

    const garbageRemovalValue = mooringLocation === 'anchorage' ? 55 : 35
    const berthDaysNumeric = berthHoursValue / 24
    const garbageRemovalValueFinal = garbageRemovalValue * Math.ceil(berthDaysNumeric / 2)
    const garbageRemoval = formatAmount(garbageRemovalValueFinal)
    
    const defaultRows: QuoteRow[] = []
    let currentNo = 1
    const nextNo = () => currentNo++
    const pushNumbered = (row: QuoteRow) => defaultRows.push({ ...row, no: row.no ?? nextNo() })
    const pushUnnumbered = (row: QuoteRow) => defaultRows.push({ ...row, no: '' })

    pushNumbered({ item: 'Tonnage', details: 'USD 0.034 / GRT x 2 (out)', amount: tonnage })
    pushNumbered({ item: 'Navigation due', details: 'USD 0.1 / GRT x 2 (in + out)', amount: navigationDue })
    pushNumbered({
      item: 'Pilotage',
      details: 'USD0.0034 / GRT (in+out)',
      add: `${pilotageFirstMiles} miles`,
      remark: '1st 10 miles',
      amount: pilotageFirst,
    })
    pushUnnumbered({
      item: '',
      details: 'USD0.0022 / GRT (in+out)',
      add: `${pilotageSecondMiles} miles`,
      remark: '2nd 20 miles',
      amount: pilotageSecond,
    })
    pushUnnumbered({
      item: '',
      details: 'USD0.0015 / GRT (in+out)',
      add: `${pilotageThirdMiles} miles`,
      remark: `3rd ${pilotageThirdMiles} miles`,
      amount: pilotageThird,
    })
    pushNumbered({ item: 'Tug assistance charge', details: '(in & out)', amount: tugAssistance })
    pushNumbered({ item: 'Moor / Unmooring', details: '', amount: moorUnmoor })

    if (mooringLocation === 'anchorage') {
      pushNumbered({
        item: 'Buoy due',
        details: 'USD 0.0013 / GRT / hour x',
        add: anchorageHoursText,
        remark: anchorageRemark,
        amount: buoyDue,
      })
    } else {
      pushNumbered({
        item: 'Berth due',
        details: 'USD 0.0031 / GRT / hour x',
        add: berthHoursText,
        remark: berthRemark,
        amount: berthDue,
      })
    }

    pushNumbered({
      item: 'Anchorage fees if any',
      details: 'USD 0.0005 / GRT / hour x',
      add: anchorageHoursText,
      remark: anchorageRemark,
      amount: anchorageFees,
    })

    pushNumbered({ item: 'Quarantine fee', details: '(out)', amount: quarantineFee })

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

    defaultRows.push({ item: 'Clearance fees', details: '(outward clearance)', amount: clearanceFees })
    defaultRows.push({
      item: 'Garbage removal fee',
      details: mooringLocation === 'anchorage' ? 'USD 55/cbm/2 days/time' : 'USD 35/cbm/2 days/time',
      amount: garbageRemoval,
    })

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
    mooringLocation: (data.at_anchorage || '').trim() ? 'anchorage' : 'berth',
    pilotageThirdMiles: data.pilotage_third_miles,
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
    eta: escapeHtml(data.eta || 'TBN'),
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
