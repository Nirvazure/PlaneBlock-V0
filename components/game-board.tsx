"use client"

import { cn } from "@/lib/utils"
import type { CellState, Airplane, GamePhase } from "@/app/page"

interface GameBoardProps {
  board: CellState[][]
  airplanes: Airplane[]
  isOwn: boolean
  onCellClick: (row: number, col: number) => void
  onCellHover?: (row: number, col: number) => void
  gamePhase: GamePhase
}

export function GameBoard({ board, airplanes, isOwn, onCellClick, onCellHover, gamePhase }: GameBoardProps) {
  const getCellContent = (row: number, col: number, cellState: CellState) => {
    switch (cellState) {
      case "airplane-head":
        return "●"
      case "airplane-body":
        return "★"
      case "hit":
        return "✕"
      case "miss":
        return "○"
      case "destroyed":
        return "💥"
      default:
        return ""
    }
  }

  const getCellClassName = (cellState: CellState, isClickable: boolean) => {
    return cn("w-8 h-8 border border-game-grid flex items-center justify-center text-sm font-bold transition-colors", {
      "bg-game-water": cellState === "empty",
      "bg-game-airplane text-game-airplane-head": cellState === "airplane-body",
      "bg-game-airplane-head text-primary-foreground": cellState === "airplane-head",
      "bg-game-hit text-destructive-foreground": cellState === "hit",
      "bg-game-miss text-muted-foreground": cellState === "miss",
      "bg-game-destroyed text-game-destroyed animate-pulse": cellState === "destroyed",
      "hover:bg-game-hover cursor-pointer": isClickable && cellState === "empty",
      "cursor-not-allowed": !isClickable && gamePhase === "battle",
      "hover:scale-105 hover:shadow-md": isClickable,
    })
  }

  const isClickable = (cellState: CellState) => {
    if (gamePhase === "setup") return isOwn && cellState === "empty"
    if (gamePhase === "battle") return !isOwn && cellState === "empty"
    return false
  }

  return (
    <div className="inline-block bg-card p-4 rounded-lg">
      {/* Column headers */}
      <div className="flex mb-2">
        <div className="w-8 h-6"></div>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="w-8 h-6 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {/* Game grid */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {/* Row header */}
          <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {rowIndex + 1}
          </div>

          {/* Row cells */}
          {row.map((cellState, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(cellState, isClickable(cellState))}
              onClick={() => {
                console.log("[v0] Cell button clicked:", rowIndex, colIndex, "clickable:", isClickable(cellState))
                if (isClickable(cellState)) {
                  onCellClick(rowIndex, colIndex)
                }
              }}
              onMouseEnter={() => onCellHover?.(rowIndex, colIndex)}
              disabled={!isClickable(cellState)}
            >
              {getCellContent(rowIndex, colIndex, cellState)}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
