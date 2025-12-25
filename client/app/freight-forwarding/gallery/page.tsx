'use client'

import { useEffect } from 'react'
import { FreightForwardingLogistics } from '@/features/services-config/components/TotalLogisticsConfig'

export default function FreightForwardingGalleryPage() {
  useEffect(() => {
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return <FreightForwardingLogistics />
}
