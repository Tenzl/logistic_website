'use client'

import { useEffect } from 'react'
import { TotalLogistics } from '@/features/services-config/components/TotalLogisticsConfig'
import Header from '../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'
import { useRouter } from 'next/navigation'

export default function TotalLogisticsPage() {
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
        <TotalLogistics onNavigateHome={() => router.push('/')} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
