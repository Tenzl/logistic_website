'use client'

import { Signup } from '@/features/auth/components/SignupForm'
import Header from '../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Signup 
          onNavigateHome={() => router.push('/')}
          onNavigateLogin={() => router.push('/login')}
        />
      </main>
      <Footer />
    </div>
  )
}
