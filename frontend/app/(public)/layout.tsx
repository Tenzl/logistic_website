import Header from '@/shared/components/layout/Header/Header'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
