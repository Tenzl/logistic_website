import { ReactNode, useEffect, useMemo, useState } from 'react'
import { LucideIcon } from 'lucide-react'
import { Hero } from '@/features/landing/components/Hero'

import { BreadcrumbSection } from './sections/sections/BreadcrumbSection'
import { DescriptionSection } from './sections/sections/DescriptionSection'
import { ContactSection, ContactTeam, StatItem } from './sections/sections/ContactSection'
import { ServicesSection, ServiceItem } from './sections/sections/ServicesSection'
import { FormSection, FormField, InquiryPayload } from './sections/sections/FormSection'
import { GallerySection } from './sections/sections/GallerySection'
import { fetchServiceFormFields } from '../services/formFieldService'

export interface ContactPerson {
  name: string
  mobile: string
}

export interface CaseStudy {
  title: string
  client: string
  challenge: string
  solution: string
  result: string
  image: string
}

export interface ServiceTemplateProps {
  serviceName: string
  serviceIcon: LucideIcon
  onNavigateHome?: () => void
  serviceTypeId?: number

  hero: {
    title: string
    description: string
    image?: string
  }

  contacts?: {
    showEmergencyBadge?: boolean
    sectionTitle: string
    sectionDescription: string
    teams: ContactTeam[]
    stats?: StatItem[]
  }

  services?: {
    sectionTitle: string
    sectionDescription: string
    items: ServiceItem[]
  }

  form?: {
    sectionTitle: string
    sectionDescription: string
    badgeText?: string
    fields: FormField[]
    submitButtonText: string
    onSubmit: (data: InquiryPayload) => void
  }

  gallery?: {
    sectionTitle: string
    sectionDescription: string
    enabled: boolean
    imageTypes?: { label: string; value: number }[]
  }

  caseStudies?: {
    sectionTitle: string
    sectionDescription: string
    badgeText?: string
    items: CaseStudy[]
  }

  customSections?: ReactNode[]
}

export function ServiceTemplate({
  serviceName,
  serviceIcon: ServiceIcon,
  onNavigateHome,
  serviceTypeId,
  hero,
  contacts,
  services,
  form,
  gallery,
  customSections
}: ServiceTemplateProps) {
  const [dynamicFields, setDynamicFields] = useState<FormField[]>([])
  const [loadingFields, setLoadingFields] = useState(false)
  const [fieldsError, setFieldsError] = useState<string | null>(null)

  const identityFields: FormField[] = useMemo(() => ([
    { id: 'fullName', label: 'Full name', type: 'text', required: true, placeholder: 'Your full name', gridSpan: 1, identity: true },
    { id: 'company', label: 'Company', type: 'text', required: true, placeholder: 'Your company', gridSpan: 1, identity: true },
    { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'your@email.com', gridSpan: 1, identity: true },
    { id: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+84...', gridSpan: 1, identity: true },
    { id: 'nation', label: 'Nation', type: 'text', required: true, placeholder: 'Your country', gridSpan: 1, identity: true },
  ]), [])

  useEffect(() => {
    if (!serviceTypeId || !form) return
    const load = async () => {
      setLoadingFields(true)
      setFieldsError(null)
      try {
        const response = await fetchServiceFormFields(serviceTypeId)
        const mapped: FormField[] = response.map(f => ({
          id: f.key,
          label: f.label,
          type: f.type,
          required: f.required,
          placeholder: f.placeholder || '',
          gridSpan: (f.gridSpan as 1 | 2 | 3 | undefined) ?? 1,
          identity: false,
          options: f.type === 'select' && f.options ? safeParseOptions(f.options) : undefined,
        }))
        setDynamicFields(mapped)
      } catch (err) {
        setFieldsError(err instanceof Error ? err.message : 'Failed to load form fields')
        setDynamicFields([])
      } finally {
        setLoadingFields(false)
      }
    }
    load()
  }, [serviceTypeId, form])

  const mergedForm = form
    ? {
        ...form,
        fields: [...identityFields, ...dynamicFields],
        serviceTypeId,
        loadingFields,
        fieldsError,
      }
    : undefined

  return (
    <div>
      <Hero title={hero.title} subtitle={serviceName} image={hero.image} />

      <div className="py-16 md:py-24">
        <BreadcrumbSection
          serviceName={serviceName}
          onNavigateHome={() => onNavigateHome?.()}
        />

        <DescriptionSection
          serviceIcon={ServiceIcon}
          description={hero.description}
        />

        {contacts && <ContactSection contacts={contacts} />}

        {services && <ServicesSection services={services} />}

        {form && mergedForm && (
          <FormSection form={mergedForm} />
        )}

        {gallery?.enabled && serviceTypeId && (
          <GallerySection
            serviceTypeId={serviceTypeId}
            gallery={gallery}
          />
        )}

        {customSections?.map((node, i) => (
          <div key={i}>{node}</div>
        ))}
      </div>
    </div>
  )
}

function safeParseOptions(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch (e) {
    return []
  }
}