import { Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb'

export function BreadcrumbSection({
  serviceName,
  onNavigateHome,
}: {
  serviceName: string
  onNavigateHome?: () => void
}) {
  return (
    <section className="py-4">
      <div className="container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                onClick={(e) => {
                  if (onNavigateHome) {
                    e.preventDefault()
                    onNavigateHome()
                  }
                }}
                className="flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{serviceName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </section>
  )
}
