import { Button } from '@/shared/components/ui/button'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'

interface HeroProps {
  title?: string
  subtitle?: string
  image?: string
}

export function Hero({ title, subtitle, image }: HeroProps = {}) {
  const [ref, isInView] = useIntersectionObserver()
  const prefersReducedMotion = useReducedMotion()

  const defaultImage = "https://images.unsplash.com/photo-1632517306067-b54ab4d1f98d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJnbyUyMHNoaXAlMjBvY2VhbiUyMHNoaXBwaW5nJTIwbG9naXN0aWNzfGVufDF8fHx8MTc1ODI0OTE4OHww&ixlib=rb-4.1.0&q=80&w=1080"

  return (
    <div ref={ref}>
      <section className="relative min-h-[50vh] max-h-[600px] overflow-hidden border-b-4 border-primary">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={image || defaultImage}
            alt={title ? `${title} - Seatrans` : "Cargo ship on ocean - Seatrans shipping and logistics operations across Asia-Pacific region"}
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          {/* Overlay when text is present */}
          {title && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          )}
        </div>

        {/* Text Content Overlay */}
        {title && (
          <div className="relative z-10 h-full flex items-center justify-center text-center">
            <div 
              className="container max-w-4xl px-4"
              style={{
                opacity: prefersReducedMotion ? 1 : (isInView ? 1 : 0),
                transform: prefersReducedMotion ? 'none' : (isInView ? 'translateY(0)' : 'translateY(20px)'),
                transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {subtitle && (
                <p 
                  className="text-white/90 text-lg md:text-xl mb-3 tracking-wide uppercase"
                  style={{
                    opacity: prefersReducedMotion ? 1 : (isInView ? 1 : 0),
                    transform: prefersReducedMotion ? 'none' : (isInView ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s'
                  }}
                >
                  {subtitle}
                </p>
              )}
              <h1 
                className="text-white text-4xl md:text-5xl lg:text-6xl mb-4 drop-shadow-lg uppercase"
                style={{
                  opacity: prefersReducedMotion ? 1 : (isInView ? 1 : 0),
                  transform: prefersReducedMotion ? 'none' : (isInView ? 'translateY(0)' : 'translateY(20px)'),
                  transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                }}
              >
                {title}
              </h1>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}