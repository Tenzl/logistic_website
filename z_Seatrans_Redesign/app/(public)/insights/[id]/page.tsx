'use client'

import { ArticleDetailPage } from '@/modules/posts/components/public/ArticleDetailPage'
import { useRouter, useParams } from 'next/navigation'

export default function ArticleDetail() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  return (
    <main>
      <ArticleDetailPage 
        articleId={parseInt(id || '0')}
        onNavigateBack={() => router.push('/insights')}
      />
    </main>
  )
}
