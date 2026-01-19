import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse } from '@/shared/types/api.types'

export interface Port {
  id: number
  name: string
  provinceId: number
}

export const portService = {
  async getAllPorts(): Promise<Port[]> {
    const response = await apiClient.get<ApiResponse<Port[]>>(API_CONFIG.PORTS.BASE)
    const data = await response.json()
    return data.data
  },

  async getPortsByProvince(provinceId: number): Promise<Port[]> {
    const response = await apiClient.get<ApiResponse<Port[]>>(API_CONFIG.PORTS.BY_PROVINCE(provinceId))
    const data = await response.json()
    return data.data
  },
}
