"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logoutClient } from "@/lib/auth-client"

export function AdminSignOut() {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full"
      onClick={() => {
        logoutClient()
        router.replace("/admin/login")
        router.refresh()
      }}
    >
      Sign out
    </Button>
  )
}
