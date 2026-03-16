import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete("tcb_access_token")
  cookieStore.delete("tcb_user_id")
  cookieStore.delete("tcb_nickname")
  return NextResponse.json({ ok: true })
}
