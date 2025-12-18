import { useState, useEffect } from 'react'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const partnersData = [
  {
    name: 'Maersk',
    logo: 'M',
    color: 'bg-blue-600',
    description: 'Global leader in container shipping and logistics solutions.',
    partnership: 'Strategic alliance for Asia-Pacific container operations since 2018.',
    website: 'https://maersk.com'
  },
  {
    name: 'MSC',
    logo: 'MSC',
    color: 'bg-red-600',
    description: 'World\'s largest container shipping company.',
    partnership: 'Joint venture for Mediterranean-Asia trade routes.',
    website: 'https://msc.com'
  },
  {
    name: 'CMA CGM',
    logo: 'CMA',
    color: 'bg-orange-600',
    description: 'French container transportation and shipping company.',
    partnership: 'Collaborative freight forwarding services across Vietnam.',
    website: 'https://cmacgm.com'
  },
  {
    name: 'Hapag-Lloyd',
    logo: 'HL',
    color: 'bg-orange-500',
    description: 'German container shipping company.',
    partnership: 'Port agency services for European routes.',
    website: 'https://hapag-lloyd.com'
  },
  {
    name: 'ONE',
    logo: 'ONE',
    color: 'bg-purple-600',
    description: 'Ocean Network Express - Japanese shipping line.',
    partnership: 'Integrated logistics solutions for Japanese markets.',
    website: 'https://one-line.com'
  },
  {
    name: 'COSCO',
    logo: 'COSCO',
    color: 'bg-blue-800',
    description: 'China\'s largest shipping company.',
    partnership: 'Terminal operations and vessel management services.',
    website: 'https://cosco.com'
  },
  {
    name: 'Evergreen',
    logo: 'EVG',
    color: 'bg-green-600',
    description: 'Taiwanese containerized-freight shipping company.',
    partnership: 'Chartering and brokerage services.',
    website: 'https://evergreen-line.com'
  },
  {
    name: 'Yang Ming',
    logo: 'YM',
    color: 'bg-red-700',
    description: 'Taiwanese shipping company.',
    partnership: 'Freight forwarding and customs services.',
    website: 'https://yangming.com'
  },
  {
    name: 'OOCL',
    logo: 'OOCL',
    color: 'bg-blue-700',
    description: 'Hong Kong-based container transport and logistics company.',
    partnership: 'Regional distribution and warehousing solutions.',
    website: 'https://oocl.com'
  },
  {
    name: 'HMM',
    logo: 'HMM',
    color: 'bg-gray-700',
    description: 'South Korean shipping company.',
    partnership: 'Korea-Vietnam trade route optimization.',
    website: 'https://hmm21.com'
  }
]

export function Partners() {
  const [ref, isInView] = useIntersectionObserver()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Duplicate array for infinite loop
  const infiniteLogos = [...partnersData, ...partnersData, ...partnersData]
  
  // Auto-scroll every 3 seconds, moving 3 logos at a time
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 3
          // Reset to beginning smoothly when reaching end
          return next >= partnersData.length ? 0 : next
        })
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isPaused])

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev + 3
      return next >= partnersData.length ? 0 : next
    })
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev - 3
      return next < 0 ? partnersData.length - 3 : next
    })
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index * 3)
  }

  // Calculate dots
  const totalDots = Math.ceil(partnersData.length / 3)
  const activeDot = Math.floor(currentIndex / 3)

  return (
    <div ref={ref}>
      <section className="py-20 pb-[70px] bg-background">
        <div className="container">
          <div className={`section-heading ${isInView ? 'fade-rise' : 'opacity-0'}`}>
          <h2>Global Partners & Integrations</h2>
          <p>
            Trusted partnerships with leading shipping lines and logistics providers worldwide.
          </p>
          </div>

        {/* Partner Logos Carousel */}
        <div 
          className={`relative mt-8 ${isInView ? 'fade-rise stagger-1' : 'opacity-0'}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Rounded Container */}
          <div className="relative bg-muted rounded-2xl py-12 px-4 md:px-12 overflow-hidden">
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/60 hover:bg-white text-foreground rounded-full p-2 shadow-md transition-all opacity-0 hover:opacity-100 group-hover:opacity-70 duration-300"
              aria-label="Previous partners"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/60 hover:bg-white text-foreground rounded-full p-2 shadow-md transition-all opacity-0 hover:opacity-100 group-hover:opacity-70 duration-300"
              aria-label="Next partners"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Logo Container */}
            <div className="overflow-hidden group">
              <div 
                className="flex gap-4 md:gap-6 lg:gap-8 transition-transform duration-700 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / 8)}%)`,
                }}
              >
                {infiniteLogos.map((partner, idx) => (
                  <div 
                    key={`partner-${idx}`}
                    className="flex-shrink-0 flex items-center justify-center group/logo w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] lg:w-[calc(14.285%-14px)] xl:w-[calc(12.5%-14px)]"
                  >
                    <div className="flex items-center justify-center h-12 md:h-14">
                      <div 
                        className={`h-10 md:h-12 aspect-square ${partner.color} rounded-lg flex items-center justify-center text-white shadow-sm transition-all duration-300 grayscale group-hover/logo:grayscale-0 group-hover/logo:scale-110`}
                        style={{ fontSize: 'clamp(0.625rem, 1.2vw, 0.875rem)' }}
                      >
                        <span className="font-bold">{partner.logo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalDots }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeDot
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to partner group ${index + 1}`}
              />
            ))}
          </div>
        </div>
        </div>
      </section>
    </div>
  )
}