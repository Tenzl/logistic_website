import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Calendar, Clock, Eye, Tag, User } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { postService, Post } from '../services/postService'

interface ArticleDetailPageProps {
  articleId: number
  onNavigateBack: () => void
}

type ContentBlock = HTMLElement

const MEDIA_SELECTOR = 'img, picture, video, iframe, svg, table, pre, code'

function decorateContent(html: string): string {
  // Tag blocks so we can style spacing/width without relying on CSS :has()
  if (typeof window === 'undefined') return html

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const blocks = Array.from(
      doc.querySelectorAll('p, ul, ol, h1, h2, h3, h4, h5, h6, blockquote')
    ) as ContentBlock[]

    for (const el of blocks) {
      const hasMedia = el.querySelector(MEDIA_SELECTOR) !== null

      // Used for 42rem width constraint (text-only blocks)
      if (!hasMedia) el.classList.add('content-text')

      // Tag paragraphs separately for spacing rules
      if (el.tagName.toLowerCase() === 'p') {
        if (hasMedia) el.classList.add('content-media-p')
        else el.classList.add('content-text-p')
      }
    }

    // Remove empty paragraphs like <p>&nbsp;</p>
    const paragraphs = Array.from(doc.querySelectorAll('p')) as HTMLParagraphElement[]
    for (const p of paragraphs) {
      const hasMedia = p.querySelector(MEDIA_SELECTOR) !== null
      const text = (p.textContent || '').replace(/\u00a0/g, ' ').trim()
      if (!hasMedia && text.length === 0) p.remove()
    }

    return doc.body.innerHTML
  } catch {
    return html
  }
}

function formatDate(value?: string | Date | null) {
  if (!value) return ''
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

export function ArticleDetailPage({ articleId, onNavigateBack }: ArticleDetailPageProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const prefersReducedMotion = useReducedMotion()
  const [headerRef, headerVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [contentRef, contentVisible] = useIntersectionObserver({ threshold: 0.1 })

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    postService
      .getById(articleId)
      .then((data) => setPost(data))
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setError('Failed to load the article')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [articleId])

  const decoratedHtml = useMemo(() => decorateContent(post?.content || ''), [post?.content])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-[420px] animate-pulse rounded-2xl bg-muted" />
        <div className="mt-8 space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24">
        <p className="text-destructive">{error || 'Article not found'}</p>
        <Button variant="ghost" className="mt-6" onClick={onNavigateBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    )
  }

  const authorName = post.author?.fullName || post.authorName || 'Admin'
  const publishedLabel = formatDate(post.publishedAt as any)
  const readingMinutes = post.readingTime || 5

  return (
    <article className="mx-auto max-w-7xl px-6 py-16">
      <Button variant="ghost" className="mb-10" onClick={onNavigateBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <header
        ref={headerRef}
        className={`mx-auto max-w-5xl transition-all duration-700 ${
          headerVisible || prefersReducedMotion ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {post.categories?.map((c) => (
            <Badge key={c.id} variant="secondary" className="text-xs">
              {c.name}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl font-semibold tracking-tight leading-[1.22] md:text-5xl md:leading-[1.18]">
          {post.title}
        </h1>

        {post.summary && (
          <p className="mt-4 max-w-3xl text-xl leading-relaxed text-muted-foreground">
            {post.summary}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <User className="h-4 w-4" /> {authorName}
          </span>

          {publishedLabel && (
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {publishedLabel}
            </span>
          )}

          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" /> {readingMinutes} min read
          </span>

          <span className="inline-flex items-center gap-2">
            <Eye className="h-4 w-4" /> {post.viewCount}
          </span>
        </div>

        <div className="mt-10 h-px w-full bg-border" />
      </header>

      {/* Thumbnail intentionally not rendered */}

      <section
        ref={contentRef}
        className={`mx-auto mt-14 max-w-[56rem] transition-all duration-700 ${
          contentVisible || prefersReducedMotion ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div
          className={[
            'article-content prose prose-2xl max-w-none',

            // Constrain ONLY text-only blocks to 42rem and center them
            '[&_.content-text]:mx-auto [&_.content-text]:max-w-[42rem]',

            // IMPORTANT: prevent "margin collapse" by controlling ONLY bottom margins.
            // Also neutralize prose default p margins so our rules always win.
            'prose-p:m-0',

            // Text paragraphs: bottom 20px + line-height 25.92px
            '[&_.content-text-p]:mt-0 [&_.content-text-p]:mb-[20px] [&_.content-text-p]:leading-[25.92px]',

            // Media paragraphs (contains image/video/etc): bottom 20px
            '[&_.content-media-p]:mt-[30px] [&_.content-media-p]:mb-[30px]',

            // Headings / links / strong
            'prose-headings:tracking-tight prose-headings:font-semibold',
            'prose-a:underline prose-a:underline-offset-4',
            'prose-strong:font-semibold',

            // Lists
            'prose-ul:list-disc prose-ol:list-decimal',
            'prose-ul:pl-6 prose-ol:pl-6',
            'prose-ul:my-4 prose-ol:my-4',
            'prose-li:my-1',
            'prose-li:marker:text-muted-foreground',

            // Images inside content
            'prose-img:rounded-2xl prose-img:shadow-sm prose-img:mx-auto',

            // Blockquotes
            'prose-blockquote:border-l-border prose-blockquote:text-muted-foreground',
          ].join(' ')}
          dangerouslySetInnerHTML={{ __html: decoratedHtml }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </section>
    </article>
  )
}
