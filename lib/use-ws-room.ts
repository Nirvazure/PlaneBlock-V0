"use client"

import { useEffect, useRef, useCallback } from "react"
import { getRoom } from "@/lib/game-session"
import {
  isWsAvailable,
  ensureWsConnection,
  subscribeRoom,
  unsubscribeRoom,
  sendRoomUpdated,
  onWsMessage,
} from "@/lib/ws-client"
import type { GameState } from "@/lib/game-types"

export type RoomData = {
  roomId: string
  roomCode: string
  player1Nickname: string
  player2Nickname: string | null
  state: GameState
}

export function useWsRoom(
  roomId: string | null,
  onRoomUpdate: (room: RoomData) => void,
  onError?: (err: string | null) => void,
  options?: { shouldSkipFetch?: () => boolean }
) {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const fetchRoom = useCallback(async () => {
    if (!roomId) return
    if (options?.shouldSkipFetch?.()) return
    try {
      const room = await getRoom(roomId)
      if (mountedRef.current) onRoomUpdate(room)
      if (onError && mountedRef.current) onError(null)
    } catch (err) {
      if (mountedRef.current) {
        onError?.(err instanceof Error ? err.message : "加载失败")
      }
    }
  }, [roomId, onRoomUpdate, onError, options])

  useEffect(() => {
    mountedRef.current = true
    if (!roomId) return

    let unsub: (() => void) | null = null

    if (isWsAvailable()) {
      ensureWsConnection().then((sock) => {
        if (!mountedRef.current) return
        if (!sock) {
          pollRef.current = setInterval(fetchRoom, 3000)
          fetchRoom()
          return
        }
        subscribeRoom(roomId)
        unsub = onWsMessage((type, payload) => {
          if (type === "room:updated" && (payload as { roomId?: string }).roomId === roomId) {
            fetchRoom()
          }
        })
        fetchRoom()
      })
    } else {
      pollRef.current = setInterval(fetchRoom, 3000)
      fetchRoom()
    }

    return () => {
      mountedRef.current = false
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      unsubscribeRoom(roomId)
      unsub?.()
    }
  }, [roomId, fetchRoom])

  const notifyRoomUpdated = useCallback(() => {
    if (roomId) sendRoomUpdated(roomId)
  }, [roomId])

  return { fetchRoom, notifyRoomUpdated }
}
