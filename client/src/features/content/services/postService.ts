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

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const API_BASE_URL = 'http://localhost:8080/api'
const TOKEN_KEY = 'auth_token'

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

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const postService = {
  // Admin endpoints
  getAllPosts: async (): Promise<Post[]> => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw new Error('Not authenticated. Please log in.')
    }

    const response = await fetch(`${API_BASE_URL}/admin/posts`, {
      headers: getAuthHeaders(),
    })
    
    if (response.status === 401) {
      throw new Error('Session expired. Please log in again.')
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    
    const result: ApiResponse<Post[]> = await response.json()
    return Array.isArray(result.data) ? result.data.map(mapPost) : []
  },

  getPostById: async (id: number): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch post')
    }
    
    const result: ApiResponse<Post> = await response.json()
    return mapPost(result.data)
  },

  createPost: async (postData: PostRequest): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/admin/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create post')
    }
    
    const result: ApiResponse<Post> = await response.json()
    return mapPost(result.data)
  },

  updatePost: async (id: number, postData: PostRequest): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update post')
    }
    
    const result: ApiResponse<Post> = await response.json()
    return mapPost(result.data)
  },

  deletePost: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete post')
    }
  },

  publishPost: async (id: number): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}/publish`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to publish post')
    }
    
    const result: ApiResponse<Post> = await response.json()
    return mapPost(result.data)
  },

  unpublishPost: async (id: number): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}/unpublish`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    
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
    
    const url = `${API_BASE_URL}/posts${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
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
    const response = await fetch(`${API_BASE_URL}/posts/${id}`)
    
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
    const response = await fetch(`${API_BASE_URL}/posts/latest?limit=${limit}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch latest posts')
    }
    
    const result: ApiResponse<Post[]> = await response.json()
    return Array.isArray(result.data) ? result.data.map(mapPost) : []
  },

  uploadImage: async (file: File, postId?: number): Promise<string> => {
    const token = localStorage.getItem(TOKEN_KEY)
    const formData = new FormData()
    formData.append('file', file)
    if (postId) {
      formData.append('postId', postId.toString())
    }

    const response = await fetch(`${API_BASE_URL}/admin/posts/upload-image`, {
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

    const result = await response.json()
    const serverUrl = API_BASE_URL.replace('/api', '')
    return `${serverUrl}${result.data}`
  },
}
