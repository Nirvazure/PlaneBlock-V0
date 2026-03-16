"use client"

import { useState } from "react"
import { toast } from "sonner"
import { GameBoard } from "@/components/game-board"
import { GameSetup } from "@/components/game-setup"
import { GameStatus } from "@/components/game-status"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { initialBoard, type GameState } from "@/lib/game-types"

type BattleView = "mine" | "attack"

export default function LocalBattlePage() {
  const [battleView, setBattleView] = useState<BattleView>("mine")
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
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-7xl mx-auto min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-0 mb-4 border-[3px] border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-card">
          <Button onClick={resetGame} variant="outline" className="rounded-none border-0 border-b-[3px] border-b-[var(--nes-border-dark)] sm:border-b-0 sm:border-r-[3px] sm:border-r-[var(--nes-border-dark)] shrink-0 px-3 py-2 text-xs sm:text-sm">
            重新开始
          </Button>
          <div className="flex-1 flex items-center px-3 py-2 min-w-0">
            <GameStatus gameState={gameState} compact />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 min-w-0">
          {gameState.phase === "setup" ? (
            <div className="lg:col-span-2 min-w-0">
              <GameSetup gameState={gameState} setGameState={setGameState} />
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4 lg:hidden">
                <Button
                  variant={battleView === "mine" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setBattleView("mine")}
                >
                  我的战场
                </Button>
                <Button
                  variant={battleView === "attack" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setBattleView("attack")}
                >
                  攻击对手
                </Button>
              </div>

              <Card className={`p-4 sm:p-6 min-h-[360px] lg:min-h-0 min-w-0 overflow-hidden ${battleView !== "mine" ? "hidden lg:block" : ""}`}>
                <h3 className="text-sm font-bold mb-4 text-center">玩家 {gameState.currentPlayer} - 我的战场</h3>
                <div className="flex justify-center w-full min-w-0">
                  <GameBoard
                    board={gameState.playerBoards[gameState.currentPlayer]}
                    airplanes={gameState.playerAirplanes[gameState.currentPlayer]}
                    isOwn={true}
                    onCellClick={() => {}}
                    gamePhase={gameState.phase}
                  />
                </div>
              </Card>

              <Card className={`p-4 sm:p-6 lg:min-h-0 min-h-[360px] min-w-0 overflow-hidden ${battleView !== "attack" ? "hidden lg:block" : ""}`}>
                <h3 className="text-sm font-bold mb-4 text-center">攻击对手</h3>
                <div className="flex justify-center w-full min-w-0">
                  <GameBoard
                    board={gameState.attackBoards[gameState.currentPlayer]}
                    airplanes={[]}
                    isOwn={false}
                    onCellClick={(row, col) => {
                      if (gameState.phase !== "battle") return

                      const opponent = gameState.currentPlayer === 1 ? 2 : 1
                      const opponentBoard = gameState.playerBoards[opponent]
                      const attackBoard = [...gameState.attackBoards[gameState.currentPlayer]]

                      if (attackBoard[row][col] !== "empty") return

                      let result: "hit" | "miss" | "destroy" = "miss"

                      if (opponentBoard[row][col] === "airplane-body" || opponentBoard[row][col] === "airplane-head") {
                        result = "hit"
                        attackBoard[row][col] = opponentBoard[row][col] === "airplane-head" ? "destroyed" : "hit"

                        if (opponentBoard[row][col] === "airplane-head") {
                          result = "destroy"
                          const updatedAirplanes = gameState.playerAirplanes[opponent].map((airplane) => {
                            if (airplane.head.row === row && airplane.head.col === col) {
                              return { ...airplane, isDestroyed: true }
                            }
                            return airplane
                          })

                          const destroyedCount = updatedAirplanes.filter((a) => a.isDestroyed).length

                          if (destroyedCount === 3) {
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
                              phase: "finished",
                              winner: gameState.currentPlayer,
                            }))
                          } else {
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
                              currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
                            }))
                          }
                          toast.success("击毁飞机！")
                          return
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

                      toast.success(result === "hit" ? "击中！" : "未击中")
                    }}
                    gamePhase={gameState.phase}
                  />
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
