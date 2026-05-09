import {
  cloneBoard,
  getCandidateMoves,
  placeStone,
  undoStone,
} from '../game/board'
import { checkWinnerByMove } from '../game/rules'
import type { Board, Move, Stone } from '../game/types'
import { evaluateBoard } from './evaluate'

const WIN_SCORE = 10_000_000

export interface AIMoveResult {
  move: Move | null
  score: number
}

interface SearchResult {
  score: number
  move: Move | null
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiStone: Stone,
  humanStone: Stone,
  lastMove: Move | null,
): SearchResult {
  if (lastMove) {
    const lastStone = maximizing ? humanStone : aiStone
    const winner = checkWinnerByMove(board, lastMove, lastStone)
    if (winner === aiStone) {
      return { score: WIN_SCORE + depth, move: lastMove }
    }
    if (winner === humanStone) {
      return { score: -WIN_SCORE - depth, move: lastMove }
    }
  }

  if (depth === 0) {
    return { score: evaluateBoard(board, aiStone), move: null }
  }

  const candidates = getCandidateMoves(board, 2).slice(0, 16)
  if (candidates.length === 0) {
    return { score: evaluateBoard(board, aiStone), move: null }
  }

  if (maximizing) {
    let bestScore = -Infinity
    let bestMove: Move | null = null

    for (const move of candidates) {
      placeStone(board, move, aiStone)
      const result = minimax(
        board,
        depth - 1,
        alpha,
        beta,
        false,
        aiStone,
        humanStone,
        move,
      )
      undoStone(board, move)

      if (result.score > bestScore) {
        bestScore = result.score
        bestMove = move
      }

      alpha = Math.max(alpha, bestScore)
      if (beta <= alpha) break
    }

    return { score: bestScore, move: bestMove }
  }

  let bestScore = Infinity
  let bestMove: Move | null = null

  for (const move of candidates) {
    placeStone(board, move, humanStone)
    const result = minimax(
      board,
      depth - 1,
      alpha,
      beta,
      true,
      aiStone,
      humanStone,
      move,
    )
    undoStone(board, move)

    if (result.score < bestScore) {
      bestScore = result.score
      bestMove = move
    }

    beta = Math.min(beta, bestScore)
    if (beta <= alpha) break
  }

  return { score: bestScore, move: bestMove }
}

export function getBestMove(
  board: Board,
  aiStone: Stone,
  depth = 2,
): AIMoveResult {
  const humanStone: Stone = aiStone === 1 ? 2 : 1
  const boardCopy = cloneBoard(board)
  const result = minimax(
    boardCopy,
    depth,
    -Infinity,
    Infinity,
    true,
    aiStone,
    humanStone,
    null,
  )
  return { move: result.move, score: result.score }
}
