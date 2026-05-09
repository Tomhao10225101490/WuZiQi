import { getDirections, isInsideBoard } from '../game/board'
import type { Board, Stone } from '../game/types'

const SCORE_TABLE: Record<string, number> = {
  five: 20_000_000,
  open4: 600_000,
  closed4: 80_000,
  open3: 25_000,
  closed3: 2_000,
  open2: 450,
  closed2: 90,
  open1: 8,
}

function patternScore(length: number, openEnds: number): number {
  if (length >= 5) return SCORE_TABLE.five
  if (length === 4 && openEnds === 2) return SCORE_TABLE.open4
  if (length === 4 && openEnds === 1) return SCORE_TABLE.closed4
  if (length === 3 && openEnds === 2) return SCORE_TABLE.open3
  if (length === 3 && openEnds === 1) return SCORE_TABLE.closed3
  if (length === 2 && openEnds === 2) return SCORE_TABLE.open2
  if (length === 2 && openEnds === 1) return SCORE_TABLE.closed2
  if (length === 1 && openEnds === 2) return SCORE_TABLE.open1
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
  let openFourCount = 0
  let openThreeCount = 0
  const dirs = getDirections()
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] !== stone) continue
      for (const [dr, dc] of dirs) {
        const line = lineScore(board, row, col, dr, dc, stone)
        score += line
        if (line >= SCORE_TABLE.open4) openFourCount += 1
        else if (line >= SCORE_TABLE.open3) openThreeCount += 1
      }
    }
  }

  // 组合棋型奖励：双活三、冲四活三等，提升战术灵敏度。
  if (openFourCount >= 2) score += 1_500_000
  if (openFourCount >= 1 && openThreeCount >= 1) score += 900_000
  if (openThreeCount >= 2) score += 260_000

  return score
}

export function evaluateBoard(board: Board, aiStone: Stone): number {
  const humanStone: Stone = aiStone === 1 ? 2 : 1
  const aiScore = evaluateForStone(board, aiStone)
  const humanScore = evaluateForStone(board, humanStone)
  return aiScore - humanScore * 1.25
}
