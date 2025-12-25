import { Anchor, Ship, Package, Globe, Truck, TreePine, Wheat, Mountain, FileText } from 'lucide-react'
import { ServiceTemplate, ServiceTemplateProps } from './ServiceTemplate'

interface CharteringBrokingProps {
  onNavigateHome?: () => void
}

// Configuration for Chartering & Broking Service
export function CharteringBroking({ onNavigateHome }: CharteringBrokingProps) {
  const config: ServiceTemplateProps = {
    serviceName: 'Chartering & Broking',
    serviceIcon: Anchor,
    onNavigateHome,
    serviceTypeId: 2, // Chartering & Broking ID

    hero: {
      title: 'Chartering & Broking Services',
      description: 'Thanks to the support of shipowners community, Seatrans is always recommended to have suitable tonnage with competitive rates to fix our charterer\'s shipments on time.',
      image: 'https://images.unsplash.com/photo-1645255315921-09c386465750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMGZyZWlnaHQlMjBzaGlwJTIwY2hhcnRlcmluZ3xlbnwxfHx8fDE3NjUwNzQzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },

    contacts: {
      showEmergencyBadge: false,
      sectionTitle: 'Contact Our Broking Team',
      sectionDescription: 'Our experienced chartering professionals are ready to arrange suitable tonnage for your cargo',
      teams: [
        {
          title: 'Chartering & Broking',
          subtitle: 'Vessel Fixture & Cargo Operations',
          icon: Anchor,
          contacts: [
            { name: 'PHAN DUY CONG', mobile: '+84.905001077' },
            { name: 'DO DUY AN', mobile: '+84.935015679' }
          ],
          email: 'chartering@seatrans.com.vn'
        }
      ],
      stats: [
        { icon: Ship, value: '100+', label: 'Vessels' },
        { icon: Globe, value: '15+', label: 'Trade Routes' },
        { icon: Package, value: '500K+', label: 'Tons/Year' },
        { icon: FileText, value: '98%', label: 'On-Time Fixtures' }
      ]
    },

    services: {
      sectionTitle: 'Cargo & Tonnage Arrangements',
      sectionDescription: 'Seatrans arranges tonnages for major cargo types across key trade routes',
      items: [
        { 
          name: 'Tapioca Chip',
          description: '7-20K tons per shipment Ex Vietnam to China (Shatian, Fangcheng, Lianyungang, Rizhao, Qingdao)',
          icon: Package
        },
        { 
          name: 'Wood-Chip',
          description: '8-15K BDMT per shipment Ex Vietnam to China, Korea',
          icon: TreePine
        },
        { 
          name: 'Wood-Pellets',
          description: '8-15K tons per shipment Ex Vietnam to Korea (Kunsan, Pyongteak)',
          icon: TreePine
        },
        { 
          name: 'Fertilizer in Bulk',
          description: '5-10K tons per shipment Ex Fuzhou (CN), Nagoya (JP) to Vietnam',
          icon: Wheat
        },
        { 
          name: 'Sand & Ore in Bulk',
          description: '7-10K tons per shipment Ex Vietnam to Huanghua (CN), Qingdao (CN), Taichung (TW)',
          icon: Mountain
        },
        { 
          name: 'Round Logs',
          description: '3-5K cbm per shipment Ex Papua New Guinea & Malaysian ports to Vietnam',
          icon: TreePine
        },
        { 
          name: 'Domestic Sea Transportation',
          description: 'Coastal shipping services within Vietnamese ports for domestic cargo',
          icon: Truck
        }
      ]
    },

    form: {
      badgeText: 'Request Tonnage',
      sectionTitle: 'TONNAGE/VESSEL ORDER',
      sectionDescription: 'Submit your cargo requirements and we will arrange suitable tonnage with competitive rates',
      submitButtonText: 'Submit Order',
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
          id: 'cargoQuantity', 
          label: 'Cargo/Quantity', 
          type: 'text', 
          required: true, 
          placeholder: 'e.g., Tapioca chip 15,000 tons', 
          gridSpan: 2 
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
          id: 'laycanFrom', 
          label: 'LAY CAN - From date', 
          type: 'text', 
          required: true, 
          placeholder: 'DD/MM/YYYY', 
          gridSpan: 1 
        },
        { 
          id: 'laycanTo', 
          label: 'LAY CAN - To date', 
          type: 'text', 
          required: true, 
          placeholder: 'DD/MM/YYYY', 
          gridSpan: 1 
        },
        { 
          id: 'otherInfo', 
          label: 'Other information (optional)', 
          type: 'textarea', 
          placeholder: 'Additional requirements, special handling, preferred vessel type...', 
          gridSpan: 2 
        }
      ],
      onSubmit: (data: any) => {
        console.log('Tonnage order submitted:', data)
        // Handle form submission
      }
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Our Chartering Operations',
      sectionDescription: 'Major cargo operations and trade routes across Asia-Pacific region'
    },

    caseStudies: {
      badgeText: 'Success Stories',
      sectionTitle: 'Recent Fixtures',
      sectionDescription: 'Successful tonnage arrangements delivering competitive rates and on-time performance',
      items: [
        {
          title: 'Tapioca Chip Shipment to China',
          client: 'Agricultural Exporter',
          challenge: 'Required 15,000 tons of tapioca chip shipped from Vietnam to Qingdao with tight laycan window.',
          solution: 'Arranged suitable 20K DWT bulk carrier with experienced owners, competitive freight rate, and flexible loading schedule.',
          result: 'Cargo loaded and delivered within laycan, client saved 12% on freight costs',
          image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80'
        },
        {
          title: 'Wood Pellets to Korea',
          client: 'Biomass Energy Company',
          challenge: 'Regular monthly shipments of 10K tons wood pellets from Vietnam to Kunsan, Korea.',
          solution: 'Secured long-term COA with reliable tonnage provider, ensuring consistent vessel availability and stable rates.',
          result: '12 consecutive on-time deliveries, 18% cost reduction vs spot market',
          image: 'https://images.unsplash.com/photo-1509389344381-e973fca0b0d4?w=800&q=80'
        },
        {
          title: 'Round Logs from PNG',
          client: 'Timber Processing Plant',
          challenge: 'Import 4,000 cbm round logs from Papua New Guinea to Vietnam, specialized handling required.',
          solution: 'Identified geared bulk carrier with log handling experience, coordinated stevedoring at both ports.',
          result: 'Zero cargo damage, smooth customs clearance, repeat business secured',
          image: 'https://images.unsplash.com/photo-1542223616-9de9adb5e3e8?w=800&q=80'
        }
      ]
    }
  }

  return <ServiceTemplate {...config} />
}