"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export const EXPERT_HUB_ITEMS: {
  href: string
  label: string
  active: (pathname: string) => boolean
}[] = [
  {
    href: "/expert",
    label: "Dashboard",
    active: (p) => p === "/expert",
  },
  {
    href: "/expert/chat",
    label: "Chat",
    active: (p) => p === "/expert/chat" || p.startsWith("/expert/chat/"),
  },
  {
    href: "/climate-zones",
    label: "Growing zones",
    active: (p) => p === "/climate-zones" || p.startsWith("/climate-zones/"),
  },
  {
    href: "/shop",
    label: "Plants",
    active: (p) => p === "/shop" || p.startsWith("/shop/") || p.startsWith("/product/"),
  },
]

/** Expert hub in the main header row (next to logo & account). */
export function ExpertHubBar() {
  const pathname = usePathname()

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center lg:px-3">
      <nav
        className="mx-auto flex max-w-full justify-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Expert hub"
      >
        {EXPERT_HUB_ITEMS.map((item) => {
          const isActive = item.active(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
