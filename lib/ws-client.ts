"use client"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL

type MessageHandler = (type: string, payload: unknown) => void

let ws: WebSocket | null = null
let handlers = new Set<MessageHandler>()
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let token: string | null = null
let connectionPromise: Promise<WebSocket | null> | null = null

export function isWsAvailable(): boolean {
  return Boolean(WS_URL)
}

export async function getWsToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/ws-token", { credentials: "include" })
    if (!res.ok) return null
    const data = await res.json()
    return data.token ?? null
  } catch {
    return null
  }
}

function connect(): Promise<WebSocket | null> {
  return new Promise((resolve) => {
    if (!WS_URL || !token) {
      resolve(null)
      return
    }
    const url = `${WS_URL.replace(/\/$/, "")}?token=${encodeURIComponent(token)}`
    const sock = new WebSocket(url)
    sock.onopen = () => resolve(sock)
    sock.onerror = () => resolve(null)
    sock.onclose = () => {
      ws = null
      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        ensureWsConnection()
      }, 3000)
    }
    sock.onmessage = (e) => {
      try {
        const { type, payload } = JSON.parse(e.data as string)
        handlers.forEach((h) => h(type, payload ?? {}))
      } catch (_) {
        // ignore
      }
    }
  })
}

async function initConnection(): Promise<WebSocket | null> {
  if (ws?.readyState === WebSocket.OPEN) return ws
  token = await getWsToken()
  if (!token) return null
  const sock = await connect()
  ws = sock
  return sock
}

export function subscribeRoom(roomId: string): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "subscribe:room", roomId }))
  }
}

export function unsubscribeRoom(roomId: string): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "unsubscribe:room", roomId }))
  }
}

export function subscribeUser(): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "subscribe:user" }))
  }
}

export function sendRoomUpdated(roomId: string): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "room:updated", roomId }))
  }
}

export function onWsMessage(handler: MessageHandler): () => void {
  handlers.add(handler)
  return () => handlers.delete(handler)
}

export async function ensureWsConnection(): Promise<WebSocket | null> {
  if (ws?.readyState === WebSocket.OPEN) return ws
  if (connectionPromise) return connectionPromise
  connectionPromise = initConnection()
  try {
    return await connectionPromise
  } finally {
    connectionPromise = null
  }
}
