import { cookies } from "next/headers"

export interface AuthResult {
  userId: string
  accessToken: string
  nickname: string
}

export async function getAuthFromRequest(request?: Request): Promise<AuthResult | null> {
  if (request) {
    const authHeader = request.headers.get("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7)
      const userId = request.headers.get("X-User-Id")
      const nickname = request.headers.get("X-Nickname") ?? "玩家"
      if (userId && token) {
        return { userId, accessToken: token, nickname }
      }
    }
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("tcb_user_id")?.value
  const accessToken = cookieStore.get("tcb_access_token")?.value
  const nickname = cookieStore.get("tcb_nickname")?.value ?? "玩家"

  if (!userId || !accessToken) return null
  return { userId, accessToken, nickname }
}
