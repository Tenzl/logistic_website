# Seatrans Landing Page - Cấu trúc và Phân tích

## 📋 Tổng quan

Landing page được xây dựng bằng **React + TypeScript + Vite**, sử dụng **Tailwind CSS** và **Radix UI** components.

---

## 🏗️ Kiến trúc Tech Stack

### Frontend Framework
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite 6.3.5** - Build tool (rất nhanh)
- **React DOM 18.3.1** - Rendering

### UI Component Libraries
- **Radix UI** - Headless accessible components (40+ components)
  - Dialog, Dropdown, Popover, Tooltip, Accordion...
  - Fully accessible (ARIA compliant)
- **shadcn/ui pattern** - Reusable UI components
- **Lucide React** - Icon library
- **Tailwind CSS** - Utility-first CSS

### Additional Libraries
- **class-variance-authority** - Component variants
- **tailwind-merge** - Merge Tailwind classes
- **react-hook-form** - Form management
- **sonner** - Toast notifications
- **embla-carousel-react** - Carousel slider
- **recharts** - Charts and data visualization
- **next-themes** - Dark/Light theme support

---

## 📁 Cấu trúc Thư mục

```
Seatrans Redesign Specifications (Copy)/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies
├── vite.config.ts               # Vite configuration
├── README.md                    # Documentation
│
└── src/
    ├── main.tsx                 # Entry point
    ├── App.tsx                  # Main component
    ├── index.css                # Global styles
    ├── Attributions.md          # Credits
    │
    ├── components/              # React Components
    │   ├── Header.tsx           # Top navigation
    │   ├── Hero.tsx             # Hero section
    │   ├── Solutions.tsx        # Services overview
    │   ├── Coverage.tsx         # Geographic coverage
    │   ├── FieldGallery.tsx     # Image gallery
    │   ├── Updates.tsx          # News/updates
    │   ├── Partners.tsx         # Partner logos
    │   ├── Footer.tsx           # Footer
    │   ├── ScrollToTop.tsx      # Scroll-to-top button
    │   │
    │   ├── figma/               # Figma integration
    │   │   └── ImageWithFallback.tsx
    │   │
    │   ├── hooks/               # Custom hooks
    │   │   └── useIntersectionObserver.tsx
    │   │
    │   └── ui/                  # Reusable UI components (40+)
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── input.tsx
    │       ├── sheet.tsx
    │       ├── popover.tsx
    │       └── ... (35+ more components)
    │
    ├── guidelines/
    │   └── Guidelines.md        # Design guidelines
    │
    └── styles/
        └── globals.css          # Global CSS styles
```

---

## 🎨 Cấu trúc Page Layout

### App.tsx - Main Structure
```tsx
<div className="min-h-screen bg-background">
  <Header />              {/* Sticky navigation */}
  <main>
    <Hero />              {/* Hero banner với CTA */}
    <Solutions />         {/* 4 dịch vụ chính */}
    <Coverage />          {/* Bản đồ phủ sóng */}
    <FieldGallery />      {/* Gallery hình ảnh */}
    <Updates />           {/* Tin tức/cập nhật */}
    <Partners />          {/* Đối tác */}
  </main>
  <Footer />              {/* Footer links */}
  <ScrollToTop />         {/* FAB scroll button */}
</div>
```

---

## 🧩 Chi tiết Components

### 1. Header Component
**Features:**
- **Sticky navigation** với scroll effect
- **Desktop menu** với dropdowns
- **Mobile menu** (Sheet/Drawer)
- **Search bar** với popover
- **Language selector**
- **Multi-level mega menu**

**Mega Menu Sections:**
- **Solutions:** 4 dịch vụ (Shipping Agency, Chartering, Freight Forwarding, Logistics)
- **Updates:** Recent news và advisories
- **Quick Actions:** Track shipment, Get quote, Contact

**State Management:**
```tsx
const [isSearchOpen, setIsSearchOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
const [isScrolled, setIsScrolled] = useState(false)
```

### 2. Hero Component
**Features:**
- **Full-screen hero** (min-height: 600px)
- **Background image** với gradient overlay
- **Animated text** với fade-rise effect
- **2 CTA buttons:**
  - "Explore Solutions" (Outline)
  - "Get a Custom Quote" (Primary)
- **Scroll indicator** (animated bounce)

**Animation Hook:**
```tsx
const [ ref, isInView ] = useIntersectionObserver()
// Trigger animations khi scroll vào view
```

### 3. Solutions Component
**4 Core Services:**
1. **Shipping Agency** (Ship icon)
2. **Chartering & Broking** (Truck icon)
3. **Freight Forwarding** (Package icon)
4. **Total Logistics** (Building icon)

**Layout:** Grid layout với hover effects

### 4. Coverage Component
**Geographic Display:**
- Map visualization của Asia-Pacific region
- Highlight các port chính
- Service coverage areas

### 5. FieldGallery Component
**Image Gallery:**
- Carousel/Grid của operational photos
- Maritime operations imagery
- Client success stories

### 6. Updates Component
**Latest News:**
```tsx
{
  title: "New Sustainability Initiative Launched",
  category: "Sustainability",
  date: "Sep 15, 2025"
}
{
  title: "Port Congestion Advisory - Ho Chi Minh",
  category: "Advisory",
  date: "Sep 18, 2025"
}
```

### 7. Partners Component
- Logo grid của shipping partners
- Trusted by section

### 8. Footer Component
- Company info
- Quick links
- Contact details
- Social media
- Copyright

---

## 🎭 UI Components Library (40+ components)

### Layout Components
- `Card` - Content containers
- `Sheet` - Side drawers
- `Dialog` - Modals
- `Popover` - Floating menus
- `Accordion` - Collapsible sections
- `Tabs` - Tab navigation
- `Separator` - Dividers

### Form Components
- `Input` - Text inputs
- `Textarea` - Multi-line text
- `Select` - Dropdowns
- `Checkbox` - Checkboxes
- `Radio Group` - Radio buttons
- `Switch` - Toggle switches
- `Slider` - Range sliders
- `Calendar` - Date picker
- `Form` - Form wrapper

### Navigation
- `Navigation Menu` - Main navigation
- `Menubar` - Menu bars
- `Dropdown Menu` - Context menus
- `Breadcrumb` - Breadcrumb trail
- `Pagination` - Page navigation

### Feedback
- `Alert` - Notifications
- `Alert Dialog` - Confirmations
- `Toast (Sonner)` - Toast messages
- `Progress` - Progress bars
- `Skeleton` - Loading states
- `Badge` - Status badges

### Data Display
- `Table` - Data tables
- `Avatar` - User avatars
- `Tooltip` - Hover hints
- `Hover Card` - Rich previews
- `Chart (Recharts)` - Data visualization
- `Carousel` - Image sliders

### Utility
- `Button` - All button variants
- `Scroll Area` - Custom scrollbars
- `Resizable` - Resizable panels
- `Toggle` - Toggle buttons
- `Command` - Command palette

---

## 🎨 Design System

### Color Scheme
```css
--primary: /* Brand blue */
--background: /* Page background */
--foreground: /* Text color */
--muted: /* Subtle backgrounds */
--accent: /* Highlight color */
```

### Typography
- Font: System fonts stack
- Headings: `text-5xl` to `text-7xl`
- Body: `text-xl` to `text-2xl`
- Responsive scaling

### Spacing
- Container: `container` class
- Padding: Tailwind utilities (`p-4`, `py-8`)
- Gaps: `space-x-*`, `gap-*`

### Animations
```css
/* Custom animations */
.fade-rise         /* Fade in + slide up */
.stagger-1        /* Delayed animation */
.hover-lift-strong /* Lift on hover */
.header-sticky    /* Sticky header transition */
```

---

## 🔧 Custom Hooks

### useIntersectionObserver
```tsx
// Detect khi element vào viewport
const [ ref, isInView ] = useIntersectionObserver()

// Usage:
<div ref={ref} className={isInView ? 'fade-rise' : 'opacity-0'}>
  Content
</div>
```

**Use cases:**
- Trigger scroll animations
- Lazy load images
- Track section visibility

---

## 📱 Responsive Design

### Breakpoints
- Mobile: `< 640px`
- Tablet: `640px - 1024px` (sm, md)
- Desktop: `> 1024px` (lg, xl)

### Responsive Patterns
```tsx
className="flex flex-col sm:flex-row"  // Stack → Row
className="text-xl md:text-2xl"        // Responsive text
className="hidden lg:flex"             // Show on desktop only
```

### Mobile Menu
- Uses `Sheet` component (slide-in drawer)
- Full-screen navigation
- Touch-friendly buttons

---

## 🚀 Performance Optimizations

### Image Loading
```tsx
<ImageWithFallback 
  src="..." 
  alt="..." 
  className="w-full h-full object-cover"
/>
```
- Lazy loading
- Fallback images
- Optimized from Unsplash

### Code Splitting
- Vite automatic code splitting
- Dynamic imports
- Tree shaking

### CSS Optimization
- Tailwind CSS purge unused classes
- PostCSS optimization
- Minimal bundle size

---

## 🎯 Key Features

### User Experience
✅ **Sticky Header** - Always accessible navigation  
✅ **Smooth Scroll** - Animated scroll behavior  
✅ **Mega Menu** - Rich dropdown navigation  
✅ **Search** - Global search functionality  
✅ **Mobile-First** - Responsive on all devices  
✅ **Accessibility** - ARIA compliant components  
✅ **Dark Mode Support** - Theme switching  

### Business Features
📦 **4 Core Services** highlighted  
🌏 **Asia-Pacific Coverage** visualization  
📰 **News & Updates** section  
🤝 **Partner Showcase**  
📞 **Quick CTAs** - Get Quote, Contact  
🔍 **Track Shipment** functionality  

---

## 🛠️ Development Workflow

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
# Runs on http://localhost:5173
```

### Build for Production
```bash
npm run build
# Output in dist/
```

### Preview Production Build
```bash
npm run preview
```

---

## 📊 Component Usage Statistics

**Total Components:** 40+ UI components  
**Custom Components:** 9 page sections  
**Icons:** 20+ Lucide icons  
**Animations:** 4 custom animations  
**Responsive:** 3 breakpoints  

---

## 🔗 Integration với Backend

### Cần implement:
1. **Search API** - `/api/search?q={query}`
2. **Quotation API** - `/api/quotations/request`
3. **Tracking API** - `/api/shipments/track/{id}`
4. **News API** - `/api/updates/latest`
5. **Contact Form** - `/api/contact/submit`

### Data Structure Example:
```typescript
interface Solution {
  icon: LucideIcon
  title: string
  description: string
  link: string
}

interface Update {
  title: string
  category: string
  date: string
  content?: string
}
```

---

## 🎨 Design Source

**Figma Design:**  
https://www.figma.com/design/u1FyyKXujb2NW5erI7VlE3/Seatrans-Redesign-Specifications--Copy-

**Features từ Figma:**
- Exact component spacing
- Color palette
- Typography scale
- Icon set
- Animation specs

---

## 🔄 So sánh với Backend hiện tại

### Landing Page (React)
- **Purpose:** Marketing, lead generation
- **Tech:** React + Vite + Tailwind
- **Features:** Hero, Services, News, Contact

### Admin Panel (Thymeleaf)
- **Purpose:** Fee management, CRUD operations
- **Tech:** Spring Boot + Thymeleaf
- **Features:** Fee config, Pricing formulas

### Cần tích hợp:
1. Share **ServiceType enum** (SHIPPING_AGENCY, CHARTERING, FREIGHT_FORWARDING)
2. **News/Updates** từ backend
3. **Quotation form** submit to backend
4. **Authentication** cho customer login
5. **API endpoints** cho dynamic content

---

## ✅ Checklist Deployment

- [ ] Build production bundle
- [ ] Optimize images (WebP, lazy load)
- [ ] Add SEO meta tags
- [ ] Configure CDN
- [ ] Setup analytics (Google Analytics)
- [ ] Test on mobile devices
- [ ] Accessibility audit
- [ ] Performance audit (Lighthouse)
- [ ] Connect to backend APIs
- [ ] Setup SSL certificate

---

## 📝 Notes

- **Modern stack** - React 18 + Vite 6 rất nhanh
- **Component library** - 40+ reusable components
- **Accessibility** - Radix UI đảm bảo ARIA compliance
- **Type-safe** - Full TypeScript coverage
- **Responsive** - Mobile-first design
- **Animations** - Smooth scroll interactions

Landing page này **RẤT chuyên nghiệp** và ready for production! 🚀
