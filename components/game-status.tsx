"use client"

import { Badge } from "./ui/badge"
import type { GameState } from "@/lib/game-types"

interface GameStatusProps {
  gameState: GameState
  compact?: boolean
}

export function GameStatus({ gameState, compact = false }: GameStatusProps) {
  const getPhaseText = () => {
    switch (gameState.phase) {
      case "setup":
        return "布置阶段"
      case "battle":
        return "战斗阶段"
      case "finished":
        return "游戏结束"
      default:
        return ""
    }
  }

  const getPlayerStats = (player: 1 | 2) => {
    const airplanes = gameState.playerAirplanes[player]
    const destroyed = airplanes.filter((a) => a.isDestroyed).length
    const remaining = airplanes.length - destroyed
    return { total: airplanes.length, destroyed, remaining }
  }

  const barContent = (
    <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 min-w-0">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Badge variant="outline" className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1">
          {getPhaseText()}
        </Badge>
        {gameState.phase === "battle" && (
          <span className="text-[10px] sm:text-xs font-bold">回合: 玩家 {gameState.currentPlayer}</span>
        )}
        {gameState.phase === "finished" && gameState.winner && (
          <span className="text-[10px] sm:text-xs font-bold">🎉 玩家 {gameState.winner} 获胜！</span>
        )}
      </div>
      <div className="flex gap-4 sm:gap-6">
        {[1, 2].map((player) => {
          const stats = getPlayerStats(player as 1 | 2)
          return (
            <div key={player} className="text-center min-w-0">
              <div className="text-[10px] text-muted-foreground">P{player}</div>
              <div className="text-[10px] sm:text-xs font-bold">
                {stats.remaining}/{stats.total}
              </div>
              {stats.destroyed > 0 && (
                <div className="text-[9px] sm:text-[10px] text-muted-foreground">击毁 {stats.destroyed}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  if (compact) {
    return barContent
  }

  return (
    <div className="flex items-center gap-4 p-3 border-[3px] border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-card">
      {barContent}
    </div>
  )
}
