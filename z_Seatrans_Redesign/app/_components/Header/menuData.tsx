import { Anchor, Container, Truck, Ship } from 'lucide-react'

export interface MenuItem {
  id: number
  title: string
  path?: string
  description?: string
  icon?: any
  subMenu?: MenuItem[]
}

export const menuData: MenuItem[] = [
  {
    id: 1,
    title: 'Solutions',
    subMenu: [
      {
        id: 11,
        title: 'Shipping Agency',
        path: '/services/shipping-agency',
        description: 'Expert vessel handling and port agency services.',
        icon: Anchor,
      },
      {
        id: 12,
        title: 'Chartering & Broking',
        path: '/services/chartering-broking',
        description: 'Global dry cargo chartering solutions.',
        icon: Container,
      },
      {
        id: 13,
        title: 'Freight Forwarding',
        path: '/services/freight-forwarding',
        description: 'Seamless logistics and supply chain management.',
        icon: Truck,
      },
      {
        id: 14,
        title: 'Total Logistics',
        path: '/services/total-logistics',
        description: 'End-to-end integrated logistics services.',
        icon: Ship,
      },
    ],
  },
  {
    id: 2,
    title: 'Insights',
    path: '/insights',
  },
  {
    id: 3,
    title: 'Contact',
    path: '/contact',
  },
]
