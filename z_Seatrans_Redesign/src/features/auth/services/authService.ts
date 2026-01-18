import { apiClient } from '@/shared/utils/apiClient'

interface LoginRequest {
  email: string
  password: string
}

export interface User {
  id: number
  email: string
  fullName: string
  phone?: string
  company?: string
  nation?: string
  role?: string
  roleId?: number
  roleGroup?: string
}

interface AuthResponse {
  token: string
  type: string
  user: User
}

interface LoginResponse {
  success: boolean
  message: string
  data: AuthResponse | null
}

interface SignupRequest {
  password: string
  email: string
  fullName: string
  phone?: string
  company?: string
}

interface SignupResponse {
  success: boolean
  message: string
  data: AuthResponse | null
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const persistAuth = (auth: AuthResponse) => {
  localStorage.setItem(TOKEN_KEY, auth.token)
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      // Skip auth for login endpoint
      const response = await apiClient.post('/auth/login', 
        { email, password } satisfies LoginRequest,
        { skipAuth: true }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed',
          data: null,
        }
      }

      // Save token and user to localStorage
      if (data.success && data.data) {
        persistAuth(data.data)
      }

      return {
        success: data.success,
        message: data.message,
        data: data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      }
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY)
  },

  register: async (email: string, fullName: string, password: string, phone?: string, company?: string): Promise<SignupResponse> => {
    try {
      // Skip auth for register endpoint
      const response = await apiClient.post('/auth/register/customer',
        { email, fullName, password, phone, company } as SignupRequest,
        { skipAuth: true }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Registration failed',
          data: null,
        }
      }

      // Save token and user to localStorage
      if (data.success && data.data) {
        persistAuth(data.data)
      }

      return {
        success: data.success,
        message: data.message,
        data: data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      }
    }
  },

  // Helper function to get authorization header
  getAuthHeader: (): Record<string, string> => {
    const token = authService.getToken()
    return token ? { Authorization: `Bearer ${token}` } : ({} as Record<string, string>)
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      // apiClient will automatically handle 401 and logout
      const response = await apiClient.get('/auth/current-user')

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Unable to fetch current user',
          data: null,
        }
      }

      if (result?.data) {
        localStorage.setItem(USER_KEY, JSON.stringify(result.data))
      }

      return {
        success: result.success,
        message: result.message,
        data: result.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      }
    }
  },

  updateProfile: async (userId: number, data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      // apiClient will automatically handle 401 and logout
      // Changed from /users/{id} to /user/profile/me for external user self-update
      const response = await apiClient.put('/user/profile/me', data)

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Update failed',
          data: null,
        }
      }

      // Update local storage with new user data
      if (result.data) {
        localStorage.setItem(USER_KEY, JSON.stringify(result.data))
      }

      return {
        success: result.success,
        message: result.message,
        data: result.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      }
    }
  },
}
 