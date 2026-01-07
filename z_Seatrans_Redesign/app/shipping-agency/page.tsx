'use client'

import { useEffect } from 'react'
import { ShippingAgency } from '@/features/services-config/components/ShippingAgencyConfig'
import Header from '../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'
import { useRouter } from 'next/navigation'

export default function ShippingAgencyPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Check if URL has #gallery hash
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
        <ShippingAgency onNavigateHome={() => router.push('/')} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
