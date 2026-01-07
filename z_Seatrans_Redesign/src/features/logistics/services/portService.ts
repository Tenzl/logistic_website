import { authService } from '@/features/auth/services/authService'

export interface Port {
  id: number
  name: string
  provinceId: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

async function request<T>(url: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const authHeader = authService.getAuthHeader()
  Object.assign(headers, authHeader)

  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  const data = await res.json().catch(() => null)
  return (data?.data as T) ?? (data as T)
}

export const portService = {
  async getAllPorts(): Promise<Port[]> {
    return request<Port[]>(`${API_BASE_URL}/ports`)
  },

  async getPortsByProvince(provinceId: number): Promise<Port[]> {
    return request<Port[]>(`${API_BASE_URL}/ports/province/${provinceId}`)
  },
}
