"use client"

import { Drawer } from "vaul"
import { Button } from "./ui/button"

const MOCK_FRIENDS = [
  { id: "1", nickname: "玩家A", avatar: null, status: "online" as const },
  { id: "2", nickname: "玩家B", avatar: null, status: "offline" as const },
  { id: "3", nickname: "玩家C", avatar: null, status: "online" as const },
  { id: "4", nickname: "玩家D", avatar: null, status: "offline" as const },
  { id: "5", nickname: "玩家E", avatar: null, status: "online" as const },
]

interface FriendSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FriendSidebar({ open, onOpenChange }: FriendSidebarProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50" />
        <Drawer.Content className="fixed top-0 right-0 h-full w-80 max-w-[100vw] bg-card border-l-[3px] border-[var(--nes-border-dark)] border-t-0 border-b-0 flex flex-col">
          <div className="p-4 border-b-[3px] border-[var(--nes-border-dark)]">
            <h2 className="text-sm font-bold">我的好友</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {MOCK_FRIENDS.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-3 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  {friend.nickname.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{friend.nickname}</p>
                  <p className="text-xs text-muted-foreground">
                    {friend.status === "online" ? "在线" : "离线"}
                  </p>
                </div>
                {friend.status === "online" && (
                  <Button size="sm" variant="outline" className="shrink-0">
                    邀请对战
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
