# Kế hoạch Unified Dashboard - MainDashboard.tsx

## 1. PHÂN TÍCH HỆ THỐNG HIỆN TẠI

### 1.1. Role System (từ Backend Spring Boot)
```
RoleGroup: INTERNAL | EXTERNAL

INTERNAL Roles:
- ROLE_ADMIN
- ROLE_EMPLOYEE

EXTERNAL Roles:
- ROLE_CUSTOMER
```

### 1.2. Dashboard hiện tại

#### `/dashboard/page.tsx` - UserDashboard (EXTERNAL)
**Chức năng:**

**Profile:**
- ✅ Edit Profile
**Inquiries (Quản lý yêu cầu báo giá):**
- ✅ Inquiry History (Xem lịch sử yêu cầu báo giá)

#### `/admin/page.tsx` - AdminPage (INTERNAL)
**Chức năng được nhóm theo Categories:**

**Profile:**
- ✅ Edit Profile

**Invoices:**
- ✅ Create Invoice (Tạo hóa đơn)

**Inquiries (Quản lý yêu cầu báo giá):**
- ✅ Shipping Agency Inquiries
- ✅ Freight Forwarding Inquiries
- ✅ Logistics Inquiries
- ✅ Chartering Inquiries
- ✅ Special Request Inquiries

**Image Management:**
- ✅ Add Image
- ✅ Manage Images

**Data Management:**
- ✅ Services (Quản lý dịch vụ)
- ✅ Ports (Quản lý cảng)
- ✅ Offices (Quản lý văn phòng)
- ✅ Commodities (Quản lý hàng hóa)

**Content Management:**
- ✅ Categories (Quản lý danh mục)
- ✅ Posts (Quản lý bài viết)

---

## 2. THIẾT KẾ UNIFIED DASHBOARD

### 2.1. Cấu trúc Component
```
MainDashboard.tsx (Shared Layout)
├── AppSidebar (Dynamic theo roleGroup)
│   ├── Navigation Menu (role-based)
│   └── User Profile Footer
├── Header (SidebarTrigger + Breadcrumb)
└── Content Area (Dynamic children based on activeSection)
```

### 2.2. Navigation Structure

#### **INTERNAL Users (Admin/Employee)** - AdminDashboard Features

```typescript
[
  // Profile
  { section: 'profile', label: 'Edit Profile', icon: User },
  
  // Invoices
  { section: 'create-invoice', label: 'Create Invoice', icon: Calculator },
  
  // Inquiries Management
  { section: 'shipping-agency-inquiries', label: 'Shipping Agency', icon: ListChecks },
  { section: 'freight-forwarding-inquiries', label: 'Freight Forwarding', icon: Package },
  { section: 'logistics-inquiries', label: 'Logistics', icon: Truck },
  { section: 'chartering-inquiries', label: 'Chartering', icon: Anchor },
  { section: 'special-request-inquiries', label: 'Special Request', icon: FileText },
  
  // Image Management
  { section: 'add-image', label: 'Add Image', icon: Upload },
  { section: 'manage-images', label: 'Manage Images', icon: ImageIcon },
  
  // Data Management
  { section: 'services', label: 'Services', icon: Cog },
  { section: 'ports', label: 'Ports', icon: Anchor },
  { section: 'offices', label: 'Offices', icon: LayoutDashboard },
  { section: 'commodities', label: 'Commodities', icon: Package },
  
  // Content Management
  { section: 'categories', label: 'Categories', icon: Database },
  { section: 'posts', label: 'Posts', icon: FileText },
]
```

#### **EXTERNAL Users (Customer)** - UserDashboard Features

```typescript
[
  // Profile
  { section: 'profile', label: 'Edit Profile', icon: UserIcon },
  
  // Inquiry History
  { section: 'inquiry', label: 'Inquiry History', icon: FileText },
]
```

---

## 3. IMPLEMENTATION PLAN

### 3.1. Files cần tạo/sửa

**Tạo mới:**
```
src/shared/components/layout/dashboard/
├── MainDashboard.tsx (Unified Layout) ✨
├── DashboardContent.tsx (Content router based on section)
└── ui/
    ├── app-sidebar.tsx (Updated với role-based menu)
    ├── nav-main.tsx
    ├── nav-projects.tsx
    ├── nav-user.tsx
    └── team-switcher.tsx
```

**Import components từ features:**
```typescript
// INTERNAL Components (từ features/admin)
- EditProfileTab
- CreateInvoiceTab
- ShippingAgencyInquiriesTab
- FreightForwardingInquiriesTab
- LogisticsInquiriesTab
- CharteringInquiriesTab
- SpecialRequestInquiriesTab
- AddImageTab
- ManageImagesTab
- ManageServices
- ManagePorts
- ManageOffices
- ManageImageTypes (Commodities)
- ManageCategories
- ManagePosts

// EXTERNAL Components (từ features/user)
- EditProfileTab (shared)
- UserInquiryHistoryTab
```

### 3.2. Logic phân quyền

```typescript
// Trong MainDashboard.tsx
const { user, isAuthenticated, isLoading } = useAuth()

// TODO: Sử dụng utility function getRoleGroup(user) thay vì manual derive
// Utility function sẽ được tạo trong src/utils/auth.ts hoặc src/shared/utils/auth.ts
const roleGroup = getRoleGroup(user) // Returns 'INTERNAL' | 'EXTERNAL' | undefined

// Menu items dựa trên roleGroup
const menuItems = roleGroup === 'INTERNAL' 
  ? internalMenuItems 
  : externalMenuItems
```

**⚠️ Action Required:**
- [ ] Tạo utility function `getRoleGroup(user)` trong `src/utils/auth.ts`
- [ ] Function logic:
  ```typescript
  export function getRoleGroup(user: User | null | undefined): 'INTERNAL' | 'EXTERNAL' | undefined {
    if (!user) return undefined
    
    // 1. Ưu tiên sử dụng roleGroup từ backend nếu có
    if (user.roleGroup) return user.roleGroup as 'INTERNAL' | 'EXTERNAL'
    
    // 2. Fallback: derive từ role name
    if (user.role?.includes('ADMIN') || user.role?.includes('EMPLOYEE')) {
      return 'INTERNAL'
    }
    if (user.role?.includes('CUSTOMER')) {
      return 'EXTERNAL'
    }
    
    return undefined
  }
  ```
- [ ] Refactor tất cả nơi dùng `derivedGroup` manual sang dùng `getRoleGroup()`

### 3.3. Routing Strategy ✅ APPROVED

**✅ Strategy: Giữ nguyên 2 routes riêng biệt (Phù hợp với doanh nghiệp)**

```typescript
// app/dashboard/page.tsx - EXTERNAL Customers
export default function DashboardPage() {
  const { user } = useAuth()
  const roleGroup = getRoleGroup(user)
  
  // Customer dashboard - simple features
  return <MainDashboard roleGroup="EXTERNAL" initialSection="profile" />
}

// app/admin/page.tsx - INTERNAL Staff (với access guard)
export default function AdminPage() {
  const { user } = useAuth()
  const roleGroup = getRoleGroup(user)
  
  // Guard: Only INTERNAL users
  if (roleGroup !== 'INTERNAL') {
    return <AccessDenied />
  }
  
  // Admin dashboard - full features
  return <MainDashboard roleGroup="INTERNAL" initialSection="profile" />
}
```

**Lợi ích:**
- 🔒 **Security**: Clear separation giữa public/admin areas
- 👥 **UX**: Customers không cần biết admin features
- 💼 **Business Logic**: Reflects company structure (staff vs customers)
- 🚀 **Scalability**: Dễ extend cho roles khác (MANAGER, SUPERVISOR)
- 📊 **Analytics**: Track customer vs admin usage separately

---

## 4. COMPONENTS STRUCTURE

### 4.1. MainDashboard.tsx Props
```typescript
interface MainDashboardProps {
  onNavigateHome: () => void
  initialSection?: DashboardSection
  roleGroup?: 'INTERNAL' | 'EXTERNAL' // Optional override
}

type DashboardSection = 
  // Shared
  | 'profile'
  // INTERNAL only
  | 'create-invoice'
  | 'shipping-agency-inquiries'
  | 'freight-forwarding-inquiries'
  | 'logistics-inquiries'
  | 'chartering-inquiries'
  | 'special-request-inquiries'
  | 'add-image'
  | 'manage-images'
  | 'services'
  | 'ports'
  | 'offices'
  | 'commodities'
  | 'categories'
  | 'posts'
  // EXTERNAL only
  | 'inquiry'
```

### 4.2. Navigation Categories

**INTERNAL:**
```typescript
const categories = [
  { name: 'Profile', items: [...] },
  { name: 'Invoices', items: [...] },
  { name: 'Inquiries', items: [...] },
  { name: 'Image Management', items: [...] },
  { name: 'Data Management', items: [...] },
  { name: 'Content Management', items: [...] },
]
```

**EXTERNAL:**
```typescript
const menuItems = [
  { section: 'profile', label: 'Edit Profile', icon: UserIcon },
  { section: 'inquiry', label: 'Inquiry History', icon: FileText },
]
```

---

## 5. MIGRATION CHECKLIST

### Phase 1: Foundation (Security & Utils)
- [ ] Tạo `getRoleGroup()` utility function
- [ ] Tạo `ProtectedRoute` component
- [ ] Tạo `SectionErrorBoundary` component
- [ ] Tạo loading skeletons
- [ ] Setup toast utilities

### Phase 2: Feature Registry
- [ ] Tạo `dashboard-registry.ts` với tất cả sections
- [ ] Define section permissions (ADMIN, EMPLOYEE, CUSTOMER)
- [ ] Implement `canAccessSection()` helpers
- [ ] Setup lazy loading cho components

### Phase 3: Main Components
- [ ] Tạo MainDashboard.tsx với role detection
- [ ] Tạo DashboardContent.tsx sử dụng registry
- [ ] Update app-sidebar.tsx với dynamic menu from registry
- [ ] Implement breadcrumb dynamic

### Phase 4: Route Integration
- [ ] Update `/dashboard/page.tsx` với ProtectedRoute
- [ ] Update `/admin/page.tsx` với ProtectedRoute
- [ ] Wrap sections trong ErrorBoundary
- [ ] Add Suspense boundaries

### Phase 5: Performance
- [ ] Configure QueryClient với caching strategy
- [ ] Implement prefetching cho common queries
- [ ] Add bundle analysis
- [ ] Optimize images với Next/Image

### Phase 6: Testing
- [ ] Test login flow → dashboard redirect
- [ ] Test INTERNAL features (admin/employee)
- [ ] Test EXTERNAL features (customer)
- [ ] Test permission denials
- [ ] Test error boundaries
- [ ] Test loading states
- [ ] Test responsive design

### Phase 7: Monitoring (Production)
- [ ] Setup Sentry integration
- [ ] Add telemetry tracking
- [ ] Setup error logging
- [ ] Add analytics events

---

## 6. BUSINESS LOGIC NOTES

### 6.1. Access Control
- INTERNAL users: Full access đến tất cả management features
- EXTERNAL users: Chỉ xem profile và inquiry history của chính mình
- Shared: EditProfile component được dùng bởi cả 2 groups

### 6.2. Feature Mapping
```
INTERNAL = Quản lý nghiệp vụ công ty
- Xử lý inquiries của khách hàng
- Tạo invoices/báo giá
- Quản lý dữ liệu master (ports, services, etc)
- Quản lý nội dung website

EXTERNAL = Khách hàng
- Gửi inquiry requests
- Xem lịch sử requests
- Quản lý profile cá nhân
```

---

## 7. TECHNICAL DECISIONS

### 7.1. Component Reuse
- ✅ Sử dụng lại tất cả components từ `/features/admin` và `/features/user`
- ✅ Không duplicate code
- ✅ EditProfileTab được shared giữa INTERNAL và EXTERNAL

### 7.2. State Management
- ✅ Local state với useState cho activeSection
- ✅ AuthContext cho user/roleGroup
- ✅ QueryClient đã có sẵn trong AdminPage

### 7.3. Styling
- ✅ Sử dụng ShadcN UI components (Sidebar, SidebarInset)
- ✅ Consistent với design hiện tại
- ✅ Responsive với collapsible sidebar

---

## 7.5. ENTERPRISE ENHANCEMENTS ⭐ (Critical for Production)

### 7.5.1. Security Layer 🔒

**❌ Hiện tại (Chỉ UI check):**
```typescript
if (roleGroup !== 'INTERNAL') return <AccessDenied />
```

**✅ Cần implement (Defense in Depth):**

**1. ProtectedRoute Component:**
```typescript
// src/shared/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'INTERNAL' | 'EXTERNAL'
  requiredPermissions?: string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const roleGroup = getRoleGroup(user)
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=' + window.location.pathname)
    }
  }, [isLoading, user])
  
  if (isLoading) return <LoadingSkeleton />
  if (!user) return null
  
  if (requiredRole && roleGroup !== requiredRole) {
    return <AccessDenied requiredRole={requiredRole} userRole={roleGroup} />
  }
  
  return <>{children}</>
}
```

**2. Usage in Routes:**
```typescript
// app/admin/page.tsx
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="INTERNAL">
      <MainDashboard roleGroup="INTERNAL" />
    </ProtectedRoute>
  )
}

// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="EXTERNAL">
      <MainDashboard roleGroup="EXTERNAL" />
    </ProtectedRoute>
  )
}
```

**3. Section-Level Permissions:**
```typescript
// Per-section role check
const SECTION_PERMISSIONS = {
  'create-invoice': ['ADMIN'], // Chỉ ADMIN
  'posts': ['ADMIN', 'EMPLOYEE'], // ADMIN + EMPLOYEE
  'profile': ['ADMIN', 'EMPLOYEE', 'CUSTOMER'], // All
}
```

---

### 7.5.2. Feature Registry Pattern 🏗️

**❌ Hiện tại (Switch-case hell):**
```typescript
switch(activeSection) {
  case 'profile': return <EditProfileTab />
  case 'services': return <ManageServices />
  // ... 16+ cases
}
```

**✅ Nên dùng (Scalable Registry):**

```typescript
// src/shared/config/dashboard-registry.ts
import { lazy } from 'react'
import { LucideIcon } from 'lucide-react'

interface SectionConfig {
  id: DashboardSection
  label: string
  icon: LucideIcon
  component: React.LazyExoticComponent<React.ComponentType<any>>
  roles: string[] // ['ADMIN', 'EMPLOYEE'] or ['CUSTOMER']
  category: string
  title: string // Breadcrumb title
  description?: string
}

// Lazy load components
const SECTION_REGISTRY: Record<DashboardSection, SectionConfig> = {
  // INTERNAL Sections
  'profile': {
    id: 'profile',
    label: 'Edit Profile',
    icon: User,
    component: lazy(() => import('@/features/admin/components/EditProfileTab')),
    roles: ['ADMIN', 'EMPLOYEE', 'CUSTOMER'],
    category: 'Profile',
    title: 'Edit Profile',
  },
  'create-invoice': {
    id: 'create-invoice',
    label: 'Create Invoice',
    icon: Calculator,
    component: lazy(() => import('@/features/admin/components/CreateInvoiceTab')),
    roles: ['ADMIN'], // Chỉ ADMIN mới tạo invoice
    category: 'Invoices',
    title: 'Create Invoice',
  },
  'services': {
    id: 'services',
    label: 'Services',
    icon: Cog,
    component: lazy(() => import('@/features/admin/components/ManageServices')),
    roles: ['ADMIN', 'EMPLOYEE'],
    category: 'Data Management',
    title: 'Manage Services',
  },
  // ... all other sections
}

// Helper functions
export function getSectionConfig(section: DashboardSection) {
  return SECTION_REGISTRY[section]
}

export function getSectionsByRole(role: string) {
  return Object.values(SECTION_REGISTRY).filter(s => 
    s.roles.includes(role)
  )
}

export function canAccessSection(section: DashboardSection, userRole: string) {
  const config = SECTION_REGISTRY[section]
  return config?.roles.includes(userRole) ?? false
}
```

**Usage in DashboardContent:**
```typescript
// src/shared/components/layout/dashboard/DashboardContent.tsx
import { Suspense } from 'react'
import { getSectionConfig, canAccessSection } from '@/shared/config/dashboard-registry'

export function DashboardContent({ section, userRole }) {
  const config = getSectionConfig(section)
  
  if (!config) return <NotFound />
  if (!canAccessSection(section, userRole)) return <AccessDenied />
  
  const Component = config.component
  
  return (
    <Suspense fallback={<SectionLoadingSkeleton />}>
      <Component />
    </Suspense>
  )
}
```

**Lợi ích:**
- ✅ Dễ thêm section mới (chỉ add vào registry)
- ✅ Lazy loading tự động
- ✅ Permission check tập trung
- ✅ Type-safe với TypeScript
- ✅ Dễ test

---

### 7.5.3. Error Boundary & Monitoring 🚨

**1. Error Boundary per Section:**
```typescript
// src/shared/components/error/SectionErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary'

function SectionErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button onClick={resetErrorBoundary} className="btn-primary">
        Try again
      </button>
    </div>
  )
}

export function SectionErrorBoundary({ children, sectionId }) {
  const handleError = (error, info) => {
    // Send to monitoring service
    console.error(`Error in section ${sectionId}:`, error, info)
    // TODO: Send to Sentry/LogRocket
  }
  
  return (
    <ErrorBoundary
      FallbackComponent={SectionErrorFallback}
      onError={handleError}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  )
}
```

**2. Toast System (Standardized):**
```typescript
// src/shared/utils/toast.ts
import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, { duration: 3000 })
  },
  error: (message: string, error?: Error) => {
    sonnerToast.error(message, { duration: 5000 })
    // Log to monitoring
    console.error(message, error)
  },
  loading: (message: string) => {
    return sonnerToast.loading(message)
  },
  promise: async <T,>(promise: Promise<T>, messages: {
    loading: string
    success: string
    error: string
  }) => {
    return sonnerToast.promise(promise, messages)
  }
}
```

**3. Loading Skeletons:**
```typescript
// src/shared/components/loading/SectionLoadingSkeleton.tsx
export function SectionLoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
```

**4. Telemetry Integration:**
```typescript
// src/shared/utils/monitoring.ts
import * as Sentry from '@sentry/nextjs'

export const monitoring = {
  captureException: (error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, { extra: context })
  },
  
  captureMessage: (message: string, level: 'info' | 'warning' | 'error') => {
    Sentry.captureMessage(message, level)
  },
  
  setUser: (user: { id: number; email: string; role: string }) => {
    Sentry.setUser({ id: user.id.toString(), email: user.email, role: user.role })
  },
  
  trackPageView: (page: string) => {
    // Analytics tracking
    console.log(`[Analytics] Page view: ${page}`)
  }
}
```

---

### 7.5.4. Performance Optimizations ⚡

**1. Lazy Loading & Code Splitting:**
```typescript
// Already in Registry pattern above
const component = lazy(() => import('@/features/admin/components/ManageServices'))
```

**2. Query Caching Strategy:**
```typescript
// src/shared/config/react-query.config.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
})

// Query keys registry
export const queryKeys = {
  inquiries: (type: string) => ['inquiries', type] as const,
  services: () => ['services'] as const,
  ports: () => ['ports'] as const,
  user: (id: number) => ['user', id] as const,
}
```

**3. Prefetching Strategy:**
```typescript
// Prefetch common data on dashboard mount
useEffect(() => {
  if (roleGroup === 'INTERNAL') {
    queryClient.prefetchQuery({
      queryKey: queryKeys.inquiries('all'),
      queryFn: () => inquiryService.getAll()
    })
  }
}, [roleGroup])
```

**4. Image Optimization:**
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image 
  src={imageUrl} 
  alt="..." 
  width={800} 
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

**5. Bundle Analysis:**
```bash
# Add to package.json
"analyze": "ANALYZE=true next build"
```

---

## 8. DESIGN DECISIONS ✅ CONFIRMED

**Decisions đã được approve:**

1. ✅ **URL Strategy**: Giữ nguyên `/dashboard` (EXTERNAL) và `/admin` (INTERNAL) riêng biệt
   - Lý do: Security, UX, Business logic alignment
   
2. ✅ **Component Location**: `src/shared/components/layout/dashboard/MainDashboard.tsx`
   - Shared layout component, reused by both routes
   
3. ❓ **QueryClient**: EXTERNAL users có cần không?
   - Recommend: Yes, để support future API calls (inquiry history, profile updates)
   
4. ✅ **Breadcrumb**: Dynamic based on activeSection
   - Format: `Dashboard > [Section Name]`
   
5. ❌ **Team Switcher**: Không cần cho MVP
   - Future feature: Multi-office/branch support

---

## 9. FINAL STRUCTURE SUMMARY

```
MainDashboard
├── Props: { roleGroup, initialSection, onNavigateHome }
├── Logic: Auto-detect roleGroup from user.role/user.roleGroup
├── Sidebar: Dynamic menu based on roleGroup
│   ├── INTERNAL: 6 categories, 16 sections
│   └── EXTERNAL: 2 sections flat
└── Content: Switch-case render section component
    ├── Shared: EditProfileTab
    ├── INTERNAL: 15 admin components
    └── EXTERNAL: UserInquiryHistoryTab
```

## 10. API INTEGRATION & FILE STRUCTURE 🗂️

### 10.1. API Services Structure (Hiện tại)

**Đã có sẵn các services:**
```
src/features/
├── auth/services/
│   └── authService.ts (login, register, getCurrentUser)
├── inquiries/services/
│   ├── inquiryService.ts (getAll, getById, create, update)
│   └── documentService.ts
├── gallery/services/
│   ├── galleryService.ts
│   └── imageTypeService.ts
├── logistics/services/
│   ├── portService.ts
│   └── provinceService.ts
├── content/services/
│   ├── postService.ts
│   └── categoryService.ts
└── services-config/services/
    ├── serviceTypeService.ts
    └── formFieldService.ts
```

**✅ API Services đầy đủ, KHÔNG CẦN TẠO THÊM**

---

### 10.2. Dashboard API Integration Pattern

**Cách gắn API chuẩn cho từng role:**

```typescript
// src/features/admin/services/dashboardService.ts (TẠO MỚI)
import { api } from '@/shared/lib/api'

interface DashboardStats {
  totalInquiries: number
  pendingInquiries: number
  totalInvoices: number
  recentActivities: Activity[]
}

export const dashboardService = {
  // INTERNAL Dashboard
  getAdminStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/admin/dashboard/stats')
    return response.data
  },
  
  getRecentInquiries: async (limit = 10) => {
    const response = await api.get('/api/admin/inquiries/recent', {
      params: { limit }
    })
    return response.data
  },
  
  // EXTERNAL Dashboard
  getCustomerStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/customer/dashboard/stats')
    return response.data
  },
  
  getMyInquiries: async () => {
    const response = await api.get('/api/customer/inquiries')
    return response.data
  }
}
```

**Usage trong components:**

```typescript
// src/features/admin/components/AdminDashboardOverview.tsx
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export function AdminDashboardOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: dashboardService.getAdminStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  
  if (isLoading) return <DashboardSkeleton />
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Inquiries" value={data.totalInquiries} />
      <StatCard title="Pending" value={data.pendingInquiries} />
      {/* ... */}
    </div>
  )
}
```

---

### 10.3. Folder Structure - NEW vs OLD

**✅ Cấu trúc MỚI (Sau khi implement):**

```
src/
├── features/
│   ├── admin/
│   │   ├── components/
│   │   │   ├── AdminDashboardOverview.tsx (NEW - dashboard overview)
│   │   │   ├── EditProfileTab.tsx (GIỮ NGUYÊN)
│   │   │   ├── CreateInvoiceTab.tsx (GIỮ NGUYÊN)
│   │   │   ├── ManageServices.tsx (GIỮ NGUYÊN)
│   │   │   └── ... (tất cả admin tabs)
│   │   ├── services/
│   │   │   └── dashboardService.ts (NEW - admin dashboard API)
│   │   └── hooks/
│   │       └── useDashboardStats.ts (NEW - custom hook)
│   │
│   ├── user/
│   │   └── components/
│   │       ├── UserDashboardOverview.tsx (NEW - customer dashboard overview)
│   │       ├── EditProfileTab.tsx (GIỮ NGUYÊN - shared)
│   │       └── UserInquiryHistoryTab.tsx (GIỮ NGUYÊN)
│   │
│   └── ... (other features unchanged)
│
├── shared/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx (NEW)
│   │   ├── error/
│   │   │   └── SectionErrorBoundary.tsx (NEW)
│   │   ├── loading/
│   │   │   └── SectionLoadingSkeleton.tsx (NEW)
│   │   └── layout/
│   │       └── dashboard/
│   │           ├── MainDashboard.tsx (NEW ⭐)
│   │           ├── DashboardContent.tsx (NEW ⭐)
│   │           └── ui/
│   │               ├── app-sidebar.tsx (UPDATE)
│   │               ├── nav-main.tsx (GIỮ NGUYÊN)
│   │               ├── nav-user.tsx (GIỮ NGUYÊN)
│   │               └── ... (other UI components)
│   │
│   ├── config/
│   │   ├── dashboard-registry.ts (NEW ⭐)
│   │   └── react-query.config.ts (NEW)
│   │
│   ├── utils/
│   │   ├── auth.ts (NEW - getRoleGroup)
│   │   ├── toast.ts (NEW)
│   │   └── monitoring.ts (NEW - Sentry)
│   │
│   └── lib/
│       └── api.ts (GIỮ NGUYÊN - axios instance)
│
└── app/
    ├── dashboard/
    │   └── page.tsx (UPDATE - use MainDashboard)
    └── admin/
        └── page.tsx (UPDATE - use MainDashboard)
```

---

### 10.4. Files SẼ XÓA / DEPRECATED ❌

**KHÔNG XÓA hoàn toàn, nhưng sẽ DEPRECATED:**

```
✅ GIỮ LẠI (Có thể rollback nếu cần):
src/features/admin/components/AdminDashboard.tsx
src/features/user/components/UserDashboard.tsx

❌ KHÔNG DÙNG NỮA sau khi migration:
- AdminDashboard.tsx sẽ được thay bằng MainDashboard với roleGroup="INTERNAL"
- UserDashboard.tsx sẽ được thay bằng MainDashboard với roleGroup="EXTERNAL"

📝 STRATEGY:
1. Comment out old imports
2. Keep files for 1-2 sprints
3. Xóa sau khi verify MainDashboard stable
```

**Migration path:**

```typescript
// OLD: app/admin/page.tsx
import { AdminPage } from '@/features/admin/components/AdminDashboard'
export default function Admin() {
  return <AdminPage onNavigateHome={() => router.push('/')} />
}

// NEW: app/admin/page.tsx
import { MainDashboard } from '@/shared/components/layout/dashboard/MainDashboard'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="INTERNAL">
      <MainDashboard roleGroup="INTERNAL" initialSection="profile" />
    </ProtectedRoute>
  )
}
```

---

### 10.5. Backend API Endpoints Requirements

**Cần backend team chuẩn bị:**

```java
// INTERNAL Dashboard APIs
GET /api/admin/dashboard/stats
GET /api/admin/dashboard/recent-activities
GET /api/admin/dashboard/pending-inquiries

// EXTERNAL Dashboard APIs  
GET /api/customer/dashboard/stats
GET /api/customer/dashboard/my-inquiries
GET /api/customer/dashboard/notifications

// Shared APIs (Already exist)
GET /api/users/profile
PUT /api/users/profile
GET /api/inquiries (với role-based filter)
```

**Response format chuẩn:**
```json
{
  "success": true,
  "data": {
    "totalInquiries": 150,
    "pendingInquiries": 23,
    "recentActivities": [...]
  },
  "message": "Success"
}
```

---

### 10.6. Implementation Checklist với API

**Phase 1: Setup**
- [ ] Tạo `src/features/admin/services/dashboardService.ts`
- [ ] Tạo `src/features/user/services/dashboardService.ts` (customer)
- [ ] Tạo custom hooks: `useDashboardStats()`, `useRecentInquiries()`

**Phase 2: Components**
- [ ] Tạo `AdminDashboardOverview.tsx` (kết nối API)
- [ ] Tạo `UserDashboardOverview.tsx` (kết nối API)
- [ ] Tạo `MainDashboard.tsx` (layout wrapper)

**Phase 3: Migration**
- [ ] Update `app/admin/page.tsx` dùng MainDashboard
- [ ] Update `app/dashboard/page.tsx` dùng MainDashboard
- [ ] Test API integration với cả 2 roles
- [ ] Comment out old AdminDashboard/UserDashboard

**Phase 4: Cleanup**
- [ ] Verify MainDashboard stable 1-2 sprints
- [ ] Archive old dashboard files
- [ ] Update documentation

---

## 11. IMPLEMENTATION READY ✅

**Plan Status: APPROVED & READY FOR IMPLEMENTATION**

**Confirmed Scope:**
- ✅ Features: Không thiếu, không thừa (100% từ code hiện tại)
- ✅ Navigation: Hợp lý với nghiệp vụ doanh nghiệp
- ✅ Routing: 2 routes riêng biệt (`/dashboard` + `/admin`)
- ✅ Architecture: Shared MainDashboard component với role-based rendering
- ✅ API Strategy: Reuse existing services + Add dashboard-specific APIs
- ✅ File Structure: Clear separation, không xóa file cũ ngay

**Backend Requirements:**
- [ ] GET `/api/admin/dashboard/stats`
- [ ] GET `/api/customer/dashboard/stats`
- [ ] Response format chuẩn với ApiResponse wrapper

**Next Steps:**
1. [ ] Implement `getRoleGroup()` utility function
2. [ ] Create dashboard services (admin + customer)
3. [ ] Create `MainDashboard.tsx` unified component
4. [ ] Update `/dashboard/page.tsx` và `/admin/page.tsx`
5. [ ] Test với INTERNAL và EXTERNAL users
6. [ ] Refactor các nơi dùng manual `derivedGroup`

**Ready to start implementation! 🚀
## 10. CÂU HỎI DUYỆT REVIEW

**Bạn vui lòng review và confirm:**
1. Có thiếu hoặc thừa features nào không?
2. Navigation structure có hợp lý với nghiệp vụ không?
3. Có cần thêm/bớt sections nào không?
4. Strategy implementation (giữ 2 routes vs merge 1 route) - chọn phương án nào?

**Sau khi approve, tôi sẽ proceed với implementation theo đúng plan này.**
