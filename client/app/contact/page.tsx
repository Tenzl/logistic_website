'use client'

import { ContactPage } from '@/features/inquiries/components/ContactPage'
import Header from '../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'
import { useRouter } from 'next/navigation'

export default function Contact() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ContactPage onNavigateHome={() => router.push('/')} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
