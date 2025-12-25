import { Phone, Mail, MapPin, Clock, Ship, Anchor, Truck, FileText, ArrowRight, User, Building2, Send, Paperclip, CheckCircle2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useState, useRef, useEffect } from 'react'

interface ContactPageProps {
  onNavigateHome: () => void
}

interface Office {
  id: string
  name: string
  city: string
  region: string
  address: string
  manager: {
    name: string
    title: string
    mobile: string
    email: string
  }
  coordinates: {
    lat: number
    lng: number
  }
  isHeadquarter?: boolean
}

export function ContactPage({ onNavigateHome }: ContactPageProps) {
  const [ heroRef, heroVisible ] = useIntersectionObserver({ threshold: 0.1 })
  const [ mapRef, mapVisible ] = useIntersectionObserver({ threshold: 0.1 })
  const [ departmentsRef, departmentsVisible ] = useIntersectionObserver({ threshold: 0.1 })
  const [ formRef, formVisible ] = useIntersectionObserver({ threshold: 0.1 })

  const offices: Office[] = [
    {
      id: 'ho-chi-minh',
      name: 'Head Office',
      city: 'Ho Chi Minh City',
      region: 'Southern Vietnam',
      address: '26 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City, Vietnam',
      manager: {
        name: 'Minh Khang (Mr)',
        title: 'Office Supervisor',
        mobile: '+84 90-111-2233',
        email: 'hcm.office@seatrans.com.vn'
      },
      coordinates: { lat: 10.7769, lng: 106.7009 },
      isHeadquarter: true
    },
    {
      id: 'hai-phong',
      name: 'Hai Phong Branch',
      city: 'Hai Phong',
      region: 'Northern Vietnam',
      address: '12 Lach Tray Street, Ngo Quyen District, Hai Phong, Vietnam',
      manager: {
        name: 'Quang Huy (Mr)',
        title: 'Branch Manager',
        mobile: '+84 90-222-3344',
        email: 'haiphong.branch@seatrans.com.vn'
      },
      coordinates: { lat: 20.8449, lng: 106.6881 }
    },
    {
      id: 'da-nang',
      name: 'Da Nang Branch',
      city: 'Da Nang',
      region: 'Central Vietnam',
      address: '88 Bach Dang Street, Hai Chau District, Da Nang, Vietnam',
      manager: {
        name: 'Thao Nguyen (Ms)',
        title: 'Branch Manager',
        mobile: '+84 90-333-4455',
        email: 'danang.branch@seatrans.com.vn'
      },
      coordinates: { lat: 16.0544, lng: 108.2022 }
    },
    {
      id: 'can-tho',
      name: 'Can Tho Branch',
      city: 'Can Tho',
      region: 'Mekong Delta',
      address: '45 Hoa Binh Avenue, Ninh Kieu District, Can Tho, Vietnam',
      manager: {
        name: 'Thanh Dat (Mr)',
        title: 'Branch Manager',
        mobile: '+84 90-444-5566',
        email: 'cantho.branch@seatrans.com.vn'
      },
      coordinates: { lat: 10.0452, lng: 105.7469 }
    }
  ]

  const [selectedOffice, setSelectedOffice] = useState<Office>(offices[0])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    office: '',
    department: '',
    message: '',
    contactPreference: 'Email'
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const departments = [
    {
      title: 'Shipping Agency',
      icon: Ship,
      description: 'Port operations, vessel services, and agency representation',
      manager: 'DUC TUYEN (Mr)',
      role: 'Manager',
      email: 'ship.agency@seatrans.com.vn',
      phone: '+84 91-428-2649'
    },
    {
      title: 'Chartering & Ship-Broking',
      icon: Anchor,
      description: 'Vessel chartering, sale & purchase, and market intelligence',
      manager: 'DUY CONG (Mr)',
      role: 'Manager',
      email: 'chartering@seatrans.com.vn',
      phone: '+84 90-500-1077'
    },
    {
      title: 'Freight Forwarding & Logistics',
      icon: Truck,
      description: 'Multi-modal transport, warehousing, and supply chain solutions',
      manager: 'Ta Thi Thao Ly (Ms)',
      role: 'Manager',
      email: 'total.logistics@seatrans.com.vn',
      phone: '+84 90-581-2679'
    },
    {
      title: 'IM-EXPORT Customs Clearance',
      icon: FileText,
      description: 'Import/export documentation and customs compliance',
      manager: 'Duy Tuan (Mr)',
      role: 'Customs Expert',
      email: 'customs.svc@seatrans.com.vn',
      phone: '+84 90-104-7477'
    }
  ]

  // Generate map URL centered on selected office
  const generateMapUrl = () => {
    // Use Google Maps Embed with marker at exact coordinates
    const { lat, lng } = selectedOffice.coordinates
    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Special request submitted:', formData)
    setFormSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false)
      setFormData({
        subject: '',
        office: '',
        department: '',
        message: '',
        contactPreference: 'Email'
      })
    }, 3000)
  }

  const handleSelectOffice = (office: Office) => {
    setSelectedOffice(office)
    setIsDrawerOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Compact */}
      <section className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-16">
        <div className="container">
          <div ref={heroRef} className={`text-center max-w-3xl mx-auto ${heroVisible ? 'fade-rise' : 'opacity-0'}`}>
            <h1 className="mb-4">Contact SEATRANS</h1>
            <p className="text-lg opacity-90">
              Our nationwide network is ready to support your maritime logistics needs
            </p>
          </div>
        </div>
      </section>

      {/* Company Contact - General Manager Hotline */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl">24/7 Hotline</h2>
                </div>
                <p className="text-sm opacity-90 mb-1">DO DUY AN (Mr) - General Manager</p>
                <div className="flex flex-wrap gap-4 text-sm opacity-75">
                  <a href="mailto:operation@seatrans.com.vn" className="hover:underline">
                    operation@seatrans.com.vn
                  </a>
                  <a href="mailto:seatrans.info@seatrans.com.vn" className="hover:underline">
                    seatrans.info@seatrans.com.vn
                  </a>
                </div>
              </div>
              <a 
                href="tel:+84935015679" 
                className="text-3xl font-semibold hover:underline whitespace-nowrap"
              >
                +84 93-501-5679
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Office Network - 2 Card System (Office Panel + Selector) */}
      <section ref={mapRef} className="py-16">
        <div className="container">
          <div className={`text-center mb-12 ${mapVisible ? 'fade-rise' : 'opacity-0'}`}>
            <h2 className="mb-4">Our Offices</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nationwide presence across Vietnam's key maritime hubs
            </p>
          </div>

          <div className={`flex flex-col lg:flex-row gap-6 ${mapVisible ? 'fade-rise' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
            {/* Left Column: 2 Cards (Selector Top + Panel Bottom) - 600px total */}
            <div className="w-full lg:w-[clamp(420px,38vw,560px)] flex-shrink-0 flex flex-col gap-3">
              
              {/* Card A: Office Selector (Top) - 160px → 360px */}
              <div 
                className="bg-card border rounded-2xl shadow-lg"
                style={{
                  height: isDrawerOpen ? '360px' : '160px',
                  transition: 'height 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                  willChange: 'height',
                  overflow: 'hidden'
                }}
              >
                {/* Header - Always visible with Office Name (H2) + Responsible */}
                <div className="px-6 pt-6 pb-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl">{selectedOffice.city}</h2>
                        {selectedOffice.isHeadquarter && (
                          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded">
                            HQ
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedOffice.manager.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedOffice.manager.title}</p>
                    </div>
                    <Button
                      variant={isDrawerOpen ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                      className="flex-shrink-0"
                    >
                      <Building2 className="mr-2 h-3.5 w-3.5" />
                      {isDrawerOpen ? 'Close' : 'Change Office'}
                    </Button>
                  </div>
                </div>

                {/* Dropdown List - Appears when OPEN */}
                <div 
                  style={{
                    height: isDrawerOpen ? '248px' : '0px',
                    opacity: isDrawerOpen ? 1 : 0,
                    transform: isDrawerOpen ? 'translateY(0)' : 'translateY(-6px)',
                    transition: 'height 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                    pointerEvents: isDrawerOpen ? 'auto' : 'none',
                    overflow: 'hidden'
                  }}
                >
                  <div className="p-4 h-full overflow-auto">
                    <h3 className="text-sm mb-3 text-muted-foreground uppercase tracking-wide">Select Office</h3>
                    <div className="space-y-2">
                      {offices.map((office) => (
                        <button
                          key={office.id}
                          onClick={() => handleSelectOffice(office)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 ${
                            selectedOffice.id === office.id
                              ? 'bg-primary/10 border border-primary'
                              : 'hover:bg-muted border border-transparent'
                          }`}
                          style={{
                            height: '52px'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-medium text-sm">{office.city}</p>
                                {office.isHeadquarter && (
                                  <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded">
                                    HQ
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{office.manager.name}</p>
                            </div>
                            {selectedOffice.id === office.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card B: Office Panel (Bottom) - 428px → 228px */}
              <div 
                className="bg-card border rounded-2xl shadow-lg relative"
                style={{
                  height: isDrawerOpen ? '228px' : '428px',
                  transition: 'height 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                  willChange: 'height',
                  overflow: 'hidden'
                }}
              >
                {/* Full Details Content - Visible when CLOSED */}
                <div 
                  className="absolute inset-0 px-6 py-6"
                  style={{
                    opacity: isDrawerOpen ? 0 : 1,
                    transform: isDrawerOpen ? 'translateY(-4px)' : 'translateY(0)',
                    transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                    pointerEvents: isDrawerOpen ? 'none' : 'auto'
                  }}
                >
                  {/* Region */}
                  <div className="mb-5">
                    <p className="text-xs text-muted-foreground mb-1">Region</p>
                    <p className="text-sm font-medium">{selectedOffice.region}</p>
                  </div>

                  {/* Address */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Address</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedOffice.address}
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Phone</p>
                    </div>
                    <a 
                      href={`tel:${selectedOffice.manager.mobile.replace(/\s/g, '')}`}
                      className="text-sm text-primary hover:underline block"
                    >
                      {selectedOffice.manager.mobile}
                    </a>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Email</p>
                    </div>
                    <a 
                      href={`mailto:${selectedOffice.manager.email}`}
                      className="text-sm text-primary hover:underline block break-all"
                    >
                      {selectedOffice.manager.email}
                    </a>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedOffice.coordinates.lat},${selectedOffice.coordinates.lng}`, '_blank')}
                    >
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      Directions
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = `tel:${selectedOffice.manager.mobile.replace(/\s/g, '')}`}
                    >
                      <Phone className="mr-1 h-3.5 w-3.5" />
                      Call
                    </Button>
                  </div>
                </div>

                {/* Compact Contact Only - Visible when OPEN */}
                <div 
                  className="absolute inset-0 px-6 py-6 flex flex-col justify-center"
                  style={{
                    opacity: isDrawerOpen ? 1 : 0,
                    transform: isDrawerOpen ? 'translateY(0)' : 'translateY(6px)',
                    transition: `opacity 300ms ease-out ${isDrawerOpen ? '100ms' : '0ms'}, transform 300ms ease-out ${isDrawerOpen ? '100ms' : '0ms'}`,
                    pointerEvents: isDrawerOpen ? 'auto' : 'none'
                  }}
                >
                  <h3 className="text-sm font-medium mb-4 text-muted-foreground">Quick Contact</h3>
                  
                  {/* Phone */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium">Phone</p>
                    </div>
                    <a 
                      href={`tel:${selectedOffice.manager.mobile.replace(/\s/g, '')}`}
                      className="text-lg text-primary hover:underline block font-medium"
                    >
                      {selectedOffice.manager.mobile}
                    </a>
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium">Email</p>
                    </div>
                    <a 
                      href={`mailto:${selectedOffice.manager.email}`}
                      className="text-sm text-primary hover:underline block break-all"
                    >
                      {selectedOffice.manager.email}
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Map Panel (fixed 600px height) */}
            <div className="flex-1">
              <div className="h-[600px] rounded-2xl overflow-hidden border shadow-lg">
                <iframe
                  src={generateMapUrl()}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${selectedOffice.name} Location`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Department Contacts */}
      <section ref={departmentsRef} className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Department Contacts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect directly with our specialized teams for expert assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => {
              const Icon = dept.icon
              return (
                <div
                  key={dept.title}
                  className={`group bg-card border rounded-lg p-6 hover-lift transition-all hover:border-primary/50 ${departmentsVisible ? 'fade-rise' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                    </div>
                  </div>
                  
                  <h3 className="text-sm mb-2">{dept.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="space-y-3 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{dept.role}</p>
                      <p className="text-sm font-medium">{dept.manager}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.href = `mailto:${dept.email}`}
                    >
                      <Mail className="mr-1 h-3.5 w-3.5" />
                      Email
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = `tel:${dept.phone.replace(/\s/g, '')}`}
                    >
                      <Phone className="mr-1 h-3.5 w-3.5" />
                      Call
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Special Request Form */}
      <section ref={formRef} className="py-16">
        <div className="container">
          <div className={`max-w-3xl mx-auto ${formVisible ? 'fade-rise' : 'opacity-0'}`}>
            <div className="text-center mb-12">
              <h2 className="mb-4">Special Request</h2>
              <p className="text-lg text-muted-foreground">
                Have a unique requirement? Submit your special request and our team will contact you shortly.
              </p>
            </div>

            {formSubmitted ? (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-500 mx-auto mb-4" />
                <h3 className="text-xl text-green-900 dark:text-green-100 mb-2">Thank You!</h3>
                <p className="text-green-700 dark:text-green-300">
                  Your special request has been received. Our team will contact you shortly.
                </p>
              </div>
            ) : (
              <div className="bg-card border rounded-lg p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      placeholder="Brief description of your request"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Office Selection */}
                    <div>
                      <Label htmlFor="office">Preferred Office (Optional)</Label>
                      <select
                        id="office"
                        name="office"
                        value={formData.office}
                        onChange={handleInputChange}
                        className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        <option value="">Select office...</option>
                        {offices.map(office => (
                          <option key={office.id} value={office.id}>
                            {office.city} {office.isHeadquarter ? '(HQ)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Department Selection */}
                    <div>
                      <Label htmlFor="department">Related Department (Optional)</Label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        <option value="">Select department...</option>
                        {departments.map(dept => (
                          <option key={dept.title} value={dept.title}>
                            {dept.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Your Request *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Please provide detailed information about your special request..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="mt-2 resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Preference */}
                    <div>
                      <Label htmlFor="contactPreference">Contact Preference</Label>
                      <select
                        id="contactPreference"
                        name="contactPreference"
                        value={formData.contactPreference}
                        onChange={handleInputChange}
                        className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="Either">Either</option>
                      </select>
                    </div>

                    {/* Attachments */}
                    <div>
                      <Label htmlFor="attachments">Attachments (Optional)</Label>
                      <div className="mt-2">
                        <label className="flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Upload files</span>
                          <input
                            type="file"
                            id="attachments"
                            name="attachments"
                            multiple
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full hover-lift" size="lg">
                    <Send className="mr-2 h-5 w-5" />
                    Submit Request
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}