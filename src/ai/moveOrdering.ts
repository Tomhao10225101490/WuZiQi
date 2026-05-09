import { getCandidateMoves, placeStone, undoStone } from '../game/board'
import { checkWinnerByMove } from '../game/rules'
import type { Board, Move, Stone } from '../game/types'
import { evaluateBoard } from './evaluate'

const WIN_BONUS = 80_000_000
const BLOCK_WIN_BONUS = 60_000_000
const CENTER_BONUS = 100

function getCenterBias(move: Move, size: number): number {
  const center = Math.floor(size / 2)
  const dist = Math.abs(move.row - center) + Math.abs(move.col - center)
  return CENTER_BONUS - dist
}

function isWinningMove(board: Board, move: Move, stone: Stone): boolean {
  if (!placeStone(board, move, stone)) return false
  const win = checkWinnerByMove(board, move, stone) === stone
  undoStone(board, move)
  return win
}

export function getOrderedMoves(
  board: Board,
  currentStone: Stone,
  aiStone: Stone,
  maxCandidates: number,
): Move[] {
  const opponent: Stone = currentStone === 1 ? 2 : 1
  const candidates = getCandidateMoves(board, 2)

  const scored = candidates.map((move) => {
    let score = getCenterBias(move, board.length)

    if (isWinningMove(board, move, currentStone)) {
      score += WIN_BONUS
    }
    if (isWinningMove(board, move, opponent)) {
      score += BLOCK_WIN_BONUS
    }

    if (placeStone(board, move, currentStone)) {
      const evalScore = evaluateBoard(board, aiStone)
      score += currentStone === aiStone ? evalScore : -evalScore
      undoStone(board, move)
    }

    return { move, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCandidates)
    .map((item) => item.move)
}
