import type { Metadata } from 'next'
import PortInformationClient from '../PortInformationClient'

export const metadata: Metadata = {
  title: 'DA NANG Port Information',
  description: 'Port information details for DA NANG port.',
  alternates: {
    canonical: '/port-information/da-nang',
  },
}

export default function DaNangPortPage() {
  return <PortInformationClient portId="da-nang" />
}
