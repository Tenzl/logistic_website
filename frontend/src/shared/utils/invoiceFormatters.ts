export const formatInvoiceDate = (dateInput?: string | Date | null): string => {
  if (!dateInput) return ''
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (Number.isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : ''

  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'long' })
  const year = date.getFullYear()

  // Determine ordinal suffix (st, nd, rd, th)
  let suffix = 'th'
  if (day % 10 === 1 && day !== 11) suffix = 'st'
  else if (day % 10 === 2 && day !== 12) suffix = 'nd'
  else if (day % 10 === 3 && day !== 13) suffix = 'rd'

  return `${day}${suffix} ${month}, ${year}`
}

export const formatCheckMark = (value?: unknown): string => {
  if (typeof value === 'boolean') return value ? 'x' : ''
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
  
  if (['yes', 'y', 'true', '1', 'x'].includes(normalized)) return 'x'
  return ''
}

export const formatCargoDescription = (name?: string, type?: string): string => {
  const n = (name || '').trim().toUpperCase()
  const t = (type || '').trim().toUpperCase()
  
  if (!n) return ''
  if (!t) return n
  
  // Avoid duplication if name ends with type
  if (n.endsWith(t)) return n
  
  return `${n} ${t}`
}
