'use client'

import { AdminPage } from '@/features/admin/components/AdminDashboard'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context/AuthContext'

export default function Admin() {
  const router = useRouter()
  const { user } = useAuth()

  const derivedGroup = user?.role
    ? (user.role.includes('ADMIN') || user.role.includes('EMPLOYEE') ? 'INTERNAL' : 'EXTERNAL')
    : undefined
  const roleGroup = user?.roleGroup ?? derivedGroup
  
  if (!user || roleGroup !== 'INTERNAL') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <button onClick={() => router.push('/')} className="text-primary hover:underline">Return to Home</button>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <AdminPage onNavigateHome={() => router.push('/')} />
      <ScrollToTop />
    </>
  )
}
