'use client'

import { ContactPage } from '@/modules/inquiries/components/public/ContactPage'
import { useRouter } from 'next/navigation'

export default function Contact() {
  const router = useRouter()
  
  return (
    <main>
      <ContactPage onNavigateHome={() => router.push('/')} />
    </main>
  )
}
