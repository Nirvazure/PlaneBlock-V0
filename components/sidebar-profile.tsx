"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { SidebarProfileHeader } from "./sidebar-profile-header"
import { SidebarUserStats } from "./sidebar-user-stats"

export function SidebarProfile() {
  const { user } = useAuth()
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

  const wins = stats?.wins ?? 0
  const losses = stats?.losses ?? 0

  return (
    <div className="space-y-4">
      <SidebarProfileHeader />
      <SidebarUserStats wins={wins} losses={losses} loading={statsLoading} />
    </div>
  )
}
