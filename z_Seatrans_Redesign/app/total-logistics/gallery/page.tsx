'use client'

import { useEffect } from 'react'
import { TotalLogistics } from '@/features/services-config/components/TotalLogisticsConfig'

export default function TotalLogisticsGalleryPage() {
  useEffect(() => {
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return <TotalLogistics />
}
