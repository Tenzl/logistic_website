import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Seatrans',
  description: 'Contact Seatrans for maritime logistics, shipping agency, and freight forwarding services.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    type: 'website',
    url: '/contact',
    title: 'Contact Seatrans',
    description: 'Contact Seatrans for maritime logistics, shipping agency, and freight forwarding services.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Seatrans',
    description: 'Contact Seatrans for maritime logistics, shipping agency, and freight forwarding services.',
  },
}

export default function Contact() {
  return <ContactClient />
}
