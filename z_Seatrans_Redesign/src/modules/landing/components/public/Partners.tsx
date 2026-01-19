"use client"

import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import {
  Marquee,
  MarqueeContent,
  MarqueeEdge,
  MarqueeItem,
} from "@/shared/components/ui/marquee"

const partnersData = [
  {
    name: 'Maersk',
    logo: '/icon-image/maersk.jpg',
    color: 'bg-blue-600',
    description: 'Global leader in container shipping and logistics solutions.',
    partnership: 'Strategic alliance for Asia-Pacific container operations since 2018.',
    website: 'https://maersk.com'
  },
  {
    name: 'MSC',
    logo: '/icon-image/msc.jpg',
    color: 'bg-red-600',
    description: 'World\'s largest container shipping company.',
    partnership: 'Joint venture for Mediterranean-Asia trade routes.',
    website: 'https://msc.com'
  },
  {
    name: 'CMA CGM',
    logo: '/icon-image/cma.jpg',
    color: 'bg-orange-600',
    description: 'French container transportation and shipping company.',
    partnership: 'Collaborative freight forwarding services across Vietnam.',
    website: 'https://cmacgm.com'
  },
  {
    name: 'Wan Hai',
    logo: '/icon-image/wanhai.jpg',
    color: 'bg-orange-500',
    description: 'Taiwan shipping company.',
    partnership: 'Port agency services for Asian routes.',
    website: 'https://wanhai.com'
  },
  {
    name: 'UASC',
    logo: '/icon-image/UASC.jpg',
    color: 'bg-purple-600',
    description: 'United Arab Shipping Company.',
    partnership: 'Integrated logistics solutions for Middle East markets.',
    website: 'https://uasc.com'
  },
  {
    name: 'COSCO',
    logo: '/icon-image/cosco.jpg',
    color: 'bg-blue-800',
    description: 'China\'s largest shipping company.',
    partnership: 'Terminal operations and vessel management services.',
    website: 'https://cosco.com'
  },
  {
    name: 'MCC',
    logo: '/icon-image/mcc.jpg',
    color: 'bg-green-600',
    description: 'MCC Transport shipping company.',
    partnership: 'Chartering and brokerage services.',
    website: 'https://mcc.com'
  },
  {
    name: 'Yang Ming',
    logo: '/icon-image/yangming.jpg',
    color: 'bg-red-700',
    description: 'Taiwanese shipping company.',
    partnership: 'Freight forwarding and customs services.',
    website: 'https://yangming.com'
  },
  {
    name: 'MOL',
    logo: '/icon-image/mol.jpg',
    color: 'bg-blue-700',
    description: 'Mitsui O.S.K. Lines - Japanese shipping company.',
    partnership: 'Regional distribution and warehousing solutions.',
    website: 'https://mol.com'
  },
  {
    name: 'NYK',
    logo: '/icon-image/nyk.jpg',
    color: 'bg-gray-700',
    description: 'Nippon Yusen Kaisha - Japanese shipping company.',
    partnership: 'Japan-Vietnam trade route optimization.',
    website: 'https://nyk.com'
  },
  {
    name: 'ZIM',
    logo: '/icon-image/zim.jpg',
    color: 'bg-blue-500',
    description: 'Israeli shipping company.',
    partnership: 'Mediterranean and Asia container services.',
    website: 'https://zim.com'
  },
  {
    name: 'Chan May',
    logo: '/icon-image/chanmay.jpg',
    color: 'bg-green-700',
    description: 'Vietnamese port and logistics services.',
    partnership: 'Local port operations and cargo handling.',
    website: 'https://chanmay.com'
  }
]

export function Partners() {
  const [ref, isInView] = useIntersectionObserver()

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

          {/* Partner Logos Marquee */}
          <div className={`relative mt-8 py-12 ${isInView ? 'fade-rise stagger-1' : 'opacity-0'}`}>
            <Marquee
              side="right"
              speed={30}
              autoFill
              pauseOnHover
              pauseOnKeyboard
            >
              <MarqueeContent>
                {partnersData.map((partner) => (
                  <MarqueeItem key={partner.name} asChild>
                    <div className="flex items-center justify-center mx-4 md:mx-6">
                      <img 
                        src={partner.logo} 
                        alt={partner.name}
                        className="h-12 md:h-16 w-auto transition-all duration-300 hover:scale-110"
                      />
                    </div>
                  </MarqueeItem>
                ))}
              </MarqueeContent>
              <MarqueeEdge side="left" />
              <MarqueeEdge side="right" />
            </Marquee>
          </div>
        </div>
      </section>
    </div>
  )
}