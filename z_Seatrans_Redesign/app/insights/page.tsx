'use client'

import { PostsPage } from '@/features/content/components/Insights/PostPage'
import Header from '../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'
import { useRouter } from 'next/navigation'

export default function Insights() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PostsPage 
          onNavigateHome={() => router.push('/')} 
          onNavigateToPostDetail={(id) => router.push(`/insights/${id}`)} 
        />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
