# Frontend Folder Structure Refactoring Guide
**Enterprise-Grade Organization for Seatrans Application**

---

## 📋 Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Problems Identified](#problems-identified)
3. [Proposed Enterprise Structure](#proposed-enterprise-structure)
4. [Migration Plan](#migration-plan)
5. [Implementation Checklist](#implementation-checklist)

---

## 🔍 Current State Analysis

### Current Structure (❌ Problematic)

```
src/
├── assets/                          # ❌ Not organized by usage
│   └── newvn.json
├── components/                      # ❌ Ambiguous - shared or feature?
│   └── NProgressProvider.tsx
├── features/                        # ⚠️ Mixed access levels
│   ├── admin/                       # ✅ Clear role
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── auth/                        # ⚠️ Should be in shared
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   ├── content/                     # ⚠️ Mixed admin/public
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── gallery/                     # ⚠️ Mixed admin/public
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── inquiries/                   # ⚠️ Mixed admin/user
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── landing/                     # ✅ Clear purpose (public)
│   │   ├── components/
│   │   └── data/
│   ├── logistics/                   # ⚠️ Only services, incomplete
│   │   └── services/
│   ├── services-config/             # ⚠️ Unclear naming
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   └── user/                        # ✅ Clear role
│       └── components/
├── hooks/                           # ❌ DUPLICATE with shared/hooks
│   ├── use-mobile.ts
│   ├── use-mobile.tsx               # ❌ Duplicate filename
│   └── useLinkNavigation.ts
├── shared/                          # ⚠️ Good concept, needs organization
│   ├── components/
│   │   ├── auth/
│   │   ├── error/
│   │   ├── layout/
│   │   ├── loading/
│   │   └── ui/
│   ├── config/
│   ├── hooks/                       # ✅ Proper location
│   │   └── hooks/                   # ❌ Nested hooks folder (typo?)
│   ├── lib/
│   ├── types/
│   └── utils/
├── styles/                          # ✅ Clear purpose
│   └── nprogress.css
├── types/                           # ❌ DUPLICATE with shared/types
│   ├── css.d.ts
│   ├── dashboard.ts
│   └── geojson.d.ts
└── utils/                           # ❌ DUPLICATE with shared/utils
    ├── geoUtils.ts
    ├── provinceCoordinates.ts
    └── provinceMapping.ts
```

---

## 🚨 Problems Identified

### 1. **Duplicate Folders**
- `hooks/` vs `shared/hooks/`
- `utils/` vs `shared/utils/`
- `types/` vs `shared/types/`
- `shared/hooks/hooks/` (nested duplication)

### 2. **Mixed Access Levels**
Features don't clearly separate:
- **Public** (unauthenticated users)
- **User** (authenticated customers)
- **Admin** (internal staff)

### 3. **Unclear Naming**
- `services-config/` - What is this? Service type management?
- `logistics/` - Only has services, missing components
- `content/` - Contains both PostManagement (admin) and public articles

### 4. **Inconsistent Organization**
- Some features have `components/services/types/hooks`
- Some only have `services/`
- `auth/` should be in shared, not features

### 5. **Asset Management**
- `assets/` not organized by feature or usage
- Hard to find what assets belong to which module

---

## ✅ Proposed Enterprise Structure

### Target Structure (Enterprise-Grade)

```
src/
├── app/                             # ✨ Next.js App Router (if using)
│   └── (routes here)
│
├── shared/                          # 🎯 SHARED ACROSS ALL FEATURES
│   ├── assets/                      # Centralized assets
│   │   ├── icons/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── data/
│   │       └── newvn.json
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── dashboard/
│   │   ├── feedback/                # User feedback
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Toast.tsx
│   │   └── common/                  # Common reusable
│   │       ├── ImageWithFallback.tsx
│   │       ├── PdfPreviewDialog.tsx
│   │       └── NProgressProvider.tsx
│   ├── config/                      # App-wide configuration
│   │   ├── api.config.ts            # ⭐ API endpoints
│   │   ├── app.config.ts            # App settings
│   │   ├── dashboard-registry.ts
│   │   └── react-query.config.ts
│   ├── hooks/                       # Shared custom hooks
│   │   ├── useAuth.ts
│   │   ├── useMobile.ts
│   │   ├── useIntersectionObserver.ts
│   │   └── useToast.ts
│   ├── lib/                         # Third-party lib configs
│   │   ├── axios.ts
│   │   ├── utils.ts                 # cn() helper
│   │   └── compose-refs.ts
│   ├── services/                    # ⭐ NEW: Centralized API client
│   │   ├── apiClient.ts             # Base HTTP client
│   │   └── baseService.ts           # Base service class
│   ├── types/                       # Shared TypeScript types
│   │   ├── api.types.ts             # API response types
│   │   ├── common.types.ts
│   │   ├── css.d.ts
│   │   └── geojson.d.ts
│   ├── utils/                       # Shared utility functions
│   │   ├── date.utils.ts
│   │   ├── format.utils.ts
│   │   ├── validation.utils.ts
│   │   ├── geo.utils.ts
│   │   ├── monitoring.ts
│   │   └── toast.ts
│   └── styles/                      # Global styles
│       ├── globals.css
│       └── nprogress.css
│
├── modules/                         # 🎯 BUSINESS MODULES (by domain)
│   ├── auth/                        # Authentication & Authorization
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── utils/
│   │       └── auth.utils.ts
│   │
│   ├── posts/                       # Blog/News/Insights Module
│   │   ├── components/
│   │   │   ├── public/              # Public-facing
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── PostList.tsx
│   │   │   │   ├── PostDetail.tsx
│   │   │   │   └── LatestPosts.tsx
│   │   │   └── admin/               # Admin management
│   │   │       ├── PostEditor.tsx
│   │   │       ├── PostManagement.tsx
│   │   │       └── PostForm.tsx
│   │   ├── services/
│   │   │   └── postService.ts
│   │   ├── types/
│   │   │   └── post.types.ts
│   │   └── hooks/
│   │       └── usePostEditor.ts
│   │
│   ├── categories/                  # Content Categories
│   │   ├── components/
│   │   │   ├── public/
│   │   │   │   └── CategoryFilter.tsx
│   │   │   └── admin/
│   │   │       └── CategoryManagement.tsx
│   │   ├── services/
│   │   │   └── categoryService.ts
│   │   └── types/
│   │       └── category.types.ts
│   │
│   ├── gallery/                     # Image Gallery Module
│   │   ├── components/
│   │   │   ├── public/              # Public gallery
│   │   │   │   ├── GalleryGrid.tsx
│   │   │   │   ├── FieldGallery.tsx
│   │   │   │   └── ImageViewer.tsx
│   │   │   └── admin/               # Admin image management
│   │   │       ├── ImageManagement.tsx
│   │   │       ├── ImageUpload.tsx
│   │   │       └── ImageTypeManagement.tsx
│   │   ├── services/
│   │   │   ├── galleryService.ts
│   │   │   └── imageTypeService.ts
│   │   └── types/
│   │       └── gallery.types.ts
│   │
│   ├── inquiries/                   # Customer Inquiry System
│   │   ├── components/
│   │   │   ├── public/              # Public inquiry form
│   │   │   │   ├── InquiryForm.tsx
│   │   │   │   └── ContactPage.tsx
│   │   │   ├── user/                # User's inquiry history
│   │   │   │   └── InquiryHistory.tsx
│   │   │   └── admin/               # Admin inquiry management
│   │   │       ├── InquiryList.tsx
│   │   │       ├── ShippingAgencyTab.tsx
│   │   │       ├── CharteringTab.tsx
│   │   │       ├── FreightForwardingTab.tsx
│   │   │       ├── LogisticsTab.tsx
│   │   │       └── SpecialRequestTab.tsx
│   │   ├── services/
│   │   │   ├── inquiryService.ts
│   │   │   └── documentService.ts
│   │   └── types/
│   │       └── inquiry.types.ts
│   │
│   ├── logistics/                   # Logistics Management
│   │   ├── components/
│   │   │   ├── public/
│   │   │   │   ├── ProvinceSelector.tsx
│   │   │   │   ├── PortSelector.tsx
│   │   │   │   └── CoverageMap.tsx
│   │   │   └── admin/
│   │   │       ├── ManagePorts.tsx
│   │   │       ├── ManageOffices.tsx
│   │   │       └── OfficeForm.tsx
│   │   ├── services/
│   │   │   ├── provinceService.ts
│   │   │   ├── portService.ts
│   │   │   └── officeService.ts
│   │   ├── types/
│   │   │   ├── province.types.ts
│   │   │   ├── port.types.ts
│   │   │   └── office.types.ts
│   │   └── utils/
│   │       ├── provinceMapping.ts
│   │       ├── provinceCoordinates.ts
│   │       └── geoUtils.ts
│   │
│   ├── service-types/               # Service Configuration
│   │   ├── components/
│   │   │   ├── public/
│   │   │   │   ├── ServiceCard.tsx
│   │   │   │   └── ServiceSelector.tsx
│   │   │   └── admin/
│   │   │       └── ManageServices.tsx
│   │   ├── services/
│   │   │   └── serviceTypeService.ts
│   │   └── types/
│   │       └── serviceType.types.ts
│   │
│   ├── landing/                     # Landing Page Module
│   │   ├── components/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Updates.tsx
│   │   │   ├── Coverage.tsx
│   │   │   └── CallToAction.tsx
│   │   └── data/
│   │       └── landingData.ts
│   │
│   └── users/                       # User Management
│       ├── components/
│       │   ├── UserProfile.tsx
│       │   ├── UserDashboard.tsx
│       │   └── admin/
│       │       └── UserManagement.tsx
│       ├── services/
│       │   └── userService.ts
│       └── types/
│           └── user.types.ts
│
└── features/                        # 🎯 CROSS-CUTTING FEATURES (by role)
    ├── admin/                       # Admin-specific features
    │   ├── components/
    │   │   ├── AdminDashboard.tsx
    │   │   ├── AdminLayout.tsx
    │   │   ├── CreateInvoiceTab.tsx
    │   │   ├── EditProfileTab.tsx
    │   │   └── FileUploadDialog.tsx
    │   ├── hooks/
    │   │   └── useFileManagement.ts
    │   └── types/
    │       └── spreadsheet-file.types.ts
    │
    └── public/                      # Public-facing features
        ├── components/
        │   ├── PublicLayout.tsx
        │   └── PublicNav.tsx
        └── hooks/
            └── useLinkNavigation.ts
```

---

## 📐 Structure Principles

### 1. **Separation by Concern**

#### **`shared/`** - Infrastructure Layer
- Components, hooks, utils used across ALL modules
- No business logic
- Technology-focused (UI components, HTTP client, config)
- Examples: Button, Dialog, apiClient, useToast

#### **`modules/`** - Business Domain Layer
- Organized by **business domain** (posts, gallery, inquiries)
- Each module is **self-contained** with components/services/types
- Split by access level **within** module: `public/`, `user/`, `admin/`
- Domain-focused (posts, users, logistics)

#### **`features/`** - Role-Based Layer
- Organized by **user role** (admin, public)
- Cross-cutting concerns that span multiple modules
- Role-specific layouts, dashboards, workflows

---

## 🔄 Migration Plan

### Phase 1: Create New Structure (No Breaking Changes)

#### Step 1.1: Create Folders
```bash
# Create new structure
mkdir -p src/shared/{assets,services}
mkdir -p src/modules/{auth,posts,categories,gallery,inquiries,logistics,service-types,landing,users}
mkdir -p src/features/{admin,public}
```

#### Step 1.2: Move Shared Assets
```bash
# Move assets
mv src/assets/* src/shared/assets/data/

# Move root-level duplicates to shared
mv src/types/* src/shared/types/
mv src/hooks/* src/shared/hooks/
mv src/utils/* src/shared/utils/

# Fix nested hooks
mv src/shared/hooks/hooks/* src/shared/hooks/
rmdir src/shared/hooks/hooks/
```

#### Step 1.3: Create API Layer
```bash
# NEW files to create:
# src/shared/config/api.config.ts
# src/shared/services/apiClient.ts
# src/shared/types/api.types.ts
```

---

### Phase 2: Reorganize Modules

#### Module 1: Auth (shared infrastructure)
```bash
# Auth is infrastructure, stays in modules/
mv src/features/auth src/modules/auth
```

#### Module 2: Posts & Categories
```bash
# Create posts module structure
mkdir -p src/modules/posts/components/{public,admin}
mkdir -p src/modules/posts/services
mkdir -p src/modules/posts/types

# Move files
mv src/features/content/components/PostEditor.tsx src/modules/posts/components/admin/
mv src/features/content/components/PostManagement.tsx src/modules/posts/components/admin/
mv src/features/content/components/ArticleDetailPage.tsx src/modules/posts/components/public/
mv src/features/content/components/Insights/* src/modules/posts/components/public/
mv src/features/content/services/postService.ts src/modules/posts/services/

# Categories
mkdir -p src/modules/categories/components/{public,admin}
mv src/features/content/components/CategoryManagement.tsx src/modules/categories/components/admin/
mv src/features/content/services/categoryService.ts src/modules/categories/services/
```

#### Module 3: Gallery
```bash
mkdir -p src/modules/gallery/components/{public,admin}
mkdir -p src/modules/gallery/services

# Move files
mv src/features/gallery/components/FieldGallery.tsx src/modules/gallery/components/public/
mv src/features/gallery/components/ImageManagement.tsx src/modules/gallery/components/admin/
mv src/features/gallery/components/ImageTypeManagement.tsx src/modules/gallery/components/admin/
mv src/features/gallery/components/ImageUpload.tsx src/modules/gallery/components/admin/
```

#### Module 4: Inquiries
```bash
mkdir -p src/modules/inquiries/components/{public,user,admin}
mkdir -p src/modules/inquiries/services

# Move admin tabs
mv src/features/admin/components/ShippingAgencyInquiriesTab.tsx src/modules/inquiries/components/admin/
mv src/features/admin/components/CharteringInquiriesTab.tsx src/modules/inquiries/components/admin/
mv src/features/admin/components/FreightForwardingInquiriesTab.tsx src/modules/inquiries/components/admin/
mv src/features/admin/components/LogisticsInquiriesTab.tsx src/modules/inquiries/components/admin/
mv src/features/admin/components/SpecialRequestInquiriesTab.tsx src/modules/inquiries/components/admin/
```

#### Module 5: Logistics
```bash
mkdir -p src/modules/logistics/components/{public,admin}
mkdir -p src/modules/logistics/services
mkdir -p src/modules/logistics/utils

# Move files
mv src/features/admin/components/ManagePorts.tsx src/modules/logistics/components/admin/
mv src/features/admin/components/ManageOffices.tsx src/modules/logistics/components/admin/
mv src/features/logistics/services/* src/modules/logistics/services/
mv src/utils/provinceMapping.ts src/modules/logistics/utils/
mv src/utils/provinceCoordinates.ts src/modules/logistics/utils/
mv src/utils/geoUtils.ts src/modules/logistics/utils/
```

#### Module 6: Service Types
```bash
mkdir -p src/modules/service-types/components/{public,admin}
mkdir -p src/modules/service-types/services

# Move from services-config
mv src/features/services-config src/modules/service-types
mv src/features/admin/components/ManageServices.tsx src/modules/service-types/components/admin/
```

#### Module 7: Landing
```bash
# Landing is already good, just move
mv src/features/landing src/modules/landing
```

#### Module 8: Users
```bash
mkdir -p src/modules/users/components/{user,admin}

# Move user dashboard
mv src/features/user/components/* src/modules/users/components/user/
```

---

### Phase 3: Reorganize Admin Features

```bash
# Keep only cross-cutting admin features
mkdir -p src/features/admin/components

# Move cross-cutting admin components
mv src/features/admin/components/AdminDashboard.tsx src/features/admin/components/
mv src/features/admin/components/CreateInvoiceTab.tsx src/features/admin/components/
mv src/features/admin/components/EditProfileTab.tsx src/features/admin/components/
mv src/features/admin/components/FileUploadDialog.tsx src/features/admin/components/

# Keep admin hooks and types
# src/features/admin/hooks/
# src/features/admin/types/
```

---

### Phase 4: Update Imports

#### Create Path Aliases (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/shared/*": ["src/shared/*"],
      "@/modules/*": ["src/modules/*"],
      "@/features/*": ["src/features/*"],
      "@/app/*": ["src/app/*"]
    }
  }
}
```

#### Update Imports Script
```typescript
// Example import updates:

// ❌ OLD:
import { provinceService } from '@/features/logistics/services/provinceService'
import LoginForm from '@/features/auth/components/LoginForm'
import { Button } from '@/shared/components/ui/button'

// ✅ NEW:
import { provinceService } from '@/modules/logistics/services/provinceService'
import LoginForm from '@/modules/auth/components/LoginForm'
import { Button } from '@/shared/components/ui/button'
```

---

## ✅ Implementation Checklist

### Phase 1: Setup Foundation
- [ ] Create new folder structure (shared, modules, features)
- [ ] Move root-level duplicates to shared
  - [ ] `types/` → `shared/types/`
  - [ ] `hooks/` → `shared/hooks/`
  - [ ] `utils/` → `shared/utils/`
  - [ ] `assets/` → `shared/assets/`
- [ ] Fix `shared/hooks/hooks/` nested folder
- [ ] Create API layer files:
  - [ ] `shared/config/api.config.ts`
  - [ ] `shared/services/apiClient.ts`
  - [ ] `shared/types/api.types.ts`
- [ ] Move `components/NProgressProvider.tsx` to `shared/components/common/`

### Phase 2: Reorganize Modules
- [ ] **Auth Module**
  - [ ] Move `features/auth/` → `modules/auth/`
  - [ ] Update imports in AuthContext, LoginForm, SignupForm
- [ ] **Posts Module**
  - [ ] Create `modules/posts/components/{public,admin}`
  - [ ] Move PostEditor → `admin/`
  - [ ] Move ArticleDetail, PostList → `public/`
  - [ ] Move postService.ts
  - [ ] Update all imports
- [ ] **Categories Module**
  - [ ] Create `modules/categories/`
  - [ ] Move CategoryManagement → `admin/`
  - [ ] Move categoryService.ts
- [ ] **Gallery Module**
  - [ ] Create `modules/gallery/components/{public,admin}`
  - [ ] Move FieldGallery → `public/`
  - [ ] Move ImageManagement, ImageTypeManagement, ImageUpload → `admin/`
  - [ ] Move gallery services
- [ ] **Inquiries Module**
  - [ ] Create `modules/inquiries/components/{public,user,admin}`
  - [ ] Move all inquiry tabs from `features/admin/` → `admin/`
  - [ ] Move inquiry services
- [ ] **Logistics Module**
  - [ ] Create `modules/logistics/components/{public,admin}`
  - [ ] Move ManagePorts, ManageOffices → `admin/`
  - [ ] Move province/port services
  - [ ] Move geo utils
- [ ] **Service Types Module**
  - [ ] Rename `services-config/` → `modules/service-types/`
  - [ ] Move ManageServices → `admin/`
- [ ] **Landing Module**
  - [ ] Move `features/landing/` → `modules/landing/`
- [ ] **Users Module**
  - [ ] Create `modules/users/components/{user,admin}`
  - [ ] Move user dashboard components

### Phase 3: Clean Up Features
- [ ] **Admin Feature** (keep only cross-cutting)
  - [ ] Keep AdminDashboard
  - [ ] Keep CreateInvoiceTab
  - [ ] Keep EditProfileTab
  - [ ] Keep FileUploadDialog
  - [ ] Keep admin hooks and types
  - [ ] Remove module-specific components (moved to modules)
- [ ] **Public Feature**
  - [ ] Create `features/public/` if needed
  - [ ] Move public-specific cross-cutting features

### Phase 4: Update Configuration
- [ ] Update `tsconfig.json` with new path aliases
- [ ] Update `next.config.js` if needed
- [ ] Update `.eslintrc.json` import rules
- [ ] Update VSCode settings for path intellisense

### Phase 5: Update Imports
- [ ] Run find-and-replace for import paths:
  - [ ] `@/features/auth` → `@/modules/auth`
  - [ ] `@/features/content` → `@/modules/posts` or `@/modules/categories`
  - [ ] `@/features/gallery` → `@/modules/gallery`
  - [ ] `@/features/logistics` → `@/modules/logistics`
  - [ ] `@/features/services-config` → `@/modules/service-types`
  - [ ] `@/features/landing` → `@/modules/landing`
  - [ ] `@/features/user` → `@/modules/users`
- [ ] Fix broken imports in components
- [ ] Fix broken imports in services
- [ ] Fix broken imports in pages/app router

### Phase 6: Testing & Validation
- [ ] Test all pages load without import errors
- [ ] Test admin dashboard functionality
- [ ] Test user dashboard functionality
- [ ] Test public pages functionality
- [ ] Verify no broken imports in dev console
- [ ] Run TypeScript compiler check: `npm run type-check`
- [ ] Run build: `npm run build`

### Phase 7: Cleanup
- [ ] Delete old empty folders:
  - [ ] `src/features/content/`
  - [ ] `src/features/services-config/`
  - [ ] Root `src/types/`, `src/hooks/`, `src/utils/`
- [ ] Update documentation
- [ ] Update README with new structure

---

## 📊 Before & After Comparison

### Example: Gallery Module

#### ❌ BEFORE (Scattered)
```
src/
├── features/gallery/
│   └── components/
│       ├── FieldGallery.tsx          # Public
│       ├── ImageManagement.tsx       # Admin
│       └── ImageUpload.tsx           # Admin
└── features/admin/
    └── components/
        ├── ManageImagesTab.tsx        # Admin gallery
        └── ManageImageTypes.tsx       # Admin image types
```

#### ✅ AFTER (Organized)
```
src/
└── modules/gallery/
    ├── components/
    │   ├── public/
    │   │   └── FieldGallery.tsx       # ✅ Clear: Public gallery
    │   └── admin/
    │       ├── ImageManagement.tsx    # ✅ Clear: Admin management
    │       ├── ImageUpload.tsx        # ✅ Clear: Admin upload
    │       └── ImageTypeManagement.tsx # ✅ Clear: Admin types
    ├── services/
    │   ├── galleryService.ts
    │   └── imageTypeService.ts
    └── types/
        └── gallery.types.ts
```

---

## 🎯 Benefits of New Structure

### 1. **Clear Separation of Concerns**
- ✅ Shared infrastructure in `shared/`
- ✅ Business logic in `modules/`
- ✅ Role-specific features in `features/`

### 2. **Scalability**
- ✅ Easy to add new modules
- ✅ Each module is self-contained
- ✅ No cross-module dependencies

### 3. **Discoverability**
- ✅ Clear where to find public vs admin components
- ✅ Module name matches business domain
- ✅ Consistent folder structure across modules

### 4. **Maintainability**
- ✅ No duplicate folders
- ✅ Single source of truth for shared code
- ✅ Easy to refactor individual modules

### 5. **Team Collaboration**
- ✅ Clear ownership boundaries
- ✅ Parallel development without conflicts
- ✅ Easy onboarding for new developers

---

## 🔧 Migration Commands

### Quick Migration Script (PowerShell)
```powershell
# Navigate to src directory
cd z_Seatrans_Redesign/src

# Create new structure
New-Item -ItemType Directory -Force -Path "shared/assets/data"
New-Item -ItemType Directory -Force -Path "shared/services"
New-Item -ItemType Directory -Force -Path "modules/auth"
New-Item -ItemType Directory -Force -Path "modules/posts/components/public"
New-Item -ItemType Directory -Force -Path "modules/posts/components/admin"
New-Item -ItemType Directory -Force -Path "modules/gallery/components/public"
New-Item -ItemType Directory -Force -Path "modules/gallery/components/admin"
# ... (continue for all modules)

# Move files (example)
Move-Item -Path "assets/*" -Destination "shared/assets/data/"
Move-Item -Path "features/auth" -Destination "modules/auth"
# ... (continue for all moves)

# Clean up empty directories
Remove-Item -Path "types" -Recurse -Force
Remove-Item -Path "hooks" -Recurse -Force
Remove-Item -Path "utils" -Recurse -Force
```

---

## 📚 Additional Recommendations

### 1. **Naming Conventions**
- Use **plural** for modules: `posts`, `users`, `categories`
- Use **singular** for utilities: `authService`, `provinceMapping`
- Use **PascalCase** for components: `PostEditor.tsx`
- Use **camelCase** for services: `postService.ts`

### 2. **Barrel Exports**
Create `index.ts` in each module:
```typescript
// modules/posts/index.ts
export * from './components/public/PostCard'
export * from './components/public/PostList'
export * from './services/postService'
export * from './types/post.types'
```

### 3. **Module Dependencies**
- Modules should **NOT** depend on each other
- All cross-module communication through **services**
- Shared types in `shared/types/`

### 4. **Testing Structure**
Mirror source structure in tests:
```
tests/
├── shared/
├── modules/
│   ├── posts/
│   ├── gallery/
│   └── ...
└── features/
```

---

## 🚀 Next Steps After Refactoring

1. **API Standardization** (Already have guide)
   - Implement `shared/config/api.config.ts`
   - Implement `shared/services/apiClient.ts`
   - Refactor all services to use centralized API client

2. **State Management**
   - Consider React Query for server state
   - Consider Zustand/Jotai for client state
   - Separate concerns: server vs client state

3. **Documentation**
   - Add README.md to each module
   - Document module dependencies
   - Create component storybook

4. **CI/CD**
   - Add lint rules for import paths
   - Add tests for critical paths
   - Setup automated refactoring checks

---

**Last Updated:** January 19, 2026  
**Version:** 1.0.0  
**Status:** Ready for Implementation
