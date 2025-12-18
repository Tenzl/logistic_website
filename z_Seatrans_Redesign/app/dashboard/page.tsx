'use client'

import { UserDashboard } from '@/features/user/components/UserDashboard'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context/AuthContext'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-muted-foreground mb-4">You need an account to access the dashboard.</p>
          <button onClick={() => router.push('/login')} className="text-primary hover:underline">Go to Login</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <UserDashboard onNavigateHome={() => router.push('/')} />
      <ScrollToTop />
    </>
  )
}
