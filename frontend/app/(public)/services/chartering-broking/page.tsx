'use client'

import { useEffect } from 'react'
import { CharteringBroking } from '@/modules/service-types/components/admin/CharteringBrokingConfig'
import { useRouter } from 'next/navigation'

export default function CharteringBrokingPage() {
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
      <CharteringBroking onNavigateHome={() => router.push('/')} />
    </main>
  )
}
