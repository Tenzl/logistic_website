'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search, MapPin, Navigation, Waves, ShieldAlert, Ship } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { getPortById, PORTS } from './portData'

const BLUR_KEYWORD = 'restricted'

interface PortInformationClientProps {
  portId?: string
}

export default function PortInformationClient({ portId }: PortInformationClientProps) {
  const [query, setQuery] = useState('')

  const filteredPorts = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) {
      return PORTS
    }

    return PORTS.filter((port) => port.name.toLowerCase().includes(keyword))
  }, [query])

  const selectedPort = getPortById(portId)

  return (
    <main className="relative overflow-hidden py-10 md:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-300/15 blur-3xl" />
      </div>

      <section className="container space-y-6">
        <div className="rounded-2xl border bg-card/70 p-6 backdrop-blur md:p-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground">PUBLIC DATA CENTER</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">PORT INFORMATION</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Browse key nautical notes and operational limits by port. Use the right-hand search panel to quickly switch between ports.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          <Card className="border-primary/15 bg-card/90">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-2xl md:text-3xl">{selectedPort.name} PORT INFORMATION</CardTitle>
                <Badge variant={selectedPort.status === 'ready' ? 'default' : 'outline'}>
                  {selectedPort.status === 'ready' ? 'Published' : 'Updating'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock icon={MapPin} label="Port Location" value={selectedPort.location} />
                <InfoBlock
                  icon={Navigation}
                  label="Pilot Boarding Position"
                  value={selectedPort.pilotBoardingPosition}
                />
                <InfoBlock icon={Ship} label="Port Access Channel" value={selectedPort.accessChannel} />
                <InfoBlock icon={Waves} label="Tide Regime" value={selectedPort.tideRegime} />
              </div>

              <Separator />

              <section className="space-y-3">
                <h2 className="text-lg font-semibold">AVAILABLE MAIN BERTHS</h2>
                <ul className="space-y-2 text-sm md:text-base">
                  {selectedPort.mainBerths.map((berth) => (
                    <li key={berth} className="rounded-lg border bg-muted/40 px-3 py-2">
                      {berth}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  PORT RESTRICTION
                </h2>
                <ul className="list-disc space-y-2 pl-5 text-sm md:text-base">
                  {selectedPort.restrictions.map((item) => (
                    <li key={item}>{renderBlurKeyword(item)}</li>
                  ))}
                </ul>
              </section>
            </CardContent>
          </Card>

          <Card className="h-fit border-primary/20 bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Search Ports</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by port name..."
                  className="pl-9"
                />
              </div>

              <div className="max-h-[460px] space-y-2 overflow-auto pr-1">
                {filteredPorts.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    No matching ports. Try another keyword.
                  </p>
                ) : (
                  filteredPorts.map((port) => {
                    const active = selectedPort.id === port.id

                    return (
                      <Link
                        key={port.id}
                        href={`/port-information/${port.id}`}
                        className={`block w-full rounded-xl border px-3 py-3 text-left no-underline text-foreground transition ${
                          active
                            ? 'border-primary bg-primary/10 ring-1 ring-primary/25'
                            : 'border-border hover:border-primary/40 hover:bg-muted/60'
                        }`}
                      >
                        <p className="font-medium">{port.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {port.status === 'ready' ? 'Detailed information available' : 'Content is being updated'}
                        </p>
                      </Link>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

interface InfoBlockProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}

function InfoBlock({ icon: Icon, label, value }: InfoBlockProps) {
  return (
    <div className="rounded-lg border bg-muted/35 p-4">
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="text-sm leading-relaxed md:text-base">{value}</p>
    </div>
  )
}

function renderBlurKeyword(text: string) {
  const pattern = new RegExp(`(${BLUR_KEYWORD})`, 'gi')
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    if (part.toLowerCase() === BLUR_KEYWORD) {
      return (
        <span key={`${part}-${index}`} className="blur-sm select-none">
          {part}
        </span>
      )
    }

    return <span key={`${part}-${index}`}>{part}</span>
  })
}
