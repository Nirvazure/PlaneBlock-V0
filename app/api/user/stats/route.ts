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
    const coll = db.collection("game_sessions")
    const [res1, res2] = await Promise.all([
      coll.where({ player1UserId: auth.userId }).get(),
      coll.where({ player2UserId: auth.userId }).get(),
    ])
    const allDocs = [
      ...((res1.data ?? []) as Array<Record<string, unknown>>),
      ...((res2.data ?? []) as Array<Record<string, unknown>>),
    ]
    const seen = new Set<string>()
    const docs = allDocs.filter((d) => {
      const id = (d as { _id?: string })._id
      if (id && seen.has(id)) return false
      if (id) seen.add(id)
      return true
    })

    let wins = 0
    let losses = 0

    for (const doc of docs as Array<{ state?: { winner?: 1 | 2 }; player1UserId?: string; player2UserId?: string }>) {
      const winner = doc.state?.winner
      if (winner != null) {
        const isPlayer1 = doc.player1UserId === auth.userId
        const isPlayer2 = doc.player2UserId === auth.userId
        if (isPlayer1 && winner === 1) wins++
        else if (isPlayer2 && winner === 2) wins++
        else if (isPlayer1 || isPlayer2) losses++
      }
    }

    const total = wins + losses
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

    return NextResponse.json({ wins, losses, winRate })
  } catch (err) {
    console.error("[API] stats error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "获取战绩失败" },
      { status: 500 }
    )
  }
}
