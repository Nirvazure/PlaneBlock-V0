"use client"

import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import type { GameState } from "@/app/page"

interface GameStatusProps {
  gameState: GameState
}

export function GameStatus({ gameState }: GameStatusProps) {
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

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {getPhaseText()}
          </Badge>

          {gameState.phase === "battle" && (
            <div className="text-lg font-semibold">当前回合: 玩家 {gameState.currentPlayer}</div>
          )}

          {gameState.phase === "finished" && gameState.winner && (
            <div className="text-xl font-bold text-primary">🎉 玩家 {gameState.winner} 获胜！</div>
          )}
        </div>

        <div className="flex gap-6">
          {[1, 2].map((player) => {
            const stats = getPlayerStats(player as 1 | 2)
            return (
              <div key={player} className="text-center">
                <div className="text-sm text-muted-foreground">玩家 {player}</div>
                <div className="text-lg font-semibold">
                  {stats.remaining}/{stats.total} 架飞机
                </div>
                {stats.destroyed > 0 && <div className="text-xs text-destructive">已击毁 {stats.destroyed} 架</div>}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
