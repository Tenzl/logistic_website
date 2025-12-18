export interface Category {
  id: number
  name: string
  description?: string
  createdAt: string
}

export interface CategoryRequest {
  name: string
  description?: string
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

export const categoryService = {
  // Get all categories (public)
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        // Return empty array if endpoint not available or unauthorized
        console.warn('Categories endpoint not available:', response.status)
        return []
      }

      const result: ApiResponse<Category[]> = await response.json()
      return result.data
    } catch (error) {
      console.warn('Failed to fetch categories, using empty list')
      return []
    }
  },

  // Admin: Get all categories (with fallback to public endpoint)
  getAdminCategories: async (): Promise<Category[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: getAuthHeaders(),
      })
      
      if (response.ok) {
        const result: ApiResponse<Category[]> = await response.json()
        return result.data
      }
      
      // Fallback to public endpoint if admin endpoint doesn't exist
      console.log('Admin categories endpoint not available, trying public endpoint')
      return await categoryService.getAllCategories()
    } catch (error) {
      // If network error, try public endpoint as fallback
      console.log('Error fetching admin categories, using fallback')
      return await categoryService.getAllCategories()
    }
  },

  // Admin: Create category
  createCategory: async (data: CategoryRequest): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create category')
    }

    const result: ApiResponse<Category> = await response.json()
    return result.data
  },

  // Admin: Update category
  updateCategory: async (id: number, data: CategoryRequest): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update category')
    }

    const result: ApiResponse<Category> = await response.json()
    return result.data
  },

  // Admin: Delete category
  deleteCategory: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete category')
    }
  },
}
