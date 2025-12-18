'use client'

import { useEffect } from 'react'
import { CharteringBroking } from '@/features/services-config/components/CharteringBrokingConfig'

export default function CharteringBrokingGalleryPage() {
  useEffect(() => {
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return <CharteringBroking />
}
