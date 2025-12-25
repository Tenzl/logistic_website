'use client'

import { useEffect } from 'react'
import { FreightForwarding } from '@/features/services-config/components/FreightForwardingConfig'

export default function FreightForwardingGalleryPage() {
  useEffect(() => {
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return <FreightForwarding />
}
