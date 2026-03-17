const WEBHOOK_URL = process.env.WS_WEBHOOK_URL
const SECRET = process.env.WS_SERVER_SECRET

export async function notifyUser(
  userId: string,
  channel: "invites" | "friend_requests"
): Promise<void> {
  if (!WEBHOOK_URL || !SECRET) return
  try {
    const res = await fetch(`${WEBHOOK_URL.replace(/\/$/, "")}/notify-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SECRET}`,
      },
      body: JSON.stringify({ userId, channel }),
    })
    if (!res.ok) {
      console.warn("[ws-webhook] notify-user failed:", res.status)
    }
  } catch (err) {
    console.warn("[ws-webhook] notify-user error:", err)
  }
}
