import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

const JWT_EXP = "5m"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("tcb_user_id")?.value
    const accessToken = cookieStore.get("tcb_access_token")?.value

    if (!userId || !accessToken) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const secret = process.env.WS_SERVER_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "服务端未配置 WS_SERVER_SECRET" },
        { status: 500 }
      )
    }

    const token = await new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXP)
      .sign(new TextEncoder().encode(secret))

    return NextResponse.json({ token })
  } catch (err) {
    console.error("[API] ws-token error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "获取 token 失败" },
      { status: 500 }
    )
  }
}
