# Frontend API Standardization Guide
**Enterprise-Grade API Architecture for Seatrans Application**

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Backend API Reference](#backend-api-reference)
4. [Standardization Architecture](#standardization-architecture)
5. [Implementation Steps](#implementation-steps)
6. [Migration Checklist](#migration-checklist)

---

## 🎯 Overview

### Purpose
Standardize frontend API calls to align with the refactored backend v1 API structure, eliminating hardcoded URLs and creating a maintainable, type-safe API layer.

### Goals
- ✅ Single source of truth for API endpoints
- ✅ Type-safe API calls with TypeScript
- ✅ Centralized error handling and authentication
- ✅ Easy environment switching (dev/staging/prod)
- ✅ Consistent request/response patterns
- ✅ Improved maintainability and testability

### Scope
**This guide covers:**
- Mapping existing frontend API calls to backend v1 endpoints
- Creating centralized API configuration
- Building reusable service layer
- Refactoring existing code without adding/removing features

**This guide does NOT:**
- Add new API endpoints
- Remove existing functionality
- Change business logic

---

## 📊 Current State Analysis

### Problems Identified

#### 1. **Scattered API URLs (54+ instances)**
```typescript
// ❌ BEFORE: Hardcoded in multiple files
const API_BASE_URL = 'http://localhost:8080/api'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080' // ❌ Fallback still hardcoded
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'      // ❌ Fallback still hardcoded

// ✅ AFTER: Environment variable required, fail fast if missing
if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL must be defined')
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
```

**Files with hardcoded URLs:**
- `src/features/gallery/services/galleryService.ts`
- `src/features/content/services/postService.ts`
- `src/features/logistics/services/provinceService.ts`
- `src/features/admin/components/ManagePorts.tsx`
- ... and 50+ more files

#### 2. **Inconsistent Environment Variables**
```env
# Multiple variations found in codebase:
NEXT_PUBLIC_API_BASE_URL    # Sometimes used
NEXT_PUBLIC_API_URL          # Other times used
# No standardization
```

#### 3. **Missing `/v1` Versioning**
```typescript
// ❌ OLD: No version
fetch('http://localhost:8080/api/provinces')

// ✅ NEW: Should be
fetch('http://localhost:8080/api/v1/provinces')
```

#### 4. **Duplicate Code**
Same API logic repeated across:
- Components (inline fetch)
- Services (separate implementations)
- Hooks (custom data fetching)

---

## 🔌 Backend API Reference

### Complete Endpoint Mapping

#### **Authentication & User Management**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Login | POST | `/api/v1/auth/login` | User login |
| Register Customer | POST | `/api/v1/auth/register/customer` | Customer registration |
| Google OAuth | GET | `/api/v1/auth/oauth2/google` | Google OAuth redirect |
| Current User | GET | `/api/v1/auth/current-user` | Get authenticated user |
| Change Password | POST | `/api/v1/auth/change-password` | Update password |
| Admin Users | GET | `/api/v1/admin/users` | List all users (admin) |

#### **Provinces**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Get All | GET | `/api/v1/provinces` | All provinces |
| Get Active | GET | `/api/v1/provinces/active` | Active provinces only |
| Search | GET | `/api/v1/provinces/search?query={q}` | Search by name |
| Get by ID | GET | `/api/v1/provinces/{id}` | Single province |
| Create | POST | `/api/v1/provinces` | Create province (admin) |
| Update | PUT | `/api/v1/provinces/{id}` | Update province (admin) |
| Delete | DELETE | `/api/v1/provinces/{id}` | Delete province (admin) |

#### **Ports**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Get All | GET | `/api/v1/ports` | All ports |
| Get Active | GET | `/api/v1/ports/active` | Active ports only |
| By Province | GET | `/api/v1/ports/province/{provinceId}` | Ports in province |
| Search | GET | `/api/v1/ports/search?query={q}` | Search ports |
| Search by Province | GET | `/api/v1/ports/province/{provinceId}/search?query={q}` | Search in province |
| Get by ID | GET | `/api/v1/ports/{id}` | Single port |
| Create | POST | `/api/v1/ports` | Create port (admin) |
| Update | PUT | `/api/v1/ports/{id}` | Update port (admin) |
| Delete | DELETE | `/api/v1/ports/{id}` | Delete port (admin) |

#### **Offices**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Get Active | GET | `/api/v1/offices/active` | Active offices |
| Create | POST | `/api/v1/admin/offices` | Create office (admin) |
| Update | PUT | `/api/v1/admin/offices/{id}` | Update office (admin) |
| Delete | DELETE | `/api/v1/admin/offices/{id}` | Delete office (admin) |

#### **Service Types**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Get All | GET | `/api/v1/service-types` | All service types |
| Get Active | GET | `/api/v1/service-types/active` | Active service types |
| Get by ID | GET | `/api/v1/service-types/{id}` | Single service type |
| Create | POST | `/api/v1/admin/service-types` | Create (admin) |
| Update | PUT | `/api/v1/admin/service-types/{id}` | Update (admin) |
| Delete | DELETE | `/api/v1/admin/service-types/{id}` | Delete (admin) |

#### **Image Types**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Get All | GET | `/api/v1/image-types` | All image types |
| By Service | GET | `/api/v1/image-types/service-type/{id}` | By service type |
| Public Get | GET | `/api/v1/image-types/public/service-type/{id}` | Public by service |
| Create | POST | `/api/v1/admin/image-types` | Create (admin) |
| Update | PUT | `/api/v1/admin/image-types/{id}` | Update (admin) |
| Delete | DELETE | `/api/v1/admin/image-types/{id}` | Delete (admin) |

#### **Gallery Images**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Public Gallery | GET | `/api/v1/gallery/page-image?serviceTypeId={id}&imageTypeId={id}&page={n}&size={n}` | Public images |
| Admin Get All | GET | `/api/v1/admin/gallery-images?provinceId={id}&portId={id}&serviceTypeId={id}&imageTypeId={id}` | Admin view |
| Upload | POST | `/api/v1/admin/gallery-images` | Upload image (admin) |
| Update | PUT | `/api/v1/admin/gallery-images/{id}` | Update image (admin) |
| Delete | DELETE | `/api/v1/admin/gallery-images/{id}` | Delete image (admin) |

#### **Posts & Content**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Latest Posts | GET | `/api/v1/posts/latest?limit={n}` | Latest published posts |
| Get All Public | GET | `/api/v1/posts?category={slug}&search={q}` | Public posts with filters |
| Get by ID | GET | `/api/v1/posts/{id}` | Single post (increments view) |
| Admin Get All | GET | `/api/v1/admin/posts` | All posts (admin) |
| Admin Get by ID | GET | `/api/v1/admin/posts/{id}` | Single post (admin) |
| Create | POST | `/api/v1/admin/posts` | Create post (admin) |
| Update | PUT | `/api/v1/admin/posts/{id}` | Update post (admin) |
| Delete | DELETE | `/api/v1/admin/posts/{id}` | Delete post (admin) |
| Publish | POST | `/api/v1/admin/posts/{id}/publish` | Publish post (admin) |
| Unpublish | POST | `/api/v1/admin/posts/{id}/unpublish` | Unpublish post (admin) |
| Upload Image | POST | `/api/v1/admin/posts/upload-image` | Upload content image |

#### **Categories**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Get All Public | GET | `/api/v1/categories` | Public categories |
| Get All Admin | GET | `/api/v1/admin/categories` | Admin categories |
| Get by ID | GET | `/api/v1/admin/categories/{id}` | Single category (admin) |
| Create | POST | `/api/v1/admin/categories` | Create (admin) |
| Update | PUT | `/api/v1/admin/categories/{id}` | Update (admin) |
| Delete | DELETE | `/api/v1/admin/categories/{id}` | Delete (admin) |

#### **Inquiries**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Submit | POST | `/api/v1/inquiries` | Submit inquiry (authenticated) |
| User History | GET | `/api/v1/inquiries/user/{userId}?page={n}&size={n}` | User's inquiries |
| Admin Get All | GET | `/api/v1/admin/inquiries` | All inquiries (admin) |
| Get by ID | GET | `/api/v1/admin/inquiries/{id}` | Single inquiry (admin) |
| Update Status | PATCH | `/api/v1/admin/inquiries/{id}/status` | Update inquiry status |

#### **Inquiry Documents**
| Feature | Method | Backend Endpoint | Description |
|---------|--------|------------------|-------------|
| Upload | POST | `/api/v1/inquiry-documents/upload` | Upload document |
| Get by Inquiry | GET | `/api/v1/inquiry-documents/inquiry/{inquiryId}` | Get inquiry documents |
| List All | GET | `/api/v1/inquiry-documents/{serviceSlug}/{targetId}` | List documents |
| Download | GET | `/api/v1/inquiry-documents/download/{id}` | Download document |
| Delete | DELETE | `/api/v1/inquiry-documents/{id}` | Delete document |

---

## 🏗️ Standardization Architecture

### Directory Structure

```
z_Seatrans_Redesign/
├── .env.local                          # Environment variables (DO NOT COMMIT)
├── .env.production                     # Production config
├── src/
│   ├── shared/
│   │   ├── config/
│   │   │   └── api.config.ts          # ✨ NEW: Centralized API configuration
│   │   ├── services/
│   │   │   ├── apiClient.ts           # ✨ ENHANCED: Base HTTP client
│   │   │   └── baseService.ts         # ✨ NEW: Base service class
│   │   └── types/
│   │       └── api.types.ts           # ✨ NEW: Shared API types
│   ├── features/
│   │   ├── auth/
│   │   │   └── services/
│   │   │       └── authService.ts     # 🔄 REFACTOR: Use API config
│   │   ├── logistics/
│   │   │   └── services/
│   │   │       ├── provinceService.ts # 🔄 REFACTOR
│   │   │       └── portService.ts     # 🔄 REFACTOR
│   │   ├── gallery/
│   │   │   └── services/
│   │   │       ├── galleryService.ts  # 🔄 REFACTOR
│   │   │       └── imageTypeService.ts# 🔄 REFACTOR
│   │   ├── content/
│   │   │   └── services/
│   │   │       ├── postService.ts     # 🔄 REFACTOR
│   │   │       └── categoryService.ts # 🔄 REFACTOR
│   │   ├── inquiries/
│   │   │   └── services/
│   │   │       ├── inquiryService.ts  # 🔄 REFACTOR
│   │   │       └── documentService.ts # 🔄 REFACTOR
│   │   └── services-config/
│   │       └── services/
│   │           └── serviceTypeService.ts # 🔄 REFACTOR
```

### Layer Architecture

```
┌─────────────────────────────────────────────┐
│         React Components / Pages            │
│  (Use services, no direct API calls)        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Feature Services Layer             │
│  (authService, provinceService, etc.)       │
│  - Business logic                           │
│  - Data transformation                      │
│  - Cache management                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Base Service / API Client           │
│  - HTTP methods (GET, POST, PUT, DELETE)    │
│  - Authentication injection                 │
│  - Error handling                           │
│  - Response parsing                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            API Configuration                │
│  - Endpoint definitions                     │
│  - Base URL from environment                │
│  - Route constants                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Backend REST API (v1)              │
│  http://localhost:8080/api/v1/*             │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Steps

### Step 1: Environment Configuration

#### **File: `.env.local`**
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Optional: For development debugging
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_ENABLE_API_LOGS=true
```

#### **File: `.env.production`**
```env
# Production API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.seatrans.com/api/v1
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_ENABLE_API_LOGS=false
```

---

### Step 2: Centralized API Configuration

#### **File: `src/shared/config/api.config.ts`**

```typescript
/**
 * Centralized API Configuration
 * Single source of truth for all API endpoints
 */

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL is not defined. Please add it to your .env.local file.'
  )
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const API_CONFIG = {
  BASE_URL,
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  ENABLE_LOGS: process.env.NEXT_PUBLIC_ENABLE_API_LOGS === 'true',

  // ==================== AUTHENTICATION ====================
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER_CUSTOMER: '/auth/register/customer',
    GOOGLE_OAUTH: '/auth/oauth2/google',
    GOOGLE_CALLBACK: '/auth/oauth2/callback',
    CURRENT_USER: '/auth/current-user',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH_TOKEN: '/auth/refresh-token',
  },

  // ==================== USER MANAGEMENT ====================
  USERS: {
    BASE: '/users',
    ADMIN_LIST: '/admin/users',
    BY_ID: (id: number) => `/users/${id}`,
    ADMIN_BY_ID: (id: number) => `/admin/users/${id}`,
  },

  // ==================== PROVINCES ====================
  PROVINCES: {
    BASE: '/provinces',
    ACTIVE: '/provinces/active',
    SEARCH: '/provinces/search',
    BY_ID: (id: number) => `/provinces/${id}`,
  },

  // ==================== PORTS ====================
  PORTS: {
    BASE: '/ports',
    ACTIVE: '/ports/active',
    BY_PROVINCE: (provinceId: number) => `/ports/province/${provinceId}`,
    SEARCH: '/ports/search',
    SEARCH_BY_PROVINCE: (provinceId: number) => `/ports/province/${provinceId}/search`,
    BY_ID: (id: number) => `/ports/${id}`,
  },

  // ==================== OFFICES ====================
  OFFICES: {
    ACTIVE: '/offices/active',
    ADMIN_BASE: '/admin/offices',
    ADMIN_BY_ID: (id: number) => `/admin/offices/${id}`,
  },

  // ==================== SERVICE TYPES ====================
  SERVICE_TYPES: {
    BASE: '/service-types',
    ACTIVE: '/service-types/active',
    BY_ID: (id: number) => `/service-types/${id}`,
    ADMIN_BASE: '/admin/service-types',
    ADMIN_BY_ID: (id: number) => `/admin/service-types/${id}`,
  },

  // ==================== IMAGE TYPES ====================
  IMAGE_TYPES: {
    BASE: '/image-types',
    BY_SERVICE_TYPE: (serviceTypeId: number) => `/image-types/service-type/${serviceTypeId}`,
    PUBLIC_BY_SERVICE: (serviceTypeId: number) => `/image-types/public/service-type/${serviceTypeId}`,
    ADMIN_BASE: '/admin/image-types',
    ADMIN_BY_ID: (id: number) => `/admin/image-types/${id}`,
  },

  // ==================== GALLERY IMAGES ====================
  GALLERY: {
    PUBLIC_IMAGES: '/gallery/page-image',
    ADMIN_IMAGES: '/admin/gallery-images',
    ADMIN_BY_ID: (id: number) => `/admin/gallery-images/${id}`,
  },

  // ==================== POSTS ====================
  POSTS: {
    LATEST: '/posts/latest',
    PUBLIC_BASE: '/posts',
    PUBLIC_BY_ID: (id: number) => `/posts/${id}`,
    ADMIN_BASE: '/admin/posts',
    ADMIN_BY_ID: (id: number) => `/admin/posts/${id}`,
    PUBLISH: (id: number) => `/admin/posts/${id}/publish`,
    UNPUBLISH: (id: number) => `/admin/posts/${id}/unpublish`,
    UPLOAD_IMAGE: '/admin/posts/upload-image',
  },

  // ==================== CATEGORIES ====================
  CATEGORIES: {
    PUBLIC_BASE: '/categories',
    ADMIN_BASE: '/admin/categories',
    ADMIN_BY_ID: (id: number) => `/admin/categories/${id}`,
  },

  // ==================== INQUIRIES ====================
  INQUIRIES: {
    SUBMIT: '/inquiries',
    USER_HISTORY: (userId: number) => `/inquiries/user/${userId}`,
    ADMIN_BASE: '/admin/inquiries',
    ADMIN_BY_ID: (id: number) => `/admin/inquiries/${id}`,
    UPDATE_STATUS: (id: number) => `/admin/inquiries/${id}/status`,
  },

  // ==================== INQUIRY DOCUMENTS ====================
  DOCUMENTS: {
    UPLOAD: '/inquiry-documents/upload',
    BY_INQUIRY: (inquiryId: number) => `/inquiry-documents/inquiry/${inquiryId}`,
    LIST: (serviceSlug: string, targetId: number) => `/inquiry-documents/${serviceSlug}/${targetId}`,
    DOWNLOAD: (id: number) => `/inquiry-documents/download/${id}`,
    DELETE: (id: number) => `/inquiry-documents/${id}`,
  },

  // ==================== SPREADSHEET FILES ====================
  SPREADSHEET_FILES: {
    ALL: '/spreadsheet-files/all',
    BY_SERVICE: (serviceName: string) => `/spreadsheet-files/service/${serviceName}`,
    UPLOAD: '/spreadsheet-files/upload',
    DELETE: (fileId: number) => `/spreadsheet-files/${fileId}`,
    DOWNLOAD: (fileId: number) => `/spreadsheet-files/download/${fileId}`,
  },
} as const

// Type exports for autocomplete
export type ApiConfig = typeof API_CONFIG
```

---

### Step 3: Enhanced Base API Client

#### **File: `src/shared/services/apiClient.ts`**

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG } from '@/shared/config/api.config'

/**
 * Enhanced Axios-based API Client
 * - Automatic authentication token injection
 * - Error handling and logging
 * - Request/response interceptors
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        if (API_CONFIG.ENABLE_LOGS) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
        }

        return config
      },
      (error) => {
        console.error('[API Request Error]', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => {
        if (API_CONFIG.ENABLE_LOGS) {
          console.log(`[API Response] ${response.config.url}`, response.data)
        }
        return response
      },
      (error) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response

          if (status === 401) {
            // Unauthorized - clear auth and redirect to login
            this.clearAuth()
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
          }

          console.error(`[API Error ${status}]`, data)
        } else if (error.request) {
          // Request made but no response
          console.error('[API No Response]', error.request)
        } else {
          // Other errors
          console.error('[API Error]', error.message)
        }

        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // ==================== HTTP METHODS ====================

  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(endpoint, config)
  }

  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(endpoint, data, config)
  }

  async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(endpoint, data, config)
  }

  async patch<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(endpoint, data, config)
  }

  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(endpoint, config)
  }

  // ==================== FILE UPLOAD ====================

  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return this.client.post<T>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient
```

---

### Step 4: Feature Service Examples

#### **Example 1: Province Service**

**File: `src/features/logistics/services/provinceService.ts`**

```typescript
import { apiClient } from '@/shared/services/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse, ProvinceDTO } from '@/shared/types/api.types'

export const provinceService = {
  /**
   * Get all provinces
   */
  async getAll(): Promise<ProvinceDTO[]> {
    const response = await apiClient.get<ApiResponse<ProvinceDTO[]>>(API_CONFIG.PROVINCES.BASE)
    return response.data.data
  },

  /**
   * Get active provinces only
   */
  async getActive(): Promise<ProvinceDTO[]> {
    const response = await apiClient.get<ApiResponse<ProvinceDTO[]>>(API_CONFIG.PROVINCES.ACTIVE)
    return response.data.data
  },

  /**
   * Search provinces by name
   */
  async search(query: string): Promise<ProvinceDTO[]> {
    const response = await apiClient.get<ApiResponse<ProvinceDTO[]>>(
      API_CONFIG.PROVINCES.SEARCH,
      { params: { query } }
    )
    return response.data.data
  },

  /**
   * Get province by ID
   */
  async getById(id: number): Promise<ProvinceDTO> {
    const response = await apiClient.get<ApiResponse<ProvinceDTO>>(
      API_CONFIG.PROVINCES.BY_ID(id)
    )
    return response.data.data
  },
}
```

#### **Example 2: Port Service**

**File: `src/features/logistics/services/portService.ts`**

```typescript
import { apiClient } from '@/shared/services/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse, PortDTO } from '@/shared/types/api.types'

export const portService = {
  async getAll(): Promise<PortDTO[]> {
    const response = await apiClient.get<ApiResponse<PortDTO[]>>(API_CONFIG.PORTS.BASE)
    return response.data.data
  },

  async getActive(): Promise<PortDTO[]> {
    const response = await apiClient.get<ApiResponse<PortDTO[]>>(API_CONFIG.PORTS.ACTIVE)
    return response.data.data
  },

  async getByProvince(provinceId: number): Promise<PortDTO[]> {
    const response = await apiClient.get<ApiResponse<PortDTO[]>>(
      API_CONFIG.PORTS.BY_PROVINCE(provinceId)
    )
    return response.data.data
  },

  async search(query: string): Promise<PortDTO[]> {
    const response = await apiClient.get<ApiResponse<PortDTO[]>>(
      API_CONFIG.PORTS.SEARCH,
      { params: { query } }
    )
    return response.data.data
  },

  async searchByProvince(provinceId: number, query: string): Promise<PortDTO[]> {
    const response = await apiClient.get<ApiResponse<PortDTO[]>>(
      API_CONFIG.PORTS.SEARCH_BY_PROVINCE(provinceId),
      { params: { query } }
    )
    return response.data.data
  },
}
```

#### **Example 3: Gallery Service**

**File: `src/features/gallery/services/galleryService.ts`**

```typescript
import { apiClient } from '@/shared/services/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse, GalleryImageDTO, PageResponse } from '@/shared/types/api.types'

export const galleryService = {
  /**
   * Get paginated gallery images (public)
   */
  async getPublicImages(params: {
    serviceTypeId?: number
    imageTypeId?: number
    portId?: number
    provinceId?: number
    page?: number
    size?: number
  }): Promise<PageResponse<GalleryImageDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<GalleryImageDTO>>>(
      API_CONFIG.GALLERY.PUBLIC_IMAGES,
      { params }
    )
    return response.data.data
  },

  /**
   * Get all images for admin
   */
  async getAdminImages(params: {
    provinceId?: number
    portId?: number
    serviceTypeId?: number
    imageTypeId?: number
  }): Promise<GalleryImageDTO[]> {
    const response = await apiClient.get<ApiResponse<GalleryImageDTO[]>>(
      API_CONFIG.GALLERY.ADMIN_IMAGES,
      { params }
    )
    return response.data.data
  },

  /**
   * Upload new gallery image (admin)
   */
  async uploadImage(
    file: File,
    data: {
      provinceId: number
      portId: number
      serviceTypeId: number
      imageTypeId: number
    }
  ): Promise<GalleryImageDTO> {
    const response = await apiClient.uploadFile<ApiResponse<GalleryImageDTO>>(
      API_CONFIG.GALLERY.ADMIN_IMAGES,
      file,
      data
    )
    return response.data.data
  },

  /**
   * Delete gallery image (admin)
   */
  async deleteImage(id: number): Promise<void> {
    await apiClient.delete(API_CONFIG.GALLERY.ADMIN_BY_ID(id))
  },
}
```

#### **Example 4: Post Service**

**File: `src/features/content/services/postService.ts`**

```typescript
import { apiClient } from '@/shared/services/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse, PostDTO, CreatePostRequest } from '@/shared/types/api.types'

export const postService = {
  async getLatest(limit: number = 12): Promise<PostDTO[]> {
    const response = await apiClient.get<ApiResponse<PostDTO[]>>(
      API_CONFIG.POSTS.LATEST,
      { params: { limit } }
    )
    return response.data.data
  },

  async getPublicPosts(filters?: { category?: string; search?: string }): Promise<PostDTO[]> {
    const response = await apiClient.get<ApiResponse<PostDTO[]>>(
      API_CONFIG.POSTS.PUBLIC_BASE,
      { params: filters }
    )
    return response.data.data
  },

  async getById(id: number): Promise<PostDTO> {
    const response = await apiClient.get<ApiResponse<PostDTO>>(
      API_CONFIG.POSTS.PUBLIC_BY_ID(id)
    )
    return response.data.data
  },

  async createPost(data: CreatePostRequest): Promise<PostDTO> {
    const response = await apiClient.post<ApiResponse<PostDTO>>(
      API_CONFIG.POSTS.ADMIN_BASE,
      data
    )
    return response.data.data
  },

  async updatePost(id: number, data: CreatePostRequest): Promise<PostDTO> {
    const response = await apiClient.put<ApiResponse<PostDTO>>(
      API_CONFIG.POSTS.ADMIN_BY_ID(id),
      data
    )
    return response.data.data
  },

  async deletePost(id: number): Promise<void> {
    await apiClient.delete(API_CONFIG.POSTS.ADMIN_BY_ID(id))
  },

  async publishPost(id: number): Promise<PostDTO> {
    const response = await apiClient.post<ApiResponse<PostDTO>>(
      API_CONFIG.POSTS.PUBLISH(id)
    )
    return response.data.data
  },

  async unpublishPost(id: number): Promise<PostDTO> {
    const response = await apiClient.post<ApiResponse<PostDTO>>(
      API_CONFIG.POSTS.UNPUBLISH(id)
    )
    return response.data.data
  },

  async uploadImage(file: File, postId?: number): Promise<string> {
    const response = await apiClient.uploadFile<ApiResponse<string>>(
      API_CONFIG.POSTS.UPLOAD_IMAGE,
      file,
      postId ? { postId } : undefined
    )
    return response.data.data
  },
}
```

---

### Step 5: Component Usage Examples

#### **Before (❌ Old Way)**
```typescript
// ❌ OLD: Hardcoded URL, inline fetch
const ManagePorts = () => {
  const [provinces, setProvinces] = useState([])

  useEffect(() => {
    const loadProvinces = async () => {
      const response = await fetch('http://localhost:8080/api/provinces', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setProvinces(data.data)
    }
    loadProvinces()
  }, [])

  // ...
}
```

#### **After (✅ New Way)**
```typescript
// ✅ NEW: Use service, clean and type-safe
import { provinceService } from '@/features/logistics/services/provinceService'

const ManagePorts = () => {
  const [provinces, setProvinces] = useState<ProvinceDTO[]>([])

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await provinceService.getActive()
        setProvinces(data)
      } catch (error) {
        console.error('Failed to load provinces:', error)
        toast.error('Unable to load provinces')
      }
    }
    loadProvinces()
  }, [])

  // ...
}
```

---

## ✅ Migration Checklist

### Phase 1: Foundation Setup
- [ ] Create `.env.local` with `NEXT_PUBLIC_API_BASE_URL`
- [ ] Create `src/shared/config/api.config.ts`
- [ ] Enhance `src/shared/services/apiClient.ts`
- [ ] Create `src/shared/types/api.types.ts` (TypeScript definitions)

### Phase 2: Service Layer Refactoring
#### Authentication & Users
- [ ] Refactor `src/features/auth/services/authService.ts`
- [ ] Update login components to use new service
- [ ] Update registration components

#### Logistics
- [ ] Refactor `src/features/logistics/services/provinceService.ts`
- [ ] Refactor `src/features/logistics/services/portService.ts`
- [ ] Update all components using provinces/ports

#### Gallery
- [ ] Refactor `src/features/gallery/services/galleryService.ts`
- [ ] Refactor `src/features/gallery/services/imageTypeService.ts`
- [ ] Update admin gallery components
- [ ] Update public gallery components

#### Content
- [ ] Refactor `src/features/content/services/postService.ts`
- [ ] Refactor `src/features/content/services/categoryService.ts`
- [ ] Update post editor
- [ ] Update insights page
- [ ] Update landing page posts

#### Inquiries
- [ ] Refactor `src/features/inquiries/services/inquiryService.ts`
- [ ] Refactor `src/features/inquiries/services/documentService.ts`
- [ ] Update contact/inquiry submission
- [ ] Update admin inquiry management

#### Service Configuration
- [ ] Refactor `src/features/services-config/services/serviceTypeService.ts`
- [ ] Update service configuration components

#### Offices
- [ ] Create office service if not exists
- [ ] Update office management components

### Phase 3: Component Updates
#### Admin Components
- [ ] `src/features/admin/components/ManagePorts.tsx`
- [ ] `src/features/admin/components/ManageImagesTab.tsx`
- [ ] `src/features/admin/components/ManageImageTypes.tsx`
- [ ] `src/features/admin/components/ManagePosts.tsx`
- [ ] `src/features/admin/components/ManageCategories.tsx`
- [ ] `src/features/admin/components/ManageOffices.tsx`
- [ ] `src/features/admin/components/ManageServices.tsx`
- [ ] `src/features/admin/components/EditProfileTab.tsx`
- [ ] All inquiry tabs (Shipping Agency, Chartering, Freight, Logistics, Special Request)

#### Public Components
- [ ] `src/features/landing/components/Updates.tsx`
- [ ] `src/features/landing/components/Coverage.tsx`
- [ ] `src/features/content/components/PostEditor.tsx`
- [ ] `src/features/content/components/Insights/PostPage.tsx`
- [ ] `src/features/gallery/components/FieldGallery.tsx`
- [ ] `src/features/gallery/components/ImageManagement.tsx`
- [ ] `src/features/inquiries/components/ContactPage.tsx`
- [ ] `src/features/user/components/UserInquiryHistoryTab.tsx`
- [ ] `src/features/auth/components/LoginForm.tsx`
- [ ] `src/features/services-config/components/sections/FormSection.tsx`
- [ ] `src/features/services-config/components/sections/GallerySection.tsx`

#### App Router Pages
- [ ] `app/auth/callback/page.tsx`
- [ ] `app/admin/shipping-agency/inquiries/[id]/pdf/page.tsx`

### Phase 4: Cleanup
- [ ] Remove all hardcoded `http://localhost:8080` references
- [ ] Remove all scattered `API_BASE_URL` constants
- [ ] Update `next.config.js` rewrites if needed
- [ ] Remove unused API utility functions
- [ ] Update any custom hooks using old API patterns

### Phase 5: Testing
- [ ] Test all authentication flows
- [ ] Test CRUD operations for each feature
- [ ] Test file uploads (gallery, documents, posts)
- [ ] Test admin operations
- [ ] Test public endpoints
- [ ] Verify error handling
- [ ] Test in development environment
- [ ] Test in production build

### Phase 6: Documentation
- [ ] Update README with new API structure
- [ ] Document environment variables
- [ ] Create API service usage examples
- [ ] Update developer onboarding docs

---

## 📝 Notes & Best Practices

### Environment Variables
- **NEVER** commit `.env.local` to git
- Always use `NEXT_PUBLIC_` prefix for client-side variables
- Keep production secrets separate

### Error Handling
```typescript
// Always wrap API calls in try-catch
try {
  const data = await provinceService.getActive()
  // Handle success
} catch (error) {
  console.error('API Error:', error)
  // Show user-friendly error message
  toast.error('Failed to load data. Please try again.')
}
```

### Type Safety
```typescript
// Always define return types
async getAll(): Promise<ProvinceDTO[]> {
  // Implementation
}
```

### Caching Strategy
Consider implementing:
- React Query for server state management
- SWR for data fetching
- Local cache for frequently accessed data

### Migration Strategy
1. **Start with services** - Refactor service layer first
2. **Update components gradually** - One feature at a time
3. **Test thoroughly** - Don't merge until tested
4. **Keep old code temporarily** - Remove after confirming new code works

---

## 🔍 Validation Checklist

Before marking migration complete, verify:

- [ ] No `http://localhost:8080` strings in codebase (except config)
- [ ] All API calls use services
- [ ] No inline `fetch()` or `axios` calls in components
- [ ] All endpoints include `/v1` version
- [ ] Authentication works across all endpoints
- [ ] Error handling is consistent
- [ ] TypeScript types are properly defined
- [ ] Environment variables are documented
- [ ] All features work in dev and prod builds

---

## 📚 Reference Links

- Backend API Documentation: `API_STANDARDIZATION.md`
- Environment Setup: `.env.example`
- TypeScript API Types: `src/shared/types/api.types.ts`
- API Client Source: `src/shared/services/apiClient.ts`

---

**Last Updated:** January 19, 2026  
**Version:** 1.0.0  
**Status:** Ready for Implementation
