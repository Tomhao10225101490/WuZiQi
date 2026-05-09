import {
  countContinuous,
  getDirections,
  isBoardFull,
  isInsideBoard,
} from './board'
import type { Board, Move, Stone, Winner } from './types'

export interface GameResult {
  winner: Winner
  isDraw: boolean
  gameOver: boolean
  winningLine: Move[] | null
}

export function checkWinnerByMove(
  board: Board,
  move: Move,
  stone: Stone,
): Winner {
  if (stone === 0 || !isInsideBoard(move.row, move.col)) {
    return 0
  }

  for (const [dr, dc] of getDirections()) {
    const count =
      1 +
      countContinuous(board, move.row, move.col, dr, dc, stone) +
      countContinuous(board, move.row, move.col, -dr, -dc, stone)

    if (count >= 5) {
      return stone
    }
  }

  return 0
}

export function getWinningLineByMove(
  board: Board,
  move: Move,
  stone: Stone,
): Move[] | null {
  if (stone === 0 || !isInsideBoard(move.row, move.col)) {
    return null
  }

  for (const [dr, dc] of getDirections()) {
    const line: Move[] = [{ row: move.row, col: move.col }]

    let r = move.row + dr
    let c = move.col + dc
    while (isInsideBoard(r, c) && board[r][c] === stone) {
      line.push({ row: r, col: c })
      r += dr
      c += dc
    }

    r = move.row - dr
    c = move.col - dc
    while (isInsideBoard(r, c) && board[r][c] === stone) {
      line.unshift({ row: r, col: c })
      r -= dr
      c -= dc
    }

    if (line.length >= 5) {
      return line.slice(0, 5)
    }
  }

  return null
}

export function getGameResult(board: Board, lastMove?: Move): GameResult {
  if (lastMove) {
    const stone = board[lastMove.row][lastMove.col]
    const winner = checkWinnerByMove(board, lastMove, stone)
    if (winner !== 0) {
      return {
        winner,
        isDraw: false,
        gameOver: true,
        winningLine: getWinningLineByMove(board, lastMove, stone),
      }
    }
  }

  if (isBoardFull(board)) {
    return { winner: 0, isDraw: true, gameOver: true, winningLine: null }
  }

  return { winner: 0, isDraw: false, gameOver: false, winningLine: null }
}
