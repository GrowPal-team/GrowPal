"use client"

import { getStoredUser } from "@/lib/shopping"

/** Logged-in customer or expert or admin (has session + user id). */
export function clientIsLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  const u = getStoredUser()
  return !!(u?.id && (localStorage.getItem("isLoggedIn") === "true" || localStorage.getItem("growpal_token")))
}

export function clientGetRole(): string | undefined {
  const u = getStoredUser()
  const r = u?.role
  if (r == null || r === "") return r
  return String(r).toLowerCase().trim()
}

export function clientGetApprovalStatus(): string | undefined {
  const u = getStoredUser()
  const status = u?.approvalStatus
  if (status == null || status === "") return undefined
  return String(status).toLowerCase().trim()
}

export function clientIsGuest(): boolean {
  return !clientIsLoggedIn()
}

export function clientIsExpert(): boolean {
  if (clientGetRole() !== "expert") return false
  const approvalStatus = clientGetApprovalStatus()
  return approvalStatus !== "pending" && approvalStatus !== "rejected"
}

export function clientIsAdmin(): boolean {
  return clientGetRole() === "admin"
}

/** Standard customer (not staff). */
export function clientIsCustomer(): boolean {
  if (!clientIsLoggedIn()) return false
  const r = clientGetRole() || ""
  if (r === "admin") return false
  if (r === "expert") return !clientIsExpert()
  return r === "user" || r === ""
}
