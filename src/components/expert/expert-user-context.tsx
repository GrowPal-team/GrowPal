"use client"

import { createContext, useContext } from "react"

export const ExpertUserIdContext = createContext<number | null>(null)

export function useExpertUserId(): number {
  const v = useContext(ExpertUserIdContext)
  if (v == null) throw new Error("useExpertUserId outside expert shell")
  return v
}
