'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/context/AuthContext'
import { authService } from '@/features/auth/services/authService'
import { ChevronsUpDown } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

export interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'port' | 'mv-prefix'
  placeholder?: string
  required?: boolean
  options?: string[]
  gridSpan?: 1 | 2
  identity?: boolean
  helperText?: string
  enableSearch?: boolean
  showWhen?: { field: string; value: string | string[] }
}

export interface InquiryPayload {
  serviceTypeId: number
  serviceTypeSlug?: string
  fullName: string
  company: string
  email: string
  phone: string
  notes: string
}

function ComboboxSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  enableSearch = true,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options?: string[]
  placeholder?: string
  disabled?: boolean
  enableSearch?: boolean
}) {
  const [open, setOpen] = useState(false)
  const normalizedOptions = (options || []).map(opt => ({ label: opt, value: opt.toLowerCase() }))
  const selected = normalizedOptions.find(opt => opt.value === (value || '').toLowerCase())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white"
          disabled={disabled}
          id={id}
        >
          {selected ? selected.label : (placeholder || 'Select...')}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[280px]" align="start">
        <Command loop shouldFilter={false}>
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {normalizedOptions.map(opt => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function FormSection({
  form
}: {
  form: {
    sectionTitle: string
    sectionDescription: string
    badgeText?: string
    fields: FormField[]
    sections?: { title?: string; description?: string; fields: FormField[] }[]
    submitButtonText: string
    onSubmit: (data: InquiryPayload) => void
    serviceTypeId?: number
    submitPath?: string
    serviceTypeSlug?: string
    loadingFields?: boolean
    fieldsError?: string | null
  }
}) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()
  // User fields we may want to preserve on reset
  const userFieldIds = ['fullName', 'company', 'email', 'phone']
  
  // Port fields now free-text; no province/port loading needed

  // Flatten sections into fields if sections are provided (no identity fields injected)
  const allFields = useMemo(() => {
    if (form.sections && form.sections.length > 0) {
      return form.sections.flatMap(section => section.fields)
    }
    return form.fields
  }, [form.sections, form.fields])

  const otherFields = allFields

  useEffect(() => {
    const initial: Record<string, string> = {}
    allFields.forEach(f => {
      // Initialize MV prefix fields with "MV "
      if (f.type === 'mv-prefix') {
        initial[f.id] = 'MV '
      } else if (f.id === 'boatHireEnabled' || f.id === 'tallyFeeEnabled') {
        // Default yes/no toggles to "No"
        initial[f.id] = 'no'
      } else {
        initial[f.id] = ''
      }
    })
    setFormData(initial)
  }, [allFields])

  // Port fields are free-text; no province/port loading needed

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setSubmitError('Please log in to submit an inquiry.')
      setSubmitMessage(null)
      return
    }

    if (!form.serviceTypeId) {
      setSubmitError('Missing service identifier. Please try again later.')
      setSubmitMessage(null)
      return
    }

    // Validate: number fields must not be negative
    const numberFields = allFields.filter(f => f.type === 'number')
    for (const field of numberFields) {
      const value = formData[field.id]
      if (value && Number(value) < 0) {
        setSubmitError(`${field.label} cannot be negative. Please enter a value >= 0.`)
        setSubmitMessage(null)
        return
      }
    }

    const toDecimal = (value?: string) => {
      if (value === undefined || value === null) return null
      const trimmed = value.toString().trim()
      if (trimmed === '') return null
      const num = Number(trimmed)
      if (Number.isNaN(num)) return null
      return Math.round(num * 100) / 100
    }


    const submitPath = form.submitPath || '/inquiries'
    const serviceTypeSlug = form.serviceTypeSlug
    const isShippingAgency = serviceTypeSlug === 'shipping-agency'
    const isChartering = serviceTypeSlug === 'chartering-ship-broking'
    const isFreight = serviceTypeSlug === 'freight-forwarding'
    const isLogistics = serviceTypeSlug === 'total-logistics'

    // Map to backend DTO shape for shipping agency
    const shippingAgencyPayload = isShippingAgency
      ? {
          serviceTypeId: form.serviceTypeId,
          serviceTypeSlug: serviceTypeSlug,
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: (user as any)?.company || '',
          notes: formData.otherInfo || formData.notes || '',
          shipownerTo: formData.to,
          vesselName: formData.mv,
          grt: toDecimal(formData.grt),
          dwt: toDecimal(formData.dwt),
          loa: toDecimal(formData.loa),
          eta: formData.eta || null,
          cargoType: formData.cargoType,
          cargoName: formData.cargoName,
          cargoNameOther: formData.cargoNameOther,
          quantityTons: toDecimal(formData.quantityTons),
          frtTaxType: formData.frtTaxType,
          portOfCall: formData.portOfCall,
          dischargeLoadingLocation: formData.dischargeLoadingLocation,
          boatHireAmount: toDecimal(formData.boatHireAmount),
          tallyFeeAmount: toDecimal(formData.tallyFeeAmount),
          transportLs: toDecimal(formData.transportLs),
          transportQuarantine: toDecimal(formData.transportQuarantine),
        }
      : null

    // Map to backend DTO for chartering
    const charteringPayload = isChartering
      ? {
          serviceTypeId: form.serviceTypeId,
          serviceTypeSlug: serviceTypeSlug,
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: (user as any)?.company || '',
          notes: formData.otherInfo || '',
          cargoQuantity: formData.cargoQuantity,
          loadingPort: formData.loadingPort,
          dischargingPort: formData.dischargingPort,
          laycanFrom: formData.laycanFrom || null,
          laycanTo: formData.laycanTo || null,
        }
      : null

    // Map to backend DTO for freight forwarding
    const freightPayload = isFreight
      ? {
          serviceTypeId: form.serviceTypeId,
          serviceTypeSlug: serviceTypeSlug,
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: (user as any)?.company || '',
          notes: formData.otherInfo || '',
          cargoName: formData.cargoName,
          deliveryTerm: formData.deliveryTerm,
          container20: formData.container20 ? parseInt(formData.container20) : null,
          container40: formData.container40 ? parseInt(formData.container40) : null,
          loadingPort: formData.loadingPort,
          dischargingPort: formData.dischargingPort,
          shipmentFrom: formData.shipmentFrom || null,
          shipmentTo: formData.shipmentTo || null,
        }
      : null

    // Map to backend DTO for logistics (same as freight)
    const logisticsPayload = isLogistics
      ? {
          serviceTypeId: form.serviceTypeId,
          serviceTypeSlug: serviceTypeSlug,
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: (user as any)?.company || '',
          notes: formData.otherInfo || '',
          cargoName: formData.cargoName,
          deliveryTerm: formData.deliveryTerm,
          container20: formData.container20 ? parseInt(formData.container20) : null,
          container40: formData.container40 ? parseInt(formData.container40) : null,
          loadingPort: formData.loadingPort,
          dischargingPort: formData.dischargingPort,
          shipmentFrom: formData.shipmentFrom || null,
          shipmentTo: formData.shipmentTo || null,
        }
      : null

    const submit = async () => {
      setSubmitting(true)
      setSubmitError(null)
      setSubmitMessage(null)
      try {
        const submitPath = form.submitPath || '/inquiries'
        const body = shippingAgencyPayload || charteringPayload || freightPayload || logisticsPayload
        
        if (!body) {
          setSubmitError('Invalid service type configuration.')
          return
        }
        
        const response = await fetch(`${API_BASE_URL}${submitPath}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeader(),
          },
          body: JSON.stringify(body),
        })

        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          const message = result?.message || 'Request could not be sent. Please try again.'
          setSubmitError(message)
          return
        }

        setSubmitMessage('Your request was sent successfully. We will contact you shortly.')
        if (form.onSubmit) {
          form.onSubmit(body)
        }
        setFormData(prev => {
          const cleared: Record<string, string> = {}
          Object.keys(prev).forEach(key => {
            const keepUserField = isAuthenticated && userFieldIds.includes(key)
            const userValue = (user as any)?.[key]
            cleared[key] = keepUserField ? userValue || '' : ''
          })
          return cleared
        })
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.')
      } finally {
        setSubmitting(false)
      }
    }

    submit()
  }

  // Helper function to render a field
  const renderField = (
    field: FormField,
    value: string,
    onChange: (id: string, value: string) => void,
    disabled: boolean
  ) => {
    if (field.type === 'textarea') {
      return (
        <Textarea
          id={field.id}
          value={value}
          onChange={e => onChange(field.id, e.target.value)}
          required={field.required}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={4}
          className="bg-white"
        />
      )
    }
    
    if (field.type === 'select') {
      return (
        <ComboboxSelect
          id={field.id}
          value={value}
          onChange={v => onChange(field.id, v)}
          options={field.options}
          placeholder={field.placeholder}
          disabled={disabled}
          enableSearch={field.enableSearch}
        />
      )
    }
    
    if (field.type === 'date') {
      return (
        <DatePicker
          id={field.id}
          value={value}
          onChange={v => onChange(field.id, v)}
          placeholder={field.placeholder || 'dd/mm/yyyy'}
          disabled={disabled}
          required={field.required}
        />
      )
    }
    
    if (field.type === 'mv-prefix') {
      // Special handling for MV prefix that cannot be deleted
      const mvPrefix = 'MV '
      const displayValue = value.startsWith(mvPrefix) ? value : mvPrefix + value
      
      return (
        <Input
          id={field.id}
          value={displayValue}
          onChange={e => {
            const newValue = e.target.value
            // Ensure MV prefix is always present
            if (newValue.startsWith(mvPrefix)) {
              onChange(field.id, newValue)
            } else if (newValue.length < mvPrefix.length) {
              onChange(field.id, mvPrefix)
            }
          }}
          onKeyDown={e => {
            // Prevent deleting past the prefix
            const input = e.target as HTMLInputElement
            const cursorPos = input.selectionStart || 0
            if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos <= mvPrefix.length) {
              e.preventDefault()
            }
          }}
          required={field.required}
          placeholder={field.placeholder}
          disabled={disabled}
          className="bg-white"
        />
      )
    }
    
    if (field.type === 'port') {
      return (
        <Input
          id={field.id}
          value={value}
          onChange={e => onChange(field.id, e.target.value)}
          required={field.required}
          placeholder={field.placeholder || 'Enter port'}
          disabled={disabled}
          className="bg-white"
        />
      )
    }
    
    const isNumber = field.type === 'number'

    return (
      <Input
        id={field.id}
        type={field.type}
        inputMode={isNumber ? 'decimal' : undefined}
        pattern={isNumber ? "^\\d+(\\.\\d{0,2})?$" : undefined}
        step={isNumber ? '0.01' : undefined}
        min={isNumber ? '0' : undefined}
        value={value}
        onChange={e => onChange(field.id, e.target.value)}
        required={field.required}
        placeholder={field.placeholder}
        disabled={disabled}
        className="bg-white"
      />
    )
  }

  const hasNegativeNumbers = useMemo(() => {
    const numberFields = allFields.filter(f => f.type === 'number')
    return numberFields.some(field => {
      const value = formData[field.id]
      return value && Number(value) < 0
    })
  }, [formData, allFields])

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            {form.badgeText && <Badge className="mb-4">{form.badgeText}</Badge>}
            <h2 className="fade-rise text-3xl md:text-4xl font-bold">{form.sectionTitle}</h2>
            <p className="text-muted-foreground mt-4 fade-rise" style={{ animationDelay: '90ms' }}>
              {form.sectionDescription}
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              {form.fieldsError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Unable to load form</AlertTitle>
                  <AlertDescription>{form.fieldsError}</AlertDescription>
                </Alert>
              )}
              {!isAuthenticated && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Login required</AlertTitle>
                  <AlertDescription>
                    Please sign in before submitting your inquiry.
                    <Link href="/auth/login" className="ml-2 underline font-semibold">
                      Go to login
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              {submitMessage && (
                <Alert className="mb-4">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{submitMessage}</AlertDescription>
                </Alert>
              )}

              {submitError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {form.loadingFields && (
                  <div className="text-sm text-muted-foreground">
                    Loading form fields...
                  </div>
                )}
                
                {/* Render sections if provided */}
                {form.sections && form.sections.length > 0 ? (
                  <>
                    {/* Render each section */}
                    {form.sections.map((section, sectionIdx) => {
                      const sectionFields = section.fields
                      if (sectionFields.length === 0) return null

                      return (
                        <div key={sectionIdx} className="space-y-4">
                          {section.title && (
                            <div className="border-b pb-2">
                              <h3 className="text-lg font-semibold">{section.title}</h3>
                              {section.description && (
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                              )}
                            </div>
                          )}
                          <div className="grid md:grid-cols-2 gap-6">
                            {sectionFields.map(field => {
                              // Check if field should be shown based on showWhen condition
                              if (field.showWhen) {
                                const conditionValue = formData[field.showWhen.field]
                                const expectedValues = Array.isArray(field.showWhen.value) 
                                  ? field.showWhen.value 
                                  : [field.showWhen.value]
                                const shouldShow = expectedValues.some(v => 
                                  conditionValue?.toLowerCase() === v.toLowerCase()
                                )
                                if (!shouldShow) return null
                              }

                              const colSpan = field.gridSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'
                              const disabledByToggle = false
                              return (
                                <div key={field.id} className={`space-y-2 ${colSpan}`}>
                                  <Label htmlFor={field.id}>
                                    {field.label} {field.required && '*'}
                                  </Label>
                                  {renderField(field, formData[field.id] || '', handleInputChange, disabledByToggle)}
                                  {field.helperText && (
                                    <p className="text-xs text-muted-foreground">{field.helperText}</p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </>
                ) : (
                  /* Fallback: render fields without sections */
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      {otherFields.map(field => {
                        const colSpan = field.gridSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'
                        const disabledByToggle =
                          (field.id === 'boatHireAmount' && (formData.boatHireEnabled || '').toLowerCase() !== 'yes') ||
                          (field.id === 'tallyFeeAmount' && (formData.tallyFeeEnabled || '').toLowerCase() !== 'yes')
                        return (
                          <div key={field.id} className={`space-y-2 ${colSpan}`}>
                            <Label htmlFor={field.id}>
                              {field.label} {field.required && '*'}
                            </Label>
                            {renderField(field, formData[field.id] || '', handleInputChange, disabledByToggle)}
                            {field.helperText && (
                              <p className="text-xs text-muted-foreground">{field.helperText}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full hover-lift"
                  size="lg"
                  disabled={submitting || !isAuthenticated || !form.serviceTypeId || hasNegativeNumbers}
                >
                  {submitting ? 'Đang gửi...' : form.submitButtonText}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
