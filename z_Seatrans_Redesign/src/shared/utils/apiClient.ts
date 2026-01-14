/**
 * API Client with automatic token refresh and 401 handling
 * Automatically logs out user when receiving 401 Unauthorized
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
const TOKEN_KEY = 'auth_token'

export interface ApiClientConfig extends RequestInit {
  skipAuth?: boolean
}

class ApiClient {
  private static instance: ApiClient

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('auth_user')
    
    // Redirect to login page
    window.location.href = '/login?reason=session_expired'
  }

  async fetch(endpoint: string, config: ApiClientConfig = {}): Promise<Response> {
    const { skipAuth, headers, ...restConfig } = config

    const token = this.getToken()
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    }

    // Add Authorization header if token exists and not explicitly skipped
    if (token && !skipAuth) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...restConfig,
        headers: requestHeaders,
        credentials: 'include',
      })

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401 && !skipAuth) {
        console.warn('Received 401 Unauthorized - logging out user')
        this.clearAuth()
        throw new Error('Session expired. Please login again.')
      }

      return response
    } catch (error) {
      // Network errors or other fetch errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      throw error
    }
  }

  async get(endpoint: string, config?: ApiClientConfig): Promise<Response> {
    return this.fetch(endpoint, { ...config, method: 'GET' })
  }

  async post(endpoint: string, body?: any, config?: ApiClientConfig): Promise<Response> {
    return this.fetch(endpoint, {
      ...config,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: body instanceof FormData ? {} : config?.headers,
    })
  }

  async put(endpoint: string, body?: any, config?: ApiClientConfig): Promise<Response> {
    return this.fetch(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete(endpoint: string, config?: ApiClientConfig): Promise<Response> {
    return this.fetch(endpoint, { ...config, method: 'DELETE' })
  }
}

export const apiClient = ApiClient.getInstance()
