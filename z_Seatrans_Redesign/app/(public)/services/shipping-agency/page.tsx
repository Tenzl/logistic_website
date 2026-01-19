'use client'

import { useEffect } from 'react'
import { ShippingAgency } from '@/modules/service-types/components/admin/ShippingAgencyConfig'
import { useRouter } from 'next/navigation'

export default function ShippingAgencyPage() {
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
      <ShippingAgency onNavigateHome={() => router.push('/')} />
    </main>
  )
}
