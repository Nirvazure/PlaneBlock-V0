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
  const mountedRef = useRef(true)
  const onRoomUpdateRef = useRef(onRoomUpdate)
  const onErrorRef = useRef(onError)
  const optionsRef = useRef(options)
  onRoomUpdateRef.current = onRoomUpdate
  onErrorRef.current = onError
  optionsRef.current = options

  const fetchRoom = useCallback(async () => {
    if (!roomId) return
    if (optionsRef.current?.shouldSkipFetch?.()) return
    try {
      const room = await getRoom(roomId)
      if (mountedRef.current) onRoomUpdateRef.current(room)
      if (mountedRef.current) onErrorRef.current?.(null)
    } catch (err) {
      if (mountedRef.current) {
        onErrorRef.current?.(err instanceof Error ? err.message : "加载失败")
      }
    }
  }, [roomId])

  useEffect(() => {
    mountedRef.current = true
    if (!roomId) return

    let unsub: (() => void) | null = null

    if (isWsAvailable()) {
      ensureWsConnection().then((sock) => {
        if (!mountedRef.current) return
        if (!sock) {
          fetchRoom()
          onErrorRef.current?.("实时连接失败，请刷新重试")
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
      fetchRoom()
      onErrorRef.current?.("实时功能需要配置 NEXT_PUBLIC_WS_URL")
    }

    return () => {
      mountedRef.current = false
      unsubscribeRoom(roomId)
      unsub?.()
    }
  }, [roomId, fetchRoom])

  const notifyRoomUpdated = useCallback(() => {
    if (roomId) sendRoomUpdated(roomId)
  }, [roomId])

  return { fetchRoom, notifyRoomUpdated }
}
