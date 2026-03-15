"use client"

import Link from "next/link"

const MOCK_USER = { nickname: "游客", avatar: null }

interface TopBarProps {
  onOpenFriends?: () => void
}

export function TopBar({ onOpenFriends }: TopBarProps) {
  return (
    <header className="flex justify-between items-center h-14 px-4 bg-card border-b-[3px] border-[var(--nes-border-dark)] border-t-0 border-x-0">
      <Link href="/" className="flex items-center gap-2 text-sm font-bold text-foreground hover:opacity-80 transition-opacity">
        <img src="/planeBlock.png" alt="PlaneBlock" className="h-8 w-auto object-contain" />
        PlaneBlock
      </Link>
      <div className="flex items-center gap-4">
        {onOpenFriends && (
          <button
            type="button"
            onClick={onOpenFriends}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            我的好友
          </button>
        )}
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted flex items-center justify-center text-xs text-muted-foreground">
            {MOCK_USER.avatar ? (
              <img src={MOCK_USER.avatar} alt={MOCK_USER.nickname} className="w-full h-full rounded-full object-cover" />
            ) : (
              MOCK_USER.nickname.slice(0, 1)
            )}
          </div>
        </Link>
      </div>
    </header>
  )
}
