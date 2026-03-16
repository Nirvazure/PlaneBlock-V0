"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<{ wins: number; losses: number; winRate: number } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch("/api/user/stats", { credentials: "include" })
      .then((r) => r.ok ? r.json() : { wins: 0, losses: 0, winRate: 0 })
      .then((d) => setStats(d))
      .finally(() => setStatsLoading(false))
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8">
          <h1 className="text-lg font-bold text-center mb-6">请先登录</h1>
          <Button asChild className="w-full">
            <Link href="/login">去登录</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link href="/" className="hover:underline">返回首页</Link>
          </p>
        </Card>
      </div>
    )
  }

  const s = stats ?? { wins: 0, losses: 0, winRate: 0 }
  const total = s.wins + s.losses
  const winRate = total > 0 ? Math.round((s.wins / total) * 100) : 0

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-lg font-bold text-center mb-4">个人主页</h1>
        {user && (
          <div className="mb-6 p-3 border-2 border-[var(--nes-border-dark)] bg-muted/30">
            <p className="text-xs text-muted-foreground">我的用户 ID（分享给好友添加）</p>
            <p className="font-mono text-sm break-all select-all">{user.id}</p>
          </div>
        )}
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted/50">
              <p className="text-2xl font-bold text-primary">{statsLoading ? "-" : s.wins}</p>
              <p className="text-sm text-muted-foreground">胜场</p>
            </div>
            <div className="p-4 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted/50">
              <p className="text-2xl font-bold text-destructive">{statsLoading ? "-" : s.losses}</p>
              <p className="text-sm text-muted-foreground">负场</p>
            </div>
            <div className="p-4 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted/50">
              <p className="text-2xl font-bold text-accent">{statsLoading ? "-" : winRate}%</p>
              <p className="text-sm text-muted-foreground">胜率</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
