"use client"

import { useState } from "react"
import { GameBoard } from "@/components/game-board"
import { GameSetup } from "@/components/game-setup"
import { GameStatus } from "@/components/game-status"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export type GamePhase = "setup" | "battle" | "finished"
export type CellState = "empty" | "airplane-body" | "airplane-head" | "hit" | "miss"
export type Direction = "up" | "down" | "left" | "right"

export interface Airplane {
  id: number
  head: { row: number; col: number }
  body: { row: number; col: number }[]
  direction: Direction
  isDestroyed: boolean
}

export interface GameState {
  phase: GamePhase
  currentPlayer: 1 | 2
  playerBoards: {
    1: CellState[][]
    2: CellState[][]
  }
  playerAirplanes: {
    1: Airplane[]
    2: Airplane[]
  }
  attackBoards: {
    1: CellState[][]
    2: CellState[][]
  }
  winner: 1 | 2 | null
}

const initialBoard = (): CellState[][] =>
  Array(10)
    .fill(null)
    .map(() => Array(10).fill("empty"))

export default function AirplaneBattlePage() {
  const [gameState, setGameState] = useState<GameState>({
    phase: "setup",
    currentPlayer: 1,
    playerBoards: {
      1: initialBoard(),
      2: initialBoard(),
    },
    playerAirplanes: {
      1: [],
      2: [],
    },
    attackBoards: {
      1: initialBoard(),
      2: initialBoard(),
    },
    winner: null,
  })

  console.log("[v0] Current game state:", gameState)

  const resetGame = () => {
    setGameState({
      phase: "setup",
      currentPlayer: 1,
      playerBoards: {
        1: initialBoard(),
        2: initialBoard(),
      },
      playerAirplanes: {
        1: [],
        2: [],
      },
      attackBoards: {
        1: initialBoard(),
        2: initialBoard(),
      },
      winner: null,
    })
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">飞机大战</h1>
          <p className="text-muted-foreground">经典纸笔游戏的数字版本</p>
          <div className="mt-4 p-2 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">
              当前阶段:{" "}
              {gameState.phase === "setup" ? "布置飞机" : gameState.phase === "battle" ? "战斗中" : "游戏结束"}
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <Button onClick={resetGame} variant="outline">
            重新开始游戏
          </Button>
        </div>

        <GameStatus gameState={gameState} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {gameState.phase === "setup" ? (
            <div className="lg:col-span-2">
              <GameSetup gameState={gameState} setGameState={setGameState} />
            </div>
          ) : (
            <>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">玩家 {gameState.currentPlayer} - 我的战场</h3>
                <GameBoard
                  board={gameState.playerBoards[gameState.currentPlayer]}
                  airplanes={gameState.playerAirplanes[gameState.currentPlayer]}
                  isOwn={true}
                  onCellClick={() => {}}
                  gamePhase={gameState.phase}
                />
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">攻击对手</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">点击格子攻击对手的飞机</p>
                <GameBoard
                  board={gameState.attackBoards[gameState.currentPlayer]}
                  airplanes={[]}
                  isOwn={false}
                  onCellClick={(row, col) => {
                    console.log("[v0] Cell clicked:", row, col)
                    if (gameState.phase !== "battle") return

                    const opponent = gameState.currentPlayer === 1 ? 2 : 1
                    const opponentBoard = gameState.playerBoards[opponent]
                    const attackBoard = [...gameState.attackBoards[gameState.currentPlayer]]

                    if (attackBoard[row][col] !== "empty") return

                    let result: "hit" | "miss" | "destroy" = "miss"

                    if (opponentBoard[row][col] === "airplane-body" || opponentBoard[row][col] === "airplane-head") {
                      result = "hit"
                      attackBoard[row][col] = "hit"

                      // Check if airplane head is hit
                      if (opponentBoard[row][col] === "airplane-head") {
                        result = "destroy"
                        // Mark airplane as destroyed
                        const updatedAirplanes = gameState.playerAirplanes[opponent].map((airplane) => {
                          if (airplane.head.row === row && airplane.head.col === col) {
                            return { ...airplane, isDestroyed: true }
                          }
                          return airplane
                        })

                        setGameState((prev) => ({
                          ...prev,
                          playerAirplanes: {
                            ...prev.playerAirplanes,
                            [opponent]: updatedAirplanes,
                          },
                          attackBoards: {
                            ...prev.attackBoards,
                            [gameState.currentPlayer]: attackBoard,
                          },
                        }))

                        // Check for win condition
                        const destroyedCount = updatedAirplanes.filter((a) => a.isDestroyed).length
                        if (destroyedCount === 3) {
                          setGameState((prev) => ({
                            ...prev,
                            phase: "finished",
                            winner: gameState.currentPlayer,
                          }))
                          return
                        }
                      }
                    } else {
                      attackBoard[row][col] = "miss"
                    }

                    setGameState((prev) => ({
                      ...prev,
                      attackBoards: {
                        ...prev.attackBoards,
                        [gameState.currentPlayer]: attackBoard,
                      },
                      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
                    }))

                    // Show result
                    const messages = {
                      hit: "击中！",
                      miss: "未击中",
                      destroy: "击毁飞机！",
                    }
                    alert(messages[result])
                  }}
                  gamePhase={gameState.phase}
                />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
