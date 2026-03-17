"use client"

import { useEffect, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { Button } from "./ui/button"
import { useAuth } from "@/lib/auth-context"
import { SidebarProfileHeader } from "./sidebar-profile-header"
import { SidebarUserStats } from "./sidebar-user-stats"
import { EditProfileModal } from "./edit-profile-modal"

export function AvatarDropdown() {
  const { user, logout, refresh } = useAuth()
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [stats, setStats] = useState<{ wins: number; losses: number } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setStatsLoading(true)
    fetch("/api/user/stats", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { wins: 0, losses: 0 }))
      .then((d) => setStats(d))
      .finally(() => setStatsLoading(false))
  }, [user])

  if (!user) return null

  const handleLogout = () => {
    logout()
    setOpen(false)
  }

  const wins = stats?.wins ?? 0
  const losses = stats?.losses ?? 0

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="w-8 h-8 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
            ) : (
              user.nickname.slice(0, 1)
            )}
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="w-64 p-4 bg-card border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] shadow-lg z-50 rounded-none"
        >
          <div className="space-y-4">
            <SidebarProfileHeader showLogout={false} />
            <div className="border-t-2 border-[var(--nes-border-dark)] pt-4">
              <SidebarUserStats wins={wins} losses={losses} loading={statsLoading} />
            </div>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setEditOpen(true)
              }}
            >
              编辑资料
            </Button>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={handleLogout}
            >
              登出
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => refresh()}
      />
    </Popover.Root>
  )
}
