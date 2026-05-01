"use client"

import { useEffect, useState } from "react"
import { ExpertChatWidget } from "@/components/expert-chat-widget"
import { clientGetRole, clientIsExpert } from "@/lib/session-client"

/** Customer-facing chat; hidden for expert accounts (they use the inbox dashboard). */
export function ConditionalExpertChatWidget() {
  const [hideWidget, setHideWidget] = useState(false)

  useEffect(() => {
    const sync = () => {
      const role = clientGetRole()
      setHideWidget(role === "admin" || clientIsExpert())
    }
    sync()
    window.addEventListener("growpal-auth", sync)
    return () => window.removeEventListener("growpal-auth", sync)
  }, [])

  if (hideWidget) return null
  return <ExpertChatWidget />
}
