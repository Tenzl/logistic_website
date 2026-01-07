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
    serviceTypeId: 3, // Chartering & Broking ID (backend seed)

    hero: {
      title: 'Chartering & Broking Services',
      description:
        "Thanks to the support of shipowners community, Seatrans is always recommended to have suitable tonnage with competitive rates to fix our charterer's shipments on time.",
      image:
        'https://images.unsplash.com/photo-1645255315921-09c386465750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMGZyZWlnaHQlMjBzaGlwJTIwY2hhcnRlcmluZ3xlbnwxfHx8fDE3NjUwNzQzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },

    contacts: {
      showEmergencyBadge: false,
      sectionTitle: 'Contact our Broking Team',
      sectionDescription: 'Our experienced chartering professionals are ready to arrange suitable tonnage for your cargo',
      teams: [
        {
          title: 'Chartering & Broking',
          subtitle: 'Vessel Fixture & Cargo Operations',
          icon: Anchor,
          contacts: [
            { name: 'PHAN DUY CONG', mobile: '+84.905001077' },
            { name: 'DO DUY AN', mobile: '+84.935015679' },
          ],
          email: 'chartering@seatrans.com.vn',
        },
      ],
      stats: [
        { icon: Ship, value: '100+', label: 'Vessels' },
        { icon: Globe, value: '15+', label: 'Trade Routes' },
        { icon: Package, value: '500K+', label: 'Tons/Year' },
        { icon: FileText, value: '98%', label: 'On-Time Fixtures' },
      ],
    },

    services: {
      sectionTitle: 'Cargo & Tonnage Arrangements',
      sectionDescription: 'Seatrans arranges tonnages for major cargo types across key trade routes',
      items: [
        {
          name: 'Tapioca Chip',
          description: '7-20K tons per shipment Ex Vietnam to China (Shatian, Fangcheng, Lianyungang, Rizhao, Qingdao)',
          icon: Package,
        },
        {
          name: 'Wood-Chip',
          description: '8-15K BDMT per shipment Ex Vietnam to China, Korea',
          icon: TreePine,
        },
        {
          name: 'Wood-Pellets',
          description: '8-15K tons per shipment Ex Vietnam to Korea (Kunsan, Pyongteak)',
          icon: TreePine,
        },
        {
          name: 'Fertilizer in Bulk',
          description: '5-10K tons per shipment Ex Fuzhou (CN), Nagoya (JP) to Vietnam',
          icon: Wheat,
        },
        {
          name: 'Sand & Ore in Bulk',
          description: '7-10K tons per shipment Ex Vietnam to Huanghua (CN), Qingdao (CN), Taichung (TW)',
          icon: Mountain,
        },
        {
          name: 'Round Logs',
          description: '3-5K cbm per shipment Ex Papua New Guinea & Malaysian ports to Vietnam',
          icon: TreePine,
        },
        {
          name: 'Domestic Sea Transportation',
          description: 'Coastal shipping services within Vietnamese ports for domestic cargo',
          icon: Truck,
        },
      ],
    },

    form: {
      badgeText: 'Request Tonnage',
      sectionTitle: 'Tonnage/Vessel order',
      sectionDescription: 'Submit your cargo requirements and we will arrange suitable tonnage with competitive rates',
      submitButtonText: 'Submit Order',
      submitPath: '/inquiries',
      serviceTypeSlug: 'chartering-ship-broking',
      fields: [
        { id: 'cargoQuantity', label: 'Cargo/Quantity', type: 'number', required: true, placeholder: 'e.g., Tapioca chip 15,000 tons', gridSpan: 2 },
        { id: 'loadingPort', label: 'Loading port', type: 'port', required: true, gridSpan: 1 },
        { id: 'dischargingPort', label: 'Discharging port', type: 'port', required: true, gridSpan: 1 },
        { id: 'laycanFrom', label: 'Laycan - From date', type: 'date', required: true, gridSpan: 1 },
        { id: 'laycanTo', label: 'Laycan - To date', type: 'date', required: true, gridSpan: 1 },
        { id: 'otherInfo', label: 'Other information (optional)', type: 'textarea', placeholder: 'Any additional details...', gridSpan: 2 },
      ],
      onSubmit: (data: any) => {
        console.log('Tonnage order submitted:', data)
        // Handle form submission
      },
    },

    gallery: {
      enabled: true,
      sectionTitle: 'Our Chartering Operations',
      sectionDescription: 'Major cargo operations and trade routes across Asia-Pacific region'
    }
  }

  return <ServiceTemplate {...config} />
}