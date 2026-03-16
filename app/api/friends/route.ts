import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"
import { getAuthFromRequest } from "@/lib/auth-server"

export async function GET(request: Request) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const db = getDb()
    const friendsColl = db.collection("friends")
    const profilesColl = db.collection("profiles")

    const res = await friendsColl.where({ userId: auth.userId, status: "accepted" }).get()
    const friendships = (res.data ?? []) as Array<{ friendId: string }>

    const friendIds = friendships.map((f) => f.friendId)
    if (friendIds.length === 0) {
      return NextResponse.json({ friends: [] })
    }

    const friends: Array<{ id: string; nickname: string; avatar: string | null; status: "online" | "offline" }> = []
    for (const fid of friendIds) {
      const pr = await profilesColl.where({ userId: fid }).get()
      const profile = (pr.data ?? [])[0] as { nickname?: string; avatar?: string } | undefined
      friends.push({
        id: fid,
        nickname: profile?.nickname ?? `用户${fid.slice(-4)}`,
        avatar: profile?.avatar ?? null,
        status: "online",
      })
    }

    return NextResponse.json({ friends })
  } catch (err) {
    console.error("[API] friends list error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "获取好友失败" },
      { status: 500 }
    )
  }
}
