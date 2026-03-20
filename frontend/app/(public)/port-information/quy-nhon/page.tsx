import type { Metadata } from 'next'
import PortInformationClient from '../PortInformationClient'

export const metadata: Metadata = {
  title: 'QUY NHON Port Information',
  description: 'Port information details for QUY NHON port.',
  alternates: {
    canonical: '/port-information/quy-nhon',
  },
}

export default function QuyNhonPortPage() {
  return <PortInformationClient portId="quy-nhon" />
}
