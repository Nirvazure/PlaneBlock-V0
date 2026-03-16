import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"
import { getAuthFromRequest } from "@/lib/auth-server"
import type { GameState } from "@/lib/game-types"

type Doc = {
  _id: string
  roomCode: string
  player1UserId?: string | null
  player2UserId?: string | null
  player1Nickname: string
  player2Nickname: string | null
  state: GameState
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    if (!roomId) {
      return NextResponse.json({ error: "缺少 roomId" }, { status: 400 })
    }

    const db = getDb()
    const res = await db.collection("game_sessions").doc(roomId).get()

    if (!res.data || !res.data[0]) {
      return NextResponse.json({ error: "房间不存在" }, { status: 404 })
    }

    const doc = res.data[0] as Doc
    return NextResponse.json({
      roomId: doc._id,
      roomCode: doc.roomCode,
      player1Nickname: doc.player1Nickname,
      player2Nickname: doc.player2Nickname,
      state: doc.state,
    })
  } catch (err) {
    console.error("[API] get room error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "获取房间失败" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { roomId } = await params
    if (!roomId) {
      return NextResponse.json({ error: "缺少 roomId" }, { status: 400 })
    }

    const { state } = await request.json()
    if (!state || typeof state !== "object") {
      return NextResponse.json({ error: "请提供 state" }, { status: 400 })
    }

    const db = getDb()
    const res = await db.collection("game_sessions").doc(roomId).get()
    if (!res.data || !res.data[0]) {
      return NextResponse.json({ error: "房间不存在" }, { status: 404 })
    }
    const doc = res.data[0] as Doc
    const hasUserId = doc.player1UserId != null || doc.player2UserId != null
    if (hasUserId) {
      const isPlayer1 = doc.player1UserId === auth.userId
      const isPlayer2 = doc.player2UserId === auth.userId
      if (!isPlayer1 && !isPlayer2) {
        return NextResponse.json({ error: "无权更新此房间" }, { status: 403 })
      }
    }

    await db.collection("game_sessions").doc(roomId).update({
      state: state as GameState,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[API] update room error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "更新房间失败" },
      { status: 500 }
    )
  }
}
