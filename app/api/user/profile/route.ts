import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDb, uploadFileToStorage } from "@/lib/cloudbase"
import { getAuthFromRequest } from "@/lib/auth-server"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60,
  path: "/",
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB

function getExt(filename: string): string {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/)
  return match ? `.${match[1].toLowerCase()}` : ".jpg"
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    let displayName = auth.nickname
    let avatarFileID: string | null = null
    let updateAvatar = false

    const contentType = request.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const nicknameRaw = formData.get("nickname")
      if (nicknameRaw != null && typeof nicknameRaw === "string") {
        displayName = nicknameRaw.trim().slice(0, 20) || auth.nickname
      }
      const avatarFile = formData.get("avatar")
      if (avatarFile instanceof File && avatarFile.size > 0) {
        if (!avatarFile.type.startsWith("image/")) {
          return NextResponse.json({ error: "请上传图片文件" }, { status: 400 })
        }
        if (avatarFile.size > MAX_AVATAR_SIZE) {
          return NextResponse.json({ error: "头像不能超过 2MB" }, { status: 400 })
        }
        const ext = getExt(avatarFile.name)
        const cloudPath = `avatars/${auth.userId}/${Date.now()}${ext}`
        const buffer = Buffer.from(await avatarFile.arrayBuffer())
        avatarFileID = await uploadFileToStorage(cloudPath, buffer)
        updateAvatar = true
      }
    } else {
      const body = await request.json()
      const nickname = body?.nickname
      if (nickname != null && typeof nickname === "string") {
        displayName = nickname.trim().slice(0, 20) || auth.nickname
      }
    }

    const db = getDb()
    const coll = db.collection("profiles")
    const existing = await coll.where({ userId: auth.userId }).get()

    const updateData: Record<string, unknown> = {
      nickname: displayName,
      updatedAt: new Date(),
    }
    if (updateAvatar && avatarFileID) {
      updateData.avatar = avatarFileID
    }

    if (existing.data.length > 0) {
      await coll.doc((existing.data[0] as { _id: string })._id).update(updateData)
    } else {
      await coll.add({
        userId: auth.userId,
        nickname: displayName,
        avatar: avatarFileID ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const cookieStore = await cookies()
    cookieStore.set("tcb_nickname", displayName, { ...COOKIE_OPTIONS, httpOnly: false })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[API] profile upsert error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "更新资料失败" },
      { status: 500 }
    )
  }
}
