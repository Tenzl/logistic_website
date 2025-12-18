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

export const imageTypeService = {
  getAllImageTypes: async (): Promise<ImageType[]> => {
    const response = await fetch(`${API_BASE_URL}/image-types`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch image types')
    }
    
    const result: ApiResponse<ImageType[]> = await response.json()
    return result.data
  },

  getImageTypesByServiceType: async (serviceTypeId: number): Promise<ImageType[]> => {
    const response = await fetch(`${API_BASE_URL}/image-types/service-type/${serviceTypeId}`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch image types')
    }
    
    const result: ApiResponse<ImageType[]> = await response.json()
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
    
    const url = `${API_BASE_URL}/image-types/${imageTypeId}/image-count${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch image count')
    }
    
    const result: ApiResponse<ImageCountDTO> = await response.json()
    return result.data
  },

  createImageType: async (data: CreateImageTypeRequest): Promise<ImageType> => {
    const response = await fetch(`${API_BASE_URL}/image-types`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create image type')
    }
    
    const result: ApiResponse<ImageType> = await response.json()
    return result.data
  },

  updateImageType: async (id: number, data: CreateImageTypeRequest): Promise<ImageType> => {
    const response = await fetch(`${API_BASE_URL}/image-types/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update image type')
    }
    
    const result: ApiResponse<ImageType> = await response.json()
    return result.data
  },

  deleteImageType: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/image-types/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete image type')
    }
  },
}

export type { ImageType, CreateImageTypeRequest, ImageCountDTO }
