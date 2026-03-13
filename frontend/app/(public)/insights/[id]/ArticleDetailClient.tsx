'use client'

import { ArticleDetailPage } from '@/modules/posts/components/public/ArticleDetailPage'
import { useRouter } from 'next/navigation'

type ArticleDetailClientProps = {
  id: string
}

export default function ArticleDetailClient({ id }: ArticleDetailClientProps) {
  const router = useRouter()

  return (
    <main>
      <ArticleDetailPage
        articleId={parseInt(id || '0')}
        onNavigateBack={() => router.push('/insights')}
      />
    </main>
  )
}
