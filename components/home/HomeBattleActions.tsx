"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { createRoom } from "@/lib/game-session"

export function HomeBattleActions() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleCreateRoom = async () => {
    setLoading(true)
    try {
      const { roomId } = await createRoom(user.nickname)
      router.push(`/battle/${roomId}?slot=1`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "创建房间失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted flex items-center justify-center text-lg text-muted-foreground overflow-hidden">
        {user.avatar ? (
          <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
        ) : (
          user.nickname.slice(0, 1)
        )}
      </div>
      <p className="font-medium text-base mt-1.5 truncate max-w-full">{user.nickname}</p>
      <div className="space-y-2 w-full mt-4">
        <Button onClick={handleCreateRoom} disabled={loading} variant="outline" className="w-full h-10 text-sm">
          {loading ? "创建中..." : "创建房间"}
        </Button>
        <Button asChild variant="outline" className="w-full h-10 text-sm">
          <Link href="/join">加入房间</Link>
        </Button>
        <Button asChild variant="outline" className="w-full h-10 text-sm">
          <Link href="/battle/local">本地对战</Link>
        </Button>
      </div>
    </div>
  )
}
