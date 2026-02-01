/**
 * Centralized API configuration for frontend services.
 * Validates required environment variables at startup.
 */

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined. Please set it in your environment.')
}

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  // Remove any trailing slash
  .replace(/\/+$/, '')
  // Strip accidental /api or /api/v1 from env to keep origin clean
  .replace(/\/api(?:\/v\d+)?$/, '')

const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || 'api'
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'
const API_BASE_PATH = `/${API_PREFIX}/${API_VERSION}`

const API_URL = `${rawBaseUrl}${API_BASE_PATH}`
const ASSET_BASE_URL = rawBaseUrl

export const API_CONFIG = {
  /** Origin host without /api prefix (e.g., https://api.seatrans.com) */
  API_ORIGIN: rawBaseUrl,
  /** API prefix segment, defaults to "api" */
  API_PREFIX,
  /** API version segment, defaults to "v1" */
  API_VERSION,
  /** Combined base path including prefix + version */
  API_BASE_PATH,
  /** Fully qualified API base (origin + /api/v1) */
  API_URL,
  /** Backwards-compatible alias for API_URL */
  BASE_URL: API_URL,
  /** Asset/base origin for file URLs */
  ASSET_BASE_URL,
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  ENABLE_LOGS: process.env.NEXT_PUBLIC_ENABLE_API_LOGS === 'true',

  AUTH: {
    LOGIN: '/auth/login',
    REGISTER_CUSTOMER: '/auth/register/customer',
    GOOGLE_OAUTH: '/auth/oauth2/google',
    GOOGLE_CALLBACK: '/auth/oauth2/callback',
    CURRENT_USER: '/auth/current-user',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH_TOKEN: '/auth/refresh-token',
  },

  USERS: {
    BASE: '/users',
    ADMIN_LIST: '/admin/users',
    BY_ID: (id: number) => `/users/${id}`,
    ADMIN_BY_ID: (id: number) => `/admin/users/${id}`,
  },

  PROVINCES: {
    BASE: '/provinces',
    ACTIVE: '/provinces/active',
    SEARCH: '/provinces/search',
    BY_ID: (id: number) => `/provinces/${id}`,
  },

  PORTS: {
    BASE: '/ports',
    ACTIVE: '/ports/active',
    BY_PROVINCE: (provinceId: number) => `/ports/province/${provinceId}`,
    SEARCH: '/ports/search',
    SEARCH_BY_PROVINCE: (provinceId: number) => `/ports/province/${provinceId}/search`,
    BY_ID: (id: number) => `/ports/${id}`,
  },

  OFFICES: {
    ACTIVE: '/offices/active',
    ADMIN_BASE: '/admin/offices',
    ADMIN_BY_ID: (id: number) => `/admin/offices/${id}`,
  },

  SERVICE_TYPES: {
    BASE: '/service-types',
    ACTIVE: '/service-types/active',
    BY_ID: (id: number) => `/service-types/${id}`,
    ADMIN_BASE: '/admin/service-types',
    ADMIN_BY_ID: (id: number) => `/admin/service-types/${id}`,
  },

  IMAGE_TYPES: {
    BASE: '/image-types',
    BY_SERVICE_TYPE: (serviceTypeId: number) => `/image-types/service-type/${serviceTypeId}`,
    PUBLIC_BY_SERVICE: (serviceTypeId: number) => `/image-types/public/service-type/${serviceTypeId}`,
    ADMIN_BASE: '/admin/image-types',
    ADMIN_BY_ID: (id: number) => `/admin/image-types/${id}`,
  },

  GALLERY: {
    PUBLIC_IMAGES: '/gallery/page-image',
    ADMIN_IMAGES: '/admin/gallery-images',
    ADMIN_BY_ID: (id: number) => `/admin/gallery-images/${id}`,
  },

  POSTS: {
    LATEST: '/posts/latest',
    PUBLIC_BASE: '/posts',
    PUBLIC_BY_ID: (id: number) => `/posts/${id}`,
    ADMIN_BASE: '/admin/posts',
    ADMIN_BY_ID: (id: number) => `/admin/posts/${id}`,
    PUBLISH: (id: number) => `/admin/posts/${id}/publish`,
    UNPUBLISH: (id: number) => `/admin/posts/${id}/unpublish`,
    UPLOAD_IMAGE: '/admin/posts/upload-image',
    UPLOAD_THUMBNAIL: '/admin/posts/upload-thumbnail',
  },

  CATEGORIES: {
    PUBLIC_BASE: '/categories',
    ADMIN_BASE: '/admin/categories',
    ADMIN_BY_ID: (id: number) => `/admin/categories/${id}`,
  },

  INQUIRIES: {
    SUBMIT: '/inquiries',
    BASE: '/inquiries',
    USER_HISTORY: (userId: number) => `/inquiries/user/${userId}`,
    ADMIN_BASE: '/admin/inquiries',
    ADMIN_BY_ID: (id: number) => `/admin/inquiries/${id}`,
    UPDATE_STATUS: (id: number) => `/admin/inquiries/${id}/status`,
  },

  DOCUMENTS: {
    UPLOAD: '/inquiry-documents/upload',
    BY_INQUIRY: (inquiryId: number) => `/inquiry-documents/inquiry/${inquiryId}`,
    LIST: (serviceSlug: string, targetId: number) => `/inquiry-documents/${serviceSlug}/${targetId}`,
    DOWNLOAD: (id: number) => `/inquiry-documents/download/${id}`,
    DELETE: (id: number) => `/inquiry-documents/${id}`,
  },

  SPREADSHEET_FILES: {
    ALL: '/spreadsheet-files/all',
    BY_SERVICE: (serviceName: string) => `/spreadsheet-files/service/${serviceName}`,
    UPLOAD: '/spreadsheet-files/upload',
    DELETE: (fileId: number) => `/spreadsheet-files/${fileId}`,
    DOWNLOAD: (fileId: number) => `/spreadsheet-files/download/${fileId}`,
  },
} as const

export type ApiConfig = typeof API_CONFIG
