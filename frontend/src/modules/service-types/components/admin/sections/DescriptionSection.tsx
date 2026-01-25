import { LucideIcon } from 'lucide-react'

export function DescriptionSection({
  serviceIcon: ServiceIcon,
  description
}: {
  serviceIcon: LucideIcon
  description: string
}) {
  return (
    <section className="py-8 md:py-10">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ServiceIcon className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground fade-rise text-lg">{description}</p>
        </div>
      </div>
    </section>
  )
}
