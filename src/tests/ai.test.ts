import { describe, expect, it } from 'vitest'
import { getBestMove } from '../ai/minimax'
import { createEmptyBoard, placeStone } from '../game/board'

describe('ai minimax', () => {
  it('should choose winning move when available', () => {
    const board = createEmptyBoard()
    for (let i = 3; i <= 6; i += 1) {
      placeStone(board, { row: 7, col: i }, 2)
    }

    const result = getBestMove(board, 2, 2)
    expect(result.move).not.toBeNull()
    expect(result.move?.row).toBe(7)
    expect([2, 7]).toContain(result.move?.col)
  })
})
