import { describe, expect, it } from 'vitest'
import { getBestMove } from '../ai/minimax'
import { createEmptyBoard, placeStone } from '../game/board'
import { checkWinnerByMove } from '../game/rules'

describe('ai minimax', () => {
  it('should choose winning move when available', () => {
    const board = createEmptyBoard()
    for (let i = 3; i <= 6; i += 1) {
      placeStone(board, { row: 7, col: i }, 2)
    }

    const result = getBestMove(board, 2, 4, 2_000)
    expect(result.move).not.toBeNull()
    if (result.move) {
      placeStone(board, result.move, 2)
      expect(checkWinnerByMove(board, result.move, 2)).toBe(2)
    }
  })

  it('should block opponent immediate four', () => {
    const board = createEmptyBoard()
    for (let i = 5; i <= 8; i += 1) {
      placeStone(board, { row: 9, col: i }, 1)
    }

    const result = getBestMove(board, 2, 4, 2_000)
    expect(result.move).not.toBeNull()
    expect(result.move?.row).toBe(9)
    expect([4, 9]).toContain(result.move?.col)
  })
})
