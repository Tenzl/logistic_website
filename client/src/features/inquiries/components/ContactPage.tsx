import { Phone, Mail, User, Ship, Anchor, Truck, FileText } from 'lucide-react'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useState } from 'react'

interface ContactPageProps {
  onNavigateHome: () => void
}

export function ContactPage({ onNavigateHome }: ContactPageProps) {
  const prefersReducedMotion = useReducedMotion()
  const [heroRef, heroVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [hotlineRef, hotlineVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [departmentsRef, departmentsVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [formRef, formVisible] = useIntersectionObserver({ threshold: 0.1 })

  const departments = [
    {
      title: 'SHIPPING AGENCY',
      icon: Ship,
      manager: 'DUC TUYEN (Mr)',
      role: 'Manager',
      mobile: '+84 91-428-2649',
      email: 'ship.agency@seatrans.com.vn',
      color: 'bg-blue-50'
    },
    {
      title: 'CHARTERING & SHIP-BROKING',
      icon: Anchor,
      manager: 'DUY CONG (Mr)',
      role: 'Manager',
      mobile: '+84 90-500-1077',
      email: 'chartering@seatrans.com.vn',
      color: 'bg-indigo-50'
    },
    {
      title: 'FREIGHT FORWARDING & LOGISTICS',
      icon: Truck,
      manager: 'Ta Thi Thao Ly (Ms)',
      role: 'Manager',
      mobile: '+84 90-581-2679',
      email: 'total.logistics@seatrans.com.vn',
      color: 'bg-purple-50'
    },
    {
      title: 'IM-EXPORT CUSTOMS CLEARANCE',
      icon: FileText,
      manager: 'Duy Tuan (Mr)',
      role: 'Customs Expert',
      mobile: '+84 90-104-7477',
      email: 'customs.svc@seatrans.com.vn',
      color: 'bg-cyan-50'
    }
  ]

  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    inquiry: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log('Inquiry submitted:', formData)
    alert('Thank you for your inquiry! We will get back to you soon.')
    // Reset form
    setFormData({
      fullName: '',
      company: '',
      email: '',
      phone: '',
      inquiry: ''
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="py-20 bg-gradient-to-br from-primary/5 to-white"
      >
        <div className="container">
          <div 
            className="max-w-3xl mx-auto text-center"
            style={{
              opacity: prefersReducedMotion ? 1 : (heroVisible ? 1 : 0),
              transform: prefersReducedMotion ? 'none' : (heroVisible ? 'translateY(0)' : 'translateY(20px)'),
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <h1 className="text-4xl md:text-5xl mb-6">
              SEATRANS is your reliable partner & professional services provider !!!
            </h1>
            <p className="text-xl text-muted-foreground">
              Contact us
            </p>
          </div>
        </div>
      </section>

      {/* Hotline Section */}
      <section 
        ref={hotlineRef}
        className="py-16 border-b"
      >
        <div className="container">
          <div 
            className="max-w-2xl mx-auto bg-primary text-white rounded-lg p-8 md:p-12"
            style={{
              opacity: prefersReducedMotion ? 1 : (hotlineVisible ? 1 : 0),
              transform: prefersReducedMotion ? 'none' : (hotlineVisible ? 'translateY(0)' : 'translateY(20px)'),
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="flex items-center justify-center mb-6">
              <Phone className="h-12 w-12" />
            </div>
            <h2 className="text-center text-2xl mb-8">Hotline</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <User className="h-5 w-5" />
                <p>
                  <strong>DO DUY AN (Mr)</strong> - General Manager
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" />
                <a href="tel:+84935015679" className="hover:underline">
                  +84 93-501-5679
                </a>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  <a href="mailto:operation@seatrans.com.vn" className="hover:underline">
                    operation@seatrans.com.vn
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  <a href="mailto:seatrans.info@seatrans.com.vn" className="hover:underline">
                    seatrans.info@seatrans.com.vn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section 
        ref={departmentsRef}
        className="py-20"
      >
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {departments.map((dept, index) => {
              const Icon = dept.icon
              return (
                <div
                  key={dept.title}
                  className={`${dept.color} rounded-lg p-8 border border-gray-200`}
                  style={{
                    opacity: prefersReducedMotion ? 1 : (departmentsVisible ? 1 : 0),
                    transform: prefersReducedMotion ? 'none' : (departmentsVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s`
                  }}
                >
                  {/* Department Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg">
                      {dept.title}
                    </h3>
                  </div>

                  {/* Manager Info */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{dept.manager}</p>
                        <p className="text-sm text-muted-foreground">{dept.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                      <a 
                        href={`tel:${dept.mobile.replace(/\s/g, '')}`}
                        className="hover:text-primary transition-colors"
                      >
                        {dept.mobile}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                      <a 
                        href={`mailto:${dept.email}`}
                        className="hover:text-primary transition-colors break-all"
                      >
                        {dept.email}
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section 
        ref={formRef}
        className="py-20 bg-muted border-t"
      >
        <div className="container">
          <div 
            className="max-w-2xl mx-auto text-center mb-8"
            style={{
              opacity: prefersReducedMotion ? 1 : (formVisible ? 1 : 0),
              transform: prefersReducedMotion ? 'none' : (formVisible ? 'translateY(0)' : 'translateY(20px)'),
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <h2 className="text-3xl mb-4">Send Us Your Inquiry</h2>
            <p className="text-lg text-muted-foreground">
              If any your further inquiry and/or order, please send to us!
            </p>
          </div>
          <Card 
            className="max-w-2xl mx-auto shadow-lg"
            style={{
              opacity: prefersReducedMotion ? 1 : (formVisible ? 1 : 0),
              transform: prefersReducedMotion ? 'none' : (formVisible ? 'translateY(0)' : 'translateY(20px)'),
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.08s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.08s'
            }}
          >
            <CardHeader>
              <CardTitle>Contact Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      type="text"
                      id="company"
                      name="company"
                      placeholder="Your Company Ltd."
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+84 90-123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquiry">Inquiry</Label>
                    <Textarea
                      id="inquiry"
                      name="inquiry"
                      placeholder="Please describe your inquiry or order details..."
                      value={formData.inquiry}
                      onChange={handleInputChange}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-32"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-6 transition-all duration-200 hover:shadow-lg"
                >
                  Submit Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}