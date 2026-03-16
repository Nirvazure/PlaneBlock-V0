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
    const invitesColl = db.collection("battle_invites")
    const profilesColl = db.collection("profiles")

    const res = await invitesColl
      .where({ inviteeId: auth.userId, status: "pending" })
      .get()

    const invites = (res.data ?? []) as Array<{ _id: string; inviterId: string; roomId: string; createdAt: Date }>
    const result: Array<{ id: string; inviterNickname: string; roomId: string }> = []

    for (const inv of invites) {
      const pr = await profilesColl.where({ userId: inv.inviterId }).get()
      const profile = (pr.data ?? [])[0] as { nickname?: string } | undefined
      result.push({
        id: inv._id,
        inviterNickname: profile?.nickname ?? `用户${inv.inviterId.slice(-4)}`,
        roomId: inv.roomId,
      })
    }

    return NextResponse.json({ invites: result })
  } catch (err) {
    console.error("[API] invites list error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "获取邀请失败" },
      { status: 500 }
    )
  }
}
