import type { GameState } from "./game-types"

const API = "/api/game"

export async function createRoom(nickname?: string): Promise<{ roomId: string; roomCode: string }> {
  const res = await fetch(`${API}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname: nickname ?? "" }),
    credentials: "include",
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? "创建房间失败")
  return data
}

export async function joinRoom(roomCode: string): Promise<{ roomId: string; slot: 1 | 2 }> {
  const res = await fetch(`${API}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomCode }),
    credentials: "include",
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? "加入房间失败")
  return data
}

export async function getRoom(roomId: string): Promise<{
  roomId: string
  roomCode: string
  player1Nickname: string
  player2Nickname: string | null
  state: GameState
}> {
  const res = await fetch(`${API}/rooms/${roomId}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? "获取房间失败")
  return data
}

export async function updateRoomState(roomId: string, state: GameState): Promise<void> {
  const res = await fetch(`${API}/rooms/${roomId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
    credentials: "include",
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? "更新房间失败")
}
