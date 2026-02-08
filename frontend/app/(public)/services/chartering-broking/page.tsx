import type { Metadata } from 'next'
import CharteringBrokingClient from './CharteringBrokingClient'

export const metadata: Metadata = {
  title: 'Chartering and Broking Services',
  description: 'Vessel chartering and broking services for bulk, project cargo, and specialized shipments.',
  alternates: {
    canonical: '/services/chartering-broking',
  },
  openGraph: {
    type: 'website',
    url: '/services/chartering-broking',
    title: 'Chartering and Broking Services | Seatrans',
    description: 'Vessel chartering and broking services for bulk, project cargo, and specialized shipments.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chartering and Broking Services | Seatrans',
    description: 'Vessel chartering and broking services for bulk, project cargo, and specialized shipments.',
  },
}

export default function CharteringBrokingPage() {
  return <CharteringBrokingClient />
}
