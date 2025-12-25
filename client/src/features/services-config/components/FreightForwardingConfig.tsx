import { Package, Truck, Plane, Ship, Globe, CheckCircle, Clock } from 'lucide-react'
import { ServiceTemplate, ServiceTemplateProps } from './ServiceTemplate'

interface FreightForwardingProps {
  onNavigateHome?: () => void
}

// Configuration for Freight Forwarding Service
export function FreightForwarding({ onNavigateHome }: FreightForwardingProps) {
  const config: ServiceTemplateProps = {
    serviceName: 'Freight Forwarding',
    serviceIcon: Package,
    onNavigateHome,
    serviceTypeId: 3, // Freight Forwarding & Logistics ID

    hero: {
      title: 'International Freight Forwarding',
      description: 'End-to-end logistics solutions for air, sea, and land freight. We handle your cargo with precision and care across global supply chains.'
    },

    contacts: {
      showEmergencyBadge: false,
      sectionTitle: 'Get In Touch',
      sectionDescription: 'Our logistics experts are available to handle your freight needs',
      teams: [
        {
          title: 'Freight Operations',
          subtitle: 'Air, Sea & Land Logistics',
          icon: Package,
          contacts: [
            { name: 'NGUYEN VAN A', mobile: '+84.901234567' },
            { name: 'TRAN THI B', mobile: '+84.902345678' }
          ],
          email: 'freight@seatrans.com.vn'
        }
      ],
      stats: [
        { icon: Globe, value: '50+', label: 'Countries' },
        { icon: Package, value: '10K+', label: 'Shipments/Year' },
        { icon: Clock, value: '24/7', label: 'Support' },
        { icon: Truck, value: '98%', label: 'On-Time Delivery' }
      ]
    },

    services: {
      sectionTitle: 'Freight Solutions',
      sectionDescription: 'Comprehensive forwarding services tailored to your needs',
      items: [
        { 
          name: 'Air Freight',
          description: 'Fast and reliable air cargo services worldwide',
          icon: Plane
        },
        { 
          name: 'Sea Freight',
          description: 'Cost-effective ocean freight for FCL and LCL',
          icon: Ship
        },
        { 
          name: 'Land Transport',
          description: 'Domestic trucking and cross-border delivery',
          icon: Truck
        },
        { 
          name: 'Customs Clearance',
          description: 'Expert customs brokerage and documentation',
          icon: CheckCircle
        },
        { 
          name: 'Warehousing',
          description: 'Secure storage and inventory management',
          icon: Package
        },
        { 
          name: 'Project Cargo',
          description: 'Specialized handling for oversized shipments',
          icon: Globe
        }
      ]
    },

    form: {
      badgeText: 'Request a Quote',
      sectionTitle: 'FREIGHT INQUIRY',
      sectionDescription: 'Tell us about your shipment and we\'ll provide a competitive quote',
      submitButtonText: 'Get Quote',
      fields: [
        { id: 'company', label: 'Company', type: 'text', required: true, placeholder: 'Your company', gridSpan: 1, identity: true },
        { id: 'fullName', label: 'Contact Person', type: 'text', required: true, placeholder: 'Your name', gridSpan: 1, identity: true },
        { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'your@email.com', gridSpan: 1, identity: true },
        { id: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+84...', gridSpan: 1, identity: true },
        { id: 'nation', label: 'Nation', type: 'text', required: true, placeholder: 'Your country', gridSpan: 1, identity: true },
        { id: 'serviceType', label: 'Service Type', type: 'select', required: true, placeholder: 'Select service', gridSpan: 1, options: [
          'Air Freight', 'Sea Freight', 'Land Transport', 'Customs Clearance', 'Warehousing', 'Project Cargo'
        ]},
        { id: 'origin', label: 'Origin', type: 'text', required: true, placeholder: 'Departure location', gridSpan: 1 },
        { id: 'destination', label: 'Destination', type: 'text', required: true, placeholder: 'Arrival location', gridSpan: 1 },
        { id: 'cargoType', label: 'Cargo Type', type: 'text', placeholder: 'Type of goods', gridSpan: 1 },
        { id: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'Total weight', gridSpan: 1 },
        { id: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'L x W x H (cm)', gridSpan: 1 },
        { id: 'additionalInfo', label: 'Additional Information', type: 'textarea', placeholder: 'Special requirements, timeline, etc...', gridSpan: 2 }
      ],
      onSubmit: (data: any) => {
        console.log('Freight inquiry submitted:', data)
        // Handle form submission
      }
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Our Operations',
      sectionDescription: 'Global freight forwarding in action'
    },

    caseStudies: {
      badgeText: 'Client Success',
      sectionTitle: 'Logistics Excellence',
      sectionDescription: 'How we deliver results for our clients',
      items: [
        {
          title: 'Urgent Medical Equipment Delivery',
          client: 'Healthcare Corp',
          challenge: 'Critical medical equipment needed in 48 hours from Europe to Vietnam',
          solution: 'Arranged express air freight, expedited customs clearance, and direct delivery to hospital.',
          result: 'Equipment delivered in 36 hours, patient treatment proceeded on schedule',
          image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&q=80'
        },
        {
          title: 'Automotive Parts Distribution',
          client: 'Auto Manufacturing Ltd',
          challenge: 'Just-in-time delivery system for factory production line',
          solution: 'Implemented weekly FCL shipments with bonded warehouse integration.',
          result: 'Zero production delays over 12 months, 15% cost reduction',
          image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80'
        }
      ]
    }
  }

  return <ServiceTemplate {...config} />
}
