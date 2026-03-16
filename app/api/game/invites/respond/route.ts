import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"
import { getAuthFromRequest } from "@/lib/auth-server"

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { inviteId, action } = await request.json()
    if (!inviteId || typeof inviteId !== "string") {
      return NextResponse.json({ error: "请提供邀请 ID" }, { status: 400 })
    }
    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ error: "action 需为 accept 或 reject" }, { status: 400 })
    }

    const db = getDb()
    const invitesColl = db.collection("battle_invites")
    const sessionsColl = db.collection("game_sessions")

    const res = await invitesColl.doc(inviteId).get()
    if (!res.data || !res.data[0]) {
      return NextResponse.json({ error: "邀请不存在或已处理" }, { status: 404 })
    }

    const doc = res.data[0] as { inviteeId: string; roomId: string; inviterId: string }
    if (doc.inviteeId !== auth.userId) {
      return NextResponse.json({ error: "无权处理此邀请" }, { status: 403 })
    }

    await invitesColl.doc(inviteId).update({
      status: action,
      updatedAt: new Date(),
    })

    if (action === "accept") {
      await sessionsColl.doc(doc.roomId).update({
        player2UserId: auth.userId,
        player2Nickname: auth.nickname.slice(0, 20),
      })
    }

    return NextResponse.json({
      ok: true,
      ...(action === "accept" ? { roomId: doc.roomId } : {}),
    })
  } catch (err) {
    console.error("[API] invite respond error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "处理失败" },
      { status: 500 }
    )
  }
}
