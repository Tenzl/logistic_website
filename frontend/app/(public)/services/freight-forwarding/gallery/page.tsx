'use client'

import { useEffect } from 'react'
import { FreightForwarding } from '@/modules/service-types/components/admin/FreightForwardingConfig'
import { useRouter } from 'next/navigation'

export default function FreightForwardingGalleryPage() {
  const router = useRouter()
  
  useEffect(() => {
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <main>
      <FreightForwarding onNavigateHome={() => router.push('/')} />
    </main>
  )
}
