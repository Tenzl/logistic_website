'use client'

import { useEffect, useRef } from 'react'
import { LucideIcon, ChevronRight } from 'lucide-react'

interface HeroBannerSectionProps {
  title: string
  subtitle?: string
  description?: string
  image: string
  serviceName: string
  serviceIcon?: LucideIcon
  onNavigateHome?: () => void
}

export function HeroBannerSection({
  title,
  subtitle = 'Services',
  description,
  image,
  serviceName,
  serviceIcon: ServiceIcon,
  onNavigateHome,
}: HeroBannerSectionProps) {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bgRef.current && image) {
      bgRef.current.style.setProperty('--hero-bg', `url(${image})`)
    }
  }, [image])

  const handleHome = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onNavigateHome) {
      e.preventDefault()
      onNavigateHome()
    }
  }

  return (
    <div className="relative w-full">
      <div
        ref={bgRef}
        className="relative overflow-hidden rounded-b-[32px] service-hero-bg"
      >
        <div className="absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center text-white flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-white/85">
            {ServiceIcon ? (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 border border-white/20">
                <ServiceIcon className="h-4 w-4" />
              </span>
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 border border-white/20">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
            <span>{subtitle}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow-md">{title}</h1>
          {description && (
            <p className="mt-2 max-w-3xl text-base md:text-lg text-white/85 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="relative z-20 -mt-8">
        <div className="container flex justify-center">
          <div className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 shadow-xl border border-border/80 text-sm font-medium">
            <button
              onClick={handleHome}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Home
            </button>
            <span className="text-muted-foreground">•</span>
            <span className="text-foreground/80">{serviceName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
