import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
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
        <div className="container py-12">
          <div className={`grid md:grid-cols-[1.8fr_1.4fr_1.3fr] gap-8 ${isInView ? 'fade-rise' : 'opacity-0'}`}>
            {/* Column 1 - Company Info (Left Aligned) */}
            <div className="space-y-4">
              <h3 className="uppercase text-[#202124] text-[18px] leading-[21.6px]" style={{ fontWeight: 800 }}>
                SEATRANS – South East Asia Transport & Logistics
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>51 - Luu Huu Phuoc str., Quinhon city VietNam</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span>Tel: +84.256.3520379</span>
                    <span className="mx-2">•</span>
                    <span>Fax: +84.256.3520479</span>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:seatrans.info@seatrans.com.vn" className="hover:text-primary transition-colors">
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

            {/* Column 2 - Services (Center Aligned) */}
            <div className="text-center space-y-3">
              <h4 className="uppercase text-[#202124] text-[18px] leading-[21.6px]" style={{ fontWeight: 800 }}>
                Doing business together
              </h4>
              
              <div className="text-sm space-y-1">
                <p>Shipping Agency / Chartering & Ship-broking /</p>
                <p>Freight Forwarding & Logistics / Customs Clearance</p>
              </div>
            </div>

            {/* Column 3 - Social Media (Right Aligned) */}
            <div className="md:text-right space-y-3">
              <h4 className="uppercase text-[#202124] text-[18px] leading-[21.6px]" style={{ fontWeight: 800 }}>
                Get to know us
              </h4>
              
              <div>
                <p className="text-sm mb-3">Follow SEATRANS</p>
                <div className="flex md:justify-end space-x-3">
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border hover:border-primary hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border hover:border-primary hover:text-primary transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border hover:border-primary hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border hover:border-primary hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded border hover:border-primary hover:text-primary transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className={`mt-8 pt-4 border-t text-center text-xs text-muted-foreground ${isInView ? 'fade-rise stagger-1' : 'opacity-0'}`}>
            © 2025 SEATRANS - South East Asia Transport & Logistics. All rights reserved. Tel: +84.256.3520379 • Fax: +84.256.3520479
          </div>
        </div>
      </footer>
    </div>
  )
}