"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ParticlesCanvas } from "@/components/ui/particles-canvas"
import LoginPage from "@/components/ui/gaming-login"
import { assetPath } from "@/lib/asset-path"
import { saveWelcomeOffer } from "@/lib/discounts"

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Field errors
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // Password requirements
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSymbol: false
  })
  
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordSubmitted, setPasswordSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const p = new URLSearchParams(window.location.search)
    const e = p.get("email")
    const promo = p.get("promo")
    if (e) setEmail(decodeURIComponent(e))
    if (promo === "10" && e) {
      saveWelcomeOffer(decodeURIComponent(e), "register-query")
    }
  }, [])

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Check password requirements
  const checkPasswordRequirements = (pwd: string) => {
    setPasswordRequirements({
      minLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    })
  }

  // Validate all fields
  const validateFields = () => {
    const errors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }

    if (!firstName.trim()) {
      errors.firstName = 'This field is required'
    }

    if (!lastName.trim()) {
      errors.lastName = 'This field is required'
    }

    if (!email.trim()) {
      errors.email = 'This field is required'
    } else if (!validateEmail(email)) {
      errors.email = 'Invalid email'
    }

    if (!password) {
      errors.password = 'This field is required'
    } else {
      const allRequirementsMet = Object.values(passwordRequirements).every(req => req === true)
      if (!allRequirementsMet) {
        errors.password = 'Password does not meet requirements'
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'This field is required'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFieldErrors(errors)
    return Object.values(errors).every(err => err === '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPasswordTouched(true)
    setPasswordSubmitted(true)

    // Validate all fields
    if (!validateFields()) {
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    setIsSubmitting(true)

    try {
      // Combine first and last name
      const fullName = `${firstName} ${lastName}`

      console.log('Sending registration request...')
      
      // Call Next.js API route (which proxies to PHP API)
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          name: fullName,
          email: email,
          password: password
        }),
      })

      const result = await response.json()
      console.log('Registration response:', result)

      if (result.success) {
        setShowSuccess(true)
        setError(null)
        console.log('✅ Registration successful! User ID:', result.user_id)
        
        const userEmail = result.email || email
        const tokenParam = result.token ? `&token=${encodeURIComponent(result.token)}` : ''
        const devCodeParam = result.dev_code ? `&code=${result.dev_code}` : ''
        setTimeout(() => {
          setShowSuccess(false)
          setFirstName('')
          setLastName('')
          setPassword('')
          setConfirmPassword('')
          setFieldErrors({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
          setPasswordRequirements({ minLength: false, hasUpperCase: false, hasLowerCase: false, hasNumber: false, hasSymbol: false })
          setShowPasswordRequirements(false)
          setPasswordTouched(false)
          setPasswordSubmitted(false)
          router.push(`/verify-email?email=${encodeURIComponent(userEmail)}${tokenParam}${devCodeParam}`)
        }, 2000)
      } else {
        const errorMsg = result.message || 'Registration failed. Please try again.'
        setError(errorMsg)
        setShowSuccess(false)
        
        // Check if email already exists
        if (errorMsg.toLowerCase().includes('email already exists') || errorMsg.toLowerCase().includes('already exists')) {
          setFieldErrors({...fieldErrors, email: 'Email already exists. Please use a different email.'})
        }
        
        console.error('❌ Registration failed:', errorMsg)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <LoginPage.VideoBackground videoUrl={assetPath("/videos/signin.mp4")} />
      <div className="absolute inset-0 z-10">
        <ParticlesCanvas />
      </div>

      <div className="relative z-20 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-1">
            <Image 
              src="/images/iccoonnn.png"
              alt="GrowPal Logo"
              width={100} 
              height={100} 
              className="object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-white/80">Join the GrowPal community and start your green journey.</p>
        </div>

        <form
          className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-sm"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200 text-center">
              {error}
            </div>
          )}
          
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <User className="text-white/60" size={18} />
                </div>
                <Input 
                  id="firstName" 
                  placeholder="First Name" 
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value)
                    if (fieldErrors.firstName) {
                      setFieldErrors({...fieldErrors, firstName: ''})
                    }
                  }}
                  onBlur={() => {
                    if (!firstName.trim()) {
                      setFieldErrors({...fieldErrors, firstName: 'This field is required'})
                    }
                  }}
                  className={`rounded-xl border-white/20 bg-white/5 text-white placeholder:text-white/50 pl-10 pr-10 ${
                    fieldErrors.firstName ? 'border-red-500' : ''
                  }`}
                  required
                />
                {fieldErrors.firstName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="text-red-500" size={18} />
                  </div>
                )}
              </div>
              {fieldErrors.firstName && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {fieldErrors.firstName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <User className="text-white/60" size={18} />
                </div>
                <Input 
                  id="lastName" 
                  placeholder="Last Name" 
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value)
                    if (fieldErrors.lastName) {
                      setFieldErrors({...fieldErrors, lastName: ''})
                    }
                  }}
                  onBlur={() => {
                    if (!lastName.trim()) {
                      setFieldErrors({...fieldErrors, lastName: 'This field is required'})
                    }
                  }}
                  className={`rounded-xl border-white/20 bg-white/5 text-white placeholder:text-white/50 pl-10 pr-10 ${
                    fieldErrors.lastName ? 'border-red-500' : ''
                  }`}
                  required
                />
                {fieldErrors.lastName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="text-red-500" size={18} />
                  </div>
                )}
              </div>
              {fieldErrors.lastName && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {fieldErrors.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <Mail className="text-white/60" size={18} />
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="Add email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors({...fieldErrors, email: ''})
                  }
                }}
                onBlur={async () => {
                  if (!email.trim()) {
                    setFieldErrors({...fieldErrors, email: 'This field is required'})
                  } else if (!validateEmail(email)) {
                    setFieldErrors({...fieldErrors, email: 'Invalid email'})
                  } else {
                    // Check if email already exists
                    try {
                      const response = await fetch('/api/auth', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          action: 'check-email',
                          email: email
                        }),
                      })
                      const result = await response.json()
                      if (result.exists) {
                        setFieldErrors({...fieldErrors, email: 'Email already exists. Please use a different email.'})
                      } else {
                        // Clear email error if it doesn't exist
                        if (fieldErrors.email && fieldErrors.email.includes('already exists')) {
                          setFieldErrors({...fieldErrors, email: ''})
                        }
                      }
                    } catch (error) {
                      // Silently fail - we'll check on submit
                    }
                  }
                }}
                className={`rounded-xl border-white/20 bg-white/5 text-white placeholder:text-white/50 pl-10 pr-10 ${
                  fieldErrors.email ? 'border-red-500' : ''
                }`}
                required
              />
              {fieldErrors.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="text-red-500" size={18} />
                </div>
              )}
            </div>
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <Lock className="text-white/60" size={18} />
              </div>
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Create password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  checkPasswordRequirements(e.target.value)
                  setShowPasswordRequirements(true)
                  setPasswordTouched(true)
                  if (fieldErrors.password) {
                    setFieldErrors({...fieldErrors, password: ''})
                  }
                }}
                onFocus={() => {
                  setShowPasswordRequirements(true)
                }}
                onBlur={() => {
                  if (!password) {
                    setFieldErrors({...fieldErrors, password: 'This field is required'})
                  } else {
                    const allRequirementsMet = Object.values(passwordRequirements).every(req => req === true)
                    if (!allRequirementsMet) {
                      setFieldErrors({...fieldErrors, password: 'Password does not meet requirements'})
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const allRequirementsMet = Object.values(passwordRequirements).every(req => req === true)
                    if (!allRequirementsMet) {
                      setFieldErrors({...fieldErrors, password: 'Password does not meet requirements'})
                    }
                  }
                }}
                className={`rounded-xl border-white/20 bg-white/5 text-white placeholder:text-white/50 pl-10 pr-10 ${
                  fieldErrors.password ? 'border-red-500' : ''
                }`}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {fieldErrors.password && (
                  <AlertCircle className="text-red-500" size={18} />
                )}
                <button
                  type="button"
                  className="text-white/60 transition-colors hover:text-white focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
            {showPasswordRequirements && (
              <div className="mt-2 space-y-1">
                <div className={`text-xs flex items-center gap-2 ${
                  passwordRequirements.minLength ? 'text-green-400' : 
                  passwordSubmitted && !passwordRequirements.minLength ? 'text-red-400' : 'text-white'
                }`}>
                  <span className={
                    passwordRequirements.minLength ? 'text-green-400' : 
                    passwordSubmitted && !passwordRequirements.minLength ? 'text-red-400' : 'text-white'
                  }>•</span>
                  At least 8 characters
                </div>
                <div className={`text-xs flex items-center gap-2 ${
                  passwordRequirements.hasUpperCase ? 'text-green-400' : 
                  passwordSubmitted && !passwordRequirements.hasUpperCase ? 'text-red-400' : 'text-white'
                }`}>
                  <span className={
                    passwordRequirements.hasUpperCase ? 'text-green-400' : 
                    passwordSubmitted && !passwordRequirements.hasUpperCase ? 'text-red-400' : 'text-white'
                  }>•</span>
                  One uppercase letter
                </div>
                <div className={`text-xs flex items-center gap-2 ${
                  passwordRequirements.hasLowerCase ? 'text-green-400' : 
                  passwordSubmitted && !passwordRequirements.hasLowerCase ? 'text-red-400' : 'text-white'
                }`}>
                  <span className={
                    passwordRequirements.hasLowerCase ? 'text-green-400' : 
                    passwordSubmitted && !passwordRequirements.hasLowerCase ? 'text-red-400' : 'text-white'
                  }>•</span>
                  One lowercase letter
                </div>
                <div className={`text-xs flex items-center gap-2 ${
                  passwordRequirements.hasNumber ? 'text-green-400' : 
                  passwordSubmitted && !passwordRequirements.hasNumber ? 'text-red-400' : 'text-white'
                }`}>
                  <span className={
                    passwordRequirements.hasNumber ? 'text-green-400' : 
                    passwordSubmitted && !passwordRequirements.hasNumber ? 'text-red-400' : 'text-white'
                  }>•</span>
                  One number
                </div>
                <div className={`text-xs flex items-center gap-2 ${
                  passwordRequirements.hasSymbol ? 'text-green-400' : 
                  passwordSubmitted && !passwordRequirements.hasSymbol ? 'text-red-400' : 'text-white'
                }`}>
                  <span className={
                    passwordRequirements.hasSymbol ? 'text-green-400' : 
                    passwordSubmitted && !passwordRequirements.hasSymbol ? 'text-red-400' : 'text-white'
                  }>•</span>
                  One symbol
                </div>
              </div>
            )}
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {fieldErrors.password}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <Lock className="text-white/60" size={18} />
              </div>
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="Confirm password" 
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors({...fieldErrors, confirmPassword: ''})
                  }
                }}
                onBlur={() => {
                  if (!confirmPassword) {
                    setFieldErrors({...fieldErrors, confirmPassword: 'This field is required'})
                  } else if (password !== confirmPassword) {
                    setFieldErrors({...fieldErrors, confirmPassword: 'Passwords do not match'})
                  }
                }}
                className={`rounded-xl border-white/20 bg-white/5 text-white placeholder:text-white/50 pl-10 pr-10 ${
                  fieldErrors.confirmPassword ? 'border-red-500' : ''
                }`}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {fieldErrors.confirmPassword && (
                  <AlertCircle className="text-red-500" size={18} />
                )}
                <button
                  type="button"
                  className="text-white/60 transition-colors hover:text-white focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="rounded-full bg-[#3FA36A] hover:bg-[#2F6F4E] disabled:opacity-70 disabled:cursor-not-allowed" 
            size="lg"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#A8D5BA] transition-colors hover:text-[#3FA36A]">
            Sign in
          </Link>
        </p>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 z-20 text-center text-sm text-white/60">
        © 2026 GrowPal. All rights reserved.
      </footer>

      {/* Success Notification - Simple notification with large checkmark */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-24 h-24 mx-auto mb-4 bg-[#2F6F4E] rounded-full flex items-center justify-center">
              <span className="text-white text-5xl font-bold">✓</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Almost there!</h2>
            <p className="mt-2 text-gray-600 text-sm">Check your email and enter the code to complete registration.</p>
          </div>
        </div>
      )}
    </div>
  )
}
