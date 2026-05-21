"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ParticlesCanvas } from "@/components/ui/particles-canvas"
import LoginPage from "@/components/ui/gaming-login"
import { assetPath } from "@/lib/asset-path"
import { BRAND_LOGO_SRC } from "@/lib/brand-assets"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') || ''
  const codeFromUrl = searchParams.get('code') || ''
  const tokenParam = searchParams.get('token') || ''
  
  const [email, setEmail] = useState(emailParam)
  const [code, setCode] = useState('')
  const [token, setToken] = useState(tokenParam)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(codeFromUrl || null)

  useEffect(() => {
    if (emailParam) setEmail(emailParam)
    if (codeFromUrl) setDevCode(codeFromUrl)
    if (tokenParam) setToken(tokenParam)
  }, [emailParam, codeFromUrl, tokenParam])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.')
      return
    }
    setIsVerifying(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-code',
          email: email,
          code: code,
          token: token
        }),
      })
      const result = await response.json()
      
      if (result.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(result.user))
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('growpal_token', '1')
        }
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          router.push('/')
        }, 2200)
      } else {
        setError(result.message || 'Verification failed. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Email is required to resend the code.')
      return
    }
    setIsResending(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend-code',
          email: email
        }),
      })
      const result = await response.json()
      
      if (result.success) {
        setError(null)
        if (result.token) setToken(result.token)
        if (result.dev_code) setDevCode(result.dev_code)
        setSuccessMessage('A new verification code was sent to your email.')
      } else {
        setError(result.message || 'Failed to resend code.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.')
    } finally {
      setIsResending(false)
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
              src={BRAND_LOGO_SRC} 
              alt="GrowPal Logo" 
              width={100} 
              height={100} 
              className="object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
          <p className="mt-2 text-sm text-white/80">Enter the 6-digit code we sent to your email</p>
        </div>

        <form
          className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-sm"
          onSubmit={handleVerify}
        >
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200 text-center">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/50 p-3 text-sm text-emerald-200 text-center">
              {successMessage}
            </div>
          )}
          
          {devCode && (
            <div className="rounded-lg bg-amber-500/20 border border-amber-500/50 p-3 text-sm text-amber-200 text-center">
              Didn't receive the email? Use this code: <strong>{devCode}</strong>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <input
                type="email"
                value={email}
                readOnly
                placeholder="your@email.com"
                required
                className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-white/50 focus:border-[#3FA36A]/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">Verification Code</label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                onComplete={() => document.getElementById('verify-btn')?.focus()}
              >
                <InputOTPGroup className="gap-2">
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-12 w-12 rounded-xl border-white/20 bg-white/5 text-white text-lg font-semibold data-[active=true]:border-[#3FA36A] data-[active=true]:ring-2 data-[active=true]:ring-[#3FA36A]/30"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button 
            id="verify-btn"
            type="submit" 
            disabled={isVerifying || code.length !== 6}
            className="rounded-full bg-[#3FA36A] hover:bg-[#2F6F4E] disabled:opacity-70 disabled:cursor-not-allowed" 
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Verify & Continue
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-[#A8D5BA] hover:text-[#3FA36A] transition-colors disabled:opacity-50"
          >
            {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          <Link href="/login" className="inline-flex items-center gap-1 font-medium text-[#A8D5BA] hover:text-[#3FA36A] transition-colors">
            <ArrowLeft size={16} />
            Back to Sign in
          </Link>
        </p>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-24 h-24 mx-auto mb-4 bg-[#2F6F4E] rounded-full flex items-center justify-center">
              <span className="text-white text-5xl font-bold">✓</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">You're all set!</h2>
            <p className="mt-2 text-gray-600 text-sm">Email verified successfully. Redirecting to the home page...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#3FA36A]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
