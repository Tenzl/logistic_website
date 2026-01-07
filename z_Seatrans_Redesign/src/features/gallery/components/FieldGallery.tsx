import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { Eye, ArrowRight } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8080/api'

interface GalleryImage {
  id: number
  imageUrl: string
  portName: string
  commodities: string
  province: string
  serviceType: string
}

const serviceOptions = ['Shipping Agency', 'Chartering & Broking', 'Freight Forwarding', 'Total Logistics']

// Map display names to backend service names
const serviceNameMap: Record<string, string> = {
  'Shipping Agency': 'Shipping Agency',
  'Chartering & Broking': 'Chartering & Broking',
  'Freight Forwarding': 'Freight Forwarding',
  'Total Logistics': 'Logistics'
}

// Map service to gallery page URLs
const serviceGalleryUrls: Record<string, string> = {
  'Shipping Agency': '/shipping-agency#gallery',
  'Chartering & Broking': '/chartering-broking#gallery',
  'Freight Forwarding': '/freight-forwarding#gallery',
  'Total Logistics': '/total-logistics#gallery'
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
  
  return `http://localhost:8080${path}`
}

export function FieldGallery() {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState('Shipping Agency')
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [ref, isInView] = useIntersectionObserver()
  
  // Fetch images from backend
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/gallery/images`)
        if (!response.ok) throw new Error('Failed to fetch gallery images')
        
        const data: GalleryImage[] = await response.json()
    
        setGalleryImages(data)
      } catch (error) {
        console.error('Error loading gallery images:', error)
        setGalleryImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryImages()
  }, [])

  // Filter and limit images
  const filteredData = galleryImages
    .filter(item => item.serviceType === serviceNameMap[selectedService])
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
            {serviceOptions.map((service) => (
              <Button
                key={service}
                variant={selectedService === service ? "default" : "outline"}
                size="default"
                className={`hover-lift text-base px-6 ${selectedService === service ? "hover:bg-primary" : ""}`}
                onClick={() => setSelectedService(service)}
              >
                {service}
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
                                <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                                  {item.commodities}
                                </Badge>
                                <Badge variant="secondary" className="bg-white/90 text-black text-xs">
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
                router.push(serviceGalleryUrls[selectedService])
              }}
              className="group"
            >
              View More {selectedService} Gallery
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
        </div>
      </section>
    </div>
  )
}