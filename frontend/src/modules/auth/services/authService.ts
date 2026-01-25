import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { User } from '@/types/dashboard'

interface LoginRequest {
  email: string
  password: string
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

const persistAuth = (auth: AuthResponse, remember = true) => {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, auth.token)
  storage.setItem(USER_KEY, JSON.stringify(auth.user))
}

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

const readToken = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
const readUser = () => sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
const getActiveStorage = () => (sessionStorage.getItem(TOKEN_KEY) ? sessionStorage : localStorage)

export const authService = {
  login: async (email: string, password: string, remember = true): Promise<LoginResponse> => {
    try {
      // Skip auth for login endpoint
      const response = await apiClient.post(API_CONFIG.AUTH.LOGIN, 
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
        persistAuth(data.data, remember)
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
    clearAuth()
  },

  getToken: () => {
    return readToken()
  },

  getUser: (): User | null => {
    const user = readUser()
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => {
    return !!readToken()
  },

  register: async (email: string, fullName: string, password: string, phone?: string, company?: string): Promise<SignupResponse> => {
    try {
      // Skip auth for register endpoint
      const response = await apiClient.post(API_CONFIG.AUTH.REGISTER_CUSTOMER,
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
      const response = await apiClient.get(API_CONFIG.AUTH.CURRENT_USER)

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Unable to fetch current user',
          data: null,
        }
      }

      if (result?.data) {
        const storage = getActiveStorage()
        storage.setItem(USER_KEY, JSON.stringify(result.data))
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
      // User self-update endpoint - available for all authenticated users
      const response = await apiClient.put('/users/profile/me', data)

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
        const storage = getActiveStorage()
        storage.setItem(USER_KEY, JSON.stringify(result.data))
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
 
