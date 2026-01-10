'use client'

import { useEffect } from 'react'
import { CharteringBroking } from '@/features/services-config/components/CharteringBrokingConfig'
import Header from '../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'
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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <CharteringBroking onNavigateHome={() => router.push('/')} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
