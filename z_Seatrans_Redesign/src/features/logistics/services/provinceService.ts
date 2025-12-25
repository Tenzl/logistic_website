interface Province {
  id: number
  name: string
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

export const provinceService = {
  getAllProvinces: async (): Promise<Province[]> => {
    const response = await fetch(`${API_BASE_URL}/provinces`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch provinces')
    }
    
    const result: ApiResponse<Province[]> = await response.json()
    return result.data
  },

  getActiveProvinces: async (): Promise<Province[]> => {
    const response = await fetch(`${API_BASE_URL}/provinces/active`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch active provinces')
    }
    
    const result: ApiResponse<Province[]> = await response.json()
    return result.data
  },

  getProvincesWithPorts: async (activeOnly: boolean = true): Promise<Province[]> => {
    const response = await fetch(`${API_BASE_URL}/provinces/with-ports?activeOnly=${activeOnly}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch provinces with ports')
    }

    const result: ApiResponse<Province[]> = await response.json()
    return result.data
  },
}

export type { Province }
