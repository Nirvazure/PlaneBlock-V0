"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { createRoom } from "@/lib/game-session"

export default function BattlePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const displayName = nickname.trim() || user?.nickname || ""
      const { roomId } = await createRoom(displayName)
      router.push(`/battle/${roomId}?slot=1`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "创建房间失败")
    } finally {
      setLoading(false)
    }
  }

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
          <p className="text-sm text-muted-foreground text-center mb-6">
            登录后才能创建房间或加入对战
          </p>
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-lg font-bold text-center mb-6">选择对战方式</h1>
        <div className="space-y-4">
          <form onSubmit={handleCreateRoom} className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={`昵称（可选，默认 ${user.nickname}）`}
              maxLength={20}
              className="flex-1 px-3 py-2 border-2 border-[var(--nes-border-dark)] bg-background text-sm"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "创建中..." : "创建房间"}
            </Button>
          </form>
          <Button asChild variant="outline" className="w-full">
            <Link href="/join">加入房间</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/battle/local">本地对战</Link>
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:underline">
            返回首页
          </Link>
        </p>
      </Card>
    </div>
  )
}
