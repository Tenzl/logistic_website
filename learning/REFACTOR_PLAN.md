# Frontend Refactoring Plan - Vertical Slice Architecture

## Current State Analysis

### Problems
1. **Mixed Component Organization**
   - `src/components/` mixes shared (Footer, ScrollToTop) with feature components (Hero, Partners, ShippingAgencyConfig)
   - Some features already in `src/features/`, others still in `src/components/`
   - Duplicate structures causing confusion

2. **Import Chaos**
   - Pages import from `src/components/` when `src/features/` exists
   - Inconsistent import paths: `../../src/components/` vs `@/features/`
   - No clear alias configuration

3. **Header Location Mismatch**
   - Header exists in `src/shared/components/Header/`
   - Pages expect it at `app/(root)/components/Header/`
   - Leading to import errors

4. **No Clear Boundaries**
   - Hard to know if component is shared or feature-specific
   - Difficult to understand dependencies between features

## Target Architecture

```
📦 app/                              (Next.js App Router)
  ├── (root)/                        (Root layout group)
  │   └── components/                (Root-level page components only)
  │       └── Header/                (Navigation header)
  ├── layout.tsx                     (Root layout with providers)
  └── [feature-routes]/              (Route pages - thin wrappers)

📦 src/
  ├── features/                      (⭐ Vertical Slices)
  │   ├── auth/
  │   │   ├── components/            (LoginForm, SignupForm)
  │   │   ├── services/              (authService.ts)
  │   │   ├── context/               (AuthContext.tsx)
  │   │   ├── hooks/                 (useAuth.ts)
  │   │   └── types/                 (auth.types.ts)
  │   │
  │   ├── content/                   (Posts & Insights)
  │   │   ├── components/
  │   │   │   ├── Insights/          (PostPage, PostCard)
  │   │   │   ├── PostEditor.tsx
  │   │   │   ├── PostManagement.tsx
  │   │   │   └── CategoryManagement.tsx
  │   │   ├── services/              (postService, categoryService)
  │   │   └── types/
  │   │
  │   ├── gallery/                   (Image galleries)
  │   │   ├── components/            (FieldGallery, ImageUpload, ImageManagement)
  │   │   ├── services/              (galleryService, imageTypeService)
  │   │   └── types/
  │   │
  │   ├── services-config/           (Service pages configuration)
  │   │   ├── components/
  │   │   │   ├── ServiceTemplate.tsx
  │   │   │   ├── ShippingAgencyConfig.tsx
  │   │   │   ├── FreightForwardingConfig.tsx
  │   │   │   ├── CharteringBrokingConfig.tsx
  │   │   │   └── sections/          (Reusable page sections)
  │   │   ├── services/              (serviceTypeService)
  │   │   └── types/
  │   │
  │   ├── logistics/                 (Ports, Provinces)
  │   │   ├── components/            (PortManagement)
  │   │   ├── services/              (portService, provinceService)
  │   │   └── types/
  │   │
  │   ├── inquiries/                 (Contact & inquiry forms)
  │   │   ├── components/            (ContactPage, InquiryManagement)
  │   │   ├── services/              (inquiryService)
  │   │   └── types/
  │   │
  │   ├── landing/                   (Homepage sections)
  │   │   ├── components/
  │   │   │   ├── Hero.tsx
  │   │   │   ├── Solutions.tsx
  │   │   │   ├── Coverage.tsx
  │   │   │   ├── Partners.tsx
  │   │   │   └── Updates/
  │   │   └── types/
  │   │
  │   └── admin/                     (Admin dashboard)
  │       ├── components/            (AdminDashboard, AdminSidebar, EditProfile)
  │       └── types/
  │
  ├── shared/                        (⭐ Shared Kernel)
  │   ├── components/                (Cross-feature components)
  │   │   ├── layout/
  │   │   │   ├── Header/            (NavMenu, UserNav, menuData)
  │   │   │   ├── Footer.tsx
  │   │   │   └── ScrollToTop.tsx
  │   │   └── ui/                    (shadcn components)
  │   │       ├── button.tsx
  │   │       ├── navigation-menu.tsx
  │   │       └── [...]
  │   │
  │   ├── hooks/                     (Shared hooks)
  │   │   ├── useAuth.ts
  │   │   ├── useMediaQuery.ts
  │   │   └── useDebounce.ts
  │   │
  │   ├── lib/                       (Utilities & configs)
  │   │   ├── utils.ts               (cn, formatters)
  │   │   ├── axios.ts               (API client config)
  │   │   └── constants.ts
  │   │
  │   └── types/                     (Global types)
  │       ├── api.types.ts
  │       └── common.types.ts
  │
  ├── data/                          (Static data - keep as is)
  ├── assets/                        (Images, icons - keep as is)
  └── styles/                        (Global styles - DEPRECATED, use app/globals.css)
```

## Migration Steps

### Phase 1: Setup Foundation ✅ DONE
- [x] Single `app/globals.css` as source
- [x] `.gitignore` for compiled CSS
- [x] Clean up duplicate CSS files

### Phase 2: Fix Import Aliases
```json
// tsconfig.json - Update paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/app/*": ["./app/*"]
    }
  }
}
```

### Phase 3: Move Components to Vertical Slices

#### 3.1 Landing Feature
Move from `src/components/` to `src/features/landing/components/`:
- [ ] `Hero.tsx`
- [ ] `Solutions.tsx`
- [ ] `Coverage.tsx`
- [ ] `Partners.tsx`
- [ ] `FieldGallery.tsx` (or move to gallery feature?)
- [ ] `Home_update/Updates.tsx`
- [ ] `SectionCards.tsx`

#### 3.2 Services Config Feature (DONE ✅)
Already in `src/features/services-config/`:
- [x] `ServiceTemplate.tsx`
- [x] `ShippingAgencyConfig.tsx`
- [x] `FreightForwardingConfig.tsx`
- [x] `FreightForwardingLogisticsConfig.tsx`
- [x] `CharteringBrokingConfig.tsx`
- [x] `sections/`

#### 3.3 Content Feature (DONE ✅)
Already in `src/features/content/`:
- [x] `components/Insights/`
- [x] `PostEditor.tsx`
- [x] `PostManagement.tsx`
- [x] `CategoryManagement.tsx`
- [x] `services/postService.ts`
- [x] `services/categoryService.ts`

#### 3.4 Inquiries Feature
Move from `src/components/` to `src/features/inquiries/components/`:
- [ ] `ContactPage.tsx` (DONE ✅ - already in features/inquiries/)
- [ ] `InquiryManagement.tsx` (DONE ✅)

#### 3.5 Admin Feature
Move from `src/components/admin/` to `src/features/admin/components/`:
- [ ] `PostEditorPage.tsx`
- [ ] `AdminDashboard.tsx` (DONE ✅)
- [ ] `AdminSidebar.tsx` (DONE ✅)
- [ ] `EditProfile.tsx` (DONE ✅)

#### 3.6 Auth Feature (DONE ✅)
Already in `src/features/auth/`:
- [x] `components/LoginForm.tsx`
- [x] `components/SignupForm.tsx`
- [x] `components/Login.tsx`
- [x] `services/authService.ts`
- [x] `context/AuthContext.tsx`

### Phase 4: Consolidate Shared Components

#### 4.1 Move to `src/shared/components/layout/`
From `src/components/`:
- [ ] `Footer.tsx` → `src/shared/components/layout/Footer.tsx`
- [ ] `ScrollToTop.tsx` → `src/shared/components/layout/ScrollToTop.tsx`

From `src/shared/components/`:
- [ ] `Header/` → `src/shared/components/layout/Header/`

#### 4.2 Move to `src/shared/components/ui/`
From `src/components/ui/`:
- [ ] Move all shadcn components to `src/shared/components/ui/`

### Phase 5: Update All Imports

#### 5.1 Update app/ pages
- [ ] `app/page.tsx` - Update landing component imports
- [ ] `app/insights/page.tsx` - Update content imports
- [ ] `app/contact/page.tsx` - Update inquiries imports
- [ ] `app/shipping-agency/page.tsx` - Update service config imports
- [ ] `app/freight-forwarding/page.tsx` - Update service config imports
- [ ] `app/chartering-broking/page.tsx` - Update service config imports
- [ ] `app/login/page.tsx` - Update auth imports
- [ ] `app/signup/page.tsx` - Update auth imports
- [ ] `app/admin/*` - Update admin imports

#### 5.2 Use new aliases
```tsx
// Before
import { Hero } from '../../src/components/Hero'
import { Footer } from '../../src/components/Footer'

// After
import { Hero } from '@/features/landing/components/Hero'
import { Footer } from '@/shared/components/layout/Footer'
```

### Phase 6: Fix Header Location

#### Option A: Keep in src/shared (RECOMMENDED)
- [ ] Update all page imports to use `@/shared/components/layout/Header`
- [ ] Remove expectation of `app/(root)/components/Header/`


### Phase 7: Clean Up

- [ ] Delete `src/components/` directory (after all moves complete)
- [ ] Delete `src/app/` directory if exists
- [ ] Delete `src/styles/` directory (using `app/globals.css` now)
- [ ] Remove unused imports
- [ ] Run linter and fix issues
- [ ] Update README with new structure

### Phase 8: Verify & Test

- [ ] Run `npm run build` - check for import errors
- [ ] Test all pages load correctly
- [ ] Test all features work (auth, posts, contact, services)
- [ ] Check responsive design still works
- [ ] Verify no console errors

## Benefits After Refactoring

1. **Clear Feature Boundaries**
   - Each feature is self-contained
   - Easy to find related code

2. **Improved Maintainability**
   - Change a feature without touching others
   - Add new features following same pattern

3. **Better Team Collaboration**
   - Different devs can work on different features
   - Less merge conflicts

4. **Easier Testing**
   - Test features in isolation
   - Mock dependencies clearly

5. **Faster Onboarding**
   - New devs understand structure quickly
   - Documentation follows feature structure

## Next Steps

Start with Phase 2 (Import Aliases), then Phase 3.1 (Landing Feature) as proof of concept.
