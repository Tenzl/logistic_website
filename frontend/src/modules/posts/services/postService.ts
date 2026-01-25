import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse } from '@/shared/types/api.types'

export interface CategoryResponse {
  id: number
  name: string
  description?: string
  createdAt?: string
}

export interface Post {
  id: number
  title: string
  content: string
  summary?: string
  authorId: number
  authorName: string
  author?: { fullName?: string }
  categories: CategoryResponse[]
  tags?: string[]
  readingTime?: number
  thumbnailUrl?: string
  publishedAt?: string
  isPublished: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface PostRequest {
  title: string
  content: string
  categoryIds?: number[]
  thumbnailUrl?: string
  isPublished?: boolean
}

const mapPost = (raw: any): Post => {
  const words = typeof raw?.content === 'string' ? raw.content.split(/\s+/).length : 0
  const readingTime = raw?.readingTime ?? Math.max(1, Math.round(words / 200))
  return {
    ...raw,
    categories: Array.isArray(raw?.categories) ? raw.categories : [],
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    summary: raw?.summary ?? '',
    author: { fullName: raw?.authorFullName || raw?.authorName },
    readingTime,
  }
}

export const postService = {
  // Admin endpoints
  getAllPosts: async (): Promise<Post[]> => {
    const response = await apiClient.get<ApiResponse<Post[]>>(API_CONFIG.POSTS.ADMIN_BASE)
    const result = await response.json()
    return Array.isArray(result.data) ? result.data.map(mapPost) : []
  },

  getPostById: async (id: number): Promise<Post> => {
    const response = await apiClient.get<ApiResponse<Post>>(API_CONFIG.POSTS.ADMIN_BY_ID(id))
    const result = await response.json()
    return mapPost(result.data)
  },

  createPost: async (postData: PostRequest): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<Post>>(API_CONFIG.POSTS.ADMIN_BASE, postData)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create post')
    }

    const result: ApiResponse<Post> = await response.json()
    return mapPost(result.data)
  },

  updatePost: async (id: number, postData: PostRequest): Promise<Post> => {
    const response = await apiClient.put<ApiResponse<Post>>(API_CONFIG.POSTS.ADMIN_BY_ID(id), postData)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update post')
    }

    const result: ApiResponse<Post> = await response.json()
    return mapPost(result.data)
  },

  deletePost: async (id: number): Promise<void> => {
    const response = await apiClient.delete(API_CONFIG.POSTS.ADMIN_BY_ID(id))

    if (!response.ok) {
      throw new Error('Failed to delete post')
    }
  },

  publishPost: async (id: number): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<Post>>(API_CONFIG.POSTS.PUBLISH(id))

    if (!response.ok) {
      throw new Error('Failed to publish post')
    }

    const result: ApiResponse<Post> = await response.json()
    return mapPost(result.data)
  },

  unpublishPost: async (id: number): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<Post>>(API_CONFIG.POSTS.UNPUBLISH(id))

    if (!response.ok) {
      throw new Error('Failed to unpublish post')
    }

    const result: ApiResponse<Post> = await response.json()
    return mapPost(result.data)
  },

  getPublishedPosts: async (category?: string, search?: string): Promise<Post[]> => {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (search) params.append('search', search)

    const url = `${API_CONFIG.POSTS.PUBLIC_BASE}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiClient.get<ApiResponse<Post[]>>(url, { skipAuth: true })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch posts:', errorText)
      throw new Error(`Failed to fetch published posts: ${response.status} ${response.statusText}`)
    }

    const result: ApiResponse<Post[]> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Invalid response from server')
    }

    return Array.isArray(result.data) ? result.data.map(mapPost) : []
  },

  getPublicPostById: async (id: number): Promise<Post> => {
    const response = await apiClient.get<ApiResponse<Post>>(API_CONFIG.POSTS.PUBLIC_BY_ID(id), { skipAuth: true })

    if (!response.ok) {
      throw new Error('Failed to fetch post')
    }

    const result: ApiResponse<Post> = await response.json()
    return mapPost(result.data)
  },

  // alias for clarity with ArticleDetailPage
  getById: async (id: number): Promise<Post> => {
    return postService.getPublicPostById(id)
  },

  getLatestPosts: async (limit: number = 5): Promise<Post[]> => {
    const response = await apiClient.get<ApiResponse<Post[]>>(
      `${API_CONFIG.POSTS.LATEST}?limit=${limit}`,
      { skipAuth: true }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch latest posts')
    }

    const result: ApiResponse<Post[]> = await response.json()
    return Array.isArray(result.data) ? result.data.map(mapPost) : []
  },

  uploadImage: async (file: File, postId?: number): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    if (postId) {
      formData.append('postId', postId.toString())
    }

    const response = await apiClient.post<ApiResponse<string>>(
      API_CONFIG.POSTS.UPLOAD_IMAGE,
      formData
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload image')
    }

    const result: ApiResponse<string> = await response.json()
    return `${API_CONFIG.ASSET_BASE_URL}${result.data}`
  },
}
