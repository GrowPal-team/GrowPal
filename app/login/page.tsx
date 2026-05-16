'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'
import LoginPage from '@/components/ui/gaming-login'
import { ParticlesCanvas } from '@/components/ui/particles-canvas'
import { saveWelcomeOffer } from '@/lib/discounts'

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/'
  return raw
}

function resolveDestination(role: string, approvalStatus: string, next: string) {
  if (role === "admin") {
    return next.startsWith("/admin") ? next : "/admin"
  }

  if (role === "expert" && approvalStatus !== "pending" && approvalStatus !== "rejected") {
    return next.startsWith("/expert") ? next : "/expert"
  }

  if (next.startsWith("/admin") || next.startsWith("/expert")) {
    return "/"
  }

  return next
}

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const next = safeNext(search.get('next'))
  const promo = search.get('promo')
  const emailQ = search.get('email')

  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (promo === '10' && emailQ) {
      saveWelcomeOffer(emailQ, 'login-query')
    }
  }, [promo, emailQ])

  const promoBanner =
    promo === '10'
      ? 'Your 10% welcome offer is ready — sign in or create an account with the same email to activate it at checkout.'
      : null

  const handleLogin = async (email: string, password: string, _remember: boolean) => {
    setError(null)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email: email,
          password: password
        }),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        if (typeof window !== 'undefined') {
          const u = result.user as Record<string, unknown>
          const roleRaw = u?.role != null ? String(u.role).toLowerCase().trim() : 'user'
          const approvalStatus =
            u?.approvalStatus != null && String(u.approvalStatus).trim() !== ''
              ? String(u.approvalStatus).toLowerCase().trim()
              : undefined
          const normalized = { ...u, role: roleRaw, approvalStatus }
          localStorage.setItem('user', JSON.stringify(normalized))
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('growpal_token', '1')
          window.dispatchEvent(new Event('growpal-auth'))
        }

        const role = String((result.user as { role?: string })?.role || '').toLowerCase()
        const approvalStatus = String((result.user as { approvalStatus?: string | null })?.approvalStatus || '').toLowerCase()
        const dest = resolveDestination(role, approvalStatus, next)

        setSuccessMessage(`Welcome back, ${result.user.name}!`)
        setShowSuccess(true)
        setError(null)

        setTimeout(() => {
          router.push(dest)
        }, 2000)
        return
      }

      if (result.needs_verification) {
        setError(null)
        router.push(`/verify-email?email=${encodeURIComponent(result.email || email)}`)
        return
      }

      const errorMsg = result.message || 'Login failed. Please check your credentials.'
      setError(errorMsg)
      setShowSuccess(false)
      setSuccessMessage(null)
      return
    } catch (error: unknown) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.'
      setError(errorMessage)
    }
  }

  return (
    <>
      <div className="relative z-20 w-full max-w-md animate-in fade-in duration-500">
        <LoginPage.LoginForm
          onSubmit={handleLogin}
          initialEmail={emailQ || ''}
          promoBanner={promoBanner}
        />
        {error && (
          <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200 text-center animate-in fade-in">
            {error}
          </div>
        )}
      </div>

      {showSuccess && successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-24 h-24 mx-auto mb-4 bg-[#2F6F4E] rounded-full flex items-center justify-center">
              <Check className="h-12 w-12 text-white" strokeWidth={3} aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Sign-in successful</h2>
            <p className="mt-2 text-gray-600 text-sm">{successMessage} Redirecting…</p>
          </div>
        </div>
      )}
    </>
  )
}

export default function Login() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12">
      <LoginPage.VideoBackground videoUrl="/videos/signin.mp4" />
      <div className="absolute inset-0 z-10">
        <ParticlesCanvas />
      </div>

      <Suspense
        fallback={
          <div className="relative z-20 w-full max-w-md rounded-2xl border border-white/10 bg-black/50 p-8 text-center text-white/80 backdrop-blur-sm">
            Loading…
          </div>
        }
      >
        <LoginInner />
      </Suspense>

      <footer className="absolute bottom-4 left-0 right-0 z-20 text-center text-sm text-white/60">
        © 2026 GrowPal. All rights reserved.
      </footer>
    </div>
  )
}
