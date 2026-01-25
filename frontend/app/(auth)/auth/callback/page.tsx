'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')
    const error = searchParams.get('error')

    if (error) {
      router.push('/login?error=' + error)
      return
    }

    if (token && refreshToken) {
      localStorage.setItem('auth_token', token)

      try {
        // Fetch full user info from API and persist
        apiClient
          .get(API_CONFIG.AUTH.CURRENT_USER, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            skipAuth: true,
          })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              localStorage.setItem('auth_user', JSON.stringify(data.data))
            }
            router.push('/')
          })
          .catch(() => {
            router.push('/')
          })
      } catch (err) {
        console.error('Failed to handle auth callback', err)
        router.push('/')
      }
    } else {
      router.push('/login')
    }
  }, [router, searchParams])

  return <LoadingState />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
