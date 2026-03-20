import type { Metadata } from 'next'
import PortInformationClient from '../PortInformationClient'

export const metadata: Metadata = {
  title: 'HAI PHONG Port Information',
  description: 'Port information details for HAI PHONG port.',
  alternates: {
    canonical: '/port-information/hai-phong',
  },
}

export default function HaiPhongPortPage() {
  return <PortInformationClient portId="hai-phong" />
}
