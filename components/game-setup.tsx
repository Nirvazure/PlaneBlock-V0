"use client"

import { useState } from "react"
import { GameBoard } from "./game-board"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import type { GameState, Airplane, Direction } from "@/app/page"

interface GameSetupProps {
  gameState: GameState
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void
}

export function GameSetup({ gameState, setGameState }: GameSetupProps) {
  const [selectedDirection, setSelectedDirection] = useState<Direction>("up")
  const [placementMode, setPlacementMode] = useState<"select" | "place">("select")
  const [selectedPosition, setSelectedPosition] = useState<{ row: number; col: number } | null>(null)

  const currentPlayerAirplanes = gameState.playerAirplanes[gameState.currentPlayer]
  const canPlaceMore = currentPlayerAirplanes.length < 3

  const getAirplaneShape = (headRow: number, headCol: number, direction: Direction) => {
    const positions = []

    switch (direction) {
      case "up":
        positions.push({ row: headRow, col: headCol, type: "head" })
        // Wings - 5 cells in cross pattern
        positions.push({ row: headRow + 1, col: headCol, type: "body" })
        positions.push({ row: headRow + 1, col: headCol - 1, type: "body" })
        positions.push({ row: headRow + 1, col: headCol + 1, type: "body" })
        positions.push({ row: headRow + 1, col: headCol - 2, type: "body" })
        positions.push({ row: headRow + 1, col: headCol + 2, type: "body" })
        // Body - 1 cell
        positions.push({ row: headRow + 2, col: headCol, type: "body" })
        // Tail - 3 cells horizontal
        positions.push({ row: headRow + 3, col: headCol - 1, type: "body" })
        positions.push({ row: headRow + 3, col: headCol, type: "body" })
        positions.push({ row: headRow + 3, col: headCol + 1, type: "body" })
        break
      case "down":
        positions.push({ row: headRow, col: headCol, type: "head" })
        positions.push({ row: headRow - 1, col: headCol, type: "body" })
        positions.push({ row: headRow - 1, col: headCol - 1, type: "body" })
        positions.push({ row: headRow - 1, col: headCol + 1, type: "body" })
        positions.push({ row: headRow - 1, col: headCol - 2, type: "body" })
        positions.push({ row: headRow - 1, col: headCol + 2, type: "body" })
        positions.push({ row: headRow - 2, col: headCol, type: "body" })
        positions.push({ row: headRow - 3, col: headCol - 1, type: "body" })
        positions.push({ row: headRow - 3, col: headCol, type: "body" })
        positions.push({ row: headRow - 3, col: headCol + 1, type: "body" })
        break
      case "left":
        positions.push({ row: headRow, col: headCol, type: "head" })
        positions.push({ row: headRow, col: headCol + 1, type: "body" })
        positions.push({ row: headRow - 1, col: headCol + 1, type: "body" })
        positions.push({ row: headRow + 1, col: headCol + 1, type: "body" })
        positions.push({ row: headRow - 2, col: headCol + 1, type: "body" })
        positions.push({ row: headRow + 2, col: headCol + 1, type: "body" })
        positions.push({ row: headRow, col: headCol + 2, type: "body" })
        // Tail - 3 cells horizontal
        positions.push({ row: headRow - 1, col: headCol + 3, type: "body" })
        positions.push({ row: headRow, col: headCol + 3, type: "body" })
        positions.push({ row: headRow + 1, col: headCol + 3, type: "body" })
        break
      case "right":
        positions.push({ row: headRow, col: headCol, type: "head" })
        positions.push({ row: headRow, col: headCol - 1, type: "body" })
        positions.push({ row: headRow - 1, col: headCol - 1, type: "body" })
        positions.push({ row: headRow + 1, col: headCol - 1, type: "body" })
        positions.push({ row: headRow - 2, col: headCol - 1, type: "body" })
        positions.push({ row: headRow + 2, col: headCol - 1, type: "body" })
        positions.push({ row: headRow, col: headCol - 2, type: "body" })
        // Tail - 3 cells horizontal
        positions.push({ row: headRow - 1, col: headCol - 3, type: "body" })
        positions.push({ row: headRow, col: headCol - 3, type: "body" })
        positions.push({ row: headRow + 1, col: headCol - 3, type: "body" })
        break
    }

    return positions.filter((pos) => pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10)
  }

  const canPlaceAirplane = (headRow: number, headCol: number, direction: Direction) => {
    const shape = getAirplaneShape(headRow, headCol, direction)
    if (shape.length < 10) return false

    const currentBoard = gameState.playerBoards[gameState.currentPlayer]
    return shape.every((pos) => currentBoard[pos.row][pos.col] === "empty")
  }

  const handleCellClick = (row: number, col: number) => {
    console.log("[v0] Cell clicked:", row, col, "mode:", placementMode)

    if (!canPlaceMore) return

    if (placementMode === "select") {
      // First click: select position and show preview
      setSelectedPosition({ row, col })
      setPlacementMode("place")
      console.log("[v0] Position selected, now in place mode")
    } else if (placementMode === "place") {
      // Second click: confirm placement
      if (selectedPosition && selectedPosition.row === row && selectedPosition.col === col) {
        // Clicked same position - place airplane
        placeAirplane(row, col)
        setSelectedPosition(null)
        setPlacementMode("select")
        console.log("[v0] Airplane placed")
      } else {
        // Clicked different position - change selection
        setSelectedPosition({ row, col })
        console.log("[v0] Position changed")
      }
    }
  }

  const placeAirplane = (headRow: number, headCol: number) => {
    console.log("[v0] Placing airplane at:", headRow, headCol, selectedDirection)

    if (!canPlaceAirplane(headRow, headCol, selectedDirection)) {
      alert("无法在此位置放置飞机，请选择其他位置或方向")
      return
    }

    const shape = getAirplaneShape(headRow, headCol, selectedDirection)
    const newBoard = gameState.playerBoards[gameState.currentPlayer].map((row) => [...row])
    const bodyPositions: { row: number; col: number }[] = []

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
  }

  const getDisplayBoard = () => {
    const baseBoard = gameState.playerBoards[gameState.currentPlayer]

    if (!selectedPosition || !canPlaceMore) {
      return baseBoard
    }

    const previewBoard = baseBoard.map((row) => [...row])

    if (canPlaceAirplane(selectedPosition.row, selectedPosition.col, selectedDirection)) {
      const shape = getAirplaneShape(selectedPosition.row, selectedPosition.col, selectedDirection)
      shape.forEach((pos) => {
        if (previewBoard[pos.row][pos.col] === "empty") {
          previewBoard[pos.row][pos.col] = pos.type === "head" ? "airplane-head" : "airplane-body"
        }
      })
    }

    return previewBoard
  }

  const nextPlayer = () => {
    if (gameState.currentPlayer === 1) {
      setGameState((prev) => ({ ...prev, currentPlayer: 2 }))
    } else {
      setGameState((prev) => ({ ...prev, phase: "battle", currentPlayer: 1 }))
    }
    setSelectedPosition(null)
    setPlacementMode("select")
  }

  const cancelSelection = () => {
    setSelectedPosition(null)
    setPlacementMode("select")
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">玩家 {gameState.currentPlayer} 布置飞机</h2>
        <p className="text-muted-foreground">已放置 {currentPlayerAirplanes.length}/3 架飞机</p>
        {canPlaceMore && (
          <div className="mt-2 space-y-1">
            {placementMode === "select" && <p className="text-sm text-primary">第一步：点击格子选择飞机机头位置</p>}
            {placementMode === "place" && selectedPosition && (
              <div className="space-y-1">
                <p className="text-sm text-green-600">
                  已选择位置 ({selectedPosition.row + 1}, {String.fromCharCode(65 + selectedPosition.col)})
                </p>
                <p className="text-sm text-primary">再次点击相同位置确认放置，或点击其他位置重新选择</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <GameBoard
            board={getDisplayBoard()}
            airplanes={currentPlayerAirplanes}
            isOwn={true}
            onCellClick={handleCellClick}
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

          {selectedPosition && placementMode === "place" && (
            <div className="space-y-2">
              <Button onClick={cancelSelection} variant="outline" className="w-full bg-transparent">
                取消选择
              </Button>
              <Button
                onClick={() => placeAirplane(selectedPosition.row, selectedPosition.col)}
                className="w-full"
                disabled={!canPlaceAirplane(selectedPosition.row, selectedPosition.col, selectedDirection)}
              >
                确认放置飞机
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">游戏规则</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 每个玩家需要放置3架飞机</li>
              <li>• 飞机形状：机头1格 + 机翅5格 + 机身1格 + 机尾3格（横向）</li>
              <li>• 飞机可以朝四个方向放置</li>
              <li>• 两步放置：先选择位置，再确认放置</li>
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
