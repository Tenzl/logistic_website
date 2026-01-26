import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { Eye, ArrowRight } from 'lucide-react'
import { galleryService } from '@/modules/gallery/services/galleryService'
import { API_CONFIG } from '@/shared/config/api.config'

// Remove trailing /api or /api/v1 to get asset host
const ASSET_BASE_URL = API_CONFIG.ASSET_BASE_URL

interface GalleryImage {
  id: number
  imageUrl: string
  portName: string
  commodities: string
  province: string
  serviceTypeId?: number
  serviceTypeName: string
}

const services = [
  { id: 1, key: 'SHIPPING_AGENCY', label: 'Shipping Agency' },
  { id: 2, key: 'FREIGHT_FORWARDING', label: 'Freight Forwarding' },
  { id: 3, key: 'CHARTERING', label: 'Chartering & Broking' },
  { id: 4, key: 'LOGISTICS', label: 'Total Logistics' },
] as const

// Map service to gallery page URLs
const serviceGalleryUrls: Record<number, string> = {
  1: '/services/shipping-agency#gallery',
  2: '/services/freight-forwarding#gallery',
  3: '/services/chartering-broking#gallery',
  4: '/services/total-logistics#gallery',
}

// Helper function to construct proper image URL
const getImageUrl = (url: string) => {
  if (!url) return ''
  // If it's already a full URL, return it
  if (url.startsWith('http')) return url
  
  // Normalize slashes
  const normalizedPath = url.replace(/\\/g, '/')
  
  // Ensure it starts with / if not present
  const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  
  return `${ASSET_BASE_URL}${path}`
}

export function FieldGallery() {
  const router = useRouter()
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0].id)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [ref, isInView] = useIntersectionObserver()
  
  // Fetch images from backend
  useEffect(() => {
    const controller = new AbortController()

    const fetchGalleryImages = async () => {
      try {
        setLoading(true)
        const data = await galleryService.getPublicImages(selectedServiceId, undefined, 0, 12, controller.signal)
        setGalleryImages(
          data.map(image => ({
            id: image.id,
            imageUrl: image.url,
            portName: image.portName,
            commodities: image.imageTypeName,
            province: image.provinceName,
            serviceTypeId: image.serviceTypeId,
            serviceTypeName: image.serviceTypeName,
          }))
        )
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        console.error('Error loading gallery images:', error)
        setGalleryImages([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchGalleryImages()
    return () => controller.abort()
  }, [selectedServiceId])

  // Filter and limit images
  const filteredData = galleryImages
    .filter(item => item.serviceTypeId === selectedServiceId)
    .slice(0, 6)

  return (
    <div ref={ref}>
      <section className="py-20 bg-background">
        <div className="container">
          <div className={`section-heading ${isInView ? 'fade-rise' : 'opacity-0'}`}>
          <h2>Field Operations <span className="text-primary">Gallery</span></h2>
          <p>
            Explore our comprehensive operations across major ports and facilities in the Asia-Pacific region.
          </p>
          </div>

        {/* Service Filter */}
        <div className={`mb-8 ${isInView ? 'fade-rise stagger-1' : 'opacity-0'}`}>
          
          <div className="flex flex-wrap justify-center gap-3">
            {services.map((service) => (
              <Button
                key={service.id}
                variant={selectedServiceId === service.id ? "default" : "outline"}
                size="default"
                className={`hover-lift text-base px-6 ${selectedServiceId === service.id ? "hover:bg-primary" : ""}`}
                onClick={() => setSelectedServiceId(service.id)}
              >
                {service.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading images...</p>
          </div>
        )}

        {/* Gallery Grid Container */}
        {!loading && filteredData.length > 0 && (
          <div className={`relative px-4 ${isInView ? 'fade-rise stagger-2' : 'opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((item) => (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer group">
                      <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="relative h-64">
                          <ImageWithFallback
                            src={getImageUrl(item.imageUrl)}
                            alt={item.portName}
                            width={800}
                            height={600}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                      
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-white text-center">
                              <Eye className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">View Details</p>
                            </div>
                          </div>

                          {/* Caption Chips */}
                          <div className="absolute bottom-4 left-4 right-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="space-y-2">
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary" className="bg-white/90 text-primary text-xs font-semibold">
                                  {item.commodities}
                                </Badge>
                                <Badge variant="secondary" className="bg-white/90 text-primary text-xs font-semibold">
                                  {item.province}
                                </Badge>
                              </div>
                              <h3 className="text-white font-medium text-sm bg-black/50 rounded px-2 py-1 backdrop-blur-sm">
                                {item.portName}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>

                  <DialogContent className="max-w-4xl">
                    <DialogTitle className="sr-only">{item.portName}</DialogTitle>
                    <DialogDescription className="sr-only">{`${item.commodities} - ${item.province}`}</DialogDescription>
                    <ImageWithFallback
                      src={getImageUrl(item.imageUrl)}
                      alt={item.portName}
                      width={1200}
                      height={800}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        )}

        {/* View More Button - Centered */}
        {!loading && filteredData.length > 0 && (
          <div className={`flex justify-center mt-8 ${isInView ? 'fade-rise stagger-3' : 'opacity-0'}`}>
            <Button
              size="lg"
              onClick={() => {
                NProgress.start()
                router.push(serviceGalleryUrls[selectedServiceId])
              }}
              className="group"
            >
              View More {services.find(s => s.id === selectedServiceId)?.label ?? 'Service'} Gallery
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
        </div>
      </section>
    </div>
  )
}
