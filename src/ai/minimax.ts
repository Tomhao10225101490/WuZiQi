import {
  cloneBoard,
  placeStone,
  undoStone,
} from '../game/board'
import { checkWinnerByMove } from '../game/rules'
import type { Board, Move, Stone } from '../game/types'
import { evaluateBoard } from './evaluate'
import { getOrderedMoves } from './moveOrdering'
import { hashBoard, TranspositionTable, type TTFlag } from './transposition'

const WIN_SCORE = 100_000_000

export interface AIMoveResult {
  move: Move | null
  score: number
  depthReached: number
  nodes: number
  timeSpentMs: number
}

interface SearchResult {
  score: number
  move: Move | null
  timeout: boolean
}

interface SearchContext {
  aiStone: Stone
  deadline: number
  nodes: number
  tt: TranspositionTable
}

function findImmediateTacticalMove(board: Board, aiStone: Stone): Move | null {
  const opponent: Stone = aiStone === 1 ? 2 : 1
  const candidates = getOrderedMoves(board, aiStone, aiStone, 32)

  for (const move of candidates) {
    if (!placeStone(board, move, aiStone)) continue
    const wins = checkWinnerByMove(board, move, aiStone) === aiStone
    undoStone(board, move)
    if (wins) return move
  }

  for (const move of candidates) {
    if (!placeStone(board, move, opponent)) continue
    const oppWins = checkWinnerByMove(board, move, opponent) === opponent
    undoStone(board, move)
    if (oppWins) return move
  }

  return null
}

function quiescence(
  board: Board,
  alpha: number,
  beta: number,
  currentStone: Stone,
  lastMove: Move | null,
  ctx: SearchContext,
  qDepth: number,
): SearchResult {
  if (Date.now() > ctx.deadline) {
    return { score: evaluateBoard(board, ctx.aiStone), move: null, timeout: true }
  }
  ctx.nodes += 1

  const previousStone: Stone = currentStone === 1 ? 2 : 1
  if (lastMove) {
    const winner = checkWinnerByMove(board, lastMove, previousStone)
    if (winner === ctx.aiStone) {
      return { score: WIN_SCORE + qDepth, move: lastMove, timeout: false }
    }
    if (winner !== 0 && winner !== ctx.aiStone) {
      return { score: -WIN_SCORE - qDepth, move: lastMove, timeout: false }
    }
  }

  const standPat = evaluateBoard(board, ctx.aiStone)
  if (qDepth <= 0) {
    return { score: standPat, move: null, timeout: false }
  }

  let best = standPat
  if (best >= beta) {
    return { score: best, move: null, timeout: false }
  }
  if (alpha < best) alpha = best

  const tacticalMoves = getOrderedMoves(board, currentStone, ctx.aiStone, 6)
  for (const move of tacticalMoves) {
    if (!placeStone(board, move, currentStone)) continue
    const winNow = checkWinnerByMove(board, move, currentStone) === currentStone
    let score: number

    if (winNow) {
      score = currentStone === ctx.aiStone ? WIN_SCORE - 1 : -WIN_SCORE + 1
    } else {
      const result = quiescence(
        board,
        -beta,
        -alpha,
        currentStone === 1 ? 2 : 1,
        move,
        ctx,
        qDepth - 1,
      )
      if (result.timeout) return { score: best, move: null, timeout: true }
      score = -result.score
    }

    undoStone(board, move)
    if (score > best) {
      best = score
    }
    if (best > alpha) alpha = best
    if (alpha >= beta) break
  }

  return { score: best, move: null, timeout: false }
}

function negamax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  currentStone: Stone,
  lastMove: Move | null,
  ctx: SearchContext,
): SearchResult {
  if (Date.now() > ctx.deadline) {
    return { score: evaluateBoard(board, ctx.aiStone), move: null, timeout: true }
  }
  ctx.nodes += 1

  const previousStone: Stone = currentStone === 1 ? 2 : 1
  if (lastMove) {
    const winner = checkWinnerByMove(board, lastMove, previousStone)
    if (winner === ctx.aiStone) {
      return { score: WIN_SCORE + depth, move: lastMove, timeout: false }
    }
    if (winner !== 0 && winner !== ctx.aiStone) {
      return { score: -WIN_SCORE - depth, move: lastMove, timeout: false }
    }
  }

  if (depth <= 0) {
    return quiescence(board, alpha, beta, currentStone, lastMove, ctx, 1)
  }

  const alphaOrig = alpha
  const boardHash = hashBoard(board, currentStone)
  const ttKey = `${boardHash}|${depth}`
  const cached = ctx.tt.get(ttKey)
  if (cached && cached.depth >= depth) {
    if (cached.flag === 'exact') {
      return { score: cached.score, move: cached.bestMove, timeout: false }
    }
    if (cached.flag === 'lower') {
      alpha = Math.max(alpha, cached.score)
    } else {
      beta = Math.min(beta, cached.score)
    }
    if (alpha >= beta) {
      return { score: cached.score, move: cached.bestMove, timeout: false }
    }
  }

  const moves = getOrderedMoves(board, currentStone, ctx.aiStone, 18)
  if (moves.length === 0) {
    return { score: evaluateBoard(board, ctx.aiStone), move: null, timeout: false }
  }

  let bestScore = -Infinity
  let bestMove: Move | null = null

  for (const move of moves) {
    if (!placeStone(board, move, currentStone)) continue
    const child = negamax(
      board,
      depth - 1,
      -beta,
      -alpha,
      currentStone === 1 ? 2 : 1,
      move,
      ctx,
    )
    undoStone(board, move)

    if (child.timeout) {
      return { score: bestScore === -Infinity ? alpha : bestScore, move: bestMove, timeout: true }
    }

    const score = -child.score
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }

    alpha = Math.max(alpha, score)
    if (alpha >= beta) break
  }

  let flag: TTFlag = 'exact'
  if (bestScore <= alphaOrig) flag = 'upper'
  else if (bestScore >= beta) flag = 'lower'

  ctx.tt.set(ttKey, {
    depth,
    score: bestScore,
    flag,
    bestMove,
  })

  return { score: bestScore, move: bestMove, timeout: false }
}

export function getBestMove(
  board: Board,
  aiStone: Stone,
  depth = 4,
  timeLimitMs = 5_000,
): AIMoveResult {
  const boardCopy = cloneBoard(board)
  const tacticalMove = findImmediateTacticalMove(boardCopy, aiStone)
  if (tacticalMove) {
    return {
      move: tacticalMove,
      score: WIN_SCORE - 2,
      depthReached: 0,
      nodes: 0,
      timeSpentMs: 0,
    }
  }

  const deadline = Date.now() + Math.max(300, timeLimitMs)
  const tt = new TranspositionTable()
  const ctx: SearchContext = {
    aiStone,
    deadline,
    nodes: 0,
    tt,
  }

  let bestMove: Move | null = null
  let bestScore = -Infinity
  let depthReached = 0
  const maxDepth = Math.max(2, depth)

  for (let d = 1; d <= maxDepth; d += 1) {
    const result = negamax(
      boardCopy,
      d,
      -Infinity,
      Infinity,
      aiStone,
      null,
      ctx,
    )
    if (result.timeout) break
    if (result.move) {
      bestMove = result.move
      bestScore = result.score
      depthReached = d
    }
    if (Date.now() > deadline) break
  }

  const timeSpentMs = Math.max(0, timeLimitMs - Math.max(0, deadline - Date.now()))
  return {
    move: bestMove,
    score: bestScore,
    depthReached,
    nodes: ctx.nodes,
    timeSpentMs,
  }
}
