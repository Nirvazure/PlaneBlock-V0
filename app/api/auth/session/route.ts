import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60,
  path: "/",
}

export async function POST(request: Request) {
  try {
    const { accessToken, userId, nickname } = await request.json()
    if (!accessToken || !userId || typeof nickname !== "string") {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 })
    }

    const cookieStore = await cookies()
    cookieStore.set("tcb_access_token", accessToken, COOKIE_OPTIONS)
    cookieStore.set("tcb_user_id", userId, COOKIE_OPTIONS)
    cookieStore.set("tcb_nickname", nickname, { ...COOKIE_OPTIONS, httpOnly: false })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[API] auth session error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "设置会话失败" },
      { status: 500 }
    )
  }
}
