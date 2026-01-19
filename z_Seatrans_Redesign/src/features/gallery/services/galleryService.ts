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

interface GalleryImage {
  id: number
  fileName: string
  url: string
  provinceId: number
  provinceName: string
  portId: number
  portName: string
  serviceTypeId: number
  serviceTypeName: string
  imageTypeId: number
  imageTypeName: string
  uploadedBy?: number
  uploadedAt: string
}

interface UpdateImageRequest {
  provinceId?: number
  portId?: number
  serviceTypeId?: number
  imageTypeId?: number
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
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
  serviceTypeName: raw.serviceType.name,
  imageTypeId: raw.imageType.id,
  imageTypeName: raw.imageType.displayName,
  uploadedBy: raw.uploadedBy,
  uploadedAt: raw.uploadedAt,
})

export const galleryService = {
  // Get image types by service type
  getImageTypesByServiceType: async (serviceTypeId: number, signal?: AbortSignal): Promise<ImageType[]> => {
    const response = await fetch(`${API_BASE_URL}/image-types/service-type/${serviceTypeId}`, { signal })
    
    if (!response.ok) {
      throw new Error('Failed to fetch image types')
    }
    
    const result: ApiResponse<ImageType[]> = await response.json()
    return result.data
  },

  // Public endpoint - không cần auth
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

    // Public endpoint - no authentication required
    const response = await fetch(`${API_BASE_URL}/gallery/page-image?${params}`, { signal })
    
    if (!response.ok) {
      throw new Error('Failed to fetch images')
    }
    
    const result: ApiResponse<PageResponse<GalleryImageRaw>> = await response.json()
    
    // Transform and return content only
    return result.data.content.map(transformGalleryImage)
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

    const response = await fetch(`${API_BASE_URL}/admin/gallery-images?${params}`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch images')
    }
    
    const result: ApiResponse<PageResponse<GalleryImageRaw>> = await response.json()
    
    // Transform nested objects to flat structure
    return {
      ...result.data,
      content: result.data.content.map(transformGalleryImage)
    }
  },

  uploadImage: async (
    file: File,
    provinceId: number,
    portId: number,
    serviceTypeId: number,
    imageTypeId: number
  ): Promise<GalleryImage> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('province_id', provinceId.toString())
    formData.append('port_id', portId.toString())
    formData.append('service_type_id', serviceTypeId.toString())
    formData.append('image_type_id', imageTypeId.toString())

    const token = localStorage.getItem(TOKEN_KEY)
    const response = await fetch(`${API_BASE_URL}/admin/gallery-images`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload image')
    }
    
    const result: ApiResponse<GalleryImageRaw> = await response.json()
    return transformGalleryImage(result.data)
  },

  updateImage: async (id: number, data: UpdateImageRequest): Promise<GalleryImage> => {
    const response = await fetch(`${API_BASE_URL}/admin/gallery-images/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update image')
    }
    
    const result: ApiResponse<GalleryImageRaw> = await response.json()
    return transformGalleryImage(result.data)
  },

  deleteImage: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/admin/gallery-images/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete image')
    }
  },
}

export type { GalleryImage, UpdateImageRequest, PageResponse }
