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
  options?: { pollInterval?: number; enabled?: boolean }
) {
  const { pollInterval = 3000, enabled = true } = options ?? {}
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
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
          pollRef.current = setInterval(doFetch, pollInterval)
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
      pollRef.current = setInterval(doFetch, pollInterval)
      doFetch()
    }

    return () => {
      mountedRef.current = false
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      unsub?.()
    }
  }, [userId, enabled, doFetch, pollInterval])

  return { refetch: doFetch }
}
