# App Directory Restructure Plan - Enterprise Standard

## Current Issues
- Components mixed with route groups in `(root)/components`
- Duplicate gallery pages across service folders
- Inconsistent naming (kebab-case vs camelCase)
- API routes mixed with page routes
- Flat admin structure without clear hierarchy
- No clear separation between public and protected routes

## Proposed Enterprise Structure

```
app/
├── (public)/                          # Public routes group
│   ├── layout.tsx                     # Public layout (header, footer)
│   ├── page.tsx                       # Landing page (/)
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── insights/
│   │   ├── page.tsx                   # Blog listing
│   │   └── [slug]/
│   │       └── page.tsx               # Article detail
│   └── services/                      # Service pages
│       ├── shipping-agency/
│       │   ├── page.tsx
│       │   └── gallery/
│       │       └── page.tsx
│       ├── chartering-broking/
│       │   ├── page.tsx
│       │   └── gallery/
│       │       └── page.tsx
│       ├── freight-forwarding/
│       │   ├── page.tsx
│       │   └── gallery/
│       │       └── page.tsx
│       └── total-logistics/
│           ├── page.tsx
│           └── gallery/
│               └── page.tsx
│
├── (auth)/                            # Authentication routes group
│   ├── layout.tsx                     # Minimal auth layout
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── callback/
│       └── page.tsx                   # OAuth callback
│
├── (protected)/                       # Protected routes requiring auth
│   ├── layout.tsx                     # Protected layout with auth check
│   └── dashboard/
│       └── page.tsx                   # User dashboard
│
├── (admin)/                           # Admin routes group
│   ├── layout.tsx                     # Admin layout with sidebar
│   ├── admin/
│   │   ├── page.tsx                   # Admin dashboard
│   │   ├── posts/
│   │   │   ├── page.tsx               # Post list
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create post
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # View post
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit post
│   │   ├── gallery/
│   │   │   ├── page.tsx               # Gallery management
│   │   │   └── upload/
│   │   │       └── page.tsx
│   │   ├── inquiries/
│   │   │   ├── page.tsx               # All inquiries
│   │   │   └── [service]/
│   │   │       ├── page.tsx           # Service-specific inquiries
│   │   │       └── [id]/
│   │   │           ├── page.tsx       # Inquiry detail
│   │   │           └── pdf/
│   │   │               └── page.tsx   # Generate PDF
│   │   ├── offices/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│
├── api/                               # API routes (Next.js API handlers)
│   ├── proxy/                         # Backend proxy routes
│   │   └── [...path]/
│   │       └── route.ts               # Catch-all proxy
│   ├── spreadsheets/
│   │   └── [filename]/
│   │       └── route.ts
│   └── health/
│       └── route.ts                   # Health check
│
├── _components/                       # Shared app-level components
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── NavMenu.tsx
│   │   ├── UserNav.tsx
│   │   └── menuData.ts
│   ├── Footer/
│   │   └── Footer.tsx
│   └── Providers/
│       └── ClientProviders.tsx
│
├── globals.css                        # Global styles
├── layout.tsx                         # Root layout
└── not-found.tsx                      # 404 page
```

## Key Improvements

### 1. Route Groups for Clear Separation
- `(public)`: No authentication required, public-facing pages
- `(auth)`: Authentication flows with minimal layout
- `(protected)`: Logged-in user routes
- `(admin)`: Admin-only routes with full dashboard layout

### 2. Consistent Naming
- **Folders**: kebab-case (`shipping-agency`, `freight-forwarding`)
- **Files**: PascalCase for components (`Header.tsx`), camelCase for utilities
- **Routes**: RESTful conventions (`/admin/posts/[id]/edit`)

### 3. Logical Grouping
- All services under `/services/*`
- All admin functions under `/admin/*`
- API routes clearly separated
- Shared components in `_components` (underscore prevents routing)

### 4. Scalability
- Easy to add new services without restructuring
- Admin sections can grow independently
- Clear patterns for CRUD operations

### 5. Enterprise Standards
- **Co-location**: Related files stay together
- **Feature-based**: Organized by domain (posts, inquiries, gallery)
- **Separation of Concerns**: Public, auth, protected, admin clearly divided
- **DRY**: Shared layouts prevent duplication

## Migration Plan

### Fast-Track Priorities
1. Create route groups and move layouts: `(public)`, `(auth)`, `(protected)`, `(admin)`
2. Consolidate public services and galleries under `(public)/services/*`
3. Normalize admin posts/inquiries structure (`/admin/posts/[id]/edit`, `/admin/inquiries/[service]/[id]/pdf`)

### Phase 1: Create Route Groups (Week 1)
1. Create `(public)`, `(auth)`, `(protected)`, `(admin)` folders
2. Move layouts to appropriate groups
3. Update imports and paths (tsconfig `paths`, absolute imports)

### Phase 2: Reorganize Public Routes (Week 1)
1. Move service pages to `(public)/services/*`
2. Consolidate gallery pages
3. Update internal links

### Phase 3: Restructure Admin (Week 2) ✅ COMPLETE

**What was done:**
1. ✅ Created RESTful admin routes:
   - Posts: `/admin/posts/new` and `/admin/posts/[id]/edit`
   - Inquiries: `/admin/inquiries/[service]` for all services
2. ✅ Migrated post editor from `/admin/post-editor/[id]` to `/admin/posts/[id]/edit`
3. ✅ Created inquiry list pages for all services
4. ✅ Updated PostManagement.tsx to use new edit routes
5. ✅ Removed legacy `post-editor` folder

**Files created:**
- `app/(admin)/admin/posts/new/page.tsx`
- `app/(admin)/admin/posts/[id]/edit/page.tsx`
- `app/(admin)/admin/inquiries/page.tsx`
- `app/(admin)/admin/inquiries/shipping-agency/page.tsx`
- `app/(admin)/admin/inquiries/freight-forwarding/page.tsx`
- `app/(admin)/admin/inquiries/total-logistics/page.tsx`
- `app/(admin)/admin/inquiries/chartering/page.tsx`

### Phase 4: Clean API Routes (Week 2) ✅ COMPLETE
**Done now:**
- Normalized `API_CONFIG` with `API_URL` (origin + `/api/v1`), `ASSET_BASE_URL`, and aliases
- Updated `apiClient` to use versioned base and normalized endpoints
- Swapped hardcoded `/api/*` calls in ContactPage to `API_CONFIG`
- Standardized document service endpoints to the versioned base (auth-aware downloads)
- Removed regex-based asset host hacks in gallery/posts to use `ASSET_BASE_URL`
- Added unified proxy handler [app/api/proxy/[...path]/route.ts](app/api/proxy/[...path]/route.ts)
- Removed unused placeholder API folders (`app/api/proxy/inquiries`, `app/api/spreadsheets`)

**Env note:** Set `NEXT_PUBLIC_API_BASE_URL` to the origin only (no `/api` suffix); optional `NEXT_PUBLIC_API_PREFIX` and `NEXT_PUBLIC_API_VERSION` default to `api` and `v1`.

### Phase 5: Shared Components (Week 3)
1. Move components to `_components`
2. Update all component imports
3. Remove old component folders

### Phase 6: Testing & Validation (Week 3)
1. Smoke test key paths: home, login/signup, each service page, insights detail, admin posts list/create/edit, admin inquiries detail/PDF
2. Verify authentication flows
3. Check admin permissions
4. Update documentation

## Implementation Checklist

- [ ] Backup current structure (mandatory before moving files)
- [ ] Create new folder structure (mandatory)
- [ ] Migrate layouts
- [ ] Migrate public routes
- [ ] Migrate auth routes
- [ ] Migrate protected routes
- [ ] Migrate admin routes
- [ ] Migrate API routes
- [ ] Move shared components
- [ ] Update all imports across codebase
- [ ] Update navigation/menu configs
- [ ] Test all routes
- [ ] Update deployment config if needed
- [ ] Document new structure

## Benefits

### Developer Experience
- **Clear Mental Model**: Developers instantly know where files belong
- **Faster Navigation**: Logical grouping speeds up file finding
- **Easier Onboarding**: New developers understand structure quickly
- **Reduced Conflicts**: Clear ownership reduces merge conflicts

### Code Quality
- **Maintainability**: Related code stays together
- **Reusability**: Shared components easily accessible
- **Testability**: Clear boundaries for testing
- **Scalability**: Structure supports growth

### Performance
- **Code Splitting**: Route groups enable better chunking
- **Loading States**: Layouts allow streaming and suspense
- **Caching**: Clear patterns improve cache strategies

## Naming Conventions

### Routes
- Use kebab-case: `shipping-agency`, `freight-forwarding`
- Keep short but descriptive
- Avoid abbreviations unless universally known

### Files
- `page.tsx`: Route page component
- `layout.tsx`: Layout wrapper
- `loading.tsx`: Loading UI
- `error.tsx`: Error UI
- `not-found.tsx`: 404 UI
- `route.ts`: API route handler
- `default.tsx`: Parallel route fallback
 - Place `loading.tsx`, `error.tsx`, `default.tsx` alongside their `page.tsx` for each route/parallel route

### Components
- PascalCase: `Header.tsx`, `NavMenu.tsx`
- Prefix private components with underscore: `_InternalHelper.tsx`
- Co-locate styles: `Header.tsx` + `Header.module.css`

### Utilities
- camelCase: `menuData.ts`, `apiHelpers.ts`
- Suffix with purpose: `.utils.ts`, `.config.ts`, `.types.ts`

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js Project Organization](https://nextjs.org/docs/app/building-your-application/routing/colocation)
- [Enterprise React Best Practices](https://www.patterns.dev/)
