import { getDirections, isInsideBoard } from '../game/board'
import type { Board, Stone } from '../game/types'

const SCORE_TABLE: Record<string, number> = {
  '5': 1_000_000,
  open4: 120_000,
  closed4: 12_000,
  open3: 6_000,
  closed3: 700,
  open2: 150,
  closed2: 30,
}

function patternScore(length: number, openEnds: number): number {
  if (length >= 5) return SCORE_TABLE['5']
  if (length === 4 && openEnds === 2) return SCORE_TABLE.open4
  if (length === 4 && openEnds === 1) return SCORE_TABLE.closed4
  if (length === 3 && openEnds === 2) return SCORE_TABLE.open3
  if (length === 3 && openEnds === 1) return SCORE_TABLE.closed3
  if (length === 2 && openEnds === 2) return SCORE_TABLE.open2
  if (length === 2 && openEnds === 1) return SCORE_TABLE.closed2
  return 0
}

function lineScore(
  board: Board,
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  stone: Stone,
): number {
  let count = 1
  let openEnds = 0

  let r = row + dRow
  let c = col + dCol
  while (isInsideBoard(r, c) && board[r][c] === stone) {
    count += 1
    r += dRow
    c += dCol
  }
  if (isInsideBoard(r, c) && board[r][c] === 0) {
    openEnds += 1
  }

  r = row - dRow
  c = col - dCol
  while (isInsideBoard(r, c) && board[r][c] === stone) {
    count += 1
    r -= dRow
    c -= dCol
  }
  if (isInsideBoard(r, c) && board[r][c] === 0) {
    openEnds += 1
  }

  return patternScore(count, openEnds)
}

function evaluateForStone(board: Board, stone: Stone): number {
  let score = 0
  const dirs = getDirections()
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] !== stone) continue
      for (const [dr, dc] of dirs) {
        score += lineScore(board, row, col, dr, dc, stone)
      }
    }
  }
  return score
}

export function evaluateBoard(board: Board, aiStone: Stone): number {
  const humanStone: Stone = aiStone === 1 ? 2 : 1
  const aiScore = evaluateForStone(board, aiStone)
  const humanScore = evaluateForStone(board, humanStone)
  return aiScore - humanScore * 1.1
}
