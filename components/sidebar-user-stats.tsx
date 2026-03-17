"use client"

interface SidebarUserStatsProps {
  wins: number
  losses: number
  loading?: boolean
}

export function SidebarUserStats({ wins, losses, loading }: SidebarUserStatsProps) {
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  const cellClass =
    "p-3 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted/50 text-center"

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className={cellClass}>
        <p className="text-xl font-bold text-primary">{loading ? "-" : wins}</p>
        <p className="text-xs text-muted-foreground">胜场</p>
      </div>
      <div className={cellClass}>
        <p className="text-xl font-bold text-destructive">{loading ? "-" : losses}</p>
        <p className="text-xs text-muted-foreground">负场</p>
      </div>
      <div className={cellClass}>
        <p className="text-xl font-bold text-accent">{loading ? "-" : `${winRate}%`}</p>
        <p className="text-xs text-muted-foreground">胜率</p>
      </div>
    </div>
  )
}
