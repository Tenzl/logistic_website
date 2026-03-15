'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import {
  Clock,
  Shield,
  Headphones,
  X,
  Anchor,
  Plus
} from 'lucide-react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { getProvinceCoordinates } from '@/shared/utils/provinceCoordinates'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { MorphingPopover, MorphingPopoverContent } from '@/shared/components/ui/morphing-popover'

interface ProvinceApiResponse {
  id: number
  name: string
  displayName?: string
  ports?: string[]
}

interface MapProvince {
  id: number
  name: string
  coordinates: [number, number]
  ports: string[]
}

export function Coverage() {
  const [provinces, setProvinces] = useState<MapProvince[]>([])
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null)
  const [hoveredProvince, setHoveredProvince] = useState<number | null>(null)
  const [popupHoveredProvince, setPopupHoveredProvince] = useState<number | null>(null)
  const [selectedPort, setSelectedPort] = useState<{ provinceName: string; portName: string } | null>(null)
  const [geoData, setGeoData] = useState<any | null>(null)
  const [ref, isInView] = useIntersectionObserver()
  const hoverHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHoverHideTimeout = () => {
    if (hoverHideTimeoutRef.current) {
      clearTimeout(hoverHideTimeoutRef.current)
      hoverHideTimeoutRef.current = null
    }
  }

  const scheduleHideProvincePopup = (provinceId: number, delay = 120) => {
    clearHoverHideTimeout()
    hoverHideTimeoutRef.current = setTimeout(() => {
      setHoveredProvince((current) => (current === provinceId ? null : current))
      setSelectedProvince((current) => (current === provinceId ? null : current))
    }, delay)
  }

  const shouldPopupRenderRight = (provinceName: string) => {
    const normalized = provinceName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return (
      normalized.includes('ho chi minh') ||
      normalized.includes('tp hcm') ||
      normalized.includes('dong nai') ||
      normalized.includes('quang ninh') ||
      normalized.includes('quang ngai')
    )
  }

  useEffect(() => {
    return () => clearHoverHideTimeout()
  }, [])

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const response = await fetch('/geo/newvn.json')
        if (!response.ok) {
          console.error('Failed to load map data', response.status)
          return
        }
        const data = await response.json()
        setGeoData(data)
      } catch (error) {
        console.error('Failed to load map data', error)
      }
    }

    loadGeoData()
  }, [])

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await apiClient.get(API_CONFIG.PROVINCES.BASE, { skipAuth: true })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to fetch provinces', response.status, errorText)
          return
        }

        const data = await response.json()

        const resolveCoordinates = (province: ProvinceApiResponse): [number, number] => {
          const candidateNames = [province.displayName, province.name]
            .filter((value): value is string => Boolean(value && value.trim()))

          for (const candidate of candidateNames) {
            const coordinates = getProvinceCoordinates(candidate)
            if (!(coordinates[0] === 0 && coordinates[1] === 0)) {
              return coordinates
            }
          }

          return [0, 0]
        }

        if (data?.success) {
          const mappedProvinces = data.data
            .filter((p: ProvinceApiResponse) => Array.isArray(p.ports) && p.ports.length > 0)
            .map((p: ProvinceApiResponse) => {
              const mapLabel = (p.displayName || p.name || '').trim()
              const coordinates = resolveCoordinates(p)

              if (coordinates[0] === 0 && coordinates[1] === 0) {
                console.warn(`No coordinates found for province: ${mapLabel} (ID: ${p.id})`)
              }

              return {
                id: p.id,
                name: mapLabel,
                coordinates: coordinates,
                ports: p.ports || []
              }
            })
            .filter((p: MapProvince) => p.coordinates[0] !== 0) // Filter out unmapped

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
                  {/* Full Coverage Across */}
                  {/* <br /> */}
                  <span className="text-primary">South East Asia Transport and Logistics (SEATRANS)</span>
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
                    <h3 className="text-xl font-semibold">SEATRANS - OPERATION MAP</h3>
                    <Badge variant="secondary">Live Coverage</Badge>
                  </div>

                  {/* Map Container */}
                  <div ref={ref} className="relative bg-card rounded-lg overflow-hidden border">
                    {selectedPort && (
                      <div className="absolute inset-0 z-30 bg-black/25 backdrop-blur-sm" />
                    )}

                    {geoData ? (
                      <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ center: [107, 16], scale: 3000 }}
                        width={800}
                        height={850}
                        className="w-full h-auto"
                      >
                        <Geographies geography={geoData}>
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
                        {provinces.map((province) => (
                          <Marker key={province.id} coordinates={province.coordinates}>
                            <g
                              onMouseEnter={() => {
                                clearHoverHideTimeout()
                                setHoveredProvince(province.id)
                              }}
                              onMouseLeave={() => {
                                if (popupHoveredProvince === province.id) return
                                scheduleHideProvincePopup(province.id)
                              }}
                              onClick={() => {
                                clearHoverHideTimeout()
                                setSelectedProvince(province.id)
                                setHoveredProvince(province.id)
                              }}
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
                              {(selectedProvince === province.id || hoveredProvince === province.id || popupHoveredProvince === province.id) && (
                                <foreignObject
                                  x={shouldPopupRenderRight(province.name) ? 20 : -300}
                                  y={-95}
                                  width={280}
                                  height={190}
                                  className="overflow-visible"
                                >
                                  <div
                                    className="flex flex-row items-center justify-end h-full animate-in fade-in zoom-in-95 duration-200"
                                    onMouseEnter={() => {
                                      clearHoverHideTimeout()
                                      setPopupHoveredProvince(province.id)
                                    }}
                                    onMouseLeave={() => {
                                      setPopupHoveredProvince((current) => (current === province.id ? null : current))
                                      scheduleHideProvincePopup(province.id, 80)
                                    }}
                                  >
                                    {shouldPopupRenderRight(province.name) ? (
                                      <>
                                        {/* Triangle Tail (pointing left) */}
                                        <div className="w-4 h-4 bg-card rotate-45 transform translate-x-2 shadow-sm border-l border-b z-10"></div>

                                        {/* Bubble Body */}
                                        <div className="bg-card rounded-xl shadow-xl border p-4 min-w-[220px]">
                                          <div className="text-base font-bold text-foreground uppercase tracking-wide border-b pb-2 mb-2">
                                            {province.name}
                                          </div>

                                          <div className="space-y-2">
                                            {province.ports.map((port: string, idx: number) => (
                                              <div key={idx} className="flex items-center justify-between gap-3">
                                                <Anchor className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-[15px] font-medium text-muted-foreground leading-tight text-left flex-1">
                                                  {port}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={(event) => {
                                                    event.stopPropagation()
                                                    setSelectedPort({ provinceName: province.name, portName: port })
                                                  }}
                                                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-primary/30 text-primary hover:bg-primary/10"
                                                  aria-label={`View details for ${port}`}
                                                >
                                                  <Plus className="h-4 w-4" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        {/* Bubble Body */}
                                        <div className="bg-card rounded-xl shadow-xl border p-4 min-w-[220px]">
                                          <div className="text-base font-bold text-foreground uppercase tracking-wide border-b pb-2 mb-2">
                                            {province.name}
                                          </div>

                                          <div className="space-y-2">
                                            {province.ports.map((port: string, idx: number) => (
                                              <div key={idx} className="flex items-center justify-between gap-3">
                                                <Anchor className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-[15px] font-medium text-muted-foreground leading-tight text-left flex-1">
                                                  {port}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={(event) => {
                                                    event.stopPropagation()
                                                    setSelectedPort({ provinceName: province.name, portName: port })
                                                  }}
                                                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-primary/30 text-primary hover:bg-primary/10"
                                                  aria-label={`View details for ${port}`}
                                                >
                                                  <Plus className="h-4 w-4" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Triangle Tail (pointing right) */}
                                        <div className="w-4 h-4 bg-card rotate-45 transform -translate-x-2 shadow-sm border-t border-r z-10"></div>
                                      </>
                                    )}
                                  </div>
                                </foreignObject>
                              )}
                            </g>
                          </Marker>
                        ))}
                      </ComposableMap>
                    ) : (
                      <div className="flex items-center justify-center h-[520px] text-sm text-muted-foreground">
                        Loading map...
                      </div>
                    )}

                    <MorphingPopover
                      open={!!selectedPort}
                      onOpenChange={(open) => {
                        if (!open) setSelectedPort(null)
                      }}
                      className="absolute inset-0 z-40 pointer-events-none"
                    >
                      <MorphingPopoverContent className="pointer-events-auto left-1/2 top-1/2 z-50 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 p-0">
                        <div className="flex h-full flex-col bg-background">
                          <div className="flex items-center justify-between border-b px-4 py-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Port information</p>
                              <h4 className="text-base font-semibold">{selectedPort?.portName}</h4>
                              <p className="text-sm text-muted-foreground">{selectedPort?.provinceName}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedPort(null)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                              aria-label="Close port details"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
                            <p>
                              Operational details for this port can be shown here, such as available services,
                              contact points, and handling notes.
                            </p>
                          </div>
                        </div>
                      </MorphingPopoverContent>
                    </MorphingPopover>
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