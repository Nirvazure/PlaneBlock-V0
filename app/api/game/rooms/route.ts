import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"
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
    const { nickname } = await request.json()
    if (!nickname || typeof nickname !== "string") {
      return NextResponse.json({ error: "请提供昵称" }, { status: 400 })
    }

    const db = getDb()
    const coll = db.collection("game_sessions")

    let roomCode: string
    let exists = true
    while (exists) {
      roomCode = generateRoomCode()
      const r = await coll.where({ roomCode }).get()
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

    const res = await coll.add({
      roomCode,
      player1Nickname: nickname.trim().slice(0, 20),
      player2Nickname: null,
      state: initialState,
      createdAt: new Date(),
    })

    const roomId = (res as { _id?: string })._id ?? (res as { id?: string }).id
    return NextResponse.json({ roomId, roomCode })
  } catch (err) {
    console.error("[API] create room error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "创建房间失败" },
      { status: 500 }
    )
  }
}
