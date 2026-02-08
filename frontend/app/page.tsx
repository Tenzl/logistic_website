import type { Metadata } from 'next'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = {
  title: 'Seatrans - Maritime Logistics Solutions',
  description: 'Professional shipping agency, chartering broking, and freight forwarding services',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Seatrans - Maritime Logistics Solutions',
    description: 'Professional shipping agency, chartering broking, and freight forwarding services',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seatrans - Maritime Logistics Solutions',
    description: 'Professional shipping agency, chartering broking, and freight forwarding services',
  },
}

export default function HomePage() {
  return <HomePageClient />
}
