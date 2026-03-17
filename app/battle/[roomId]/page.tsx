"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { GameBoard } from "@/components/game-board"
import { GameSetup } from "@/components/game-setup"
import { GameStatus } from "@/components/game-status"
import { Card } from "@/components/ui/card"
import { updateRoomState } from "@/lib/game-session"
import { useWsRoom } from "@/lib/use-ws-room"
import type { GameState } from "@/lib/game-types"

type BattleView = "mine" | "attack"

export default function BattleRoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const slot = parseInt(searchParams.get("slot") ?? "1", 10) as 1 | 2

  const [battleView, setBattleView] = useState<BattleView>("mine")
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [roomCode, setRoomCode] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isUpdatingRef = useRef(false)

  const onRoomUpdate = useCallback(
    (room: { roomId: string; roomCode: string; player1Nickname: string; player2Nickname: string | null; state: GameState }) => {
      setRoomCode(room.roomCode)
      setError(null)
      setLoading(false)
      setGameState((prev) => {
        if (!prev) return room.state
        if (JSON.stringify(prev) === JSON.stringify(room.state)) return prev
        return room.state
      })
    },
    []
  )

  const wsOptions = useMemo(
    () => ({ shouldSkipFetch: () => isUpdatingRef.current }),
    []
  )
  const { notifyRoomUpdated } = useWsRoom(
    roomId || null,
    onRoomUpdate,
    (err) => {
      setError(err)
      setLoading(false)
    },
    wsOptions
  )

  const setGameStateAndSync = useCallback(
    async (updater: GameState | ((prev: GameState) => GameState)) => {
      if (!gameState) return
      
      // 加锁：标记正在更新
      isUpdatingRef.current = true
      
      const next = typeof updater === "function" ? updater(gameState) : updater
      
      // 立即更新本地状态（乐观更新）
      setGameState(next)
      
      try {
        await updateRoomState(roomId, next)
        notifyRoomUpdated() // room:updated 广播会触发 use-ws-room 的 fetchRoom，避免重复 GET
      } catch (e) {
        console.error(e)
        toast.error("同步失败，请重试")
        // 失败时恢复旧状态
        setGameState(gameState)
      } finally {
        // 解锁
        isUpdatingRef.current = false
      }
    },
    [roomId, gameState, notifyRoomUpdated]
  )

  if (loading && !gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">{error ?? "房间不存在"}</p>
      </div>
    )
  }

  const isMyTurn = gameState.currentPlayer === slot
  const myBoard = gameState.playerBoards[slot]
  const myAirplanes = gameState.playerAirplanes[slot]
  const myAttackBoard = gameState.attackBoards[slot]
  const opponentBoard = gameState.playerBoards[slot === 1 ? 2 : 1]
  const opponentAirplanes = gameState.playerAirplanes[slot === 1 ? 2 : 1]

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-7xl mx-auto min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-0 mb-4 border-[3px] border-[var(--nes-border-dark)] border-t-[var(--nes-border-light)] border-l-[var(--nes-border-light)] bg-card">
          <div className="shrink-0 px-3 py-2 text-xs text-muted-foreground border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-[var(--nes-border-dark)] flex items-center gap-2">
            <span>房间码: <strong className="text-foreground">{roomCode}</strong> · 你是玩家{slot}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(roomCode)
                toast.success("已复制房间码")
              }}
              className="text-primary hover:underline text-[10px]"
            >
              复制
            </button>
          </div>
          <div className="flex-1 flex items-center px-3 py-2 min-w-0">
            <GameStatus gameState={gameState} compact />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 min-w-0">
          {gameState.phase === "setup" ? (
            <div className="lg:col-span-2 min-w-0">
              {gameState.currentPlayer === slot ? (
                <GameSetup gameState={gameState} setGameState={setGameStateAndSync} />
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">等待玩家 {gameState.currentPlayer} 布置飞机...</p>
                </Card>
              )}
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4 lg:hidden">
                <button
                  type="button"
                  onClick={() => setBattleView("mine")}
                  className={`flex-1 py-2 text-sm border-2 ${battleView === "mine" ? "border-primary bg-primary/10" : "border-[var(--nes-border-dark)]"}`}
                >
                  我的战场
                </button>
                <button
                  type="button"
                  onClick={() => setBattleView("attack")}
                  className={`flex-1 py-2 text-sm border-2 ${battleView === "attack" ? "border-primary bg-primary/10" : "border-[var(--nes-border-dark)]"}`}
                >
                  攻击对手
                </button>
              </div>

              <Card className={`p-4 sm:p-6 min-h-[360px] lg:min-h-0 min-w-0 overflow-hidden ${battleView !== "mine" ? "hidden lg:block" : ""}`}>
                <h3 className="text-sm font-bold mb-4 text-center">我的战场</h3>
                <div className="flex justify-center w-full min-w-0">
                  <GameBoard
                    board={myBoard}
                    airplanes={myAirplanes}
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
                    board={myAttackBoard}
                    airplanes={[]}
                    isOwn={false}
                    onCellClick={(row, col) => {
                      if (gameState.phase !== "battle" || !isMyTurn) return

                      const opponent = slot === 1 ? 2 : 1
                      const attackBoard = [...gameState.attackBoards[slot]]

                      if (attackBoard[row][col] !== "empty") return

                      let result: "hit" | "miss" | "destroy" = "miss"

                      if (opponentBoard[row][col] === "airplane-body" || opponentBoard[row][col] === "airplane-head") {
                        result = "hit"
                        attackBoard[row][col] = opponentBoard[row][col] === "airplane-head" ? "destroyed" : "hit"

                        if (opponentBoard[row][col] === "airplane-head") {
                          result = "destroy"
                          const updatedAirplanes = opponentAirplanes.map((ap) =>
                            ap.head.row === row && ap.head.col === col ? { ...ap, isDestroyed: true } : ap
                          )
                          const destroyedCount = updatedAirplanes.filter((a) => a.isDestroyed).length

                          setGameStateAndSync((prev) => ({
                            ...prev,
                            playerAirplanes: { ...prev.playerAirplanes, [opponent]: updatedAirplanes },
                            attackBoards: { ...prev.attackBoards, [slot]: attackBoard },
                            ...(destroyedCount === 3
                              ? { phase: "finished" as const, winner: slot }
                              : { currentPlayer: (prev.currentPlayer === 1 ? 2 : 1) as 1 | 2 }),
                          }))
                          toast.success("击毁飞机！")
                          return
                        }
                      } else {
                        attackBoard[row][col] = "miss"
                      }

                      setGameStateAndSync((prev) => ({
                        ...prev,
                        attackBoards: { ...prev.attackBoards, [slot]: attackBoard },
                        currentPlayer: (prev.currentPlayer === 1 ? 2 : 1) as 1 | 2,
                      }))
                      toast.success(result === "hit" ? "击中！" : "未击中")
                    }}
                    gamePhase={gameState.phase}
                  />
                </div>
                {!isMyTurn && gameState.phase === "battle" && (
                  <p className="text-center text-xs text-muted-foreground mt-2">等待对手回合</p>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
