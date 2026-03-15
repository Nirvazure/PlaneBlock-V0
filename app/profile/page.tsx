"use client"

import { Card } from "@/components/ui/card"

const MOCK_STATS = { wins: 12, losses: 8 }

export default function ProfilePage() {
  const total = MOCK_STATS.wins + MOCK_STATS.losses
  const winRate = total > 0 ? Math.round((MOCK_STATS.wins / total) * 100) : 0

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-lg font-bold text-center mb-8">个人主页</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted/50">
              <p className="text-2xl font-bold text-primary">{MOCK_STATS.wins}</p>
              <p className="text-sm text-muted-foreground">胜场</p>
            </div>
            <div className="p-4 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted/50">
              <p className="text-2xl font-bold text-destructive">{MOCK_STATS.losses}</p>
              <p className="text-sm text-muted-foreground">负场</p>
            </div>
            <div className="p-4 border-2 border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-muted/50">
              <p className="text-2xl font-bold text-accent">{winRate}%</p>
              <p className="text-sm text-muted-foreground">胜率</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
