import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("tcb_user_id")?.value
    const nickname = cookieStore.get("tcb_nickname")?.value
    const accessToken = cookieStore.get("tcb_access_token")?.value

    if (!userId || !accessToken) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: userId,
        nickname: nickname ?? `用户${userId.slice(-4)}`,
        avatar: null,
      },
    })
  } catch (err) {
    console.error("[API] auth me error:", err)
    return NextResponse.json({ user: null })
  }
}
