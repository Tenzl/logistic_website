const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

const getAuthHeader = () => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface ServiceFormField {
  id: number
  key: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'date'
  required: boolean
  placeholder?: string
  gridSpan?: number
  options?: string
  position?: number
  isActive?: boolean
  meta?: string
}

export async function fetchServiceFormFields(serviceTypeId: number): Promise<ServiceFormField[]> {
  const response = await fetch(`${API_BASE_URL}/service-types/${serviceTypeId}/form-fields`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Bạn cần đăng nhập để tải form. Vui lòng đăng nhập và thử lại.')
    }
    throw new Error('Failed to load form fields')
  }

  return response.json()
}
