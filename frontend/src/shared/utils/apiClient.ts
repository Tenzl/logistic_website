import { API_CONFIG } from '@/shared/config/api.config'

/**
 * API Client with automatic token handling and base URL from config.
 * Automatically logs out user when receiving 401 Unauthorized.
 */

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
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return

    // Clear both persistent and session storage to cover remember-me/session flows
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('auth_user')
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem('auth_user')

    // Avoid redirect loops when already on login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?reason=session_expired'
    }
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) return endpoint

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${API_CONFIG.API_URL}${normalizedEndpoint}`
  }

  private withTimeout(signal?: AbortSignal | null): AbortSignal | undefined {
    if (!API_CONFIG.TIMEOUT) return signal ?? undefined
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

    if (signal) {
      signal.addEventListener('abort', () => controller.abort())
    }

    // Clear timeout on abort to avoid leaks
    controller.signal.addEventListener('abort', () => clearTimeout(timeoutId))

    return controller.signal
  }

  private logRequest(method: string | undefined, url: string, body?: any) {
    if (!API_CONFIG.ENABLE_LOGS) return
    console.log(`[API Request] ${method?.toUpperCase() || 'GET'} ${url}`, body)
  }

  private logResponse(url: string, data: any) {
    if (!API_CONFIG.ENABLE_LOGS) return
    console.log(`[API Response] ${url}`, data)
  }

  async fetch(endpoint: string, config: ApiClientConfig = {}): Promise<Response> {
    const { skipAuth, headers, signal, ...restConfig } = config

    const token = this.getToken()
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    }

    // Add Authorization header if token exists and not explicitly skipped
    if (token && !skipAuth) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }

    const url = this.buildUrl(endpoint)

    this.logRequest(restConfig.method, url, restConfig.body)

    try {
      const isFormData = restConfig.body instanceof FormData

      if (isFormData) {
        // Let the browser set multipart boundaries
        delete requestHeaders['Content-Type']
      }

      const response = await fetch(url, {
        ...restConfig,
        headers: requestHeaders,
        credentials: 'include',
        signal: this.withTimeout(signal),
      })

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401 && !skipAuth) {
        console.warn('Received 401 Unauthorized - logging out user')
        this.clearAuth()
        throw new Error('Session expired. Please login again.')
      }

      this.logResponse(url, response.clone())

      return response
    } catch (error) {
      // Network errors or other fetch errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      throw error
    }
  }

  async get<T = unknown>(endpoint: string, config?: ApiClientConfig): Promise<Response> {
    return this.fetch(endpoint, { ...config, method: 'GET' })
  }

  async post<T = unknown>(endpoint: string, body?: any, config?: ApiClientConfig): Promise<Response> {
    return this.fetch(endpoint, {
      ...config,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: body instanceof FormData ? {} : config?.headers,
    })
  }

  async put<T = unknown>(endpoint: string, body?: any, config?: ApiClientConfig): Promise<Response> {
    return this.fetch(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T = unknown>(endpoint: string, config?: ApiClientConfig): Promise<Response> {
    return this.fetch(endpoint, { ...config, method: 'DELETE' })
  }
}

export const apiClient = ApiClient.getInstance()
