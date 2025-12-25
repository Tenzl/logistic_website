import { Package, Truck, Plane, Ship, Warehouse, FileCheck, Globe, Clock } from 'lucide-react'
import { ServiceTemplate, ServiceTemplateProps } from './ServiceTemplate'

interface FreightForwardingLogisticsProps {
  onNavigateHome?: () => void
}

// Configuration for Freight Forwarding & Logistics Service
export function FreightForwardingLogistics({ onNavigateHome }: FreightForwardingLogisticsProps) {
  const config: ServiceTemplateProps = {
    serviceName: 'Freight Forwarding & Logistics',
    serviceIcon: Package,
    onNavigateHome,
    serviceTypeId: 3, // Freight Forwarding ID

    hero: {
      title: 'Freight Forwarding & Logistics',
      description: 'SEATRANS\' professional team with their knowledge & experience are able to perform the full range of services: Accepting and Delivering consignments from Door to Door by Sea, Air, Land (FCL/LCL), Multimodal transportation and other total logistics services.',
      image: 'https://images.unsplash.com/photo-1759826350352-c5b0b77729bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dpc3RpY3MlMjB3YXJlaG91c2UlMjBmcmVpZ2h0JTIwZm9yd2FyZGluZ3xlbnwxfHx8fDE3NjUwNzQzMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },

    contacts: {
      showEmergencyBadge: false,
      sectionTitle: 'Contact Our Logistics Team',
      sectionDescription: 'Our freight forwarding experts are ready to provide you with the best rates and solutions',
      teams: [
        {
          title: 'Freight Forwarding',
          subtitle: 'Door-to-Door Solutions',
          icon: Package,
          contacts: [
            { name: 'TA THI THAO LY', mobile: '+84.905.812.679' }
          ],
          email: 'ly.tathithao@seatrans.com.vn'
        },
        {
          title: 'Total Logistics',
          subtitle: 'Complete Supply Chain',
          icon: Warehouse,
          contacts: [
            { name: 'DO DUY AN', mobile: '+84.935015679' }
          ],
          email: 'total.logistics@seatrans.com.vn'
        }
      ],
      stats: [
        { icon: Globe, value: '50+', label: 'Countries' },
        { icon: Ship, value: '10K+', label: 'TEUs/Year' },
        { icon: Clock, value: '24/7', label: 'Support' },
        { icon: Truck, value: '99%', label: 'On-Time' }
      ]
    },

    services: {
      sectionTitle: 'Comprehensive Logistics Services',
      sectionDescription: 'Full range of freight forwarding and logistics solutions tailored to your needs',
      items: [
        { 
          name: 'Global Freight Forwarding (FCL/LCL)',
          description: 'Full Container Load and Less than Container Load services worldwide',
          icon: Ship
        },
        { 
          name: 'Port to Port & Door-to-Door',
          description: 'Flexible delivery options by Air & Sea with accepted bookings',
          icon: Globe
        },
        { 
          name: 'Inland Trucking',
          description: 'Ex Work pick-up & delivery services across the region',
          icon: Truck
        },
        { 
          name: 'Warehousing & Packing',
          description: 'Secure storage facilities and professional packing services',
          icon: Warehouse
        },
        { 
          name: 'Full Customs Formality Services',
          description: 'Complete customs clearance and documentation support',
          icon: FileCheck
        },
        { 
          name: 'Multimodal Transportation',
          description: 'Integrated sea, air, and land transport solutions',
          icon: Plane
        }
      ]
    },

    form: {
      badgeText: 'Get Best Rates',
      sectionTitle: 'REQUEST A QUOTE',
      sectionDescription: 'Hello Seatrans Logistics, please offer us the best rates for our following shipment details:',
      submitButtonText: 'Get Quote',
      fields: [
        { 
          id: 'fullName', 
          label: 'Full name', 
          type: 'text', 
          required: true, 
          placeholder: 'Your full name', 
          gridSpan: 1,
          identity: true
        },
        { 
          id: 'company', 
          label: 'Company', 
          type: 'text', 
          required: true, 
          placeholder: 'Your company', 
          gridSpan: 1,
          identity: true
        },
        { 
          id: 'email', 
          label: 'Email', 
          type: 'email', 
          required: true, 
          placeholder: 'your@email.com', 
          gridSpan: 1,
          identity: true
        },
        { 
          id: 'phone', 
          label: 'Phone', 
          type: 'tel', 
          required: true, 
          placeholder: '+84...', 
          gridSpan: 1,
          identity: true
        },
        { 
          id: 'nation', 
          label: 'Nation', 
          type: 'text', 
          required: true, 
          placeholder: 'Your country', 
          gridSpan: 1,
          identity: true
        },
        { 
          id: 'cargoName', 
          label: 'Cargo name', 
          type: 'text', 
          required: true, 
          placeholder: 'Type of cargo', 
          gridSpan: 2 
        },
        { 
          id: 'deliveryTerm', 
          label: 'Delivery term', 
          type: 'select', 
          required: true, 
          placeholder: 'Select delivery term', 
          gridSpan: 2,
          options: ['CY/CY', 'CY/Door', 'Door/CY', 'Door/Door', 'Port/Port', 'Airport/Airport']
        },
        { 
          id: 'container20', 
          label: 'Container 20\' feet', 
          type: 'number', 
          placeholder: '0 cont', 
          gridSpan: 1 
        },
        { 
          id: 'container40', 
          label: 'Container 40\' feet', 
          type: 'number', 
          placeholder: '0 cont', 
          gridSpan: 1 
        },
        { 
          id: 'loadingPort', 
          label: 'Loading port', 
          type: 'text', 
          required: true, 
          placeholder: 'Port of loading', 
          gridSpan: 1 
        },
        { 
          id: 'dischargingPort', 
          label: 'Discharging port', 
          type: 'text', 
          required: true, 
          placeholder: 'Port of discharge', 
          gridSpan: 1 
        },
        { 
          id: 'shipmentFrom', 
          label: 'SHIPMENT TIME - From date', 
          type: 'text', 
          required: true, 
          placeholder: 'DD/MM/YYYY', 
          gridSpan: 1 
        },
        { 
          id: 'shipmentTo', 
          label: 'SHIPMENT TIME - To date', 
          type: 'text', 
          required: true, 
          placeholder: 'DD/MM/YYYY', 
          gridSpan: 1 
        }
      ],
      onSubmit: (data) => {
        console.log('Freight quote request submitted:', data)
        // Handle form submission - send to ly.tathithao@seatrans.com.vn or total.logistics@seatrans.com.vn
      }
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Our Logistics Operations',
      sectionDescription: 'Door-to-door freight forwarding services across multiple transport modes'
    },

    caseStudies: {
      badgeText: 'Client Success',
      sectionTitle: 'Logistics Excellence',
      sectionDescription: 'Real-world examples of our freight forwarding solutions',
      items: [
        {
          title: 'Door-to-Door Electronics Shipment',
          client: 'Electronics Manufacturer',
          challenge: 'Urgent delivery of high-value electronics from Vietnam factory to European retailers with strict deadline.',
          solution: 'Coordinated FCL ocean freight with bonded warehousing, customs pre-clearance, and final mile delivery to 5 distribution centers.',
          result: 'All shipments delivered on-time, zero damage, 20% cost savings vs air freight',
          image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80'
        },
        {
          title: 'Multimodal Automotive Parts',
          client: 'Auto Parts Distributor',
          challenge: 'Just-in-time delivery system requiring seamless coordination between sea, air, and land transport.',
          solution: 'Implemented weekly LCL consolidation with air backup option, inland trucking network, and real-time tracking.',
          result: '99.5% on-time delivery rate over 12 months, production never delayed',
          image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80'
        },
        {
          title: 'Textile Export Program',
          client: 'Garment Exporter',
          challenge: 'Managing 50+ FCL shipments monthly to US and EU with complex customs requirements.',
          solution: 'Dedicated team handling documentation, customs clearance, warehousing, and container optimization.',
          result: 'Reduced shipping costs by 18%, improved container utilization to 95%',
          image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80'
        }
      ]
    }
  }

  return <ServiceTemplate {...config} />
}