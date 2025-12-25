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
      description: 'Comprehensive vessel agency services across major Vietnamese ports. Available 24/7 for emergency support and operational assistance.',
      image: 'https://images.unsplash.com/photo-1614568111194-3c251800e81e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJnbyUyMHNoaXAlMjBwb3J0JTIwY29udGFpbmVyfGVufDF8fHx8MTc2NTA3NDMwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },

    contacts: {
      showEmergencyBadge: true,
      sectionTitle: 'Contact Our Team',
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
      sectionTitle: 'SEATRANS - AGENCY SERVICES',
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
      sectionTitle: 'PORT D/A INQUIRY',
      sectionDescription: 'Submit your vessel details for a detailed port disbursement account',
      submitButtonText: 'Submit Inquiry',
      fields: [
        { id: 'fullName', label: 'Full name', type: 'text', required: true, placeholder: 'Your full name', gridSpan: 1, identity: true },
        { id: 'company', label: 'Company', type: 'text', required: true, placeholder: 'Your company', gridSpan: 1, identity: true },
        { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'your@email.com', gridSpan: 1, identity: true },
        { id: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+84...', gridSpan: 1, identity: true },
        { id: 'nation', label: 'Nation', type: 'text', required: true, placeholder: 'Your country', gridSpan: 1, identity: true },
        { id: 'dwt', label: 'DWT', type: 'number', placeholder: 'Tons', gridSpan: 1 },
        { id: 'grt', label: 'GRT', type: 'number', placeholder: 'Tons', gridSpan: 1 },
        { id: 'loa', label: 'LOA', type: 'number', placeholder: 'Meters', gridSpan: 1 },
        { id: 'cargo', label: 'Cargo/Quantity', type: 'text', placeholder: 'Type and quantity of cargo', gridSpan: 2 },
        { id: 'port', label: 'Port of call', type: 'select', required: true, placeholder: 'Select port', gridSpan: 1, options: [
          'Haiphong', 'Ho Chi Minh', 'Da Nang', 'Quy Nhon', 'Vung Tau', 'Hai Duong', 'Nghi Son'
        ]},
        { id: 'portName', label: 'Port name', type: 'text', placeholder: 'Specific port/terminal name', gridSpan: 1 },
        { id: 'otherInfo', label: 'Other information (optional)', type: 'textarea', placeholder: 'Any additional details about your vessel or requirements...', gridSpan: 2 }
      ],
      onSubmit: (data) => {
        console.log('Form submitted:', data)
        // Handle form submission
      }
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Our Shipping Agency Operations',
      sectionDescription: 'Browse images from our shipping agency services across Vietnamese ports'
    },

    caseStudies: {
      badgeText: 'Success Stories',
      sectionTitle: 'Case Studies',
      sectionDescription: 'Real-world examples of our agency services in action',
      items: [
        {
          title: 'Bulk Carrier Emergency Support',
          client: 'International Shipping Co.',
          challenge: 'Engine failure requiring urgent repair coordination in Haiphong',
          solution: 'Coordinated emergency engineering team, secured spare parts within 8 hours, and managed port authority communications.',
          result: 'Vessel operational in 36 hours, saving $120K in demurrage costs',
          image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80'
        },
        {
          title: 'Complex Crew Change Operation',
          client: 'Pacific Maritime Lines',
          challenge: 'Multi-national crew change during COVID-19 restrictions',
          solution: 'Managed visa applications for 15 crew members from 6 countries, coordinated quarantine facilities, and arranged safe transfers.',
          result: 'Successful crew change with zero delays and full compliance',
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80'
        },
        {
          title: 'Container Vessel Quick Turnaround',
          client: 'Global Freight Services',
          challenge: 'Tight schedule requiring expedited port clearance and bunkering',
          solution: 'Pre-cleared documentation, coordinated simultaneous bunkering and loading operations, streamlined customs process.',
          result: 'Port stay reduced by 18 hours, ahead of schedule departure',
          image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80'
        }
      ]
    }
  }

  return <ServiceTemplate {...config} />
}