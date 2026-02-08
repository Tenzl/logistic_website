import type { Metadata } from 'next'
import TotalLogisticsClient from './TotalLogisticsClient'

export const metadata: Metadata = {
  title: 'Total Logistics Services',
  description: 'End-to-end logistics solutions covering sea, land, and air transport with integrated tracking.',
  alternates: {
    canonical: '/services/total-logistics',
  },
  openGraph: {
    type: 'website',
    url: '/services/total-logistics',
    title: 'Total Logistics Services | Seatrans',
    description: 'End-to-end logistics solutions covering sea, land, and air transport with integrated tracking.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Total Logistics Services | Seatrans',
    description: 'End-to-end logistics solutions covering sea, land, and air transport with integrated tracking.',
  },
}

export default function TotalLogisticsPage() {
  return <TotalLogisticsClient />
}
