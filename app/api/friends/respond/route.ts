import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"
import { getAuthFromRequest } from "@/lib/auth-server"

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { fromUserId, action } = await request.json()
    if (!fromUserId || typeof fromUserId !== "string") {
      return NextResponse.json({ error: "请提供请求方用户 ID" }, { status: 400 })
    }
    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ error: "action 需为 accept 或 reject" }, { status: 400 })
    }

    const db = getDb()
    const reqColl = db.collection("friend_requests")
    const friendsColl = db.collection("friends")

    const res = await reqColl
      .where({ fromUserId, toUserId: auth.userId, status: "pending" })
      .get()

    if (!res.data || res.data.length === 0) {
      return NextResponse.json({ error: "未找到待处理的好友请求" }, { status: 404 })
    }

    const reqDoc = res.data[0] as { _id: string }
    await reqColl.doc(reqDoc._id).update({ status: action, updatedAt: new Date() })

    if (action === "accept") {
      await Promise.all([
        friendsColl.add({
          userId: auth.userId,
          friendId: fromUserId,
          status: "accepted",
          createdAt: new Date(),
        }),
        friendsColl.add({
          userId: fromUserId,
          friendId: auth.userId,
          status: "accepted",
          createdAt: new Date(),
        }),
      ])
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[API] friend respond error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "处理失败" },
      { status: 500 }
    )
  }
}
