"use client"

import { cn } from "@/lib/utils"
import type { CellState, Airplane, GamePhase } from "@/lib/game-types"

interface GameBoardProps {
  board: CellState[][]
  airplanes: Airplane[]
  isOwn: boolean
  onCellClick: (row: number, col: number) => void
  onCellHover?: (row: number, col: number) => void
  gamePhase: GamePhase
  /** 用于判断可点击的棋盘；未传时与 board 相同（解决 preview 覆盖导致无法点击） */
  clickableBoard?: CellState[][]
}

export function GameBoard({ board, airplanes, isOwn, onCellClick, onCellHover, gamePhase, clickableBoard }: GameBoardProps) {
  const boardForClick = clickableBoard ?? board
  const getCellContent = (row: number, col: number, cellState: CellState) => {
    switch (cellState) {
      case "airplane-head":
        return "●"
      case "airplane-body":
        return "★"
      case "hit":
        return "✕"
      case "destroyed":
        return "💥"
      case "miss":
        return "○"
      default:
        return ""
    }
  }

  const getCellClassName = (cellState: CellState, isClickable: boolean) => {
    return cn(
      "flex-1 min-w-0 aspect-square sm:flex-none sm:w-7 sm:h-7 md:w-8 md:h-8 border-[2px] border-[var(--nes-border-dark)] flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors",
      {
      "bg-game-water": cellState === "empty",
      "bg-game-airplane text-game-airplane-head": cellState === "airplane-body",
      "bg-game-airplane-head text-primary-foreground": cellState === "airplane-head",
      "bg-game-hit text-destructive-foreground": cellState === "hit",
      "bg-game-destroyed text-destructive-foreground": cellState === "destroyed",
      "bg-game-miss text-muted-foreground": cellState === "miss",
      "hover:bg-game-hover cursor-pointer": isClickable && cellState === "empty",
      "cursor-not-allowed": !isClickable && gamePhase === "battle",
    })
  }

  const isClickable = (cellState: CellState) => {
    if (gamePhase === "setup") return isOwn && cellState === "empty"
    if (gamePhase === "battle") return !isOwn && cellState === "empty"
    return false
  }

  return (
    <div className="w-full max-w-full sm:w-auto sm:max-w-none sm:inline-block bg-card p-3 sm:p-4 rounded-lg mx-auto">
      {/* Column headers */}
      <div className="flex mb-1.5 sm:mb-2 w-full">
        <div className="w-5 h-5 sm:w-7 sm:h-5 md:w-8 md:h-6 shrink-0" />
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex-1 min-w-0 h-5 sm:flex-none sm:w-7 sm:h-5 md:w-8 md:h-6 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {/* Game grid */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full items-stretch">
          {/* Row header */}
          <div className="w-5 sm:w-7 md:w-8 shrink-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
            {rowIndex + 1}
          </div>

          {/* Row cells */}
          {row.map((cellState, colIndex) => {
            const clickableState = boardForClick[rowIndex]?.[colIndex] ?? "empty"
            return (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(cellState, isClickable(clickableState))}
              onClick={() => {
                if (isClickable(clickableState)) {
                  onCellClick(rowIndex, colIndex)
                }
              }}
              onMouseEnter={() => onCellHover?.(rowIndex, colIndex)}
              disabled={!isClickable(clickableState)}
            >
              {getCellContent(rowIndex, colIndex, cellState)}
            </button>
          )})}
        </div>
      ))}
    </div>
  )
}
