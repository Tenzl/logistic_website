'use client'

import { useEffect } from 'react'
import { TotalLogistics } from '@/modules/service-types/components/admin/TotalLogisticsConfig'
import { useRouter } from 'next/navigation'

export default function TotalLogisticsClient() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    const scrollTarget = hash === '#gallery' ? 'service-gallery' : hash === '#quote' ? 'quote-form' : null
    if (scrollTarget) {
      setTimeout(() => {
        document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [])

  return (
    <main>
      <TotalLogistics onNavigateHome={() => router.push('/')} />
    </main>
  )
}
