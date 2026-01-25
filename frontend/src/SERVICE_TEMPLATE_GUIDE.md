# Service Template Guide

## Overview
Service Template là một scaffold component có thể tái sử dụng cho tất cả các service pages của Seatrans. Template này giúp maintain consistency trong design và functionality across all services.

## Features
- ✅ **Breadcrumb Navigation** - Auto-generated với service name
- ✅ **Hero Section** - Customizable title, description và icon
- ✅ **Contact Section** - Support multiple teams, emergency badges, stats
- ✅ **Services Grid** - Flexible layout cho service items
- ✅ **Dynamic Forms** - Configurable fields (text, email, textarea, select, number)
- ✅ **Image Gallery** - Với filter tabs
- ✅ **Case Studies** - Success stories với structured format
- ✅ **Custom Sections** - Inject custom React components
- ✅ **Animations** - Built-in fade-rise animations
- ✅ **Responsive** - Mobile-first design

## File Structure

```
/components
  ├── ServiceTemplate.tsx          # Main template component
  ├── ShippingAgencyConfig.tsx     # Example: Shipping Agency
  └── FreightForwardingConfig.tsx  # Example: Freight Forwarding
```

## Quick Start

### 1. Create Service Config File

Create a new file: `/components/YourServiceConfig.tsx`

```tsx
import { YourIcon } from 'lucide-react'
import { ServiceTemplate, ServiceTemplateProps } from './ServiceTemplate'

interface YourServiceProps {
  onNavigateHome?: () => void
}

export function YourService({ onNavigateHome }: YourServiceProps) {
  const config: ServiceTemplateProps = {
    serviceName: 'Your Service Name',
    serviceIcon: YourIcon,
    onNavigateHome,

    hero: {
      title: 'Your Service Title',
      description: 'Your service description...'
    },

    // Add other sections as needed...
  }

  return <ServiceTemplate {...config} />
}
```

### 2. Configure Sections

Each section is optional. Include only what you need:

#### Hero Section (Required)
```tsx
hero: {
  title: 'Your Service Title',
  description: 'Brief description of your service'
}
```

#### Contact Section (Optional)
```tsx
contacts: {
  showEmergencyBadge: true, // Show red "24/7 Emergency Support" badge
  sectionTitle: 'Contact our Team',
  sectionDescription: 'Description text',
  teams: [
    {
      title: 'Team Name',
      subtitle: 'Team description',
      icon: IconComponent,
      contacts: [
        { name: 'PERSON NAME', mobile: '+84.xxx' }
      ],
      email: 'team@seatrans.com.vn'
    }
  ],
  stats: [
    { icon: Clock, value: '24/7', label: 'Available' },
    { icon: Ship, value: '2,500+', label: 'Vessels' }
  ]
}
```

#### Services Section (Optional)
```tsx
services: {
  sectionTitle: 'Our Services',
  sectionDescription: 'Description text',
  items: [
    {
      name: 'Service Name',
      description: 'Service description',
      icon: IconComponent
    }
  ]
}
```

#### Form Section (Optional)
```tsx
form: {
  badgeText: 'Get a Quote',
  sectionTitle: 'INQUIRY FORM',
  sectionDescription: 'Form description',
  submitButtonText: 'Submit',
  fields: [
    {
      id: 'fieldName',
      label: 'Field Label',
      type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number',
      required: true,
      placeholder: 'Placeholder text',
      gridSpan: 1 | 2 | 3, // Grid column span
      options: ['Option 1', 'Option 2'] // For select type only
    }
  ],
  onSubmit: (data) => {
    console.log('Form data:', data)
    // Handle submission
  }
}
```

**Field Types:**
- `text` - Standard text input
- `email` - Email input with validation
- `tel` - Phone number input
- `number` - Numeric input
- `textarea` - Multi-line text (rows=4)
- `select` - Dropdown with options

**Grid Span:**
- `1` - Half width on desktop (md:col-span-1)
- `2` - Full width on desktop (md:col-span-2)
- `3` - One-third width on 3-column layout

#### Gallery Section (Optional)
```tsx
gallery: {
  sectionTitle: 'Gallery Title',
  sectionDescription: 'Gallery description',
  filters: [
    { label: 'All', value: 'all' },
    { label: 'Category 1', value: 'cat1' }
  ],
  images: [
    {
      id: 1,
      category: 'cat1',
      alt: 'Image description',
      url: 'https://...'
    }
  ]
}
```

#### Case Studies Section (Optional)
```tsx
caseStudies: {
  badgeText: 'Success Stories',
  sectionTitle: 'Case Studies',
  sectionDescription: 'Description text',
  items: [
    {
      title: 'Project Title',
      client: 'Client Name',
      challenge: 'The challenge description',
      solution: 'How we solved it',
      result: 'The outcome',
      image: 'https://...'
    }
  ]
}
```

#### Custom Sections (Optional)
```tsx
customSections: [
  <YourCustomComponent key="custom-1" />,
  <AnotherComponent key="custom-2" />
]
```

### 3. Add to Routing

Update `/App.tsx`:

```tsx
import { YourService } from './components/YourServiceConfig'

// Add to page state type
const [currentPage, setCurrentPage] = useState<'home' | 'your-service'>('home')

// Add to routing
{currentPage === 'your-service' ? (
  <YourService onNavigateHome={() => setCurrentPage('home')} />
) : null}
```

## Examples

### Example 1: Shipping Agency
**File:** `/components/ShippingAgencyConfig.tsx`

**Features Used:**
- Emergency contact section with 2 teams
- 4 quick stats
- 6 services in 3-column grid
- Multi-field inquiry form with vessel details
- Gallery with bulk/cargo filters
- 3 case studies

**Best for:** Services requiring emergency contact and detailed forms

### Example 2: Freight Forwarding
**File:** `/components/FreightForwardingConfig.tsx`

**Features Used:**
- Single contact team
- 4 quick stats
- 6 freight solutions
- Shipment inquiry form
- Gallery with air/sea/land filters
- 2 case studies

**Best for:** Services with multiple transport modes

## Tips & Best Practices

### 1. Icons
- Use Lucide React icons for consistency
- Import from: `import { IconName } from 'lucide-react'`
- Common icons: `Ship, Truck, Plane, Package, Users, Clock, Phone, Mail`

### 2. Images
- Use Unsplash for placeholder images
- Recommended size: `w=800&q=80`
- Aspect ratio: 4:3 for gallery images

### 3. Contact Information
- Use format: `+84.xxx` for mobile numbers
- Template auto-converts to `tel:` links (removes dots)
- Email format: `service@seatrans.com.vn`

### 4. Form Design
- Group related fields with gridSpan
- Use `gridSpan: 2` for full-width fields like textarea
- Use `gridSpan: 1` for side-by-side fields
- Always mark required fields: `required: true`

### 5. Colors & Badges
- Emergency badge: Uses `bg-red-500`
- Regular badges: Uses primary color
- Card borders: `border-2 border-primary/20` for contact cards

### 6. Stats Section
- Keep to 2-4 stats for visual balance
- Use short values: "24/7", "< 2hrs", "2,500+"
- Icons should relate to the stat

### 7. Performance
- All animations use GPU-safe properties
- Intersection Observer for scroll-triggered animations
- Stagger delays: 60-90ms between sibling elements

## Section Order Recommendations

### Standard Service Page:
1. Hero
2. Contact (if emergency service)
3. Services
4. Form
5. Gallery
6. Case Studies

### Sales-Focused Page:
1. Hero
2. Services
3. Case Studies
4. Contact
5. Form
6. Gallery

### Support-Focused Page:
1. Hero
2. Contact (prominent with emergency badge)
3. Services
4. Form
5. Case Studies
6. Gallery

## Customization Examples

### Add Emergency Badge
```tsx
contacts: {
  showEmergencyBadge: true, // Red 24/7 badge
  // ...
}
```

### Single Contact Team (Centered)
```tsx
contacts: {
  teams: [{ /* single team */ }], // Auto-centers on grid
  // ...
}
```

### No Gallery, No Case Studies
```tsx
// Simply omit these sections
{
  serviceName: '...',
  hero: { /* ... */ },
  contacts: { /* ... */ },
  services: { /* ... */ },
  form: { /* ... */ }
  // gallery and caseStudies omitted
}
```

### Add Custom Section After Form
```tsx
customSections: [
  <section key="custom-cta" className="py-16 bg-primary text-white">
    <div className="container text-center">
      <h2>Special Offer</h2>
      <p>Contact us today for 10% off!</p>
    </div>
  </section>
]
```

## Motion System Integration

All sections automatically use:
- **fade-rise** animation class
- **hover-lift** for cards
- **stagger delays** for grid items (60ms intervals)
- **GPU-safe** transforms and opacity
- **Intersection Observer** for gallery section

## Accessibility

- ✅ Semantic HTML structure
- ✅ Form labels properly associated
- ✅ Required field indicators
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Click-to-call/email links

## TypeScript Types

All props are fully typed. Import types as needed:

```tsx
import {
  ServiceTemplateProps,
  ContactTeam,
  ServiceItem,
  FormField,
  GalleryImage,
  CaseStudy,
  StatItem
} from './ServiceTemplate'
```

## Common Patterns

### Pattern 1: Service with Emergency Contact
```tsx
contacts: {
  showEmergencyBadge: true,
  teams: [/* multiple teams */],
  stats: [/* quick stats */]
}
```

### Pattern 2: Simple Service Listing
```tsx
services: {
  items: [/* 3-6 items work best */]
}
```

### Pattern 3: Lead Generation Form
```tsx
form: {
  badgeText: 'Get Started',
  fields: [
    { id: 'name', type: 'text', required: true },
    { id: 'email', type: 'email', required: true },
    { id: 'phone', type: 'tel', required: true },
    { id: 'message', type: 'textarea', gridSpan: 2 }
  ],
  onSubmit: (data) => {
    // Send to API or Supabase
  }
}
```

## Troubleshooting

**Issue:** Form fields not showing correctly
- Check `gridSpan` values (1, 2, or 3 only)
- Ensure form is in `form` object, not `forms`

**Issue:** Gallery not filtering
- Check `category` values match `filter.value`
- First filter should be `{ label: 'All', value: 'all' }`

**Issue:** Icons not displaying
- Import from `lucide-react`
- Pass component, not instance: `icon: Ship` (not `icon: <Ship />`)

**Issue:** Stats grid layout broken
- Use 2, 3, or 4 stats for best results
- Check icon imports

## Next Steps

1. Create your service config file
2. Configure needed sections
3. Add to App.tsx routing
4. Test responsive design
5. Add real images from Unsplash
6. Connect form submission to backend/Supabase

---

**Need help?** Check the example files:
- `/components/ShippingAgencyConfig.tsx` - Full-featured example
- `/components/FreightForwardingConfig.tsx` - Simplified example
