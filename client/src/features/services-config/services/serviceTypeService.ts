interface ServiceType {
  id: number
  name: string
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const API_BASE_URL = 'http://localhost:8080/api'
const TOKEN_KEY = 'auth_token'

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const serviceTypeService = {
  getAllServiceTypes: async (): Promise<ServiceType[]> => {
    const response = await fetch(`${API_BASE_URL}/service-types`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch service types')
    }
    
    const result: ApiResponse<ServiceType[]> = await response.json()
    return result.data
  },

  getActiveServiceTypes: async (): Promise<ServiceType[]> => {
    const response = await fetch(`${API_BASE_URL}/service-types/active`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch active service types')
    }
    
    const result: ApiResponse<ServiceType[]> = await response.json()
    return result.data
  },
}

export type { ServiceType }
