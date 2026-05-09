import type { Board, Move, Stone } from '../game/types'

export type TTFlag = 'exact' | 'lower' | 'upper'

export interface TTEntry {
  depth: number
  score: number
  flag: TTFlag
  bestMove: Move | null
}

export class TranspositionTable {
  private table = new Map<string, TTEntry>()

  get(hash: string): TTEntry | undefined {
    return this.table.get(hash)
  }

  set(hash: string, entry: TTEntry): void {
    this.table.set(hash, entry)
  }

  clear(): void {
    this.table.clear()
  }

  get size(): number {
    return this.table.size
  }
}

export function hashBoard(board: Board, nextStone: Stone): string {
  const rows = board.map((row) => row.join('')).join('|')
  return `${nextStone}:${rows}`
}
