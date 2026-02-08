import type { Metadata } from 'next'
import ShippingAgencyClient from './ShippingAgencyClient'

export const metadata: Metadata = {
  title: 'Shipping Agency Services',
  description: 'Shipping agency services in Vietnam ports, including port clearance, vessel husbandry, and operational support.',
  alternates: {
    canonical: '/services/shipping-agency',
  },
  openGraph: {
    type: 'website',
    url: '/services/shipping-agency',
    title: 'Shipping Agency Services | Seatrans',
    description: 'Shipping agency services in Vietnam ports, including port clearance, vessel husbandry, and operational support.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping Agency Services | Seatrans',
    description: 'Shipping agency services in Vietnam ports, including port clearance, vessel husbandry, and operational support.',
  },
}

export default function ShippingAgencyPage() {
  return <ShippingAgencyClient />
}
