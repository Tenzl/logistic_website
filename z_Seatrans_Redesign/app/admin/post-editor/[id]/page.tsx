'use client'

import { PostEditorPage } from '@/features/content/components/PostEditor'
import Header from '../../../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'

export default function PostEditor() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()

  const derivedGroup = user?.role
    ? (user.role.includes('ADMIN') || user.role.includes('EMPLOYEE') ? 'INTERNAL' : 'EXTERNAL')
    : undefined
  const roleGroup = user?.roleGroup ?? derivedGroup
  
  const postId = params?.id && params.id !== 'new' ? Number(params.id) : undefined
  
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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PostEditorPage postId={postId} />
      </main>
      <Footer />
    </div>
  )
}
