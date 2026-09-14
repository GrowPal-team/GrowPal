"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { User, ChevronDown, Settings, LogOut, Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutClient } from "@/lib/auth-client"
import { getStoredUser } from "@/lib/shopping"

type Props = {
  variant?: "desktop" | "mobile"
  onNavigate?: () => void
}

export function UserMenu({ variant = "desktop", onNavigate }: Props) {
  const [open, setOpen] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const sync = useCallback(() => {
    const u = getStoredUser()
    setUserEmail(u?.email?.trim() || "")
    setUserRole(String(u?.role || "").trim().toLowerCase())
  }, [])

  useEffect(() => {
    sync()
  }, [sync])

  useEffect(() => {
    function onAuth() {
      sync()
    }
    window.addEventListener("growpal-auth", onAuth)
    return () => window.removeEventListener("growpal-auth", onAuth)
  }, [sync])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const doLogout = () => {
    logoutClient()
    setOpen(false)
    onNavigate?.()
    router.push("/")
    router.refresh()
  }

  const close = () => {
    setOpen(false)
    onNavigate?.()
  }

  return (
    <div
      className={`relative flex items-center ${variant === "mobile" ? "w-full justify-start" : ""}`}
      ref={ref}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`h-9 cursor-pointer gap-1 rounded-lg px-2 ${variant === "mobile" ? "shrink-0" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <User className="h-5 w-5" />
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && (
        <div
          className={`absolute z-[100] mt-2 w-72 rounded-xl border border-border bg-card py-2 shadow-lg ${
            variant === "mobile" ? "left-0 right-auto top-full" : "right-0 top-full"
          }`}
        >
          <div className="flex items-start gap-3 border-b border-border px-4 pb-3 pt-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="break-all text-sm leading-snug text-muted-foreground">{userEmail || "—"}</p>
            </div>
          </div>
          <nav className="py-1 font-serif">
            {userRole === "admin" ? (
              <Link
                href="/admin"
                className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={close}
              >
                <Sprout className="h-4 w-4 shrink-0 opacity-70" />
                Admin Dashboard
              </Link>
            ) : (
              <Link
                href="/my-plant"
                className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={close}
              >
                <Sprout className="h-4 w-4 shrink-0 opacity-70" />
                My Plant
              </Link>
            )}
            <Link
              href="/settings"
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={close}
            >
              <Settings className="h-4 w-4 shrink-0 opacity-70" />
              Profile Settings
            </Link>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={doLogout}
            >
              <LogOut className="h-4 w-4 shrink-0 opacity-70" />
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
