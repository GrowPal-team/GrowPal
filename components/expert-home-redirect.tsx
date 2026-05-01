"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { clientIsExpert } from "@/lib/session-client"

/** Experts skip the marketing homepage and go straight to the inbox workspace. */
export function ExpertHomeRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (clientIsExpert()) {
      router.replace("/expert")
    }
  }, [router])

  return null
}
