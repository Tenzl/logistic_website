'use client'

import { PostsPage } from '@/modules/posts/components/public/Insights/PostPage'
import { useRouter } from 'next/navigation'

export default function InsightsClient() {
  const router = useRouter()

  return (
    <main>
      <PostsPage
        onNavigateHome={() => router.push('/')}
        onNavigateToPostDetail={(id) => router.push(`/insights/${id}`)}
      />
    </main>
  )
}
