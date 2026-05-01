"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ExpertUserIdContext } from "@/components/expert/expert-user-context"
import { clientIsExpert } from "@/lib/session-client"
import { getStoredUser } from "@/lib/shopping"

/** Same chrome as the public app (Navbar + Footer); expert tools live in the subnav. */
export function ExpertAreaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [expertUserId, setExpertUserId] = useState<number | null>(null)

  useEffect(() => {
    if (!clientIsExpert()) {
      router.replace("/login?next=/expert")
      return
    }
    const u = getStoredUser()
    const id = u?.id
    if (!id) {
      router.replace("/login?next=/expert")
      return
    }
    setExpertUserId(id)
    setReady(true)
    void fetch("/api/expert/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    })
  }, [router])

  if (!ready || expertUserId == null) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center bg-[#f3ecdf]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <ExpertUserIdContext.Provider value={expertUserId}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-[#f3ecdf]">{children}</main>
        <Footer />
      </div>
    </ExpertUserIdContext.Provider>
  )
}
