import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Ship, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver'
import { useAuth } from '@/features/auth/context/AuthContext'

interface LoginProps {
  onNavigateHome: () => void
  onNavigateSignup: () => void
  onLoginSuccess?: () => void
}

export function Login({ onNavigateHome, onNavigateSignup, onLoginSuccess }: LoginProps) {
  const [credential, setCredential] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [ ref, isInView ] = useIntersectionObserver()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(credential, password)
      
      if (success) {
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', credential)
        } else {
          localStorage.removeItem('rememberMe')
        }
        
        // Redirect to dashboard or home
        onLoginSuccess?.()
      } else {
        setError('Invalid username/email or password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div ref={ref} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-muted/30 px-4 py-12">

      <div className={`w-full max-w-md ${isInView ? 'fade-rise' : 'opacity-0'}`}>
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your Seatrans account</p>
        </div>

        {/* Login Card */}
        <Card className={`shadow-xl border-border/50 ${isInView ? 'fade-rise stagger-1' : 'opacity-0'}`}>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Username or Email Field */}
              <div className="space-y-2">
                <Label htmlFor="credential">Username or Email</Label>
                <Input
                  id="credential"
                  type="text"
                  placeholder="username or email"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean | 'indeterminate') => setRememberMe(checked === true)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <a
                  href="#"
                  className="text-sm text-primary hover:underline transition-all duration-200"
                >
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full transition-all duration-200 hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button 
                onClick={onNavigateSignup}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </CardFooter>
        </Card>

        {/* Footer Links */}
        <div className={`mt-8 text-center text-sm text-muted-foreground ${isInView ? 'fade-rise stagger-2' : 'opacity-0'}`}>
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}