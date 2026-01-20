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
- `src/modules/gallery/services/galleryService.ts`
- `src/modules/posts/services/postService.ts`
- `src/modules/logistics/services/provinceService.ts`
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
│   │   │   ├── api.config.ts          # ✨ NEW: Centralized API configuration
│   │   │   ├── dashboard-registry.ts  # Dashboard configuration
│   │   │   └── react-query.config.ts  # React Query configuration
│   │   ├── components/                # Shared UI components
│   │   ├── hooks/                     # Shared custom hooks
│   │   ├── utils/                     # Shared utility functions
│   │   ├── lib/                       # Third-party library configs
│   │   └── types/
│   │       └── api.types.ts           # ✨ NEW: Shared API types
│   ├── modules/                       # Feature modules (domain-driven)
│   │   ├── auth/
│   │   │   ├── components/            # Auth UI components
│   │   │   ├── context/               # Auth context/providers
│   │   │   ├── hooks/                 # Auth-specific hooks
│   │   │   ├── services/
│   │   │   │   └── authService.ts     # 🔄 REFACTOR: Use API config
│   │   │   ├── types/                 # Auth type definitions
│   │   │   └── utils/                 # Auth utilities
│   │   ├── logistics/
│   │   │   ├── components/
│   │   │   │   ├── admin/            # Admin logistics components
│   │   │   │   └── public/           # Public logistics components
│   │   │   └── services/
│   │   │       ├── provinceService.ts # 🔄 REFACTOR
│   │   │       └── portService.ts     # 🔄 REFACTOR
│   │   ├── gallery/
│   │   │   ├── components/
│   │   │   │   ├── admin/            # Admin gallery management
│   │   │   │   └── public/           # Public gallery display
│   │   │   └── services/
│   │   │       ├── galleryService.ts  # 🔄 REFACTOR
│   │   │       └── imageTypeService.ts# 🔄 REFACTOR
│   │   ├── posts/
│   │   │   ├── components/
│   │   │   │   ├── admin/            # Post editor, management
│   │   │   │   └── public/           # Post display, insights
│   │   │   └── services/
│   │   │       └── postService.ts     # 🔄 REFACTOR
│   │   ├── categories/
│   │   │   ├── components/
│   │   │   │   └── admin/            # Category management
│   │   │   └── services/
│   │   │       └── categoryService.ts # 🔄 REFACTOR
│   │   ├── inquiries/
│   │   │   ├── components/
│   │   │   │   ├── admin/            # Admin inquiry management
│   │   │   │   ├── common/           # Shared inquiry components
│   │   │   │   └── public/           # Public inquiry submission
│   │   │   └── services/
│   │   │       ├── inquiryService.ts  # 🔄 REFACTOR
│   │   │       └── documentService.ts # 🔄 REFACTOR
│   │   ├── service-types/
│   │   │   ├── components/
│   │   │   │   └── admin/            # Service configuration
│   │   │   └── services/
│   │   │       ├── serviceTypeService.ts # 🔄 REFACTOR
│   │   │       └── formFieldService.ts   # Form field management
│   │   ├── landing/
│   │   │   └── components/
│   │   │       └── public/           # Landing page sections
│   │   └── users/
│   │       └── components/           # User profile, dashboard
│   └── features/
│       └── admin/                    # Legacy admin wrappers (being phased out)
│           ├── components/           # Thin wrappers re-exporting from modules
│           ├── hooks/                # Admin-specific hooks
│           └── types/                # Admin type definitions
```

### Layer Architecture

```
┌─────────────────────────────────────────────┐
│         React Components / Pages            │
│  app/* routes, src/modules/*/components/*   │
│  (Use services, no direct API calls)        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Module Services Layer              │
│  src/modules/*/services/*                   │
│  (authService, provinceService, etc.)       │
│  - Business logic                           │
│  - Data transformation                      │
│  - Type-safe API calls                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Shared Utils / HTTP Client          │
│  src/shared/utils/* (fetch wrappers)        │
│  - HTTP methods (GET, POST, PUT, DELETE)    │
│  - Authentication token injection           │
│  - Error handling                           │
│  - Response parsing                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            API Configuration                │
│  src/shared/config/api.config.ts ✨ NEW     │
│  - Endpoint definitions                     │
│  - Base URL from environment                │
│  - Route constants (/v1/*)                  │
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

### Step 3: Shared API Client

#### **File: `src/shared/utils/apiClient.ts`**

The shared client is fetch-based and wraps `API_CONFIG.BASE_URL`. It injects auth tokens (unless `skipAuth` is set), applies optional timeouts and console logging, redirects to `/login?reason=session_expired` on 401, and automatically handles `FormData` without manual headers.

```typescript
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'

const response = await apiClient.get(API_CONFIG.PROVINCES.ACTIVE)
const data = await response.json()
```

Use `skipAuth: true` for public endpoints or pass a `FormData` body to let the client manage multipart boundaries.

---

### Step 4: Feature Service Examples

These examples assume the fetch-based `apiClient`; parse JSON payloads with `await response.json()` instead of accessing `response.data`.

#### **Example 1: Province Service**

**File: `src/modules/logistics/services/provinceService.ts`**

```typescript
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse, ProvinceDTO } from '@/shared/types/api.types'

export const provinceService = {
  /**
   * Get all provinces
   */
  async getAll(): Promise<ProvinceDTO[]> {
    const response = await apiClient.get<ApiResponse<ProvinceDTO[]>>(API_CONFIG.PROVINCES.BASE)
    const data = await response.json()
    return data.data
  },

  /**
   * Get active provinces only
   */
  async getActive(): Promise<ProvinceDTO[]> {
    const response = await apiClient.get<ApiResponse<ProvinceDTO[]>>(API_CONFIG.PROVINCES.ACTIVE)
    const data = await response.json()
    return data.data
  },

  /**
   * Search provinces by name
   */
  async search(query: string): Promise<ProvinceDTO[]> {
    const response = await apiClient.get<ApiResponse<ProvinceDTO[]>>(
      `${API_CONFIG.PROVINCES.SEARCH}?query=${encodeURIComponent(query)}`
    )
    const data = await response.json()
    return data.data
  },

  /**
   * Get province by ID
   */
  async getById(id: number): Promise<ProvinceDTO> {
    const response = await apiClient.get<ApiResponse<ProvinceDTO>>(API_CONFIG.PROVINCES.BY_ID(id))
    const data = await response.json()
    return data.data
  },
}
```

#### **Example 2: Port Service**

**File: `src/modules/logistics/services/portService.ts`**

```typescript
import { apiClient } from '@/shared/utils/apiClient'
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

**File: `src/modules/gallery/services/galleryService.ts`**

```typescript
import { apiClient } from '@/shared/utils/apiClient'
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

**File: `src/modules/posts/services/postService.ts`**

```typescript
import { apiClient } from '@/shared/utils/apiClient'
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
import { provinceService } from '@/modules/logistics/services/provinceService'

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
- [x] Create `.env.local` with `NEXT_PUBLIC_API_BASE_URL`
- [ ] Create `src/shared/config/api.config.ts`
- [ ] Create `src/shared/utils/apiClient.ts` (HTTP client wrapper)
- [ ] Create `src/shared/types/api.types.ts` (TypeScript definitions)

### Phase 2: Service Layer Refactoring
#### Authentication & Users
- [x] Refactor `src/modules/auth/services/authService.ts`
- [x] Update login components to use new service
- [x] Update registration components

#### Logistics
- [x] Refactor `src/modules/logistics/services/provinceService.ts`
- [x] Refactor `src/modules/logistics/services/portService.ts`
- [x] Update all components using provinces/ports

#### Gallery
- [x] Refactor `src/modules/gallery/services/galleryService.ts`
- [x] Refactor `src/modules/gallery/services/imageTypeService.ts`
- [x] Update admin gallery components
- [x] Update public gallery components

#### Posts & Content
- [x] Refactor `src/modules/posts/services/postService.ts`
- [x] Refactor `src/modules/categories/services/categoryService.ts`
- [x] Update post editor
- [x] Update insights page
- [x] Update landing page posts

#### Inquiries
- [x] Refactor `src/modules/inquiries/services/inquiryService.ts`
- [x] Refactor `src/modules/inquiries/services/documentService.ts`
- [x] Update contact/inquiry submission
- [x] Update admin inquiry management

#### Service Configuration
- [x] Refactor `src/modules/service-types/services/serviceTypeService.ts`
- [x] Refactor `src/modules/service-types/services/formFieldService.ts`
- [x] Update service configuration components

#### Offices & Landing
- [x] Create office service (handled in logistics/service-types)
- [x] Migrate landing page components to `src/modules/landing`
- [x] Create user module for profile/dashboard

### Phase 3: Component Updates
#### Module Components (Completed)
- [x] `src/modules/auth/components/LoginForm.tsx` - Uses authService
- [x] `src/modules/auth/components/SignupForm.tsx` - Uses authService
- [x] `src/modules/posts/components/admin/PostEditor.tsx` - Uses postService
- [x] `src/modules/posts/components/admin/PostManagement.tsx` - Uses postService
- [x] `src/modules/posts/components/public/ArticleDetailPage.tsx` - Uses postService
- [x] `src/modules/posts/components/public/Insights/PostPage.tsx` - Uses postService
- [x] `src/modules/categories/components/admin/CategoryManagement.tsx` - Uses categoryService
- [x] `src/modules/gallery/components/admin/ImageUpload.tsx` - Uses galleryService
- [x] `src/modules/gallery/components/admin/ImageManagement.tsx` - Uses galleryService
- [x] `src/modules/gallery/components/admin/ImageTypeManagement.tsx` - Uses imageTypeService
- [x] `src/modules/gallery/components/public/FieldGallery.tsx` - Uses galleryService
- [x] `src/modules/inquiries/components/admin/InquiryManagement.tsx` - Uses inquiryService
- [x] `src/modules/inquiries/components/admin/InvoiceUploadDialog.tsx` - Uses documentService
- [x] `src/modules/inquiries/components/public/ContactPage.tsx` - Uses inquiryService
- [x] `src/modules/landing/components/public/*` - All landing sections
- [x] `src/modules/users/components/UserDashboard.tsx` - User profile
- [x] `src/modules/users/components/UserInquiryHistoryTab.tsx` - Uses inquiryService
- [x] `src/modules/service-types/components/admin/*` - Service config components

#### Admin Wrapper Components (Legacy - Thin Re-exports)
- [x] `src/features/admin/components/ManagePorts.tsx` - Legacy (to be phased out)
- [x] `src/features/admin/components/ManageImagesTab.tsx` - Re-exports from modules/gallery
- [x] `src/features/admin/components/ManageImageTypes.tsx` - Re-exports from modules/gallery
- [x] `src/features/admin/components/ManagePosts.tsx` - Re-exports from modules/posts
- [x] `src/features/admin/components/ManageCategories.tsx` - Re-exports from modules/categories
- [x] `src/features/admin/components/ManageOffices.tsx` - Legacy (to be refactored)
- [x] `src/features/admin/components/ManageServices.tsx` - Legacy (to be refactored)
- [x] `src/features/admin/components/EditProfileTab.tsx` - Uses modules/auth
- [ ] All inquiry tabs - Need to migrate to modules/inquiries/components/admin

#### App Router Pages
- [x] `app/auth/callback/page.tsx` - Uses authService
- [x] `app/login/page.tsx` - Uses LoginForm from modules
- [x] `app/signup/page.tsx` - Uses SignupForm from modules
- [x] `app/insights/page.tsx` - Uses PostPage from modules
- [x] `app/insights/[id]/page.tsx` - Uses ArticleDetailPage from modules
- [x] `app/contact/page.tsx` - Uses ContactPage from modules
- [x] `app/page.tsx` - Uses landing components from modules
- [x] `app/admin/post-editor/[id]/page.tsx` - Uses PostEditor from modules
- [x] `app/admin/offices/page.tsx` - Uses AdminDashboard
- [x] `app/*-agency/page.tsx` - Uses service config from modules
- [ ] `app/admin/shipping-agency/inquiries/[id]/pdf/page.tsx` - Needs API config

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
- Environment Setup: `.env.local` (see README for required keys)
- TypeScript API Types: `src/shared/types/api.types.ts`
- API Client Source: `src/shared/utils/apiClient.ts`

---

**Last Updated:** January 19, 2026  
**Version:** 1.0.0  
**Status:** Ready for Implementation
