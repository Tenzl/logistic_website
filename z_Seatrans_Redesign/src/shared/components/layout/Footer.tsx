import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react'

export function Footer() {
  const [ref, isInView] = useIntersectionObserver()

  return (
    <div ref={ref}>
      <footer className="bg-background border-t">
        <div className="container px-2 pb-2 md:pb-4 pt-8 md:pt-10">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.8fr_1.4fr_1.3fr] gap-6 md:gap-8 ${isInView ? 'fade-rise' : 'opacity-0'}`}>
            {/* Column 1 - Company Info (Left Aligned) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <ImageWithFallback
                  src="/landing-image/footer_Logo.png"
                  alt="SEATRANS Logo"
                  width={240}
                  height={120}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
                <h3 className="uppercase text-[#202124] text-[16px] sm:text-[18px] leading-tight" style={{ fontWeight: 800 }}>
                  SEATRANS – South East Asia Transport & Logistics
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>51 - Luu Huu Phuoc str., Quinhon city VietNam</span>
                </div>

                <div className="flex items-start space-x-2">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span>Tel: +84.256.3520379</span>
                    <span className="hidden sm:inline mx-2">•</span>
                    <span>Fax: +84.256.3520479</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:seatrans.info@seatrans.com.vn" className="hover:text-primary transition-colors break-all">
                    seatrans.info@seatrans.com.vn
                  </a>
                </div>

                <div className="flex items-start space-x-2">
                  <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="https://www.seatrans.com.vn" className="hover:text-primary transition-colors">
                    www.seatrans.com.vn
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2 - Services (Center Aligned on Desktop, Left on Mobile) */}
            <div className="text-left md:text-center space-y-3">
              <h4 className="uppercase text-[#202124] text-[16px] sm:text-[18px] leading-tight mb-4 md:mb-6" style={{ fontWeight: 800 }}>
                Doing business together
              </h4>

              <div className="text-sm space-y-1 mt-4">
                <p className="leading-relaxed">Shipping Agency / Chartering & Ship-broking /</p>
                <p className="leading-relaxed">Freight Forwarding & Logistics / Customs Clearance</p>
              </div>
            </div>

            {/* Column 3 - Social Media (Right Aligned on Desktop, Left on Mobile) */}
            <div className="text-left md:text-right space-y-3">
              <h4 className="uppercase text-[#202124] text-[16px] sm:text-[18px] leading-tight mb-4 md:mb-6" style={{ fontWeight: 800 }}>
                Get to know us
              </h4>

              <div className="mt-4">
                <p className="text-sm mb-3">Follow SEATRANS</p>
                <div className="flex md:justify-end space-x-3">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:border-primary hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:border-primary hover:text-primary transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:border-primary hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:border-primary hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:border-primary hover:text-primary transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className={`mt-6 md:mt-8 pt-4 border-t text-xs text-muted-foreground ${isInView ? 'fade-rise stagger-1' : 'opacity-0'} flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center sm:text-left`}>
            <span className="leading-relaxed">
              © 2025 SEATRANS - South East Asia Transport & Logistics. All rights reserved.
            </span>
            <span className="leading-relaxed">
              Tel: +84.256.3520379 • Fax: +84.256.3520479
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}