export const BOARD_SIZE = 15

export type Stone = 0 | 1 | 2
export type Player = 1 | 2
export type Board = Stone[][]

export interface Move {
  row: number
  col: number
}

export type Winner = Player | 0
