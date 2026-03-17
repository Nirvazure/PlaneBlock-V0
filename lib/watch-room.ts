"use client"

import { getCloudbaseApp } from "@/lib/cloudbase-client"
import type { GameState } from "@/lib/game-types"

export interface RoomDoc {
  roomCode: string
  state: GameState
}

type RoomWatchCallbacks = {
  onChange: (doc: RoomDoc) => void
  onError?: (err: unknown) => void
}

type RoomWatcherLike = { close: () => void }

type SharedRoomWatchState = {
  roomId: string
  subscribers: Set<RoomWatchCallbacks>
  watcher: RoomWatcherLike | null
  reconnectTimer: ReturnType<typeof setTimeout> | null
  closed: boolean
  reconnectAttempts: number
}

const roomWatches = new Map<string, SharedRoomWatchState>()

async function ensureAuthReady(): Promise<boolean> {
  const MAX_RETRIES = 10
  const RETRY_INTERVAL = 500
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const auth = getCloudbaseApp().auth({ persistence: "local" })
      const loginState = await auth.getLoginState()
      
      if (loginState && loginState.user && loginState.user.uid && loginState.credential?.accessToken) {
        return true
      }
    } catch (err) {
      console.warn(`[watch-room] ensureAuthReady 检查失败 (${i + 1}/${MAX_RETRIES}):`, err)
    }
    
    if (i < MAX_RETRIES - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL))
    }
  }
  
  return false
}

function notifyRoomChange(state: SharedRoomWatchState, doc: RoomDoc) {
  for (const sub of state.subscribers) {
    sub.onChange(doc)
  }
}

function notifyRoomError(state: SharedRoomWatchState, err: unknown) {
  for (const sub of state.subscribers) {
    sub.onError?.(err)
  }
}

function closeRoomWatcher(state: SharedRoomWatchState) {
  if (state.reconnectTimer) {
    clearTimeout(state.reconnectTimer)
    state.reconnectTimer = null
  }
  state.watcher?.close()
  state.watcher = null
}

function scheduleRoomReconnect(state: SharedRoomWatchState) {
  if (state.closed || state.subscribers.size === 0 || state.reconnectTimer) return
  const delay = Math.min(8000, 500 * 2 ** state.reconnectAttempts)
  state.reconnectAttempts += 1
  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null
    void startOrRestartRoomWatch(state)
  }, delay)
}

async function startOrRestartRoomWatch(state: SharedRoomWatchState): Promise<void> {
  if (state.closed || state.subscribers.size === 0) return
  const ready = await ensureAuthReady()
  if (!ready || state.closed || state.subscribers.size === 0) {
    scheduleRoomReconnect(state)
    return
  }

  try {
    closeRoomWatcher(state)
    const db = getCloudbaseApp().database()
    const watcher = db
      .collection("game_sessions")
      .doc(state.roomId)
      .watch({
        onChange: (snapshot: { docs: Record<string, { roomCode?: string; state?: unknown }> }) => {
          state.reconnectAttempts = 0
          const docs = snapshot.docs
          const entries = Array.isArray(docs) ? docs : Object.values(docs)
          const doc = entries[0]
          if (!doc || !doc.state) return
          notifyRoomChange(state, {
            roomCode: doc.roomCode ?? "",
            state: doc.state as GameState,
          })
        },
        onError: (err: unknown) => {
          notifyRoomError(state, err)
          scheduleRoomReconnect(state)
        },
      }) as RoomWatcherLike
    state.watcher = watcher
  } catch (err) {
    notifyRoomError(state, err)
    scheduleRoomReconnect(state)
  }
}

export function watchGameRoom(
  roomId: string,
  callbacks: RoomWatchCallbacks
): () => void {
  const key = `game_sessions:${roomId}`
  let state = roomWatches.get(key)

  if (!state) {
    state = {
      roomId,
      subscribers: new Set(),
      watcher: null,
      reconnectTimer: null,
      closed: false,
      reconnectAttempts: 0,
    }
    roomWatches.set(key, state)
  }

  state.subscribers.add(callbacks)
  if (!state.watcher && !state.reconnectTimer) {
    void startOrRestartRoomWatch(state)
  }

  return () => {
    const current = roomWatches.get(key)
    if (!current) return
    current.subscribers.delete(callbacks)
    if (current.subscribers.size === 0) {
      current.closed = true
      closeRoomWatcher(current)
      roomWatches.delete(key)
    }
  }
}
