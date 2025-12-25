'use client'

import { ArticleDetailPage } from '@/features/content/components/ArticleDetailPage'
import Header from '../../(root)/components/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'
import { useRouter, useParams } from 'next/navigation'

export default function ArticleDetail() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ArticleDetailPage 
          articleId={parseInt(id || '0')}
          onNavigateBack={() => router.push('/')}
        />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
