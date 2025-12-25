interface Port {
  id: number
  name: string
  provinceId: number
  provinceName: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface CreatePortRequest {
  name: string
  provinceId: number
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

export const portService = {
  getAllPorts: async (): Promise<Port[]> => {
    const response = await fetch(`${API_BASE_URL}/ports`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch ports')
    }
    
    const result: ApiResponse<Port[]> = await response.json()
    return result.data
  },

  getPortsByProvince: async (provinceId: number): Promise<Port[]> => {
    const response = await fetch(`${API_BASE_URL}/ports/province/${provinceId}`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch ports')
    }
    
    const result: ApiResponse<Port[]> = await response.json()
    return result.data
  },

  createPort: async (data: CreatePortRequest): Promise<Port> => {
    const response = await fetch(`${API_BASE_URL}/ports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create port')
    }
    
    const result: ApiResponse<Port> = await response.json()
    return result.data
  },

  updatePort: async (id: number, data: CreatePortRequest): Promise<Port> => {
    const response = await fetch(`${API_BASE_URL}/ports/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update port')
    }
    
    const result: ApiResponse<Port> = await response.json()
    return result.data
  },

  deletePort: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/ports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete port')
    }
  },
}

export type { Port, CreatePortRequest }
