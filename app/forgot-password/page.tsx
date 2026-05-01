"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ParticlesCanvas } from "@/components/ui/particles-canvas"
import LoginPage from "@/components/ui/gaming-login"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot-password', email: email.trim() }),
      })
      const result = await response.json()
      if (result.success) {
        setSuccess(true)
        if (result.dev_code) setDevCode(result.dev_code)
        const tokenParam = result.token ? `&token=${encodeURIComponent(result.token)}` : ''
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(result.email || email)}${tokenParam}`)
        }, 1500)
      } else {
        setError(result.message || 'Something went wrong.')
      }
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
              src="/images/ChatGPT Image 13 مارس 2026، 12_53_44 ص.png"
              alt="GrowPal"
              width={100}
              height={100}
              className="object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="mt-2 text-sm text-white/80">Enter your email and we&apos;ll send you a reset code</p>
        </div>

        <form
          className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-sm"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-500/20 border border-green-500/50 p-3 text-sm text-green-200 text-center">
              Check your email. Redirecting...
            </div>
          )}
          {devCode && (
            <div className="rounded-lg bg-amber-500/20 border border-amber-500/50 p-3 text-sm text-amber-200 text-center">
              Dev: Your code is <strong>{devCode}</strong>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-xl border-white/20 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-white/50 focus:border-[#3FA36A]/50 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#3FA36A] hover:bg-[#2F6F4E] disabled:opacity-70"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Send Reset Code
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
