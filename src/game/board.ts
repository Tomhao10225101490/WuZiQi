import { BOARD_SIZE, type Board, type Move, type Stone } from './types'

const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array<Stone>(BOARD_SIZE).fill(0),
  )
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

export function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

export function placeStone(board: Board, move: Move, stone: Stone): boolean {
  if (!isInsideBoard(move.row, move.col) || board[move.row][move.col] !== 0) {
    return false
  }

  board[move.row][move.col] = stone
  return true
}

export function undoStone(board: Board, move: Move): void {
  board[move.row][move.col] = 0
}

export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== 0))
}

export function hasAnyStone(board: Board): boolean {
  return board.some((row) => row.some((cell) => cell !== 0))
}

export function countContinuous(
  board: Board,
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  stone: Stone,
): number {
  let r = row + dRow
  let c = col + dCol
  let count = 0

  while (isInsideBoard(r, c) && board[r][c] === stone) {
    count += 1
    r += dRow
    c += dCol
  }

  return count
}

export function getCandidateMoves(board: Board, distance = 2): Move[] {
  const set = new Set<string>()
  const hasStone = hasAnyStone(board)

  if (!hasStone) {
    const center = Math.floor(BOARD_SIZE / 2)
    return [{ row: center, col: center }]
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] === 0) {
        continue
      }

      for (let dr = -distance; dr <= distance; dr += 1) {
        for (let dc = -distance; dc <= distance; dc += 1) {
          const nextRow = row + dr
          const nextCol = col + dc
          if (!isInsideBoard(nextRow, nextCol) || board[nextRow][nextCol] !== 0) {
            continue
          }
          set.add(`${nextRow},${nextCol}`)
        }
      }
    }
  }

  const center = Math.floor(BOARD_SIZE / 2)
  return Array.from(set)
    .map((key) => {
      const [row, col] = key.split(',').map(Number)
      return { row, col }
    })
    .sort((a, b) => {
      const da = Math.abs(a.row - center) + Math.abs(a.col - center)
      const db = Math.abs(b.row - center) + Math.abs(b.col - center)
      return da - db
    })
}

export function getDirections() {
  return DIRECTIONS
}
