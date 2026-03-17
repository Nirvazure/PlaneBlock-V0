import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"
import { getAuthFromRequest } from "@/lib/auth-server"
import { notifyUser } from "@/lib/ws-webhook"

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { toUserId } = await request.json()
    if (!toUserId || typeof toUserId !== "string") {
      return NextResponse.json({ error: "请提供对方用户 ID" }, { status: 400 })
    }

    if (toUserId === auth.userId) {
      return NextResponse.json({ error: "不能添加自己" }, { status: 400 })
    }

    const db = getDb()
    const reqColl = db.collection("friend_requests")
    const friendsColl = db.collection("friends")

    const existingReq = await reqColl
      .where({ fromUserId: auth.userId, toUserId, status: "pending" })
      .get()
    if (existingReq.data && existingReq.data.length > 0) {
      return NextResponse.json({ error: "已发送过请求，请等待对方处理" }, { status: 400 })
    }

    const existingFriend = await friendsColl
      .where({ userId: auth.userId, friendId: toUserId, status: "accepted" })
      .get()
    if (existingFriend.data && existingFriend.data.length > 0) {
      return NextResponse.json({ error: "已经是好友" }, { status: 400 })
    }

    await reqColl.add({
      fromUserId: auth.userId,
      toUserId,
      status: "pending",
      createdAt: new Date(),
    })

    await notifyUser(toUserId, "friend_requests")

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[API] friend request error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "发送请求失败" },
      { status: 500 }
    )
  }
}
