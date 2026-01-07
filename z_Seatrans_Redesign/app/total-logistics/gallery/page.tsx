'use client'

import { useEffect } from 'react'
import { TotalLogistics } from '@/features/services-config/components/TotalLogisticsConfig'
import Header from '../../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { useRouter } from 'next/navigation'

export default function TotalLogisticsGalleryPage() {
  const router = useRouter()
  
  useEffect(() => {
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <TotalLogistics onNavigateHome={() => router.push('/')} />
      </main>
      <Footer />
    </div>
  )
}
