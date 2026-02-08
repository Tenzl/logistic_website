'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import {
  Clock,
  Shield,
  Headphones,
  X,
  Anchor // Import thêm icon Anchor cho đẹp
} from 'lucide-react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import vnGeo from '@/shared/assets/data/newvn.json'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { getProvinceCoordinates } from '@/shared/utils/provinceCoordinates'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'

export function Coverage() {
  const [provinces, setProvinces] = useState<any[]>([])
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  const [ref, isInView] = useIntersectionObserver()

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await apiClient.get(API_CONFIG.PROVINCES.ACTIVE, { skipAuth: true })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to fetch provinces', response.status, errorText)
          return
        }

        const data = await response.json()

        if (data?.success) {
          const mappedProvinces = data.data
            .map((p: any) => {
              // Get pre-calculated coordinates
              const coordinates = getProvinceCoordinates(p.name)

              if (coordinates[0] === 0 && coordinates[1] === 0) {
                console.warn(`No coordinates found for province: ${p.name} (ID: ${p.id})`)
              }

              return {
                id: p.id,
                name: p.name,
                coordinates: coordinates,
                ports: p.ports || []
              }
            })
            .filter((p: any) => p.coordinates[0] !== 0) // Filter out unmapped

          setProvinces(mappedProvinces)
        } else {
          console.error('Invalid provinces response', data)
        }
      } catch (error) {
        console.error("Failed to fetch provinces", error)
      }
    }

    fetchProvinces()
  }, [])

  return (
    <div ref={ref}>
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isInView ? 'fade-rise' : 'opacity-0'}`}>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">
                  Full Coverage Across
                  <br />
                  <span className="text-primary">Trans-Asia Routes</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Comprehensive network spanning Vietnam's key ports and beyond, ensuring seamless connectivity for your cargo.
                </p>
              </div>

              {/* Key Benefits */}
              <div className={`grid gap-4 ${isInView ? 'fade-rise stagger-1' : 'opacity-0'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Predictable Transit Times</h3>
                    <p className="text-sm text-muted-foreground">Reliable scheduling across all major routes</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Customs Expertise</h3>
                    <p className="text-sm text-muted-foreground">Streamlined clearance processes and compliance</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Headphones className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">24/7 Support</h3>
                    <p className="text-sm text-muted-foreground">Round-the-clock operational assistance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Interactive Map */}
            <div className={`relative ${isInView ? 'scale-in stagger-1' : 'opacity-0'}`}>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Vietnam Network</h3>
                    <Badge variant="secondary">Live Coverage</Badge>
                  </div>

                  {/* Map Container */}
                  <div ref={ref} className="relative bg-card rounded-lg overflow-hidden border">
                    <ComposableMap
                      projection="geoMercator"
                      projectionConfig={{ center: [107, 16], scale: 3000 }}
                      width={800}
                      height={850}
                      className="w-full h-auto"
                    >
                      <Geographies geography={vnGeo}>
                        {({ geographies }) =>
                          geographies.map((geo) => (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill="#e0f2fe"
                              stroke="#1a54b4"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: 'none' },
                                hover: { outline: 'none', fill: '#bae6fd' },
                                pressed: { outline: 'none' }
                              }}
                            />
                          ))
                        }
                      </Geographies>

                      {/* Province Markers */}
                      {provinces.map((province, index) => (
                        <Marker key={province.id} coordinates={province.coordinates}>
                          <g
                            onMouseEnter={() => setHoveredProvince(province.id)}
                            onMouseLeave={() => setHoveredProvince(null)}
                            onClick={() => setSelectedProvince(province.id)}
                            className="cursor-pointer"
                          >
                            {/* Pulsating Rings */}
                            <circle
                              r={13}
                              fill="none"
                              stroke="#2ECC71"
                              strokeWidth={2}
                              opacity={0.6}
                              className="animate-ping"
                              style={{ animationDuration: '2s' }}
                            />

                            {/* Main Marker Circle */}
                            <circle
                              r={8}
                              fill="#2ECC71"
                              stroke="#fff"
                              strokeWidth={2}
                              className="transition-all hover:scale-110"
                            />

                            {/* HOVER MESSAGE BUBBLE */}
                            {hoveredProvince === province.id && (
                              <foreignObject
                                x={-215}
                                y={-60}
                                width={200}
                                height={120}
                                style={{ overflow: 'visible', zIndex: 50 }}
                              >
                                <div className="flex flex-row items-center justify-end h-full animate-in fade-in zoom-in-95 duration-200">
                                  {/* Bubble Body */}
                                  <div className="bg-card rounded-lg shadow-xl border p-3 min-w-[140px]">
                                    {/* Header: Province Name */}
                                    <div className="text-xs font-bold text-foreground uppercase tracking-wide border-b pb-1 mb-1.5">
                                      {province.name}
                                    </div>

                                    {/* List of Ports */}
                                    <div className="space-y-1.5">
                                      {province.ports.map((port: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-1.5">
                                          <Anchor className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                          <span className="text-[11px] font-medium text-muted-foreground leading-tight text-left">
                                            {port}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Triangle Tail (Mũi tên trỏ phải) */}
                                  <div className="w-3 h-3 bg-card rotate-45 transform -translate-x-1.5 shadow-sm border-t border-r z-10"></div>
                                </div>
                              </foreignObject>
                            )}
                          </g>
                        </Marker>
                      ))}
                    </ComposableMap>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}