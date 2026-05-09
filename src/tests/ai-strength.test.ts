import { describe, expect, it } from 'vitest'
import { getBestMove } from '../ai/minimax'
import { createEmptyBoard, placeStone } from '../game/board'

describe('ai strength scenarios', () => {
  it('prefers extension from open three patterns', () => {
    const board = createEmptyBoard()
    placeStone(board, { row: 7, col: 6 }, 2)
    placeStone(board, { row: 7, col: 7 }, 2)
    placeStone(board, { row: 7, col: 8 }, 2)
    placeStone(board, { row: 6, col: 7 }, 1)
    placeStone(board, { row: 8, col: 7 }, 1)

    const result = getBestMove(board, 2, 5, 2_000)
    expect(result.move).not.toBeNull()
    expect(result.move?.row).toBe(7)
    expect([5, 9]).toContain(result.move?.col)
  })

  it('returns search telemetry', () => {
    const board = createEmptyBoard()
    placeStone(board, { row: 7, col: 7 }, 1)

    const result = getBestMove(board, 2, 4, 1_500)
    expect(result.nodes).toBeGreaterThan(0)
    expect(result.depthReached).toBeGreaterThan(0)
    expect(result.timeSpentMs).toBeGreaterThanOrEqual(0)
  })
})
