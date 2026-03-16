import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"

export async function POST(request: Request) {
  try {
    const { roomCode, nickname } = await request.json()
    if (!roomCode || typeof roomCode !== "string") {
      return NextResponse.json({ error: "请提供房间码" }, { status: 400 })
    }
    if (!nickname || typeof nickname !== "string") {
      return NextResponse.json({ error: "请提供昵称" }, { status: 400 })
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
      player1Nickname: string
      player2Nickname: string | null
      state: unknown
    }

    if (doc.player2Nickname) {
      return NextResponse.json({ error: "房间已满" }, { status: 400 })
    }

    await coll.doc(doc._id).update({
      player2Nickname: nickname.trim().slice(0, 20),
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
