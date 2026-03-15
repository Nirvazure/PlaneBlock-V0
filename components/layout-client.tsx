"use client"

import { useState } from "react"
import { TopBar } from "./top-bar"
import { FriendSidebar } from "./friend-sidebar"

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [friendsOpen, setFriendsOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onOpenFriends={() => setFriendsOpen(true)} />
      <main className="flex-1">{children}</main>
      <FriendSidebar open={friendsOpen} onOpenChange={setFriendsOpen} />
    </div>
  )
}
