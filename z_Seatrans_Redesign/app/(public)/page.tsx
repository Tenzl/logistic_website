'use client'

import { useRouter } from 'next/navigation'
import { Hero } from '@/modules/landing/components/public/Hero'
import { Solutions } from '@/modules/landing/components/public/Solutions'
import { Coverage } from '@/modules/landing/components/public/Coverage'
import { FieldGallery } from '@/modules/gallery/components/public/FieldGallery'
import { Updates } from '@/modules/landing/components/public/Updates'
import { Partners } from '@/modules/landing/components/public/Partners'

export default function HomePage() {
  const router = useRouter()
  
  return (
    <main>
      <Hero />
      <Solutions onNavigate={(page) => router.push(`/${page}`)} />
      <Coverage />
      <FieldGallery />
      <Updates onNavigateToArticle={(id: number) => router.push(`/insights/${id}`)} />
      <Partners />
    </main>
  )
}
