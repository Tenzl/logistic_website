import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { galleryService, GalleryImage as DBGalleryImage } from '@/features/gallery/services/galleryService'

type FilterValue = number | 'all'

export function GallerySection({
  serviceTypeId,
  gallery
}: {
  serviceTypeId: number
  gallery: {
    sectionTitle: string
    sectionDescription: string
    enabled: boolean
    imageTypes?: { label: string; value: number }[]
  }
}) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all')
  const [imageTypes, setImageTypes] = useState<{ label: string; value: number }[]>(gallery.imageTypes ?? [])
  const [images, setImages] = useState<DBGalleryImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const limit = 6
  const [hasNextPage, setHasNextPage] = useState(false)

  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  const imageTypeFilter = useMemo(() => {
    return activeFilter === 'all' ? undefined : activeFilter
  }, [activeFilter])

  const getImageUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const normalizedPath = url.replace(/\\/g, '/')
    const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
    return `${apiBaseUrl}${path}`
  }

  // Intersection observer animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Load image types if not provided
  useEffect(() => {
    if (gallery.imageTypes?.length) return
    let cancelled = false

    ;(async () => {
      try {
        const types = await galleryService.getImageTypesByServiceType(serviceTypeId)
        if (cancelled) return
        setImageTypes(
          types.map(t => ({
            label: t.displayName,
            value: t.id
          }))
        )
      } catch {
        // không bắt buộc phải có types
      }
    })()

    return () => {
      cancelled = true
    }
  }, [gallery.imageTypes, serviceTypeId])

  // Load images (server-side pagination) + abort/race-safe
  useEffect(() => {
    const controller = new AbortController()
    const page = currentPage - 1 // API uses 0-indexed pages

    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const data = await galleryService.getPublicImages(
          serviceTypeId,
          imageTypeFilter,
          page,
          limit,
          controller.signal
        )

        setImages(data)
        setHasNextPage(data.length === limit)
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        setError('Failed to load images. Please try again.')
        setImages([])
        setHasNextPage(false)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [serviceTypeId, imageTypeFilter, currentPage, limit])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter])

  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1))
  const goNext = () => {
    if (!hasNextPage) return
    setCurrentPage(p => p + 1)
  }

  return (
    <section id="service-gallery" ref={sectionRef} className="bg-background py-8 md:py-12">
      <div className="container">
        <div className="text-center mb-8 md:mb-10">
          <h2 className={`${isVisible ? 'fade-rise' : 'opacity-0'} text-3xl md:text-4xl font-bold`}>{gallery.sectionTitle}</h2>
          <p
            className={`text-muted-foreground mt-4 ${isVisible ? 'fade-rise' : 'opacity-0'}`}
            style={{ animationDelay: '90ms' }}
          >
            {gallery.sectionDescription}
          </p>
        </div>

        {imageTypes.length > 0 && (
          <div className="flex justify-center gap-4 mb-8 md:mb-10 flex-wrap">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              className="transition-all duration-200"
            >
              All
            </Button>
            {imageTypes.map(type => (
              <Button
                key={type.value}
                variant={activeFilter === type.value ? 'default' : 'outline'}
                onClick={() => setActiveFilter(type.value)}
                className="transition-all duration-200"
              >
                {type.label}
              </Button>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading images...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => setCurrentPage(p => p)}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No images available</p>
                </div>
              ) : (
                images.map((image, index) => (
                  <Dialog key={image.id}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className={`text-left cursor-pointer group w-full ${
                          isVisible ? 'fade-rise' : 'opacity-0'
                        }`}
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                          <div className="relative h-60 md:h-64 lg:h-72">
                            <ImageWithFallback
                              src={getImageUrl(image.url)}
                              alt={`${image.serviceTypeName} - ${image.imageTypeName}`}
                              width={800}
                              height={600}
                              priority={index === 0 && currentPage === 1}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="text-white text-center">
                                <Eye className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">View Details</p>
                              </div>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                              <div className="space-y-2">
                                <div className="flex gap-2 flex-wrap">
                                  <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                                    {image.imageTypeName}
                                  </Badge>
                                  <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                                    {image.provinceName}
                                  </Badge>
                                </div>
                                <h3 className="text-white font-medium text-sm bg-black/50 rounded px-2 py-1 backdrop-blur-sm inline-block">
                                  {image.portName}
                                </h3>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </DialogTrigger>

                    <DialogContent className="max-w-5xl">
                      <DialogTitle className="sr-only">{image.portName}</DialogTitle>
                      <DialogDescription className="sr-only">
                        {`${image.imageTypeName} - ${image.provinceName}`}
                      </DialogDescription>

                      <ImageWithFallback
                        src={getImageUrl(image.url)}
                        alt={image.portName}
                        width={1600}
                        height={900}
                        priority={index === 0 && currentPage === 1}
                        className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={goPrev}
                disabled={currentPage === 1}
                className="hover-lift"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-sm text-muted-foreground">
                Page <span className="text-foreground font-medium">{currentPage}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goNext}
                disabled={!hasNextPage}
                className="hover-lift"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
