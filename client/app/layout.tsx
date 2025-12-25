import type { Metadata } from 'next'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { Toaster } from '@/shared/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'Seatrans - Maritime Logistics Solutions',
  description: 'Professional shipping agency, chartering broking, and freight forwarding services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
