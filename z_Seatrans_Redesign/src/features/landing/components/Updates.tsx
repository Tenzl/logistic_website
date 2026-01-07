'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/shared/components/ui/carousel'

interface Post {
  id: number
  title: string
  content?: string
  thumbnailUrl?: string
  publishedAt?: string
  createdAt?: string
  categories?: Array<{
    id: number
    name: string
  }>
}

interface UpdatesProps {
  onNavigateToArticle: (id: number) => void
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export function Updates({ onNavigateToArticle }: UpdatesProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [ref, isInView] = useIntersectionObserver()
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    fetchRecentPosts()
  }, [])

  useEffect(() => {
    if (!api) {
      return
    }

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    updateScrollState()
    api.on('select', updateScrollState)
    api.on('reInit', updateScrollState)

    return () => {
      api.off('select', updateScrollState)
      api.off('reInit', updateScrollState)
    }
  }, [api])

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/posts/latest?limit=12')
      if (!response.ok) {
        console.error('Failed to fetch posts', response.status)
        return
      }

      const json: ApiResponse<Post[]> = await response.json()
      setPosts((json.data || []).slice(0, 12))
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const scrollPrev = () => {
    if (!api) return
    const current = api.selectedScrollSnap() || 0
    const target = Math.max(0, current - 2)
    api.scrollTo(target)
  }

  const scrollNext = () => {
    if (!api) return
    const snaps = api.scrollSnapList().length
    const current = api.selectedScrollSnap() || 0
    const target = Math.min(snaps - 1, current + 2)
    api.scrollTo(target)
  }

  return (
    <div ref={ref}>
      <section className="py-20 bg-background">
        <div className="container">
          <div className={`section-heading ${isInView ? 'fade-rise' : 'opacity-0'}`}>
            <h2>Latest Updates</h2>
          </div>

          <Carousel
            setApi={setApi}
            opts={{
              align: 'start',
              loop: false,
            }}
            className="w-full"
          >
            <div className="relative px-16">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="group absolute -left-10 lg:-left-12 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-lg border border-primary/30 bg-white text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6 transition-colors text-primary group-hover:text-white" />
              </button>

              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="group absolute -right-10 lg:-right-12 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-lg border border-primary/30 bg-white text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6 transition-colors text-primary group-hover:text-white" />
              </button>

              <CarouselContent className="-ml-6">
                {posts.map((post, index) => (
                  <CarouselItem key={post.id} className="pl-6 md:basis-1/2 lg:basis-1/4">
                    <div
                      className={`group relative rounded-md overflow-hidden cursor-pointer ${isInView ? 'fade-rise' : 'opacity-0'}`}
                      style={{
                        aspectRatio: '1 / 1.15',
                        animationDelay: `${index * 60}ms`
                      }}
                      onClick={() => onNavigateToArticle(post.id)}
                    >
                      {post.thumbnailUrl ? (
                        <ImageWithFallback
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                          fill
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-primary/30" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-all duration-300 group-hover:from-black/90 group-hover:via-black/50"></div>

                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        <div>
                          <div className="inline-block">
                            <span className="bg-primary text-white px-4 py-1.5 text-sm font-semibold uppercase tracking-wider inline-block rounded-full">
                              {post.categories?.[0]?.name || 'News'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-white text-sm opacity-90">
                            {formatDate(post.publishedAt || post.createdAt)}
                          </div>

                          <h3 className="text-white text-lg font-semibold leading-tight line-clamp-4">
                            {post.title}
                          </h3>

                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>
          </Carousel>
        </div>
      </section>
    </div>
  )
}
