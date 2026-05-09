import { describe, expect, it } from 'vitest'
import { createEmptyBoard, placeStone } from '../game/board'
import { checkWinnerByMove } from '../game/rules'

describe('rules', () => {
  it('horizontal five should win', () => {
    const board = createEmptyBoard()
    for (let col = 2; col <= 6; col += 1) {
      placeStone(board, { row: 7, col }, 1)
    }
    const winner = checkWinnerByMove(board, { row: 7, col: 6 }, 1)
    expect(winner).toBe(1)
  })

  it('diagonal five should win', () => {
    const board = createEmptyBoard()
    for (let i = 0; i < 5; i += 1) {
      placeStone(board, { row: i + 3, col: i + 4 }, 2)
    }
    const winner = checkWinnerByMove(board, { row: 7, col: 8 }, 2)
    expect(winner).toBe(2)
  })
})
