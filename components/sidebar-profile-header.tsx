"use client"

import { Button } from "./ui/button"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface SidebarProfileHeaderProps {
  showLogout?: boolean
}

export function SidebarProfileHeader({ showLogout = true }: SidebarProfileHeaderProps) {
  const { user, logout } = useAuth()

  if (!user) return null

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id)
      toast.success("已复制")
    } catch {
      toast.error("复制失败")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 shrink-0 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden">
        {user.avatar ? (
          <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
        ) : (
          user.nickname.slice(0, 1)
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="font-medium text-xs truncate leading-tight">{user.nickname}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground shrink-0">ID</span>
          <p className="font-mono text-[10px] truncate select-all flex-1 min-w-0">{user.id}</p>
          <Button type="button" size="sm" variant="outline" className="h-5 px-1.5 shrink-0 text-[10px]" onClick={handleCopyId}>
            复制
          </Button>
        </div>
      </div>
      {showLogout && (
        <Button type="button" size="sm" variant="outline" className="shrink-0 text-[10px] h-7 px-2" onClick={() => logout()}>
          登出
        </Button>
      )}
    </div>
  )
}
