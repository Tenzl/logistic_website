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
  cargoType: CargoType
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

type CargoType = string

interface CargoTypeCatalogItem {
  code: string
  displayLabel: string
  serviceTypeType: string
}

interface CargoTypeCatalogUpsertRequest {
  serviceTypeId: number
  code: string
  displayLabel: string
}

interface CreateImageTypeRequest {
  name: string
  displayName: string
  serviceTypeId: number
  requiredImageCount: number
  cargoType: CargoType
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

  getCargoTypesByServiceType: async (serviceTypeId: number): Promise<CargoTypeCatalogItem[]> => {
    const params = new URLSearchParams({ serviceTypeId: serviceTypeId.toString() })
    const response = await apiClient.get<ApiResponse<CargoTypeCatalogItem[]>>(
      `${API_CONFIG.IMAGE_TYPES.ADMIN_CARGO_TYPES}?${params.toString()}`
    )
    const result = await response.json()
    return result.data || []
  },

  createCargoType: async (data: CargoTypeCatalogUpsertRequest): Promise<CargoTypeCatalogItem> => {
    const response = await apiClient.post<ApiResponse<CargoTypeCatalogItem>>(
      API_CONFIG.IMAGE_TYPES.ADMIN_CARGO_TYPES,
      data,
    )
    const result = await response.json()
    return result.data
  },

  updateCargoType: async (data: CargoTypeCatalogUpsertRequest): Promise<CargoTypeCatalogItem> => {
    const response = await apiClient.put<ApiResponse<CargoTypeCatalogItem>>(
      API_CONFIG.IMAGE_TYPES.ADMIN_CARGO_TYPES,
      data,
    )
    const result = await response.json()
    return result.data
  },

  deleteCargoType: async (serviceTypeId: number, code: string): Promise<void> => {
    const params = new URLSearchParams({ serviceTypeId: serviceTypeId.toString(), code })
    const response = await apiClient.delete(`${API_CONFIG.IMAGE_TYPES.ADMIN_CARGO_TYPES}?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Failed to delete cargo type')
    }
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

export type {
  CargoType,
  CargoTypeCatalogItem,
  CargoTypeCatalogUpsertRequest,
  ImageType,
  CreateImageTypeRequest,
  ImageCountDTO,
}
