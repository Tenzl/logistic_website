import { useState, useEffect } from 'react'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { Calendar, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { postService, Post, CategoryResponse } from '@/modules/posts/services/postService'
import { categoryService } from '@/modules/categories/services/categoryService'
import pageStyles from './PostPage.module.css'
import cardStyles from './PostCard.module.css'
import { API_CONFIG } from '@/shared/config/api.config'

// Helper to extract excerpt from post
const extractExcerpt = (post: Post): string => {
  // First, try summary
  if (post.content && post.content.includes('summary')) {
    const summaryMatch = post.content.match(/<summary[^>]*>(.*?)<\/summary>/is)
    if (summaryMatch) {
      const text = summaryMatch[1].replace(/<[^>]*>/g, '').trim()
      if (text) return text
    }
  }

  // Extract first paragraph that contains text (not just images)
  if (post.content) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(post.content, 'text/html')
    const paragraphs = doc.querySelectorAll('p')

    for (const p of paragraphs) {
      // Skip paragraphs that only contain images
      if (p.querySelector('img') && !p.textContent?.trim()) continue

      const text = p.textContent?.trim()
      if (text && text.length > 20) {
        return text.length > 150 ? text.substring(0, 150) + '...' : text
      }
    }
  }

  return 'No preview available...'
}

// Helper to get image URL
const getImageUrl = (url?: string): string => {
  if (!url) return 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800'
  if (url.startsWith('http')) return url
  const normalizedPath = url.replace(/\\/g, '/')
  const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  return `${API_CONFIG.ASSET_BASE_URL}${path}`
}

interface PostsPageProps {
  onNavigateHome: () => void
  onNavigateToPostDetail: (postId: number) => void
}

export function PostsPage({ onNavigateHome, onNavigateToPostDetail }: PostsPageProps) {
  const [headerRef, headerInView] = useIntersectionObserver()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayCount, setDisplayCount] = useState(6)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [postsData, categoriesData] = await Promise.all([
        postService.getPublishedPosts(),
        categoryService.getAllCategories(),
      ])

      const sortedPosts = postsData.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt).getTime()
        const dateB = new Date(b.publishedAt || b.createdAt).getTime()
        return dateB - dateA
      })

      setPosts(sortedPosts)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts =
    selectedCategory === null
      ? posts
      : posts.filter((post) => post.categories.some((cat) => cat.id === selectedCategory))

  const visiblePosts = filteredPosts.slice(0, displayCount)
  const hasMore = filteredPosts.length > displayCount

  const handleLoadMore = () => setDisplayCount((prev) => prev + 6)

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setDisplayCount(6)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    )
  }

  return (
    <div className={`${pageStyles.page} bg-background`}>
      {/* Page Header */}
      <section className={`${pageStyles.header} bg-primary text-primary-foreground`}>
        <div className="container">
          <div ref={headerRef} className={`${pageStyles.headerInner} ${headerInView ? 'fade-rise' : 'opacity-0'}`}>
            <h1 className={pageStyles.headerTitle}>Posts &amp; Insights</h1>
            <p className={pageStyles.headerLead}>
              Stay updated with the latest news, insights, and best practices in maritime logistics and shipping.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className={pageStyles.filterBar}>
        <div className="container">
          <div className={pageStyles.filterRow}>
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => handleCategoryClick(null)}
              className="transition-colors"
            >
              All
            </Button>

            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => handleCategoryClick(category.id)}
                className="transition-colors"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className={pageStyles.gridSection}>
        <div className="container">
          <div className={pageStyles.grid}>
            {visiblePosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                selectedCategoryId={selectedCategory}
                onClick={() => onNavigateToPostDetail(post.id)}
              />
            ))}
          </div>

          {visiblePosts.length === 0 && (
            <div className={pageStyles.emptyState}>
              <p className="text-muted-foreground">No posts found in this category.</p>
            </div>
          )}

          {hasMore && (
            <div className={pageStyles.loadMoreWrap}>
              <Button onClick={handleLoadMore} size="lg" className="px-8">
                Load More
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function PostCard({
  post,
  index,
  selectedCategoryId,
  onClick,
}: {
  post: Post
  index: number
  selectedCategoryId: number | null
  onClick: () => void
}) {
  const [ ref, isInView ] = useIntersectionObserver()
  const [isHoveringTitle, setIsHoveringTitle] = useState(false)

  const excerpt = extractExcerpt(post)
  const imageUrl = getImageUrl(post.thumbnailUrl)

  let displayCategory = 'Uncategorized'
  if (post.categories && post.categories.length > 0) {
    if (selectedCategoryId !== null) {
      const selectedCat = post.categories.find((cat) => cat.id === selectedCategoryId)
      displayCategory = selectedCat ? selectedCat.name : post.categories[0].name
    } else {
      displayCategory = post.categories[0].name
    }
  }

  const postDate = post.publishedAt || post.createdAt

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`${cardStyles.card} ${isInView ? 'fade-rise' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={cardStyles.media}>
        <img src={imageUrl} alt={post.title} className={cardStyles.mediaImg} />
        <div className={`${cardStyles.categoryPill} bg-primary text-primary-foreground`}>{displayCategory}</div>
      </div>

      <div className={cardStyles.body}>
        <h3 
          className={`${cardStyles.title} ${cardStyles.clamp2}`}
          style={{
            color: isHoveringTitle ? 'var(--primary)' : 'inherit',
            transition: 'color 200ms ease'
          }}
          onMouseEnter={() => setIsHoveringTitle(true)}
          onMouseLeave={() => setIsHoveringTitle(false)}
        >
          {post.title}
        </h3>

        <p className={`text-muted-foreground ${cardStyles.excerpt} ${cardStyles.clamp3}`}>{excerpt}</p>

        <div className={`text-muted-foreground ${cardStyles.metaRow}`}>
          <div className={cardStyles.metaItem}>
            <User className="h-4 w-4" />
            <span>{post.authorName}</span>
          </div>

          <div className={cardStyles.metaItem}>
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(postDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
