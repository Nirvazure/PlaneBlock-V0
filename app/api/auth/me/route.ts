import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDb, getTempFileURL } from "@/lib/cloudbase"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("tcb_user_id")?.value
    const cookieNickname = cookieStore.get("tcb_nickname")?.value
    const accessToken = cookieStore.get("tcb_access_token")?.value

    if (!userId || !accessToken) {
      return NextResponse.json({ user: null })
    }

    const db = getDb()
    const profilesColl = db.collection("profiles")
    const profileRes = await profilesColl.where({ userId }).get()
    const profile = (profileRes.data ?? [])[0] as { nickname?: string; avatar?: string } | undefined

    const nickname = profile?.nickname ?? cookieNickname ?? `用户${userId.slice(-4)}`

    let avatar: string | null = null
    const avatarVal = profile?.avatar
    if (avatarVal && typeof avatarVal === "string") {
      if (avatarVal.startsWith("cloud://")) {
        try {
          avatar = await getTempFileURL(avatarVal)
        } catch {
          avatar = null
        }
      } else if (avatarVal.startsWith("http")) {
        avatar = avatarVal
      }
    }

    return NextResponse.json({
      user: {
        id: userId,
        nickname,
        avatar,
      },
    })
  } catch (err) {
    console.error("[API] auth me error:", err)
    return NextResponse.json({ user: null })
  }
}
