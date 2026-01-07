import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import {
  Ship,
  Truck,
  Package,
  Building,
  Clock,
  MapPin,
  TrendingUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface SolutionsProps {
  onNavigate?: (page: 'shipping-agency' | 'chartering-broking' | 'freight-forwarding') => void
}

const solutionsData = {
  'shipping-agency': {
    title: 'Shipping Agency',
    icon: Ship,
    tagline: 'Comprehensive Port Services',
    description: 'Full-service port agency and vessel operations across Asia-Pacific ports.',
    metrics: [
      { label: 'Ports Covered', value: '150+' },
      { label: 'Vessels Handled', value: '2,500+' },
      { label: 'Avg Response Time', value: '< 2hrs' }
    ],
    details: [
      'Port clearance and customs coordination',
      'Vessel husbandry and crew assistance',
      '24/7 operational support'
    ],
    image: 'https://images.unsplash.com/photo-1673714697436-da13c8087c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250YWluZXIlMjBwb3J0JTIwY3JhbmV8ZW58MXx8fHwxNzU4MjQ5MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  'chartering': {
    title: 'Chartering & Broking',
    icon: TrendingUp,
    tagline: 'Maritime Brokerage Excellence',
    description: 'Expert vessel chartering and maritime brokerage services for optimal shipping solutions.',
    metrics: [
      { label: 'Charter Deals', value: '500+' },
      { label: 'Market Coverage', value: '98%' },
      { label: 'Cost Savings', value: '15%' }
    ],
    details: [
      'Spot and time charter arrangements',
      'Market intelligence and analysis',
      'Contract negotiation and management'
    ],
    image: 'https://images.unsplash.com/photo-1756966552603-6418ccbad7b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMGZyZWlnaHQlMjB2ZXNzZWx8ZW58MXx8fHwxNzU4MjQ5MTg5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  'freight-forwarding': {
    title: 'Freight Forwarding',
    icon: Package,
    tagline: 'Multimodal Transport Solutions',
    description: 'Comprehensive freight solutions for land, sea, and air transport across the region.',
    metrics: [
      { label: 'TEU Handled', value: '100K+' },
      { label: 'Transit Reliability', value: '99.2%' },
      { label: 'Countries Served', value: '25+' }
    ],
    details: [
      'Door-to-door delivery services',
      'Customs clearance and documentation',
      'Real-time tracking and monitoring'
    ],
    image: 'https://images.unsplash.com/photo-1726776230751-183496c51f00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVpZ2h0JTIwd2FyZWhvdXNlJTIwbG9naXN0aWNzfGVufDF8fHx8MTc1ODI0OTE4OHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  'total-logistics': {
    title: 'Total Logistics',
    icon: Building,
    tagline: 'End-to-End Supply Chain',
    description: 'Complete supply chain management and logistics solutions tailored to your needs.',
    metrics: [
      { label: 'Warehouses', value: '50+' },
      { label: 'Supply Chains', value: '1,000+' },
      { label: 'Efficiency Gain', value: '25%' }
    ],
    details: [
      'Warehouse management and distribution',
      'Inventory optimization and planning',
      'Integrated technology platforms'
    ],
    image: 'https://images.unsplash.com/photo-1614571272828-2d8289ff8fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlwcGluZyUyMGNvbnRhaW5lcnMlMjB5YXJkfGVufDF8fHx8MTc1ODE4ODQxOHww&ixlib=rb-4.1.0&q=80&w=1080'
  }
}

export function Solutions({ onNavigate }: SolutionsProps) {
  const [activeTab, setActiveTab] = useState('shipping-agency')
  const [expandedDetails, setExpandedDetails] = useState(false)
  const [animatedMetrics, setAnimatedMetrics] = useState<Record<string, boolean>>({})
  const [ref, isInView] = useIntersectionObserver()

  // Animate metrics when they come into view
  useEffect(() => {
    if (isInView && !animatedMetrics[activeTab]) {
      setAnimatedMetrics(prev => ({ ...prev, [activeTab]: true }))
    }
  }, [isInView, activeTab, animatedMetrics])

  const activeSolution = solutionsData[activeTab as keyof typeof solutionsData]

  return (
    <div ref={ref}>
      <section className="py-20 bg-background">
        <div className="container">
          <div className={`section-heading ${isInView ? 'fade-rise' : 'opacity-0'}`}>
            <h2>Our Solutions</h2>
            <p>
              Comprehensive shipping and logistics services designed to optimize your supply chain operations.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Ribbon Tabs */}
            <TabsList className={`grid w-full grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-1 bg-background rounded-b-none border border-border ${isInView ? 'fade-rise stagger-1' : 'opacity-0'
              }`}>
              {Object.entries(solutionsData).map(([key, solution]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex flex-col items-center p-4 space-y-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <span className="text-sm font-medium">{solution.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Live Preview Card */}
            <div className={`${isInView ? 'fade-rise stagger-2' : 'opacity-0'}`}>
              <Card className="overflow-hidden rounded-t-none border-t-0 pb-0 lg:flex">
                <div className="grid lg:grid-cols-2">
                  {/* Content */}
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                      <p className="text-sm text-primary">
                        {activeSolution.tagline}
                      </p>
                      <h3 className="text-4xl text-foreground">{activeSolution.title}</h3>
                      <p className="text-muted-foreground">
                        {activeSolution.description}
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-8 py-6">
                      {activeSolution.metrics.map((metric, index) => (
                        <div
                          key={index}
                          className={`text-center ${animatedMetrics[activeTab] ? `fade-rise stagger-${index + 1}` : 'opacity-0'
                            }`}
                        >
                          <div className="text-3xl text-primary mb-1">{metric.value}</div>
                          <div className="text-xs text-muted-foreground">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Service Details */}
                    <div>
                      <ul className="space-y-3">
                        {activeSolution.details.map((detail, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                            <span className="text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTAs */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        size="lg"
                        onClick={() => {
                          if (activeTab === 'shipping-agency' && onNavigate) {
                            onNavigate('shipping-agency')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                          if (activeTab === 'chartering' && onNavigate) {
                            onNavigate('chartering-broking')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                          if (activeTab === 'freight-forwarding' && onNavigate) {
                            onNavigate('freight-forwarding')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                        }}
                      >
                        Explore Service
                      </Button>
                      <Button variant="outline" size="lg">Request a Quote</Button>
                    </div>
                  </CardContent>

                  {/* Image - Hidden on mobile, shown on large screens */}
                  <div className="hidden lg:block relative" style={{ maxHeight: '550px' }}>
                    <ImageWithFallback
                      src={activeSolution.image}
                      alt={`${activeSolution.title} - ${activeSolution.description}`}
                      width={800}
                      height={550}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>
              </Card>
            </div>
          </Tabs>
        </div>
      </section>
    </div>
  )
}