'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

interface LoginFormProps {
  onSubmit: (email: string, password: string, remember: boolean) => void
  initialEmail?: string
  promoBanner?: string | null
  title?: string
  subtitle?: string
  forgotPasswordHref?: string | null
  registerHref?: string | null
  registerPrompt?: string
  registerLabel?: string
  homeHref?: string
}

interface VideoBackgroundProps {
  videoUrl: string
}

interface FormInputProps {
  icon: React.ReactNode
  type: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}

const FormInput: React.FC<FormInputProps> = ({
  icon,
  type,
  placeholder,
  value,
  onChange,
  required,
}) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-white placeholder-white/60 transition-colors focus:border-[#3FA36A]/50 focus:outline-none"
    />
  </div>
)

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Video autoplay failed:', error)
      })
    }
  }, [])

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <div className="absolute inset-0 z-10 bg-black/30" />
      <video
        ref={videoRef}
        className="absolute inset-0 h-auto min-h-full w-auto min-w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  initialEmail = '',
  promoBanner,
  title = 'Your green journey starts here',
  subtitle = 'Sign in to start growing',
  forgotPasswordHref = '/forgot-password',
  registerHref = '/register',
  registerPrompt = "Don't have an account? ",
  registerLabel = 'Create Account',
  homeHref = '/',
}) => {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail)
  }, [initialEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      return
    }
    
    setIsSubmitting(true)
    setIsSuccess(false)
    
    try {
      // Call the onSubmit handler (which will call the API)
      await onSubmit(email, password, false)
      setIsSuccess(true)
    } catch (error) {
      console.error('Login form error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-8 backdrop-blur-sm">
      <div className="mb-8 text-center">
        <Link href={homeHref} className="inline-flex items-center justify-center mb-1">
          <Image 
            src="/icon.svg" 
            alt="GrowPal Logo" 
            width={100} 
            height={100} 
            className="object-contain"
          />
        </Link>
        <div className="flex flex-col items-center space-y-1 text-white/80">
          <span className="group relative cursor-default">
            <span className="absolute -inset-1 rounded opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100 group-hover:bg-gradient-to-r group-hover:from-[#2F6F4E]/20 group-hover:to-[#3FA36A]/20" />
            <span className="relative inline-block animate-pulse">
              {title}
            </span>
          </span>
          <span className="text-xs text-white/50 animate-pulse">
            {subtitle}
          </span>
        </div>
      </div>

      {promoBanner && (
        <div className="mb-6 rounded-xl border border-[#3FA36A]/40 bg-[#3FA36A]/15 px-4 py-3 text-center text-sm text-white/95">
          {promoBanner}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          icon={<Mail className="text-white/60" size={18} />}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <FormInput
            icon={<Lock className="text-white/60" size={18} />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white focus:outline-none"
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

        {forgotPasswordHref ? (
          <div className="flex items-center justify-end">
            <Link
              href={forgotPasswordHref}
              className="text-sm text-white/80 transition-colors hover:text-white"
            >
              Forgot password?
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-lg py-3 font-medium text-white shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3FA36A] focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-70 ${
            isSuccess
              ? 'bg-[#3FA36A]'
              : 'bg-[#3FA36A] hover:-translate-y-0.5 hover:shadow-[#3FA36A]/40'
          }`}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {registerHref ? (
        <p className="mt-8 text-center text-sm text-white/60">
          {registerPrompt}
          <Link
            href={registerHref}
            className="font-medium text-white transition-colors hover:text-[#A8D5BA]"
          >
            {registerLabel}
          </Link>
        </p>
      ) : null}
    </div>
  )
}

const LoginPage = {
  LoginForm,
  VideoBackground,
}

export default LoginPage
