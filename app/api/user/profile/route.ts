import { NextResponse } from "next/server"
import { getDb } from "@/lib/cloudbase"
import { getAuthFromRequest } from "@/lib/auth-server"

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { nickname } = await request.json()
    const displayName = (nickname && typeof nickname === "string")
      ? nickname.trim().slice(0, 20)
      : auth.nickname

    const db = getDb()
    const coll = db.collection("profiles")
    const existing = await coll.where({ userId: auth.userId }).get()

    if (existing.data.length > 0) {
      await coll.doc((existing.data[0] as { _id: string })._id).update({
        nickname: displayName,
        updatedAt: new Date(),
      })
    } else {
      await coll.add({
        userId: auth.userId,
        nickname: displayName,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[API] profile upsert error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "更新资料失败" },
      { status: 500 }
    )
  }
}
