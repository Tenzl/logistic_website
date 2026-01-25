import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse } from '@/shared/types/api.types'

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

export const inquiryService = {
  getAllInquiries: async (): Promise<Inquiry[]> => {
    const response = await apiClient.get<ApiResponse<Inquiry[]>>(API_CONFIG.INQUIRIES.ADMIN_BASE)

    if (!response.ok) {
      throw new Error('Failed to fetch inquiries')
    }

    const result: ApiResponse<Inquiry[]> = await response.json()
    return result.data
  },

  getInquiryById: async (id: number): Promise<Inquiry> => {
    const response = await apiClient.get<ApiResponse<Inquiry>>(API_CONFIG.INQUIRIES.ADMIN_BY_ID(id))

    if (!response.ok) {
      throw new Error('Failed to fetch inquiry')
    }

    const result: ApiResponse<Inquiry> = await response.json()
    return result.data
  },

  updateInquiryStatus: async (id: number, status: string): Promise<Inquiry> => {
    const response = await apiClient.put<ApiResponse<Inquiry>>(
      API_CONFIG.INQUIRIES.UPDATE_STATUS(id),
      { status }
    )

    if (!response.ok) {
      throw new Error('Failed to update inquiry status')
    }

    const result: ApiResponse<Inquiry> = await response.json()
    return result.data
  },
}
