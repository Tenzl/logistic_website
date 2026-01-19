'use client'

import { useRouter } from 'next/navigation'
import Header from '@/app/_components/Header/Header'
import { Hero } from '@/modules/landing/components/public/Hero'
import { Solutions } from '@/modules/landing/components/public/Solutions'
import { Coverage } from '@/modules/landing/components/public/Coverage'
import { FieldGallery } from '@/modules/gallery/components/public/FieldGallery'
import { Updates } from '@/modules/landing/components/public/Updates'
import { Partners } from '@/modules/landing/components/public/Partners'
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
