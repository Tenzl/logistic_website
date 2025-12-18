'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/context/AuthContext'
import { authService } from '@/features/auth/services/authService'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

export interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'date'
  placeholder?: string
  required?: boolean
  options?: string[]
  gridSpan?: 1 | 2 | 3
  identity?: boolean
}

export interface InquiryPayload {
  serviceTypeId: number
  fullName: string
  company: string
  email: string
  phone: string
  nation: string
  notes: string
  details: Record<string, string>
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

  const explicitIdentityIds = form.fields.filter(f => f.identity).map(f => f.id)
  const userFieldIds = explicitIdentityIds.length ? explicitIdentityIds : ['fullName', 'email', 'phone', 'company', 'nation']
  const identityFields = form.fields.filter(f => userFieldIds.includes(f.id))
  const otherFields = form.fields.filter(f => !userFieldIds.includes(f.id))
  const visibleIdentityFields = identityFields.filter(f => !(isAuthenticated && userFieldIds.includes(f.id)))

  useEffect(() => {
    const initial: Record<string, string> = {}
    form.fields.forEach(f => (initial[f.id] = ''))
    setFormData(initial)
  }, [form.fields])

  // Auto-fill user info and lock fields when logged in
  useEffect(() => {
    if (!isAuthenticated || !user) return
    setFormData(prev => ({
      ...prev,
      fullName: user.fullName || prev.fullName,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      company: (user as any).company || prev.company,
      nation: (user as any).nation || prev.nation,
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

    if (!form.serviceTypeId) {
      setSubmitError('Missing service identifier. Please try again later.')
      setSubmitMessage(null)
      return
    }

    const payload: InquiryPayload = {
      serviceTypeId: form.serviceTypeId,
      fullName: isAuthenticated ? user?.fullName || formData.fullName : formData.fullName,
      company: isAuthenticated ? user?.company || formData.company : formData.company,
      email: isAuthenticated ? user?.email || formData.email : formData.email,
      phone: isAuthenticated ? user?.phone || formData.phone : formData.phone,
      nation: isAuthenticated ? user?.nation || formData.nation : formData.nation,
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

          <Card className="hover-lift">
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
                    const colSpan =
                      field.gridSpan === 3
                        ? 'md:col-span-2'
                        : field.gridSpan === 1
                        ? 'md:col-span-1'
                        : 'md:col-span-2'

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
                          <Select
                            value={formData[field.id] || ''}
                            onValueChange={(v: string) => handleInputChange(field.id, v)}
                            disabled={isUserField}
                          >
                            <SelectTrigger id={field.id}>
                              <SelectValue placeholder={field.placeholder || 'Select...'} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map(option => (
                                <SelectItem key={option} value={option.toLowerCase()}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    const colSpan =
                      field.gridSpan === 3
                        ? 'md:col-span-2'
                        : field.gridSpan === 1
                        ? 'md:col-span-1'
                        : 'md:col-span-2'

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
                          <Select
                            value={formData[field.id] || ''}
                            onValueChange={(v: string) => handleInputChange(field.id, v)}
                            disabled={isUserField}
                          >
                            <SelectTrigger id={field.id}>
                              <SelectValue placeholder={field.placeholder || 'Select...'} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map(option => (
                                <SelectItem key={option} value={option.toLowerCase()}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                  disabled={submitting || (isAuthenticated && !profileComplete) || !form.serviceTypeId}
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
