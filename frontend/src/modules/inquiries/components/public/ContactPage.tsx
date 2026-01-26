import { Phone, Mail, MapPin, Clock, Ship, Anchor, Truck, FileText, ArrowRight, User, Building2, Send, Paperclip, CheckCircle2, ChevronDown, ChevronUp, Check, ArrowUp, Upload, X, AlertCircle } from 'lucide-react'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useState, useEffect } from 'react'
import { provinceService, Province } from '@/modules/logistics/services/provinceService'
import { portService } from '@/modules/logistics/services/portService'
import { useAuth } from '@/modules/auth/context/AuthContext'
import { toast } from 'sonner'
import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import Link from 'next/link'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  type FileUploadProps,
  FileUploadTrigger,
} from '@/shared/components/ui/file-upload'

interface ContactPageProps {
  onNavigateHome: () => void
}

interface Office {
  id: number
  name: string
  city: string
  region: string
  address: string
  latitude?: number
  longitude?: number
  manager: {
    name: string
    title: string
    mobile: string
    email: string
  }
  coordinates?: {
    lat?: number
    lng?: number
  }
  isHeadquarter: boolean
  isActive: boolean
}

interface Department {
  id: number
  name: string
  displayName?: string
  slug: string
  description: string
  isActive: boolean
}

export function ContactPage({ onNavigateHome }: ContactPageProps) {
  const { user, profileComplete } = useAuth()
  const [heroRef, heroVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [mapRef, mapVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [departmentsRef, departmentsVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [formRef, formVisible] = useIntersectionObserver({ threshold: 0.1 })

  const [offices, setOffices] = useState<Office[]>([])
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [provincesWithPorts, setProvincesWithPorts] = useState<Province[]>([])
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    office: '',
    department: '',
    message: ''
  })
  const [files, setFiles] = useState<File[]>([])
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  // Hardcoded department contacts with full information
  const departmentContacts = [
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

  // Fetch offices and service types on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch offices from backend
        const officesResponse = await apiClient.get(API_CONFIG.OFFICES.ACTIVE, { skipAuth: true })
        const officesData = await officesResponse.json()
        
        if (officesData.success && officesData.data) {
          setOffices(officesData.data)
          // Set first office as default selected
          if (officesData.data.length > 0) {
            setSelectedOffice(officesData.data[0])
          }
        }
        
        // Fetch active service types
        const servicesResponse = await apiClient.get(API_CONFIG.SERVICE_TYPES.ACTIVE, { skipAuth: true })
        const servicesData = await servicesResponse.json()
        
        if (servicesData.success && servicesData.data) {
          setDepartments(servicesData.data.map((s: any) => ({
            id: s.id,
            name: s.displayName || s.name,
            displayName: s.displayName,
            slug: s.slug,
            description: s.description || '',
            isActive: s.isActive
          })))
        }
        
        // Load provinces with ports for form selection
        const allProvinces = await provinceService.getAllProvinces()
        const allPorts = await portService.getAllPorts()
        const provinceIdsWithPorts = new Set(allPorts.map(port => port.provinceId))
        const filtered = allProvinces.filter(province => provinceIdsWithPorts.has(province.id))
        setProvincesWithPorts(filtered)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback to empty arrays
        setOffices([])
        setDepartments([])
        setProvincesWithPorts([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const getCoordinateQuery = (office: Office) => {
    const lat = office.coordinates?.lat ?? office.latitude
    const lng = office.coordinates?.lng ?? office.longitude
    return lat !== undefined && lng !== undefined ? `${lat},${lng}` : ''
  }

  // Generate map URL using address first (fallback to lat/lng)
  const generateMapUrl = () => {
    if (!selectedOffice) return ''
    const coordQuery = getCoordinateQuery(selectedOffice)
    const query = selectedOffice.address?.trim()
      ? encodeURIComponent(selectedOffice.address)
      : coordQuery
    return query ? `https://maps.google.com/maps?q=${query}&z=16&output=embed` : ''
  }

  const handleSelectOffice = (office: Office) => {
    setSelectedOffice(office)
    setIsDrawerOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const onUpload: NonNullable<FileUploadProps["onUpload"]> = async (files, { onProgress, onSuccess, onError }) => {
    try {
      setIsUploading(true)
      const uploadPromises = files.map(async (file) => {
        try {
          const totalChunks = 10
          let uploadedChunks = 0

          for (let i = 0; i < totalChunks; i++) {
            await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 100))
            uploadedChunks++
            const progress = (uploadedChunks / totalChunks) * 100
            onProgress(file, progress)
          }

          await new Promise((resolve) => setTimeout(resolve, 500))
          onSuccess(file)
        } catch (error) {
          onError(file, error instanceof Error ? error : new Error("Upload failed"))
        } finally {
          setIsUploading(false)
        }
      })

      await Promise.all(uploadPromises)
    } catch (error) {
      console.error("Unexpected error during upload:", error)
    }
  }

  const onFileReject = (file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add inquiry data as JSON
      const inquiryData = {
        serviceTypeSlug: 'special-request',
        fullName: user ? user.fullName : formData.fullName,
        email: user ? user.email : formData.email,
        phone: user ? (user.phone || '') : formData.phone,
        company: user ? (user.company || '') : formData.company,
        subject: formData.subject,
        preferredProvinceId: formData.office ? parseInt(formData.office) : null,
        relatedDepartmentId: formData.department ? parseInt(formData.department) : null,
        message: formData.message
      }
      
      submitData.append('inquiry', new Blob([JSON.stringify(inquiryData)], {
        type: 'application/json'
      }))
      
      // Add files if any
      files.forEach((file) => {
        submitData.append('files', file)
      })

      // Debug: Log data before sending
      console.log('--- Submitting Special Request ---')
      console.log('Inquiry Data:', inquiryData)
      console.log('Files:', files)
      console.log('FormData Inquiry:', submitData.get('inquiry'))
      console.log('FormData Files Count:', submitData.getAll('files').length)
      
      // Submit to backend
      const response = await apiClient.post(API_CONFIG.INQUIRIES.SUBMIT, submitData, {
        skipAuth: true,
      })
      
      if (response.ok) {
        console.log('Special request submitted successfully')
        setFormSubmitted(true)
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormSubmitted(false)
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            company: '',
            subject: '',
            office: '',
            department: '',
            message: ''
          })
          setFiles([])
        }, 3000)
      } else {
        console.error('Failed to submit special request')
      }
    } catch (error) {
      console.error('Error submitting special request:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Compact */}
      <section className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-16">
        <div className="container">
          <div ref={heroRef} className={`text-center max-w-3xl mx-auto ${heroVisible ? 'fade-rise' : 'opacity-0'}`}>
            <h2 className="fade-rise text-3xl md:text-4xl font-bold mb-4">Contact SEATRANS</h2>
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
            <h2 className="fade-rise text-3xl md:text-4xl font-bold mb-4">Our Offices</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nationwide presence across Vietnam's key maritime hubs
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading offices...</p>
            </div>
          ) : selectedOffice ? (
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
                        onClick={() => {
                          const query = selectedOffice.address?.trim()
                            ? encodeURIComponent(selectedOffice.address)
                            : getCoordinateQuery(selectedOffice)
                          if (query) {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
                          }
                        }}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No offices available</p>
            </div>
          )}
        </div>
      </section>

      {/* Department Contacts */}
      <section ref={departmentsRef} className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="fade-rise text-3xl md:text-4xl font-bold mb-4">Department Contacts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect directly with our specialized teams for expert assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departmentContacts.map((dept, index) => {
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
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Mobile</span>
                      </div>
                      <p className="text-sm font-medium select-all hover:text-primary transition-colors cursor-text">
                        {dept.phone}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Email</span>
                      </div>
                      <p className="text-sm font-medium select-all break-all hover:text-primary transition-colors cursor-text">
                        {dept.email}
                      </p>
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
              <h2 className="fade-rise text-3xl md:text-4xl font-bold mb-4">Special Request</h2>
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
                {/* Profile Incomplete Warning */}
                {user && !profileComplete && (
                  <Alert variant="destructive" className="mb-6">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <AlertDescription className="flex-1">
                        Please complete your profile before submitting a request.
                        <Link href="/dashboard" className="ml-1 underline font-medium">
                          Complete Profile
                        </Link>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information - Only show when not authenticated */}
                  {!user && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="Your full name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="mt-2"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="your.email@company.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Phone */}
                        <div>
                          <Label htmlFor="phone">Phone (Optional)</Label>
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="+84 ..."
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="mt-2"
                          />
                        </div>

                        {/* Company */}
                        <div>
                          <Label htmlFor="company">Company (Optional)</Label>
                          <Input
                            type="text"
                            id="company"
                            name="company"
                            placeholder="Your company name"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </>
                  )}

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
                    {/* Province Selection */}
                    <div>
                      <Label htmlFor="office">Preferred Province (Optional)</Label>
                      <select
                        id="office"
                        name="office"
                        value={formData.office}
                        onChange={handleInputChange}
                        disabled={loading}
                        aria-label="Preferred Province"
                        className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        <option value="">Select province...</option>
                        {provincesWithPorts.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
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
                        disabled={loading}
                        aria-label="Related Department"
                        className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        <option value="">Select department...</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message & Attachments - Integrated Chat Input */}
                  <div>
                    <Label htmlFor="message">Your Request *</Label>
                    <FileUpload
                      value={files}
                      onValueChange={setFiles}
                      onUpload={onUpload}
                      onFileReject={onFileReject}
                      accept="application/pdf"
                      maxFiles={10}
                      maxSize={5 * 1024 * 1024}
                      className="relative mt-2"
                      multiple
                      disabled={isUploading}
                    >
                      <div className="relative flex w-full flex-col gap-2.5 rounded-lg border border-input px-3 py-2 outline-none focus-within:ring-1 focus-within:ring-ring/50">
                        <FileUploadList
                          orientation="horizontal"
                          className="overflow-x-auto px-0 py-1"
                        >
                          {files.map((file, index) => (
                            <FileUploadItem key={index} value={file} className="max-w-52 p-1.5">
                              <FileUploadItemPreview className="size-8 [&>svg]:size-5">
                                <FileUploadItemProgress variant="fill" />
                              </FileUploadItemPreview>
                              <FileUploadItemMetadata size="sm" />
                              <FileUploadItemDelete asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute -top-1 -right-1 size-4 shrink-0 cursor-pointer rounded-full"
                                >
                                  <X className="size-2.5" />
                                </Button>
                              </FileUploadItemDelete>
                            </FileUploadItem>
                          ))}
                        </FileUploadList>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Please provide detailed information about your special request..."
                          required
                          disabled={isUploading}
                          className="field-sizing-content min-h-[120px] w-full resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                        />
                        <div className="flex items-center justify-between gap-1.5 px-1 pb-1">
                          <span className="text-xs text-muted-foreground">
                            * Supports PDF only (max 5MB)
                          </span>
                          <FileUploadTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7 rounded-sm"
                              title="Attach PDF file"
                            >
                              <Paperclip className="size-3.5" />
                              <span className="sr-only">Attach file</span>
                            </Button>
                          </FileUploadTrigger>
                        </div>
                      </div>
                    </FileUpload>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full hover-lift" 
                    size="lg"
                    disabled={user ? !profileComplete : false}
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {user && !profileComplete ? 'Complete Profile First' : 'Submit Request'}
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