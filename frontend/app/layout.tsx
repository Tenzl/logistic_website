import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import { AuthProvider } from '@/modules/auth/context/AuthContext'
import { Toaster } from '@/shared/components/ui/sonner'
import { NProgressProvider } from '@/shared/components/NProgressProvider'
import '@/styles/nprogress.css'
import './globals.css'

const siteUrl = 'https://seatrans.vercel.app'
const gaMeasurementId = 'G-NQK767RG2P'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Seatrans - Maritime Logistics Solutions',
    template: '%s | Seatrans',
  },
  description: 'Professional shipping agency, chartering broking, and freight forwarding services',
  authors: [{ name: 'Seatrans' }],
  creator: 'Seatrans',
  publisher: 'Seatrans',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Seatrans - Maritime Logistics Solutions',
    description: 'Professional shipping agency, chartering broking, and freight forwarding services',
    siteName: 'Seatrans',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seatrans - Maritime Logistics Solutions',
    description: 'Professional shipping agency, chartering broking, and freight forwarding services',
  },
  icons: {
    icon: '/landing-image/web_Logo.png',
    apple: '/landing-image/web_Logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Seatrans',
    url: siteUrl,
    logo: `${siteUrl}/landing-image/web_Logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84 935 015 679',
      contactType: 'customer service',
      areaServed: 'VN',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '51 Luu Huu Phuoc',
      addressRegion: 'Gia Lai',
      addressCountry: 'VN',
    },
    sameAs: ['https://www.facebook.com/seatrans.info'],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Suspense fallback={null}>
            <NProgressProvider />
          </Suspense>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
