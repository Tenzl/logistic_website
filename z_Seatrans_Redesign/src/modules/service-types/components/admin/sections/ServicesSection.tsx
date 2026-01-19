import { LucideIcon } from 'lucide-react'

export interface ServiceItem {
  name: string
  description: string
  icon: LucideIcon
}

export function ServicesSection({
  services
}: {
  services: {
    sectionTitle: string
    sectionDescription: string
    items: ServiceItem[]
  }
}) {
  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="fade-rise text-3xl md:text-4xl font-bold">{services.sectionTitle}</h2>
          <p className="text-muted-foreground mt-4 fade-rise" style={{ animationDelay: '90ms' }}>
            {services.sectionDescription}
          </p>
        </div>

        <div
          className={`grid gap-6 max-w-6xl mx-auto ${
            services.items.length <= 3
              ? `md:grid-cols-${services.items.length}`
              : 'md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {services.items.map((service, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 rounded-lg bg-background hover:shadow-lg transition-all duration-300 hover-lift fade-rise border"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <service.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h4>{service.name}</h4>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
