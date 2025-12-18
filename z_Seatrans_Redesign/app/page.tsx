'use client'

import { useRouter } from 'next/navigation'
import Header from './(root)/components/Header/Header'
import { Hero } from '@/features/landing/components/Hero'
import { Solutions } from '@/features/landing/components/Solutions'
import { Coverage } from '@/features/landing/components/Coverage'
import { FieldGallery } from '@/features/gallery/components/FieldGallery'
import { Updates } from '@/features/landing/components/Updates'
import { Partners } from '@/features/landing/components/Partners'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'

export default function HomePage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Solutions onNavigate={(page) => router.push(`/${page}`)} />
        <Coverage />
        <FieldGallery />
        <Updates onNavigateToArticle={(id: number) => router.push(`/insights/${id}`)} />
        <Partners />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
