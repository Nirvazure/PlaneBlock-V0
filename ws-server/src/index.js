import "dotenv/config"
import express from "express"
import { WebSocketServer } from "ws"
import jwt from "jsonwebtoken"

const PORT = parseInt(process.env.PORT ?? "3001", 10)
const SECRET = process.env.WS_SERVER_SECRET
if (!SECRET && process.env.NODE_ENV === "production") {
  console.error("[ws-server] WS_SERVER_SECRET is required in production. Exiting.")
  process.exit(1)
}
const SECRET_OR_DEFAULT = SECRET || "change-me-in-production"

const app = express()
app.use(express.json())

// 房间订阅：roomId -> Set<ws>
const roomSubs = new Map()
// 用户订阅：userId -> Set<ws>
const userSubs = new Map()
// ws -> { userId, roomIds }
const wsMeta = new WeakMap()

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_OR_DEFAULT)
  } catch {
    return null
  }
}

// HTTP: Vercel 回调通知
app.post("/notify-user", express.json(), (req, res) => {
  const auth = req.headers.authorization
  if (auth !== `Bearer ${SECRET_OR_DEFAULT}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  const { userId, channel } = req.body || {}
  if (!userId || !channel) {
    return res.status(400).json({ error: "Missing userId or channel" })
  }
  const sockets = userSubs.get(userId)
  if (sockets) {
    const msg = JSON.stringify({ type: `user:${channel}`, payload: {} })
    for (const ws of sockets) {
      if (ws.readyState === 1) ws.send(msg)
    }
  }
  res.json({ ok: true })
})

// 健康检查
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

const server = app.listen(PORT, () => {
  console.log(`[ws-server] HTTP listening on ${PORT}`)
})

const wss = new WebSocketServer({ noServer: true })

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url || "", `http://${request.headers.host}`)
  const token = url.searchParams.get("token")
  const payload = token ? verifyToken(token) : null
  if (!payload?.userId) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
    socket.destroy()
    return
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    ws.userId = payload.userId
    wsMeta.set(ws, { userId: payload.userId, roomIds: new Set() })
    wss.emit("connection", ws, request)
  })
})

wss.on("connection", (ws, _request) => {
  const meta = wsMeta.get(ws)
  if (!meta) return

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString())
      const { type, roomId } = data
      if (type === "subscribe:room" && roomId) {
        if (!roomSubs.has(roomId)) roomSubs.set(roomId, new Set())
        roomSubs.get(roomId).add(ws)
        meta.roomIds.add(roomId)
      } else if (type === "unsubscribe:room" && roomId) {
        const set = roomSubs.get(roomId)
        if (set) {
          set.delete(ws)
          if (set.size === 0) roomSubs.delete(roomId)
        }
        meta.roomIds.delete(roomId)
      } else if (type === "subscribe:user") {
        if (!userSubs.has(meta.userId)) userSubs.set(meta.userId, new Set())
        userSubs.get(meta.userId).add(ws)
      } else if (type === "room:updated" && roomId) {
        const set = roomSubs.get(roomId)
        if (set) {
          const msg = JSON.stringify({ type: "room:updated", payload: { roomId } })
          for (const s of set) {
            if (s.readyState === 1) s.send(msg)
          }
        }
      }
    } catch (_) {
      // ignore invalid json
    }
  })

  ws.on("close", () => {
    for (const rid of meta.roomIds) {
      const set = roomSubs.get(rid)
      if (set) {
        set.delete(ws)
        if (set.size === 0) roomSubs.delete(rid)
      }
    }
    const us = userSubs.get(meta.userId)
    if (us) {
      us.delete(ws)
      if (us.size === 0) userSubs.delete(meta.userId)
    }
  })
})
