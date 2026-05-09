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

export function getGameResult(board: Board, lastMove?: Move): GameResult {
  if (lastMove) {
    const stone = board[lastMove.row][lastMove.col]
    const winner = checkWinnerByMove(board, lastMove, stone)
    if (winner !== 0) {
      return { winner, isDraw: false, gameOver: true }
    }
  }

  if (isBoardFull(board)) {
    return { winner: 0, isDraw: true, gameOver: true }
  }

  return { winner: 0, isDraw: false, gameOver: false }
}
