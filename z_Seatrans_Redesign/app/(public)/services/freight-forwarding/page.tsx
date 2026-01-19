'use client'

import { useEffect } from 'react'
import { FreightForwarding } from '@/modules/service-types/components/admin/FreightForwardingConfig'
import { useRouter } from 'next/navigation'

export default function FreightForwardingPage() {
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
      <FreightForwarding onNavigateHome={() => router.push('/')} />
    </main>
  )
}
