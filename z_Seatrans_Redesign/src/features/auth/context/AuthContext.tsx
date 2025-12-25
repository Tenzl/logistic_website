'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'

interface User {
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

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credential: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (username: string, email: string, fullName: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  profileComplete: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = authService.getUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const refreshUser = async () => {
    const response = await authService.getCurrentUser()
    if (response.success && response.data) {
      setUser(response.data)
    }
  }

  useEffect(() => {
    if (authService.isAuthenticated()) {
      refreshUser()
    }
  }, [])

  const login = async (credential: string, password: string) => {
    const response = await authService.login(credential, password)
    if (response.success && response.data) {
      setUser(response.data.user)
      return { success: true }
    }
    return { success: false, message: response.message }
  }

  const register = async (username: string, email: string, fullName: string, password: string) => {
    const response = await authService.register(username, email, fullName, password)
    if (response.success && response.data) {
      setUser(response.data.user)
      return { success: true }
    }
    return { success: false, message: response.message }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const profileComplete = !!(
    user?.fullName && user?.company && user?.email && user?.phone
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        profileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
