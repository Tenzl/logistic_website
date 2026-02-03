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
    serviceTypeId: 2, // Freight Forwarding ID (backend seed)

    hero: {
      title: 'International Freight Forwarding',
      description:"",
      // description: 'End-to-end logistics solutions for air, sea, and land freight. We handle your cargo with precision and care across global supply chains.'
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
      sectionTitle: 'Freight inquiry',
      sectionDescription: 'Tell us about your shipment and we\'ll provide a competitive quote',
      submitButtonText: 'Get Quote',
      submitPath: '/inquiries',
      serviceTypeSlug: 'freight-forwarding',
      fields: [
        { id: 'cargoName', label: 'Cargo name', type: 'text', required: true, placeholder: 'Type of cargo', gridSpan: 2 },
        { id: 'deliveryTerm', label: 'Delivery term', type: 'select', required: true, placeholder: 'Select delivery term', gridSpan: 1, options: ['CY/CY', 'CY/Door', 'Door/CY', 'Door/Door', 'Port/Port'] },
        { id: 'container20', label: 'Container 20\' feet', type: 'number', placeholder: '0 cont', gridSpan: 1 },
        { id: 'container40', label: 'Container 40\' feet', type: 'number', placeholder: '0 cont', gridSpan: 1 },
        { id: 'loadingPort', label: 'Loading port', type: 'port', required: true, gridSpan: 1 },
        { id: 'dischargingPort', label: 'Discharging port', type: 'port', required: true, gridSpan: 1 },
        { id: 'shipmentFrom', label: 'Shipment time - From date', type: 'date', required: true, gridSpan: 1 },
        { id: 'shipmentTo', label: 'Shipment time - To date', type: 'date', required: true, gridSpan: 1 },
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
    }
  }

  return <ServiceTemplate {...config} />
}
