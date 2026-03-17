"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { joinRoom } from "@/lib/game-session"

export default function JoinPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomCode.trim()) {
      toast.error("请填写房间码")
      return
    }
    setLoading(true)
    try {
      const { roomId } = await joinRoom(roomCode.trim().toUpperCase())
      router.push(`/battle/${roomId}?slot=2`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "加入失败")
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
            登录后才能加入对战
          </p>
          <Button asChild className="w-full">
            <Link href="/login">去登录</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link href="/" className="hover:underline">返回</Link>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-sm w-full p-6">
        <h1 className="text-lg font-bold text-center mb-6">加入房间</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">房间码</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="如 ABC123"
              maxLength={6}
              className="w-full px-3 py-2 border-2 border-[var(--nes-border-dark)] bg-background text-sm"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "加入中..." : "加入对战"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">以 {user.nickname} 身份加入</p>
        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:underline">
            返回
          </Link>
        </p>
      </Card>
    </div>
  )
}
