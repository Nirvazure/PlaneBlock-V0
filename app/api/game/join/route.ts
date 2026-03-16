import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"
import { getAuthFromRequest } from "@/lib/auth-server"

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { roomCode } = await request.json()
    if (!roomCode || typeof roomCode !== "string") {
      return NextResponse.json({ error: "请提供房间码" }, { status: 400 })
    }

    const db = getDb()
    const coll = db.collection("game_sessions")
    const res = await coll.where({ roomCode: roomCode.toUpperCase().trim() }).get()

    if (res.data.length === 0) {
      return NextResponse.json({ error: "房间不存在" }, { status: 404 })
    }

    const doc = res.data[0] as {
      _id: string
      roomCode: string
      player1UserId?: string | null
      player2UserId?: string | null
      player1Nickname: string
      player2Nickname: string | null
      state: unknown
    }

    if (doc.player2Nickname || doc.player2UserId) {
      return NextResponse.json({ error: "房间已满" }, { status: 400 })
    }

    if (doc.player1UserId === auth.userId) {
      return NextResponse.json({ error: "不能加入自己创建的房间" }, { status: 400 })
    }

    await coll.doc(doc._id).update({
      player2UserId: auth.userId,
      player2Nickname: auth.nickname.slice(0, 20),
    })

    return NextResponse.json({
      roomId: doc._id,
      slot: 2,
    })
  } catch (err) {
    console.error("[API] join room error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "加入房间失败" },
      { status: 500 }
    )
  }
}
