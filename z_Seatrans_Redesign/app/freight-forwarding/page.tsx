'use client'

import { useEffect } from 'react'
import { FreightForwarding } from '@/features/services-config/components/FreightForwardingConfig'
import Header from '../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'
import { useRouter } from 'next/navigation'

export default function FreightForwardingPage() {
  const router = useRouter()
  
  useEffect(() => {
    if (window.location.hash === '#gallery') {
      setTimeout(() => {
        document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <FreightForwarding onNavigateHome={() => router.push('/')} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
