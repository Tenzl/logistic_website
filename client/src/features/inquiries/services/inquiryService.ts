interface Inquiry {
  id: number
  name: string
  email: string
  service: string
  date: string
  status: string
  message?: string
  phone?: string
  company?: string
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

export const inquiryService = {
  getAllInquiries: async (): Promise<Inquiry[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/inquiries`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch inquiries')
    }
    
    const result: ApiResponse<Inquiry[]> = await response.json()
    return result.data
  },

  getInquiryById: async (id: number): Promise<Inquiry> => {
    const response = await fetch(`${API_BASE_URL}/admin/inquiries/${id}`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch inquiry')
    }
    
    const result: ApiResponse<Inquiry> = await response.json()
    return result.data
  },

  updateInquiryStatus: async (id: number, status: string): Promise<Inquiry> => {
    const response = await fetch(`${API_BASE_URL}/admin/inquiries/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update inquiry status')
    }
    
    const result: ApiResponse<Inquiry> = await response.json()
    return result.data
  },
}
