import type { Metadata } from 'next'
import FreightForwardingClient from './FreightForwardingClient'

export const metadata: Metadata = {
  title: 'Freight Forwarding Services',
  description: 'Freight forwarding and logistics services, including customs clearance and multimodal transport.',
  alternates: {
    canonical: '/services/freight-forwarding',
  },
  openGraph: {
    type: 'website',
    url: '/services/freight-forwarding',
    title: 'Freight Forwarding Services | Seatrans',
    description: 'Freight forwarding and logistics services, including customs clearance and multimodal transport.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freight Forwarding Services | Seatrans',
    description: 'Freight forwarding and logistics services, including customs clearance and multimodal transport.',
  },
}

export default function FreightForwardingPage() {
  return <FreightForwardingClient />
}
