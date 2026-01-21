import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { PhoneInput } from '@/shared/components/ui/phone-input'
import { Label } from '@/shared/components/ui/label'
import { Pending } from '@/shared/components/pending'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Ship, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/modules/auth/context/AuthContext'

interface SignupProps {
  onNavigateHome: () => void
  onNavigateLogin: () => void
  onSignupSuccess?: () => void
}

export function Signup({ onNavigateHome, onNavigateLogin, onSignupSuccess }: SignupProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    if (!agreeToTerms) {
      setError('Please agree to Terms of Service and Privacy Policy')
      return
    }

    const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)
    if (!passwordValid) {
      setError('Password must be 8+ chars with uppercase, lowercase, and a number.')
      return
    }

    setIsLoading(true)
    try {
      const result = await register(
        formData.email,
        formData.fullName,
        formData.password,
        formData.phone,
        formData.company
      )

      if (result.success) {
        // Redirect to login page for email verification
        // In the future, this will require email verification before login
        onNavigateLogin()
      } else {
        setError(result.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'Contains number', met: /[0-9]/.test(formData.password) }
  ]

  return (
    <div className="min-h-screen bg-background px-4 py-10 flex items-center justify-center">
      <div className="relative w-full max-w-md">

        <Card className="shadow-lg border border-border/60 pb-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>Fill in your details to create your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <PhoneInput
                id="phone"
                defaultCountry="VN"
                value={formData.phone || undefined}
                onChange={(val) => handleInputChange('phone', val || '')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                type="text"
                placeholder="Your company name"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <CheckCircle2
                        className={`w-3 h-3 ${req.met ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}
                      />
                      <span className={req.met ? 'text-green-700 dark:text-green-600' : 'text-muted-foreground'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </Label>
            </div>

            <Pending isPending={isLoading} disabled={!agreeToTerms}>
              <Button type="submit" className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Pending>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t pt-4">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button onClick={onNavigateLogin} className="text-primary hover:underline font-medium">
                Sign in
              </button>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Protected by industry-standard encryption and security measures
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
