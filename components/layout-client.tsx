"use client"

import { useState } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { TopBar } from "./top-bar"
import { FriendSidebar } from "./friend-sidebar"
import { InvitesBanner } from "./invites-banner"

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [friendsOpen, setFriendsOpen] = useState(false)

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <TopBar onOpenFriends={() => setFriendsOpen(true)} />
        <InvitesBanner />
        <main className="flex-1">{children}</main>
        <FriendSidebar open={friendsOpen} onOpenChange={setFriendsOpen} />
      </div>
    </AuthProvider>
  )
}
