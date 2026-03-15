export type GamePhase = "setup" | "battle" | "finished"
export type CellState = "empty" | "airplane-body" | "airplane-head" | "hit" | "miss" | "destroyed"
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

export const initialBoard = (): CellState[][] =>
  Array(10)
    .fill(null)
    .map(() => Array(10).fill("empty"))
