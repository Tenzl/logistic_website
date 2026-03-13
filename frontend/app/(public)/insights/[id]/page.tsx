import type { Metadata } from 'next'
import { API_CONFIG } from '@/shared/config/api.config'
import ArticleDetailClient from './ArticleDetailClient'

type ArticleDetailPageProps = {
  params: Promise<{ id: string }>
}

type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

type PostResponse = {
  id: number
  title: string
  content: string
  authorName?: string
  summary?: string
  thumbnailUrl?: string
  publishedAt?: string
}

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

const buildDescription = (post?: PostResponse) => {
  if (!post) return 'Industry insights and maritime updates from Seatrans.'
  if (post.summary) return post.summary
  const text = stripHtml(post.content || '')
  return text.length > 160 ? `${text.slice(0, 157)}...` : text || 'Industry insights and maritime updates from Seatrans.'
}

const resolveImageUrl = (url?: string) => {
  if (!url) return undefined
  if (url.startsWith('http')) return url
  const normalizedPath = url.replace(/\\/g, '/')
  const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  return `${API_CONFIG.ASSET_BASE_URL}${path}`
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const fallbackTitle = `Insight ${id} | Seatrans`
  const canonical = `/insights/${id}`

  try {
    const response = await fetch(
      `${API_CONFIG.API_URL}${API_CONFIG.POSTS.PUBLIC_BY_ID(Number(id))}`,
      { next: { revalidate: 300 } }
    )

    if (!response.ok) {
      return {
        title: fallbackTitle,
        description: 'Industry insights and maritime updates from Seatrans.',
        alternates: { canonical },
        openGraph: { type: 'article', url: canonical, title: fallbackTitle, description: 'Industry insights and maritime updates from Seatrans.' },
        twitter: { card: 'summary_large_image', title: fallbackTitle, description: 'Industry insights and maritime updates from Seatrans.' },
      }
    }

    const result = (await response.json()) as ApiResponse<PostResponse>
    const post = result.data
    const title = post?.title ? `${post.title} | Seatrans` : fallbackTitle
    const description = buildDescription(post)
    const imageUrl = resolveImageUrl(post?.thumbnailUrl)

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: 'article',
        url: canonical,
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    }
  } catch {
    return {
      title: fallbackTitle,
      description: 'Industry insights and maritime updates from Seatrans.',
      alternates: { canonical },
      openGraph: { type: 'article', url: canonical, title: fallbackTitle, description: 'Industry insights and maritime updates from Seatrans.' },
      twitter: { card: 'summary_large_image', title: fallbackTitle, description: 'Industry insights and maritime updates from Seatrans.' },
    }
  }
}

export default async function ArticleDetail({ params }: ArticleDetailPageProps) {
  const { id } = await params
  return <ArticleDetailClient id={id} />
}
