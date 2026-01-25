'use client'

import { useEffect } from 'react'
import { CharteringBroking } from '@/modules/service-types/components/admin/CharteringBrokingConfig'
import { useRouter } from 'next/navigation'

export default function CharteringBrokingGalleryPage() {
  const router = useRouter()
  
  useEffect(() => {
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <main>
      <CharteringBroking onNavigateHome={() => router.push('/')} />
    </main>
  )
}
