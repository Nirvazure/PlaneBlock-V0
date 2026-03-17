import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"
import { getAuthFromRequest } from "@/lib/auth-server"
import { notifyUser } from "@/lib/ws-webhook"
import { initialBoard, type GameState } from "@/lib/game-types"

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { inviteeId } = await request.json()
    if (!inviteeId || typeof inviteeId !== "string") {
      return NextResponse.json({ error: "请提供被邀请人 ID" }, { status: 400 })
    }

    if (inviteeId === auth.userId) {
      return NextResponse.json({ error: "不能邀请自己" }, { status: 400 })
    }

    const db = getDb()
    const sessionsColl = db.collection("game_sessions")
    const invitesColl = db.collection("battle_invites")

    let roomCode: string
    let exists = true
    while (exists) {
      roomCode = generateRoomCode()
      const r = await sessionsColl.where({ roomCode }).get()
      exists = r.data.length > 0
    }

    const initialState: GameState = {
      phase: "setup",
      currentPlayer: 1,
      playerBoards: { 1: initialBoard(), 2: initialBoard() },
      playerAirplanes: { 1: [], 2: [] },
      attackBoards: { 1: initialBoard(), 2: initialBoard() },
      winner: null,
    }

    const res = await sessionsColl.add({
      roomCode,
      player1UserId: auth.userId,
      player2UserId: null,
      player1Nickname: auth.nickname,
      player2Nickname: null,
      state: initialState,
      createdAt: new Date(),
    })

    const roomId = (res as { _id?: string })._id ?? (res as { id?: string }).id

    await invitesColl.add({
      inviterId: auth.userId,
      inviteeId,
      roomId,
      status: "pending",
      createdAt: new Date(),
    })

    await notifyUser(inviteeId, "invites")

    return NextResponse.json({ roomId, roomCode })
  } catch (err) {
    console.error("[API] invite error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "邀请失败" },
      { status: 500 }
    )
  }
}
