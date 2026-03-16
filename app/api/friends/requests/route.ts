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
    const reqColl = db.collection("friend_requests")
    const profilesColl = db.collection("profiles")

    const res = await reqColl
      .where({ toUserId: auth.userId, status: "pending" })
      .get()

    const requests = (res.data ?? []) as Array<{ _id: string; fromUserId: string; createdAt: Date }>
    const result: Array<{ id: string; fromUserId: string; fromNickname: string }> = []

    for (const req of requests) {
      const pr = await profilesColl.where({ userId: req.fromUserId }).get()
      const profile = (pr.data ?? [])[0] as { nickname?: string } | undefined
      result.push({
        id: req._id,
        fromUserId: req.fromUserId,
        fromNickname: profile?.nickname ?? `用户${req.fromUserId.slice(-4)}`,
      })
    }

    return NextResponse.json({ requests: result })
  } catch (err) {
    console.error("[API] friend requests list error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "获取请求失败" },
      { status: 500 }
    )
  }
}
