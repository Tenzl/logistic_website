import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

import { HeroBannerSection } from './sections/HeroBannerSection'
import { ContactSection, ContactTeam, StatItem } from './sections/ContactSection'
import { ServicesSection, ServiceItem } from './sections/ServicesSection'
import { FormSection, FormField, InquiryPayload } from './sections/FormSection'
import { GallerySection } from './sections/GallerySection'

export interface ContactPerson {
  name: string
  mobile: string
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
    subtitle?: string
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
    sections?: { title?: string; description?: string; fields: FormField[] }[]
    submitButtonText: string
    onSubmit: (data: InquiryPayload) => void
    submitPath?: string
    serviceTypeSlug?: string
  }

  gallery?: {
    sectionTitle: string
    sectionDescription: string
    enabled: boolean
    imageTypes?: { label: string; value: number }[]
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
  customSections,
}: ServiceTemplateProps) {
  const mergedForm = form
    ? {
        ...form,
        fields: form.fields,
        sections: form.sections,
        serviceTypeId,
        submitPath: form.submitPath,
        serviceTypeSlug: form.serviceTypeSlug,
        loadingFields: false,
        fieldsError: null,
      }
    : undefined

  return (
    <div>
      <HeroBannerSection
        title={hero.title}
        subtitle={hero.subtitle || 'Services'}
        description={hero.description}
        image={hero.image || ''}
        serviceName={serviceName}
        serviceIcon={ServiceIcon}
        onNavigateHome={onNavigateHome}
      />

      <div className="container pb-10">
        {contacts && <ContactSection contacts={contacts} />}

        {services && <ServicesSection services={services} />}

        {form && mergedForm && <FormSection form={mergedForm} />}

        {gallery?.enabled && serviceTypeId && (
          <GallerySection serviceTypeId={serviceTypeId} gallery={gallery} />
        )}

        {customSections?.map((node, i) => (
          <div key={i}>{node}</div>
        ))}
      </div>
    </div>
  )
}
