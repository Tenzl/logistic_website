'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
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
      // Store tokens in localStorage
      localStorage.setItem('auth_token', token)
      
      // Decode user info from token (simple Base64 decode of JWT payload)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        
        // Fetch full user info from API
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/auth/current-user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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
        console.error('Failed to decode token', err)
        router.push('/')
      }
    } else {
      router.push('/login')
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
