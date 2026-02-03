import { Ship, Clock, Users, Shield, FileText, Award, Anchor, MapPin, TrendingUp } from 'lucide-react'
import { ServiceTemplate, ServiceTemplateProps } from './ServiceTemplate'

interface ShippingAgencyProps {
  onNavigateHome?: () => void
}

// Configuration for Shipping Agency Service
export function ShippingAgency({ onNavigateHome }: ShippingAgencyProps) {
  const config: ServiceTemplateProps = {
    serviceName: 'Shipping Agency',
    serviceIcon: Ship,
    onNavigateHome,
    serviceTypeId: 1, // Shipping Agency ID (check your backend)

    hero: {
      title: 'Shipping Agency Services',
      // description: 'Comprehensive vessel agency services across major Vietnamese ports. Available 24/7 for emergency support and operational assistance.',
      description: "",
      image: 'https://images.unsplash.com/photo-1614568111194-3c251800e81e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJnbyUyMHNoaXAlMjBwb3J0JTIwY29udGFpbmVyfGVufDF8fHx8MTc2NTA3NDMwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },

    contacts: {
      showEmergencyBadge: true,
      sectionTitle: 'Contact our Team',
      sectionDescription: 'Our experienced team is ready to assist you with immediate support',
      teams: [
        {
          title: 'Shipping Agency',
          subtitle: 'Vessel Operations & Husbandry',
          icon: Ship,
          contacts: [
            { name: 'DUC TUYEN', mobile: '+84.914282649' },
            { name: 'LE HUNG', mobile: '+84.1282310497' }
          ],
          email: 'ship.agency@seatrans.com.vn'
        },
        {
          title: 'Operations',
          subtitle: '24/7 Operational Support',
          icon: Clock,
          contacts: [
            { name: 'DO DUY AN', mobile: '+84.935015679' }
          ],
          email: 'operation@seatrans.com.vn'
        }
      ],
      stats: [
        { icon: Clock, value: '24/7', label: 'Available' },
        { icon: TrendingUp, value: '< 2hrs', label: 'Response' },
        { icon: MapPin, value: '150+', label: 'Ports' },
        { icon: Ship, value: '2,500+', label: 'Vessels' }
      ]
    },

    services: {
      sectionTitle: 'Seatrans - Agency Services',
      sectionDescription: 'Complete vessel support services for all your maritime needs',
      items: [
        { 
          name: 'Full husbandry agency',
          description: 'Complete vessel care and port operations management',
          icon: Ship
        },
        { 
          name: 'Protecting agency',
          description: 'Legal and operational protection for vessel owners',
          icon: Shield
        },
        { 
          name: 'Visa application & Crew change',
          description: 'Immigration support and crew logistics',
          icon: Users
        },
        { 
          name: 'Cash To Master delivery',
          description: 'Secure financial services for vessel masters',
          icon: FileText
        },
        { 
          name: 'Repairing / Engineering / Cleaning',
          description: 'Technical support and maintenance services',
          icon: Award
        },
        { 
          name: 'Bunkering & Provision supplies',
          description: 'Fuel and supplies coordination',
          icon: Anchor
        }
      ]
    },

    form: {
      badgeText: 'Get a Quote',
      sectionTitle: 'Port D/A inquiry',
      sectionDescription: 'Submit your vessel details for a detailed port disbursement account',
      submitButtonText: 'Submit Inquiry',
      submitPath: '/inquiries',
      serviceTypeSlug: 'shipping-agency',
      sections: [
        {
          title: 'Party & Vessel',
          fields: [
            { id: 'to', label: 'To (Shipowner)', type: 'text', required: true, placeholder: 'Owner/Principal name', gridSpan: 1 },
            { id: 'mv', label: 'MV (Vessel name)', type: 'mv-prefix', required: true, placeholder: 'MV Your Vessel', gridSpan: 1 },
            { id: 'grt', label: 'GRT', type: 'number', placeholder: 'Gross tonnage', gridSpan: 1 },
            { id: 'dwt', label: 'DWT', type: 'number', placeholder: 'Deadweight (tons)', gridSpan: 1 },
            { id: 'loa', label: 'LOA', type: 'number', placeholder: 'Length overall (m)', gridSpan: 1 },
            { id: 'eta', label: 'ETA', type: 'date', required: false, placeholder: 'dd/mm/yyyy', gridSpan: 1 },
          ]
        },
        {
          title: 'Cargo',
          fields: [
            { id: 'cargoType', label: 'Cargo type', type: 'select', required: true, options: ['IN BULK', 'IN BAGS', 'IN EQUIPMENT'], gridSpan: 1 },
            { id: 'cargoName', label: 'Cargo name', type: 'select', required: true, options: ['WOOD PELLET', 'WOODCHIP', 'EQUIPMENT', 'OTHER'], placeholder: 'Select or choose OTHER', gridSpan: 1 },
            { id: 'cargoNameOther', label: 'Cargo name (if OTHER)', type: 'text', placeholder: 'Enter cargo name', gridSpan: 2, showWhen: { field: 'cargoName', value: 'other' } },
            { id: 'quantityTons', label: 'Quantity (tons)', type: 'number', required: true, placeholder: 'e.g., 15000', gridSpan: 1 },
          ]
        },
        {
          title: 'Trade & Port',
          fields: [
            { id: 'frtTaxType', label: 'Frt tax type (import/export)', type: 'select', required: true, options: ['Import', 'Export'], gridSpan: 1, helperText: 'Export may incur freight tax; import may not.', enableSearch: false },
            { id: 'portOfCall', label: 'Port of call', type: 'port', required: true, placeholder: 'e.g., Quy Nhon, HCM...', gridSpan: 1 },
            { id: 'dischargeLoadingLocation', label: 'Discharge/Loading at', type: 'select', required: true, options: ['Berth', 'Anchorage'], gridSpan: 1, enableSearch: false }
          ]
        },
        {
          title: 'Service options',
          fields: [
            { id: 'boatHireAmount', label: 'Boat-hire for entry quarantine (USD)', type: 'number', placeholder: '0', gridSpan: 1, required: false },
            { id: 'tallyFeeAmount', label: "Ship's side tally fee (USD)", type: 'number', placeholder: '0', gridSpan: 1, required: false },
            { id: 'transportLs', label: 'Transport/Communication in L/S (optional)', type: 'number', placeholder: '0', gridSpan: 2 },
            { id: 'transportQuarantine', label: 'Transport for entry quarantine formality (optional)', type: 'number', placeholder: '0', gridSpan: 2 },
          ]
        }
      ],
      fields: [],
      onSubmit: (data) => {
        console.log('Form submitted:', data)
        // Handle form submission
      }
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Our Shipping Agency Operations',
      sectionDescription: 'Browse images from our shipping agency services across Vietnamese ports'
    }
  }

  return <ServiceTemplate {...config} />
}
