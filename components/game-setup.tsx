"use client"

import { useState } from "react"
import { GameBoard } from "./game-board"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import type { GameState, Airplane, Direction, CellState } from "@/app/page"

interface GameSetupProps {
  gameState: GameState
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void
}

export function GameSetup({ gameState, setGameState }: GameSetupProps) {
  const [selectedDirection, setSelectedDirection] = useState<Direction>("up")
  const [previewBoard, setPreviewBoard] = useState<CellState[][]>(
    Array(10)
      .fill(null)
      .map(() => Array(10).fill("empty")),
  )

  const currentPlayerAirplanes = gameState.playerAirplanes[gameState.currentPlayer]
  const canPlaceMore = currentPlayerAirplanes.length < 3

  const getAirplaneShape = (headRow: number, headCol: number, direction: Direction) => {
    const positions = []

    switch (direction) {
      case "up":
        // Head (机头)
        positions.push({ row: headRow, col: headCol, type: "head" })
        // Wings (机翅) - 5 cells horizontal above head
        for (let i = -2; i <= 2; i++) {
          positions.push({ row: headRow - 1, col: headCol + i, type: "body" })
        }
        // Tail (机尾) - 3 cells vertical above wings
        for (let i = 2; i <= 4; i++) {
          positions.push({ row: headRow - i, col: headCol, type: "body" })
        }
        break
      case "down":
        // Head
        positions.push({ row: headRow, col: headCol, type: "head" })
        // Wings - 5 cells horizontal below head
        for (let i = -2; i <= 2; i++) {
          positions.push({ row: headRow + 1, col: headCol + i, type: "body" })
        }
        // Tail - 3 cells vertical below wings
        for (let i = 2; i <= 4; i++) {
          positions.push({ row: headRow + i, col: headCol, type: "body" })
        }
        break
      case "left":
        // Head
        positions.push({ row: headRow, col: headCol, type: "head" })
        // Wings - 5 cells vertical left of head
        for (let i = -2; i <= 2; i++) {
          positions.push({ row: headRow + i, col: headCol - 1, type: "body" })
        }
        // Tail - 3 cells horizontal left of wings
        for (let i = 2; i <= 4; i++) {
          positions.push({ row: headRow, col: headCol - i, type: "body" })
        }
        break
      case "right":
        // Head
        positions.push({ row: headRow, col: headCol, type: "head" })
        // Wings - 5 cells vertical right of head
        for (let i = -2; i <= 2; i++) {
          positions.push({ row: headRow + i, col: headCol + 1, type: "body" })
        }
        // Tail - 3 cells horizontal right of wings
        for (let i = 2; i <= 4; i++) {
          positions.push({ row: headRow, col: headCol + i, type: "body" })
        }
        break
    }

    // Filter out positions that are outside the board
    return positions.filter((pos) => pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10)
  }

  const canPlaceAirplane = (headRow: number, headCol: number, direction: Direction) => {
    const shape = getAirplaneShape(headRow, headCol, direction)
    console.log("[v0] Airplane shape positions:", shape.length, "expected: 9")

    if (shape.length < 7) {
      console.log("[v0] Airplane too small, only", shape.length, "positions")
      return false // Too many parts outside the board
    }

    const currentBoard = gameState.playerBoards[gameState.currentPlayer]
    const canPlace = shape.every((pos) => {
      const isEmpty = currentBoard[pos.row][pos.col] === "empty"
      if (!isEmpty) {
        console.log("[v0] Position occupied:", pos.row, pos.col, currentBoard[pos.row][pos.col])
      }
      return isEmpty
    })

    console.log("[v0] Can place airplane:", canPlace)
    return canPlace
  }

  const placeAirplane = (headRow: number, headCol: number) => {
    console.log("[v0] Attempting to place airplane at:", headRow, headCol, selectedDirection)

    if (!canPlaceAirplane(headRow, headCol, selectedDirection)) {
      console.log("[v0] Cannot place airplane at this position")
      alert("无法在此位置放置飞机，请选择其他位置或方向")
      return
    }

    const shape = getAirplaneShape(headRow, headCol, selectedDirection)
    const newBoard = gameState.playerBoards[gameState.currentPlayer].map((row) => [...row])
    const bodyPositions: { row: number; col: number }[] = []

    console.log("[v0] Placing airplane with", shape.length, "positions")

    shape.forEach((pos) => {
      if (pos.type === "head") {
        newBoard[pos.row][pos.col] = "airplane-head"
      } else {
        newBoard[pos.row][pos.col] = "airplane-body"
        bodyPositions.push({ row: pos.row, col: pos.col })
      }
    })

    const newAirplane: Airplane = {
      id: currentPlayerAirplanes.length + 1,
      head: { row: headRow, col: headCol },
      body: bodyPositions,
      direction: selectedDirection,
      isDestroyed: false,
    }

    console.log("[v0] Successfully placed airplane:", newAirplane)

    setGameState((prev) => ({
      ...prev,
      playerBoards: {
        ...prev.playerBoards,
        [gameState.currentPlayer]: newBoard,
      },
      playerAirplanes: {
        ...prev.playerAirplanes,
        [gameState.currentPlayer]: [...currentPlayerAirplanes, newAirplane],
      },
    }))

    setPreviewBoard(
      Array(10)
        .fill(null)
        .map(() => Array(10).fill("empty")),
    )
  }

  const handleCellHover = (row: number, col: number) => {
    if (!canPlaceMore) return

    const newPreviewBoard = Array(10)
      .fill(null)
      .map(() => Array(10).fill("empty"))

    if (canPlaceAirplane(row, col, selectedDirection)) {
      const shape = getAirplaneShape(row, col, selectedDirection)
      shape.forEach((pos) => {
        if (pos.type === "head") {
          newPreviewBoard[pos.row][pos.col] = "airplane-head"
        } else {
          newPreviewBoard[pos.row][pos.col] = "airplane-body"
        }
      })
    }

    setPreviewBoard(newPreviewBoard)
  }

  const nextPlayer = () => {
    if (gameState.currentPlayer === 1) {
      setGameState((prev) => ({ ...prev, currentPlayer: 2 }))
    } else {
      setGameState((prev) => ({ ...prev, phase: "battle", currentPlayer: 1 }))
    }
    setPreviewBoard(
      Array(10)
        .fill(null)
        .map(() => Array(10).fill("empty")),
    )
  }

  const combinedBoard = gameState.playerBoards[gameState.currentPlayer].map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      if (cell !== "empty") return cell
      return previewBoard[rowIndex][colIndex]
    }),
  )

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">玩家 {gameState.currentPlayer} 布置飞机</h2>
        <p className="text-muted-foreground">已放置 {currentPlayerAirplanes.length}/3 架飞机</p>
        {canPlaceMore && <p className="text-sm text-primary mt-2">选择方向后，点击格子放置飞机机头</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <GameBoard
            board={combinedBoard}
            airplanes={currentPlayerAirplanes}
            isOwn={true}
            onCellClick={canPlaceMore ? placeAirplane : () => {}}
            onCellHover={canPlaceMore ? handleCellHover : undefined}
            gamePhase="setup"
          />
        </div>

        <div className="lg:w-80 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">飞机方向</label>
            <Select value={selectedDirection} onValueChange={(value: Direction) => setSelectedDirection(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up">向上 ↑</SelectItem>
                <SelectItem value="down">向下 ↓</SelectItem>
                <SelectItem value="left">向左 ←</SelectItem>
                <SelectItem value="right">向右 →</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">游戏规则</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 每个玩家需要放置3架飞机</li>
              <li>• 飞机形状：机头1格 + 机翅5格 + 机尾3格</li>
              <li>• 飞机可以朝四个方向放置</li>
              <li>• 击中机身得"中"，击中机头得"死"</li>
              <li>• 击毁对方3架飞机获胜</li>
            </ul>
          </div>

          {currentPlayerAirplanes.length === 3 && (
            <Button onClick={nextPlayer} className="w-full">
              {gameState.currentPlayer === 1 ? "玩家2布置飞机" : "开始游戏"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
