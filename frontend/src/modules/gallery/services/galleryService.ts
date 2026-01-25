import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse, PageResponse } from '@/shared/types/api.types'

interface Province {
  id: number
  name: string
}

interface Port {
  id: number
  name: string
}

interface ServiceType {
  id: number
  name: string
  displayName?: string
}

interface ImageType {
  id: number
  displayName: string
  requiredImageCount: number
}

interface GalleryImageRaw {
  id: number
  imageUrl: string
  province: Province
  port: Port
  serviceType: ServiceType
  imageType: ImageType
  uploadedBy?: number
  uploadedAt: string
}

interface PublicGalleryImageRaw {
  id: number
  imageUrl: string
  portName: string
  provinceName: string
  imageTypeName: string
  serviceTypeId: number
  serviceTypeKey?: string
  serviceTypeDisplayName?: string
  serviceTypeName?: string
}

interface GalleryImage {
  id: number
  fileName: string
  url: string
  provinceId?: number
  provinceName: string
  portId?: number
  portName: string
  serviceTypeId?: number
  serviceTypeName: string
  imageTypeId?: number
  imageTypeName: string
  uploadedBy?: number
  uploadedAt?: string
}

interface UpdateImageRequest {
  provinceId?: number
  portId?: number
  serviceTypeId?: number
  imageTypeId?: number
}

// Transform raw backend response to flat structure
const transformGalleryImage = (raw: GalleryImageRaw): GalleryImage => ({
  id: raw.id,
  fileName: raw.imageUrl.split('/').pop() || '',
  url: raw.imageUrl,
  provinceId: raw.province.id,
  provinceName: raw.province.name,
  portId: raw.port.id,
  portName: raw.port.name,
  serviceTypeId: raw.serviceType.id,
  serviceTypeName: raw.serviceType.displayName || raw.serviceType.name,
  imageTypeId: raw.imageType.id,
  imageTypeName: raw.imageType.displayName,
  uploadedBy: raw.uploadedBy,
  uploadedAt: raw.uploadedAt,
})

const transformPublicGalleryImage = (raw: PublicGalleryImageRaw): GalleryImage => ({
  id: raw.id,
  fileName: raw.imageUrl.split('/').pop() || '',
  url: raw.imageUrl,
  provinceName: raw.provinceName,
  portName: raw.portName,
  serviceTypeId: raw.serviceTypeId,
  serviceTypeName: raw.serviceTypeDisplayName || raw.serviceTypeName || raw.serviceTypeKey || '',
  imageTypeName: raw.imageTypeName,
})

export const galleryService = {
  // Get image types by service type
  getImageTypesByServiceType: async (serviceTypeId: number, signal?: AbortSignal): Promise<ImageType[]> => {
    const response = await apiClient.get<ApiResponse<ImageType[]>>(
      API_CONFIG.IMAGE_TYPES.BY_SERVICE_TYPE(serviceTypeId),
      { signal }
    )

    const result = await response.json()
    return result.data
  },

  // Public endpoint - no authentication required
  getPublicImages: async (
    serviceTypeId?: number,
    imageTypeId?: number,
    page: number = 0,
    size: number = 100,
    signal?: AbortSignal
  ): Promise<GalleryImage[]> => {
    const params = new URLSearchParams()
    if (serviceTypeId) params.append('serviceTypeId', serviceTypeId.toString())
    if (imageTypeId) params.append('imageTypeId', imageTypeId.toString())
    params.append('page', page.toString())
    params.append('size', size.toString())

    const response = await apiClient.get<ApiResponse<PageResponse<PublicGalleryImageRaw>>>(
      `${API_CONFIG.GALLERY.PUBLIC_IMAGES}?${params.toString()}`,
      { signal, skipAuth: true }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to load gallery images', response.status, errorText)
      throw new Error(`Failed to load gallery images: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    const content = result?.data?.content

    if (!Array.isArray(content)) {
      console.error('Invalid gallery images response', result)
      return []
    }

    return content.map(transformPublicGalleryImage)
  },

  // Admin endpoint - requires auth
  getAllImages: async (
    provinceId?: number,
    portId?: number,
    serviceTypeId?: number,
    imageTypeId?: number,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<GalleryImage>> => {
    const params = new URLSearchParams()
    if (provinceId) params.append('provinceId', provinceId.toString())
    if (portId) params.append('portId', portId.toString())
    if (serviceTypeId) params.append('serviceTypeId', serviceTypeId.toString())
    if (imageTypeId) params.append('imageTypeId', imageTypeId.toString())
    params.append('page', page.toString())
    params.append('size', size.toString())

    const response = await apiClient.get<ApiResponse<PageResponse<GalleryImageRaw>>>(
      `${API_CONFIG.GALLERY.ADMIN_IMAGES}?${params.toString()}`
    )

    const result = await response.json()

    return {
      ...result.data,
      content: result.data.content.map(transformGalleryImage),
    }
  },

  uploadImage: async (
    file: File,
    provinceId: number,
    portId: number,
    serviceTypeId: number,
    imageTypeId: number
  ): Promise<GalleryImage> => {
    // Upload via backend CloudinaryService endpoint
    const formData = new FormData()
    formData.append('file', file)
    formData.append('province_id', provinceId.toString())
    formData.append('port_id', portId.toString())
    formData.append('service_type_id', serviceTypeId.toString())
    formData.append('image_type_id', imageTypeId.toString())

    const response = await apiClient.post<ApiResponse<GalleryImageRaw>>(
      `${API_CONFIG.GALLERY.ADMIN_IMAGES}`,
      formData
    )

    const result = await response.json()
    return transformGalleryImage(result.data)
  },

  updateImage: async (id: number, data: UpdateImageRequest): Promise<GalleryImage> => {
    const response = await apiClient.put<ApiResponse<GalleryImageRaw>>(
      API_CONFIG.GALLERY.ADMIN_BY_ID(id),
      data
    )

    const result = await response.json()
    return transformGalleryImage(result.data)
  },

  deleteImage: async (id: number): Promise<void> => {
    const response = await apiClient.delete(API_CONFIG.GALLERY.ADMIN_BY_ID(id))

    if (!response.ok) {
      throw new Error('Failed to delete image')
    }
  },
}

export type { GalleryImage, UpdateImageRequest, PageResponse }
