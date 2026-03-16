"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { joinRoom } from "@/lib/game-session"

export default function JoinPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomCode.trim() || !nickname.trim()) {
      toast.error("请填写房间码和昵称")
      return
    }
    setLoading(true)
    try {
      const { roomId } = await joinRoom(roomCode.trim().toUpperCase(), nickname.trim())
      router.push(`/battle/${roomId}?slot=2`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "加入失败")
    } finally {
      setLoading(false)
    }
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
          <div>
            <label className="block text-sm font-medium mb-2">你的昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入昵称"
              maxLength={20}
              className="w-full px-3 py-2 border-2 border-[var(--nes-border-dark)] bg-background text-sm"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "加入中..." : "加入对战"}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/battle" className="hover:underline">
            返回
          </Link>
        </p>
      </Card>
    </div>
  )
}
