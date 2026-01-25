'use client'

import { useEffect } from 'react'
import { TotalLogistics } from '@/modules/service-types/components/admin/TotalLogisticsConfig'
import { useRouter } from 'next/navigation'

export default function TotalLogisticsGalleryPage() {
  const router = useRouter()
  
  useEffect(() => {
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <main>
      <TotalLogistics onNavigateHome={() => router.push('/')} />
    </main>
  )
}
