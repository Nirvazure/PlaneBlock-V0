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
    <div className="flex flex-1 items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs px-3 py-1">
          {getPhaseText()}
        </Badge>
        {gameState.phase === "battle" && (
          <span className="text-xs font-bold">当前回合: 玩家 {gameState.currentPlayer}</span>
        )}
        {gameState.phase === "finished" && gameState.winner && (
          <span className="text-xs font-bold">🎉 玩家 {gameState.winner} 获胜！</span>
        )}
      </div>
      <div className="flex gap-6">
        {[1, 2].map((player) => {
          const stats = getPlayerStats(player as 1 | 2)
          return (
            <div key={player} className="text-center">
              <div className="text-[10px] text-muted-foreground">玩家 {player}</div>
              <div className="text-xs font-bold">
                {stats.remaining}/{stats.total} 架飞机
              </div>
              {stats.destroyed > 0 && <div className="text-[10px] text-muted-foreground">已击毁 {stats.destroyed}</div>}
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
