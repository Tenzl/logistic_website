import type { Metadata } from 'next'
import PortInformationClient from '../PortInformationClient'

export const metadata: Metadata = {
  title: 'HO CHI MINH Port Information',
  description: 'Port information details for HO CHI MINH port.',
  alternates: {
    canonical: '/port-information/ho-chi-minh',
  },
}

export default function HoChiMinhPortPage() {
  return <PortInformationClient portId="ho-chi-minh" />
}
