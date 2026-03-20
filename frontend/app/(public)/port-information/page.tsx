import type { Metadata } from 'next'
import PortInformationClient from './PortInformationClient'

export const metadata: Metadata = {
  title: 'Port Information',
  description: 'Public port information and navigation notes from Seatrans.',
  alternates: {
    canonical: '/port-information',
  },
  openGraph: {
    type: 'website',
    url: '/port-information',
    title: 'Port Information | Seatrans',
    description: 'Public port information and navigation notes from Seatrans.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Port Information | Seatrans',
    description: 'Public port information and navigation notes from Seatrans.',
  },
}

export default function PortInformationPage() {
  return <PortInformationClient />
}
