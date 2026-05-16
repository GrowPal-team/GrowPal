"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ParticlesCanvas } from "@/components/ui/particles-canvas"
import LoginPage from "@/components/ui/gaming-login"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') || ''
  const tokenParam = searchParams.get('token') || ''

  const [email, setEmail] = useState(emailParam)
  const [token, setToken] = useState(tokenParam)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)
  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  }
  const passwordIsValid = Object.values(passwordRequirements).every(Boolean)

  useEffect(() => {
    if (emailParam) setEmail(emailParam)
    if (tokenParam) setToken(tokenParam)
  }, [emailParam, tokenParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError('Please request a new code from the Forgot password page.')
      return
    }
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.')
      return
    }
    if (!passwordIsValid) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          email: email,
          code: code,
          token: token,
          new_password: newPassword,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 2000)
        return
      }
      setError(result.message || 'Failed to reset password.')
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <LoginPage.VideoBackground videoUrl="/videos/signin.mp4" />
      <div className="absolute inset-0 z-10">
        <ParticlesCanvas />
      </div>

      <div className="relative z-20 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-1">
            <Image
              src="/icon.svg"
              alt="GrowPal"
              width={100}
              height={100}
              className="object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="mt-2 text-sm text-white/80">Enter the code from your email and choose a new password</p>
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
          {success && (
            <div className="rounded-lg bg-green-500/20 border border-green-500/50 p-3 text-sm text-green-200 text-center">
              Password updated! Redirecting to sign in...
            </div>
          )}
          {devCode && (
            <div className="rounded-lg bg-amber-500/20 border border-amber-500/50 p-3 text-sm text-amber-200 text-center">
              Dev: Code is <strong>{devCode}</strong>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <Input
                type="email"
                value={email}
                readOnly
                placeholder="your@email.com"
                required
                className="w-full rounded-xl border-white/20 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-white/50 focus:border-[#3FA36A]/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">Reset Code</label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
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

          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Strong password"
                minLength={8}
                className="w-full rounded-xl border-white/20 bg-white/5 py-3 pl-10 pr-12 text-white placeholder:text-white/50 focus:border-[#3FA36A]/50 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 space-y-1">
              <div className={`text-xs ${passwordRequirements.minLength ? 'text-green-400' : 'text-white/75'}`}>• At least 8 characters</div>
              <div className={`text-xs ${passwordRequirements.hasUpperCase ? 'text-green-400' : 'text-white/75'}`}>• One uppercase letter</div>
              <div className={`text-xs ${passwordRequirements.hasLowerCase ? 'text-green-400' : 'text-white/75'}`}>• One lowercase letter</div>
              <div className={`text-xs ${passwordRequirements.hasNumber ? 'text-green-400' : 'text-white/75'}`}>• One number</div>
              <div className={`text-xs ${passwordRequirements.hasSymbol ? 'text-green-400' : 'text-white/75'}`}>• One symbol</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                minLength={8}
                className="w-full rounded-xl border-white/20 bg-white/5 py-3 pl-10 pr-12 text-white placeholder:text-white/50 focus:border-[#3FA36A]/50 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || code.length !== 6 || !passwordIsValid || newPassword !== confirmPassword}
            className="rounded-full bg-[#3FA36A] hover:bg-[#2F6F4E] disabled:opacity-70"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Update Password
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-[#A8D5BA] hover:text-[#3FA36A] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <Loader2 className="h-12 w-12 animate-spin text-[#3FA36A]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
