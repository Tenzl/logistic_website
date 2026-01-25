import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse } from '@/shared/types/api.types'

interface ImageType {
  id: number
  name: string
  displayName: string
  serviceTypeId: number
  serviceTypeName?: string
  requiredImageCount: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface CreateImageTypeRequest {
  name: string
  displayName: string
  serviceTypeId: number
  requiredImageCount: number
}

interface ImageCountDTO {
  imageTypeId: number
  current: number
  required: number
}

export const imageTypeService = {
  getAllImageTypes: async (): Promise<ImageType[]> => {
    const response = await apiClient.get<ApiResponse<ImageType[]>>(API_CONFIG.IMAGE_TYPES.BASE)
    const result = await response.json()
    return result.data
  },

  getImageTypesByServiceType: async (serviceTypeId: number): Promise<ImageType[]> => {
    const response = await apiClient.get<ApiResponse<ImageType[]>>(
      API_CONFIG.IMAGE_TYPES.BY_SERVICE_TYPE(serviceTypeId)
    )

    const result = await response.json()
    return result.data
  },

  getImageCount: async (
    imageTypeId: number,
    provinceId?: number,
    portId?: number,
    serviceTypeId?: number
  ): Promise<ImageCountDTO> => {
    const params = new URLSearchParams()
    if (provinceId) params.append('provinceId', provinceId.toString())
    if (portId) params.append('portId', portId.toString())
    if (serviceTypeId) params.append('serviceTypeId', serviceTypeId.toString())

    const url = `${API_CONFIG.IMAGE_TYPES.BASE}/${imageTypeId}/image-count${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiClient.get<ApiResponse<ImageCountDTO>>(url)

    const result = await response.json()
    return result.data
  },

  createImageType: async (data: CreateImageTypeRequest): Promise<ImageType> => {
    const response = await apiClient.post<ApiResponse<ImageType>>(API_CONFIG.IMAGE_TYPES.ADMIN_BASE, data)
    const result = await response.json()
    return result.data
  },

  updateImageType: async (id: number, data: CreateImageTypeRequest): Promise<ImageType> => {
    const response = await apiClient.put<ApiResponse<ImageType>>(
      API_CONFIG.IMAGE_TYPES.ADMIN_BY_ID(id),
      data
    )

    const result = await response.json()
    return result.data
  },

  deleteImageType: async (id: number): Promise<void> => {
    const response = await apiClient.delete(API_CONFIG.IMAGE_TYPES.ADMIN_BY_ID(id))

    if (!response.ok) {
      throw new Error('Failed to delete image type')
    }
  },
}

export type { ImageType, CreateImageTypeRequest, ImageCountDTO }
