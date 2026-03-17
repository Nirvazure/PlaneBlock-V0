"use client"

import { useEffect, useState, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { useAuth } from "@/lib/auth-context"
import { watchBattleInvites } from "@/lib/watch-friends"

interface Invite {
  id: string
  inviterNickname: string
  roomId: string
}

export function InvitesBanner() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [invites, setInvites] = useState<Invite[]>([])
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchInvites = useCallback(() => {
    fetch("/api/game/invites", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { invites: [] }))
      .then((d) => setInvites(d.invites ?? []))
  }, [])

  useEffect(() => {
    if (!user?.id) return
    if (pathname?.startsWith("/battle")) return
    fetchInvites()
    const close = watchBattleInvites(user.id, {
      onUpdate: fetchInvites,
      onError: () => fetchInvites(),
    })
    return close
  }, [user?.id, pathname, fetchInvites])

  const handleRespond = async (inviteId: string, action: "accept" | "reject") => {
    setProcessing(inviteId)
    try {
      const res = await fetch("/api/game/invites/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, action }),
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (action === "accept" && data.roomId) {
        router.push(`/battle/${data.roomId}?slot=2`)
      }
      setInvites((prev) => prev.filter((i) => i.id !== inviteId))
    } catch {
      setProcessing(null)
    } finally {
      setProcessing(null)
    }
  }

  if (!user || invites.length === 0) return null

  return (
    <div className="bg-primary/10 border-b-2 border-[var(--nes-border-dark)] px-4 py-2">
      {invites.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <span>
            <strong>{inv.inviterNickname}</strong> 邀请你对战
          </span>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              disabled={processing === inv.id}
              onClick={() => handleRespond(inv.id, "reject")}
            >
              拒绝
            </Button>
            <Button
              size="sm"
              disabled={processing === inv.id}
              onClick={() => handleRespond(inv.id, "accept")}
            >
              {processing === inv.id ? "处理中..." : "接受"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
