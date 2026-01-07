'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import { useLinkNavigation } from '@/hooks/useLinkNavigation'
import 'nprogress/nprogress.css'

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 100,
  minimum: 0.08,
  easing: 'ease',
  speed: 400
})

export function NProgressProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Enable auto-start on link clicks
  useLinkNavigation()

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  return null
}
