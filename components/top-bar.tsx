"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useWsUserEvents } from "@/lib/use-ws-user-events"
import { AvatarDropdown } from "./avatar-dropdown"

interface TopBarProps {
  onOpenFriends?: () => void
}

export function TopBar({ onOpenFriends }: TopBarProps) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [pendingRequests, setPendingRequests] = useState(0)

  const fetchRequests = useCallback(() => {
    fetch("/api/friends/requests", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { requests: [] }))
      .then((d) => setPendingRequests((d.requests ?? []).length))
  }, [])

  useWsUserEvents(
    user?.id ?? null,
    () => {},
    fetchRequests,
    { enabled: !pathname?.startsWith("/battle") }
  )

  return (
    <header className="flex justify-between items-center h-14 px-4 bg-card border-b-[3px] border-[var(--nes-border-dark)] border-t-0 border-x-0">
      <Link href="/" className="flex items-center gap-2 text-sm font-bold text-foreground hover:opacity-80 transition-opacity">
        <img src="/planeBlock.png" alt="PlaneBlock" className="h-8 w-auto object-contain" />
        PlaneBlock
      </Link>
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="w-8 h-8 border-2 border-[var(--nes-border-dark)] bg-muted animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-4">
            {onOpenFriends && (
              <button
                type="button"
                onClick={onOpenFriends}
                className="relative inline-flex items-center gap-1 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                我的好友
                {pendingRequests > 0 && (
                  <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground">
                    {pendingRequests}
                  </span>
                )}
              </button>
            )}
            <AvatarDropdown />
          </div>
        ) : (
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
            登录
          </Link>
        )}
      </div>
    </header>
  )
}
