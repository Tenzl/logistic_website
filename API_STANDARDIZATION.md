# API Standardization - Enterprise Guidelines

## 📋 Tóm tắt
Document này định nghĩa chuẩn hóa API cho dự án Seatrans theo best practices doanh nghiệp.

---

## 🎯 Nguyên tắc Chuẩn hóa

### 1. **API Versioning & Base Path**

#### Backend (Spring Boot)
```java
// ✅ CHUẨN: Tất cả API phải có prefix /api/v1
@RequestMapping("/api/v1/provinces")
public class ProvinceController { }

// ❌ SAI: Không dùng /api trực tiếp
@RequestMapping("/api/provinces")  // Sẽ phá vỡ khi thêm version
```

**Lý do:**
- Hỗ trợ multiple API versions đồng thời (v1, v2)
- Dễ deprecated old APIs
- Client có thể chọn version phù hợp

#### Frontend (Next.js)
```typescript
// ✅ CHUẨN: Centralized config
// File: src/shared/config/api.config.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  VERSION: 'v1',
  get API_URL() {
    return `${this.BASE_URL}/api/${this.VERSION}`
  }
}

// Usage
import { API_CONFIG } from '@/shared/config/api.config'
const response = await fetch(`${API_CONFIG.API_URL}/provinces`)

// ❌ SAI: Hardcoded trong mỗi file
const API_BASE_URL = 'http://localhost:8080/api'  // Duplicate, không maintain được
```

---

### 2. **RESTful Resource Naming**

#### Chuẩn Đặt Tên Resource

| Resource Type | Pattern | Example Backend | Example Frontend Call |
|--------------|---------|-----------------|----------------------|
| **Public Resource** | `/api/v1/{resources}` | `@RequestMapping("/api/v1/provinces")` | `GET /api/v1/provinces` |
| **Admin Resource** | `/api/v1/admin/{resources}` | `@RequestMapping("/api/v1/admin/users")` | `GET /api/v1/admin/users` |
| **User Resource** | `/api/v1/users/{action}` | `@RequestMapping("/api/v1/users")` | `GET /api/v1/users/me` |
| **Auth Resource** | `/api/v1/auth/{action}` | `@RequestMapping("/api/v1/auth")` | `POST /api/v1/auth/login` |

#### Quy tắc:
- ✅ Dùng **plural nouns**: `/provinces`, `/ports`, `/images`
- ❌ Không dùng verbs: `~/getProvinces`, `~/createUser`
- ✅ Hierarchy rõ ràng: `/provinces/{id}/ports`
- ✅ Admin resources có prefix `/admin`

---

### 3. **HTTP Methods Mapping**

| Operation | HTTP Method | Endpoint Pattern | Backend Annotation |
|-----------|------------|------------------|-------------------|
| Get list | `GET` | `/api/v1/provinces` | `@GetMapping` |
| Get by ID | `GET` | `/api/v1/provinces/{id}` | `@GetMapping("/{id}")` |
| Create | `POST` | `/api/v1/provinces` | `@PostMapping` |
| Update full | `PUT` | `/api/v1/provinces/{id}` | `@PutMapping("/{id}")` |
| Update partial | `PATCH` | `/api/v1/provinces/{id}/status` | `@PatchMapping("/{id}/status")` |
| Delete | `DELETE` | `/api/v1/provinces/{id}` | `@DeleteMapping("/{id}")` |

---

### 4. **Response Format Standardization**

#### Backend Standard Response
```java
// File: ApiResponse.java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Map<String, Object> metadata; // pagination, etc.
    private Long timestamp;
}

// Usage trong Controller
@GetMapping
public ResponseEntity<ApiResponse<List<ProvinceDTO>>> getAll() {
    return ResponseEntity.ok(
        ApiResponse.success("Provinces retrieved successfully", provinces)
    );
}

// Error response
return ResponseEntity.status(HttpStatus.BAD_REQUEST)
    .body(ApiResponse.error("Invalid province ID", errorDetails));
```

#### Frontend Service Pattern
```typescript
// File: baseService.ts
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options?.headers
    }
  })
  
  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }
  
  return response.json()
}
```

---

### 5. **Environment Configuration**

#### Backend: application.yml (chuẩn)
```yaml
# application.yml
server:
  port: 8080
  servlet:
    context-path: /  # API base là /api/v1, không dùng context-path

app:
  api:
    version: v1
    base-path: /api/${app.api.version}
  
  cors:
    allowed-origins:
      - http://localhost:3000
      - http://localhost:3001
      - ${FRONTEND_URL:http://localhost:3000}
    allowed-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
    allowed-headers: "*"
    allow-credentials: true

# application-dev.yml (development)
app:
  cors:
    allowed-origins: "*"

# application-prod.yml (production)  
app:
  cors:
    allowed-origins:
      - https://seatrans.com
      - https://admin.seatrans.com
```

#### Frontend: .env files
```bash
# .env.local (development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_VERSION=v1

# .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.seatrans.com
NEXT_PUBLIC_API_VERSION=v1
```

---

## 🔧 Backend Cần Refactor

### Controllers cần thêm /v1

| File | Current Path | New Path | Priority |
|------|-------------|----------|----------|
| `ProvinceController.java` | `/api/provinces` | `/api/v1/provinces` | 🔴 HIGH |
| `PortController.java` | `/api/ports` | `/api/v1/ports` | 🔴 HIGH |
| `ServiceTypeController.java` | `/api/service-types` | `/api/v1/service-types` | 🔴 HIGH |
| `AuthController.java` | `/api/auth` | `/api/v1/auth` | 🔴 HIGH |
| `UserController.java` | `/api/users` | `/api/v1/users` | 🔴 HIGH |
| `AdminUserController.java` | `/api/admin/users` | `/api/v1/admin/users` | 🔴 HIGH |
| `PostController.java` | `/api/admin/posts` | `/api/v1/admin/posts` | 🟡 MEDIUM |
| `PostPublicController.java` | `/api/posts` | `/api/v1/posts` | 🟡 MEDIUM |
| `OfficeController.java` | `/api/offices` | `/api/v1/offices` | 🟡 MEDIUM |
| `AdminOfficeController.java` | `/api/admin/offices` | `/api/v1/admin/offices` | 🟡 MEDIUM |
| `InquiryDocumentController.java` | `/api/inquiries` | `/api/v1/inquiries` | 🟡 MEDIUM |
| `AdminInquiryController.java` | `/api/admin` | `/api/v1/admin/inquiries` | 🔴 HIGH |
| `PublicInquiryController.java` | `/api/inquiries` | `/api/v1/inquiries` | 🟡 MEDIUM |
| `OAuth2Controller.java` | `/api/auth/oauth2` | `/api/v1/auth/oauth2` | 🔴 HIGH |
| `GalleryImageAdminController.java` | `/api/admin/gallery-images` | `/api/v1/admin/gallery-images` | 🟡 MEDIUM |
| `GalleryImagePublicController.java` | `/api/gallery` | `/api/v1/gallery` | 🟡 MEDIUM |
| `ImageTypePublicController.java` | `/api/image-types` | `/api/v1/image-types` | 🔴 HIGH |
| `ImageTypeAdminController.java` | `/api/admin/image-types` | `/api/v1/admin/image-types` | 🔴 HIGH |

### Vấn đề đặc biệt
❌ **AdminInquiryController**: Path hiện tại `/api/admin` quá generic, phải cụ thể hóa thành `/api/v1/admin/inquiries`

---

## 🛠️ Frontend Cần Refactor

### 1. Tạo Centralized Config
**File mới:** `src/shared/config/api.config.ts`
```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  
  get API_URL() {
    return `${this.BASE_URL}/api/${this.VERSION}`
  },
  
  // Timeout configs
  DEFAULT_TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 120000,
  
  // Retry configs
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
}
```

### 2. Base Service Layer
**File mới:** `src/shared/services/baseService.ts`
```typescript
import { API_CONFIG } from '@/shared/config/api.config'
import { authService } from '@/features/auth/services/authService'

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_CONFIG.API_URL}${endpoint}`
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authService.getAuthHeader(),
    ...options?.headers,
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  const data = await response.json()
  return data?.data ?? data
}
```

### 3. Service Files cần sửa

| File | Changes Needed |
|------|---------------|
| `provinceService.ts` | Import API_CONFIG, xóa hardcoded URL |
| `portService.ts` | Import API_CONFIG, xóa hardcoded URL |
| `serviceTypeService.ts` | Import API_CONFIG, xóa hardcoded URL |
| `imageTypeService.ts` | Import API_CONFIG, xóa hardcoded URL |
| `galleryService.ts` | Import API_CONFIG, xóa hardcoded URL |
| `inquiryService.ts` | Import API_CONFIG, xóa hardcoded URL |
| `postService.ts` | Import API_CONFIG, xóa hardcoded URL |
| `documentService.ts` | Import API_CONFIG, xóa `NEXT_PUBLIC_API_URL` |
| `FormSection.tsx` | Import API_CONFIG thay thế inline constant |
| `GallerySection.tsx` | Import API_CONFIG thay thế inline constant |
| `ManageImageTypes.tsx` | Import API_CONFIG thay thế inline constant |
| `ContactPage.tsx` | Import API_CONFIG thay thế inline constant |

### 4. Components cần sửa
Tất cả component có `const API_BASE_URL = process.env...` phải:
1. Import `API_CONFIG`
2. Dùng `API_CONFIG.API_URL` thay vì local const
3. Xóa duplicate logic

---

## 📝 Implementation Steps

### Phase 1: Backend Refactor (Week 1)
1. ✅ Tạo `ApiVersionConfig.java` để centralize version
2. ✅ Update tất cả `@RequestMapping` thành `/api/v1/...`
3. ✅ Update `application.yml` với CORS config đúng
4. ✅ Test tất cả endpoints với Postman/Thunder Client
5. ✅ Update API documentation (Swagger nếu có)

### Phase 2: Frontend Refactor (Week 2)
1. ✅ Tạo `api.config.ts`
2. ✅ Tạo `baseService.ts`
3. ✅ Update `.env.local` với `NEXT_PUBLIC_API_BASE_URL`
4. ✅ Refactor services theo thứ tự priority
5. ✅ Refactor components có inline API calls
6. ✅ Test integration với backend mới

### Phase 3: Testing & Documentation (Week 3)
1. ✅ E2E testing tất cả flows
2. ✅ Update README với API guidelines
3. ✅ Update onboarding docs cho developers mới

---

## 🚀 Migration Guide

### Backward Compatibility
Trong quá trình migration, backend hỗ trợ cả 2 paths:
```java
// Temporary: Support both old and new paths
@RequestMapping({"/api/provinces", "/api/v1/provinces"})
public class ProvinceController {
    // After 2 sprints, remove old path
}
```

### Frontend Migration
```typescript
// Old (phase out trong 2 sprints)
const API_BASE_URL = 'http://localhost:8080/api'

// New
import { API_CONFIG } from '@/shared/config/api.config'
const response = await fetch(`${API_CONFIG.API_URL}/provinces`)
```

---

## ✅ Checklist trước khi Deploy Production

### Backend
- [ ] Tất cả controllers dùng `/api/v1/...`
- [ ] CORS config đúng domain production
- [ ] API documentation updated
- [ ] Integration tests pass
- [ ] Load testing với expected traffic

### Frontend
- [ ] Không còn hardcoded `http://localhost`
- [ ] `.env.production` có `NEXT_PUBLIC_API_BASE_URL` đúng
- [ ] Error handling cho tất cả API calls
- [ ] Loading states cho tất cả async operations
- [ ] Toast notifications cho user feedback

---

## 🔗 References
- [REST API Best Practices](https://restfulapi.net/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Spring Boot REST API Best Practices](https://spring.io/guides/tutorials/rest/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Last Updated:** 2026-01-19  
**Version:** 1.0  
**Owner:** Development Team
