interface LoginRequest {
  username: string
  password: string
  email?: string
}

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  phone?: string
  nation?: string
  company?: string
  roles: string[]
  roleGroup: string
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
  username: string
  password: string
  email: string
  fullName: string
}

interface SignupResponse {
  success: boolean
  message: string
  data: AuthResponse | null
}

const API_BASE_URL = 'http://localhost:8080/api'
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const persistAuth = (auth: AuthResponse) => {
  localStorage.setItem(TOKEN_KEY, auth.token)
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
}

export const authService = {
  login: async (credential: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Backend accepts username; send both username and email with same credential to allow either
        body: JSON.stringify({ username: credential, email: credential, password } satisfies LoginRequest),
      })

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

  register: async (username: string, email: string, fullName: string, password: string): Promise<SignupResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, fullName, password } as SignupRequest),
      })

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
      const response = await fetch(`${API_BASE_URL}/auth/current-user`, {
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(),
        },
      })

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
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(),
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Update failed',
          data: null,
        }
      }

      // Update local storage if current user
      const currentUser = authService.getUser()
      if (currentUser && currentUser.id === userId && result.data) {
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

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}
