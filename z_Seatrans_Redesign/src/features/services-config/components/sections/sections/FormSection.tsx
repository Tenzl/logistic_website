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
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { provinceService, type Province } from '@/features/logistics/services/provinceService'
import { portService, type Port } from '@/features/logistics/services/portService'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

const DEFAULT_IDENTITY_FIELDS: FormField[] = [
  {
    id: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Your full name',
    required: true,
    gridSpan: 1,
    identity: true,
  },
  {
    id: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'you@example.com',
    required: true,
    gridSpan: 1,
    identity: true,
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: '+84 123 456 789',
    required: true,
    gridSpan: 1,
    identity: true,
  },
  {
    id: 'company',
    label: 'Company',
    type: 'text',
    placeholder: 'Company name',
    required: true,
    gridSpan: 1,
    identity: true,
  },
]

export interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'port'
  placeholder?: string
  required?: boolean
  options?: string[]
  gridSpan?: 1 | 2
  identity?: boolean
}

export interface InquiryPayload {
  serviceTypeId: number
  fullName: string
  company: string
  email: string
  phone: string
  notes: string
  details: Record<string, string>
}

function ComboboxSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options?: string[]
  placeholder?: string
  disabled?: boolean
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
          className="w-full justify-between"
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
    submitButtonText: string
    onSubmit: (data: InquiryPayload) => void
    serviceTypeId?: number
    loadingFields?: boolean
    fieldsError?: string | null
  }
}) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { user, isAuthenticated, profileComplete } = useAuth()
  
  const [provincesWithPorts, setProvincesWithPorts] = useState<Province[]>([])
  const [portsByProvince, setPortsByProvince] = useState<Record<string, Port[]>>({})
  const [selectedProvinces, setSelectedProvinces] = useState<Record<string, number>>({})
  const [loadingPortsFor, setLoadingPortsFor] = useState<Record<string, boolean>>({})

  const explicitIdentityIds = form.fields.filter(f => f.identity).map(f => f.id)
  const userFieldIds = explicitIdentityIds.length ? explicitIdentityIds : ['fullName', 'email', 'phone', 'company']

  const allFields = useMemo(() => {
    if (explicitIdentityIds.length > 0) return form.fields
    const missingDefaults = DEFAULT_IDENTITY_FIELDS.filter(
      defaultField => !form.fields.some(field => field.id === defaultField.id),
    )
    return [...missingDefaults, ...form.fields]
  }, [form.fields, explicitIdentityIds.length])

  const identityFields = allFields.filter(f => userFieldIds.includes(f.id))
  const otherFields = allFields.filter(f => !userFieldIds.includes(f.id))
  const visibleIdentityFields = identityFields.filter(f => !(isAuthenticated && userFieldIds.includes(f.id)))

  useEffect(() => {
    const initial: Record<string, string> = {}
    allFields.forEach(f => (initial[f.id] = ''))
    setFormData(initial)
  }, [allFields])

  // Load provinces with ports when form has port fields
  useEffect(() => {
    const hasPortFields = allFields.some(f => f.type === 'port')
    if (!hasPortFields) return

    const loadProvinces = async () => {
      try {
        const [provinces, allPorts] = await Promise.all([
          provinceService.getAllProvinces(),
          portService.getAllPorts(),
        ])
        const provinceIdsWithPorts = new Set(allPorts.map(port => port.provinceId))
        setProvincesWithPorts(provinces.filter(p => provinceIdsWithPorts.has(p.id)))
      } catch (error) {
        console.error('Failed to load provinces/ports:', error)
      }
    }
    loadProvinces()
  }, [allFields])

  const loadPortsForField = async (fieldId: string, provinceId: number) => {
    setLoadingPortsFor(prev => ({ ...prev, [fieldId]: true }))
    try {
      const ports = await portService.getPortsByProvince(provinceId)
      setPortsByProvince(prev => ({ ...prev, [fieldId]: ports }))
    } catch (error) {
      console.error('Failed to load ports:', error)
      setPortsByProvince(prev => ({ ...prev, [fieldId]: [] }))
    } finally {
      setLoadingPortsFor(prev => ({ ...prev, [fieldId]: false }))
    }
  }

  // Auto-fill user info and lock fields when logged in
  useEffect(() => {
    if (!isAuthenticated || !user) return
    setFormData(prev => ({
      ...prev,
      fullName: user.fullName || prev.fullName,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      company: (user as any).company || prev.company,
    }))
  }, [isAuthenticated, user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isAuthenticated && !profileComplete) {
      setSubmitError('Please complete your Full Name, Company, Email, and Phone before submitting.')
      setSubmitMessage(null)
      return
    }

    // Guard against missing identity data even when profileComplete flag is true
    const missingUserFields = missingFields
    if (isAuthenticated && missingUserFields.length > 0) {
      setSubmitError(`Please complete your profile fields: ${missingUserFields.join(', ')}`)
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

    const payload: InquiryPayload = {
      serviceTypeId: form.serviceTypeId,
      fullName: isAuthenticated ? user?.fullName || formData.fullName : formData.fullName,
      company: isAuthenticated ? user?.company || formData.company : formData.company,
      email: isAuthenticated ? user?.email || formData.email : formData.email,
      phone: isAuthenticated ? user?.phone || formData.phone : formData.phone,
      notes: formData.otherInfo || formData.notes || '',
      details: otherFields.reduce((acc, field) => {
        acc[field.id] = formData[field.id]
        return acc
      }, {} as Record<string, string>),
    }

    const submit = async () => {
      setSubmitting(true)
      setSubmitError(null)
      setSubmitMessage(null)
      try {
        const response = await fetch(`${API_BASE_URL}/inquiries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeader(),
          },
          body: JSON.stringify(payload),
        })

        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          const message = result?.message || 'Request could not be sent. Please try again.'
          setSubmitError(message)
          return
        }

        setSubmitMessage('Your request was sent successfully. We will contact you shortly.')
        form.onSubmit(payload)
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

  const missingFields = useMemo(() => {
    if (!isAuthenticated) return []
    const gaps: string[] = []
    if (!user?.fullName) gaps.push('Full Name')
    if (!user?.company) gaps.push('Company')
    if (!user?.email) gaps.push('Email')
    if (!user?.phone) gaps.push('Phone')
    return gaps
  }, [isAuthenticated, user])

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
            <h2 className="fade-rise">{form.sectionTitle}</h2>
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
              {isAuthenticated && !profileComplete && !form.fieldsError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Profile incomplete</AlertTitle>
                  <AlertDescription>
                    Please update {missingFields.join(', ')} in your profile before submitting.
                    <Link href="/dashboard" className="ml-2 underline font-semibold">
                      Update profile
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
                <div className="grid md:grid-cols-2 gap-6">
                {form.loadingFields && (
                  <div className="md:col-span-2 text-sm text-muted-foreground">
                    Loading form fields...
                  </div>
                )}
                  {visibleIdentityFields.map(field => {
                    const colSpan = field.gridSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'

                    const isUserField = !!(isAuthenticated && user && userFieldIds.includes(field.id))

                    return (
                      <div key={field.id} className={`space-y-2 ${colSpan}`}>
                        <Label htmlFor={field.id}>
                          {field.label} {field.required && '*'}
                        </Label>

                        {field.type === 'textarea' ? (
                          <Textarea
                            id={field.id}
                            value={formData[field.id] || ''}
                            onChange={e => handleInputChange(field.id, e.target.value)}
                            required={field.required}
                            placeholder={field.placeholder}
                            disabled={isUserField}
                            rows={4}
                          />
                        ) : field.type === 'select' ? (
                          <ComboboxSelect
                            id={field.id}
                            value={formData[field.id] || ''}
                            onChange={v => handleInputChange(field.id, v)}
                            options={Array.isArray(field.options) ? field.options : undefined}
                            placeholder={field.placeholder}
                            disabled={isUserField}
                          />
                        ) : field.type === 'port' ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`${field.id}-province`} className="text-sm text-muted-foreground mb-1.5 block">Province</Label>
                              <Select
                                value={selectedProvinces[field.id] ? String(selectedProvinces[field.id]) : ''}
                                onValueChange={(value) => {
                                  const provinceId = Number(value)
                                  setSelectedProvinces(prev => ({ ...prev, [field.id]: provinceId }))
                                  setFormData(prev => ({ ...prev, [field.id]: '' }))
                                  loadPortsForField(field.id, provinceId)
                                }}
                              >
                                <SelectTrigger id={`${field.id}-province`}>
                                  <SelectValue placeholder="Select province first" />
                                </SelectTrigger>
                                <SelectContent>
                                  {provincesWithPorts.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor={`${field.id}-port`} className="text-sm text-muted-foreground mb-1.5 block">Port</Label>
                              <Select
                                value={formData[field.id] || ''}
                                onValueChange={(value) => handleInputChange(field.id, value)}
                                disabled={!selectedProvinces[field.id] || loadingPortsFor[field.id]}
                              >
                                <SelectTrigger id={`${field.id}-port`}>
                                  <SelectValue placeholder={
                                    !selectedProvinces[field.id] 
                                      ? 'Select province first' 
                                      : loadingPortsFor[field.id] 
                                      ? 'Loading ports...' 
                                      : 'Select port'
                                  } />
                                </SelectTrigger>
                                <SelectContent>
                                  {(portsByProvince[field.id] || []).map(port => (
                                    <SelectItem key={port.id} value={port.id.toString()}>
                                      {port.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type}
                            value={formData[field.id] || ''}
                            onChange={e => handleInputChange(field.id, e.target.value)}
                            required={field.required}
                            placeholder={field.placeholder}
                            disabled={isUserField}
                          />
                        )}
                      </div>
                    )
                  })}

                  {visibleIdentityFields.length > 0 && otherFields.length > 0 && (
                    <div className="md:col-span-2 border-b-2 border-muted" />
                  )}

                  {otherFields.map(field => {
                    const colSpan = field.gridSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'

                    const isUserField = !!(isAuthenticated && user && userFieldIds.includes(field.id))

                    return (
                      <div key={field.id} className={`space-y-2 ${colSpan}`}>
                        <Label htmlFor={field.id}>
                          {field.label} {field.required && '*'}
                        </Label>

                        {field.type === 'textarea' ? (
                          <Textarea
                            id={field.id}
                            value={formData[field.id] || ''}
                            onChange={e => handleInputChange(field.id, e.target.value)}
                            required={field.required}
                            placeholder={field.placeholder}
                            disabled={isUserField}
                            rows={4}
                          />
                        ) : field.type === 'select' ? (
                          <ComboboxSelect
                            id={field.id}
                            value={formData[field.id] || ''}
                            onChange={v => handleInputChange(field.id, v)}
                            options={field.options}
                            placeholder={field.placeholder}
                            disabled={isUserField}
                          />
                        ) : field.type === 'port' ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`${field.id}-province`} className="text-sm text-muted-foreground mb-1.5 block">Province</Label>
                              <Select
                                value={selectedProvinces[field.id] ? String(selectedProvinces[field.id]) : ''}
                                onValueChange={(value) => {
                                  const provinceId = Number(value)
                                  setSelectedProvinces(prev => ({ ...prev, [field.id]: provinceId }))
                                  setFormData(prev => ({ ...prev, [field.id]: '' }))
                                  loadPortsForField(field.id, provinceId)
                                }}
                              >
                                <SelectTrigger id={`${field.id}-province`}>
                                  <SelectValue placeholder="Select province first" />
                                </SelectTrigger>
                                <SelectContent>
                                  {provincesWithPorts.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor={`${field.id}-port`} className="text-sm text-muted-foreground mb-1.5 block">Port</Label>
                              <Select
                                value={formData[field.id] || ''}
                                onValueChange={(value) => handleInputChange(field.id, value)}
                                disabled={!selectedProvinces[field.id] || loadingPortsFor[field.id]}
                              >
                                <SelectTrigger id={`${field.id}-port`}>
                                  <SelectValue placeholder={
                                    !selectedProvinces[field.id] 
                                      ? 'Select province first' 
                                      : loadingPortsFor[field.id] 
                                      ? 'Loading ports...' 
                                      : 'Select port'
                                  } />
                                </SelectTrigger>
                                <SelectContent>
                                  {(portsByProvince[field.id] || []).map(port => (
                                    <SelectItem key={port.id} value={port.id.toString()}>
                                      {port.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type}
                            value={formData[field.id] || ''}
                            onChange={e => handleInputChange(field.id, e.target.value)}
                            required={field.required}
                            placeholder={field.placeholder}
                            disabled={isUserField}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                <Button
                  type="submit"
                  className="w-full hover-lift"
                  size="lg"
                  disabled={submitting || (isAuthenticated && !profileComplete) || !form.serviceTypeId || hasNegativeNumbers}
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
