"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Drawer } from "vaul"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useWsUserEvents } from "@/lib/use-ws-user-events"

interface Friend {
  id: string
  nickname: string
  avatar: string | null
  status: "online" | "offline"
}

interface FriendSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FriendSidebar({ open, onOpenChange }: FriendSidebarProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [inviting, setInviting] = useState<string | null>(null)
  const [addUserId, setAddUserId] = useState("")
  const [adding, setAdding] = useState(false)
  const [requests, setRequests] = useState<Array<{ id: string; fromUserId: string; fromNickname: string }>>([])
  const [responding, setResponding] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    if (!user?.id) return
    setLoading(true)
    Promise.all([
      fetch("/api/friends", { credentials: "include" }).then((r) => (r.ok ? r.json() : { friends: [] })),
      fetch("/api/friends/requests", { credentials: "include" }).then((r) => (r.ok ? r.json() : { requests: [] })),
    ])
      .then(([friendsRes, requestsRes]) => {
        setFriends(friendsRes.friends ?? [])
        setRequests(requestsRes.requests ?? [])
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  useWsUserEvents(
    user?.id ?? null,
    fetchData,
    fetchData,
    { pollInterval: 3000, enabled: open }
  )

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addUserId.trim()) return
    setAdding(true)
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: addUserId.trim() }),
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("已发送好友请求")
      setAddUserId("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "添加失败")
    } finally {
      setAdding(false)
    }
  }


  const handleRespondRequest = async (fromUserId: string, action: "accept" | "reject") => {
    setResponding(fromUserId)
    try {
      const res = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId, action }),
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success(action === "accept" ? "已添加好友" : "已拒绝")
      setRequests((prev) => prev.filter((r) => r.fromUserId !== fromUserId))
      if (action === "accept") fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败")
    } finally {
      setResponding(null)
    }
  }

  const handleInviteBattle = async (friendId: string) => {
    setInviting(friendId)
    try {
      const res = await fetch("/api/game/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeId: friendId }),
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("已发送对战邀请")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "邀请失败")
    } finally {
      setInviting(null)
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50" />
        <Drawer.Content className="fixed top-0 right-0 h-full w-80 max-w-[100vw] bg-card border-l-[3px] border-[var(--nes-border-dark)] border-t-0 border-b-0 flex flex-col">
          <div className="p-4 border-b-[3px] border-[var(--nes-border-dark)]">
            <h2 className="text-sm font-bold mb-3">我的好友</h2>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input
                type="text"
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                placeholder="输入用户 ID 添加好友"
                className="flex-1 px-2 py-1.5 text-xs border-2 border-[var(--nes-border-dark)] bg-background"
              />
              <Button type="submit" size="sm" disabled={adding || !addUserId.trim()}>
                {adding ? "..." : "添加"}
              </Button>
            </form>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {requests.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-2">好友请求</h3>
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between gap-2 p-2 border border-[var(--nes-border-dark)] bg-muted/30"
                    >
                      <span className="text-sm truncate">{req.fromNickname}</span>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled={responding === req.fromUserId}
                          onClick={() => handleRespondRequest(req.fromUserId, "reject")}
                        >
                          拒绝
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={responding === req.fromUserId}
                          onClick={() => handleRespondRequest(req.fromUserId, "accept")}
                        >
                          {responding === req.fromUserId ? "..." : "接受"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {loading ? (
              <p className="text-sm text-muted-foreground">加载中...</p>
            ) : friends.length === 0 && requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无好友，请通过用户 ID 添加</p>
            ) : (
              <>
                {friends.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground mb-2">好友列表</h3>
                    <div className="space-y-2">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center gap-3 p-3 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-10 h-10 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            {friend.nickname.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{friend.nickname}</p>
                            <p className="text-xs text-muted-foreground">
                              {friend.status === "online" ? "在线" : "离线"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            disabled={inviting === friend.id}
                            onClick={() => handleInviteBattle(friend.id)}
                          >
                            {inviting === friend.id ? "邀请中..." : "邀请对战"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
