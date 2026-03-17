"use client"

import { useEffect, useRef, useCallback } from "react"
import {
  isWsAvailable,
  ensureWsConnection,
  subscribeUser,
  onWsMessage,
} from "@/lib/ws-client"

export function useWsUserEvents(
  userId: string | null,
  onInvites: () => void,
  onFriendRequests: () => void,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options ?? {}
  const mountedRef = useRef(true)

  const doFetch = useCallback(() => {
    onInvites()
    onFriendRequests()
  }, [onInvites, onFriendRequests])

  useEffect(() => {
    mountedRef.current = true
    if (!userId || !enabled) return

    let unsub: (() => void) | null = null

    if (isWsAvailable()) {
      ensureWsConnection().then((sock) => {
        if (!mountedRef.current) return
        if (!sock) {
          doFetch()
          return
        }
        subscribeUser()
        unsub = onWsMessage((type) => {
          if (type === "user:invites" || type === "user:friend_requests") {
            doFetch()
          }
        })
        doFetch()
      })
    } else {
      doFetch()
    }

    return () => {
      mountedRef.current = false
      unsub?.()
    }
  }, [userId, enabled, doFetch])

  return { refetch: doFetch }
}
