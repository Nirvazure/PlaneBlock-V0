"use client"

import { getCloudbaseApp } from "@/lib/cloudbase-client"

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
      console.warn(`[watch-friends] ensureAuthReady 检查失败 (${i + 1}/${MAX_RETRIES}):`, err)
    }
    
    if (i < MAX_RETRIES - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL))
    }
  }
  
  return false
}

type WatchCallbacks = {
  onUpdate: () => void
  onError?: (err: unknown) => void
}

type WatcherLike = { close: () => void }

type SharedWatchState = {
  userId: string
  collection: "friend_requests" | "battle_invites" | "friends"
  where: Record<string, string>
  subscribers: Set<WatchCallbacks>
  watcher: WatcherLike | null
  reconnectTimer: ReturnType<typeof setTimeout> | null
  closed: boolean
  reconnectAttempts: number
}

const sharedWatches = new Map<string, SharedWatchState>()

function callUpdateAll(state: SharedWatchState) {
  for (const sub of state.subscribers) {
    sub.onUpdate()
  }
}

function callErrorAll(state: SharedWatchState, err: unknown) {
  for (const sub of state.subscribers) {
    sub.onError?.(err)
  }
}

function closeUnderlyingWatcher(state: SharedWatchState) {
  if (state.reconnectTimer) {
    clearTimeout(state.reconnectTimer)
    state.reconnectTimer = null
  }
  state.watcher?.close()
  state.watcher = null
}

function scheduleReconnect(state: SharedWatchState) {
  if (state.closed || state.subscribers.size === 0 || state.reconnectTimer) return
  const delay = Math.min(8000, 500 * 2 ** state.reconnectAttempts)
  state.reconnectAttempts += 1
  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null
    void startOrRestartWatch(state)
  }, delay)
}

async function startOrRestartWatch(state: SharedWatchState): Promise<void> {
  if (state.closed || state.subscribers.size === 0) return
  const ready = await ensureAuthReady()
  if (!ready || state.closed || state.subscribers.size === 0) {
    scheduleReconnect(state)
    return
  }

  try {
    closeUnderlyingWatcher(state)
    const db = getCloudbaseApp().database()
    const watcher = db
      .collection(state.collection)
      .where(state.where)
      .watch({
        onChange: () => {
          state.reconnectAttempts = 0
          callUpdateAll(state)
        },
        onError: (err: unknown) => {
          callErrorAll(state, err)
          scheduleReconnect(state)
        },
      }) as WatcherLike
    state.watcher = watcher
  } catch (err) {
    callErrorAll(state, err)
    scheduleReconnect(state)
  }
}

function subscribeSharedWatch(
  key: string,
  collection: SharedWatchState["collection"],
  userId: string,
  where: SharedWatchState["where"],
  callbacks: WatchCallbacks
): () => void {
  let state = sharedWatches.get(key)
  if (!state) {
    state = {
      userId,
      collection,
      where,
      subscribers: new Set(),
      watcher: null,
      reconnectTimer: null,
      closed: false,
      reconnectAttempts: 0,
    }
    sharedWatches.set(key, state)
  }

  state.subscribers.add(callbacks)
  if (!state.watcher && !state.reconnectTimer) {
    void startOrRestartWatch(state)
  }

  return () => {
    const current = sharedWatches.get(key)
    if (!current) return
    current.subscribers.delete(callbacks)
    if (current.subscribers.size === 0) {
      current.closed = true
      closeUnderlyingWatcher(current)
      sharedWatches.delete(key)
    }
  }
}

/**
 * 监听发给当前用户的好友请求（toUserId = userId, status = pending）
 * 需在 CloudBase 配置 friend_requests 读权限：auth.uid == doc.toUserId
 */
export function watchFriendRequests(
  userId: string,
  callbacks: WatchCallbacks
): () => void {
  return subscribeSharedWatch(
    `friend_requests:${userId}`,
    "friend_requests",
    userId,
    { toUserId: userId },
    callbacks
  )
}

/**
 * 监听发给当前用户的对战邀请（inviteeId = userId, status = pending）
 * 需在 CloudBase 配置 battle_invites 读权限：auth.uid == doc.inviteeId
 */
export function watchBattleInvites(
  userId: string,
  callbacks: WatchCallbacks
): () => void {
  return subscribeSharedWatch(
    `battle_invites:${userId}`,
    "battle_invites",
    userId,
    { inviteeId: userId },
    callbacks
  )
}

/**
 * 监听当前用户的好友列表（userId = userId, status = accepted）
 * 需在 CloudBase 配置 friends 读权限：auth.uid == doc.userId
 */
export function watchFriends(
  userId: string,
  callbacks: WatchCallbacks
): () => void {
  return subscribeSharedWatch(`friends:${userId}`, "friends", userId, { userId }, callbacks)
}
