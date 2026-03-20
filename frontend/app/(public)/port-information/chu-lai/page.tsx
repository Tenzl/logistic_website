import type { Metadata } from 'next'
import PortInformationClient from '../PortInformationClient'

export const metadata: Metadata = {
  title: 'CHU LAI Port Information',
  description: 'Port information details for CHU LAI port.',
  alternates: {
    canonical: '/port-information/chu-lai',
  },
}

export default function ChuLaiPortPage() {
  return <PortInformationClient portId="chu-lai" />
}
