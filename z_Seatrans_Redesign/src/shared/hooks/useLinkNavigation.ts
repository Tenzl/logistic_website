'use client'

import { useEffect } from 'react'
import NProgress from 'nprogress'

export function useLinkNavigation() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && anchor.href && !anchor.target && anchor.href.startsWith(window.location.origin)) {
        const url = new URL(anchor.href)
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          NProgress.start()
        }
      }
    }

    document.addEventListener('click', handleClick)
    
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])
}
