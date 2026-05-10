/** 与标准围棋盘一致：19×19 路（交叉点下棋） */
export const BOARD_SIZE = 19

export type Stone = 0 | 1 | 2
export type Player = 1 | 2
export type Board = Stone[][]

export interface Move {
  row: number
  col: number
}

export type Winner = Player | 0
