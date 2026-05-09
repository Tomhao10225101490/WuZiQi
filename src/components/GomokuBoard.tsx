import { useEffect, useMemo, useRef } from 'react'
import { BOARD_SIZE, type Board, type Move, type Stone } from '../game/types'

interface GomokuBoardProps {
  board: Board
  lastMove: Move | null
  winningLine?: Move[] | null
  disabled?: boolean
  onPlay: (move: Move) => void
}

const PADDING = 28
const CELL = 36
const SIZE = PADDING * 2 + CELL * (BOARD_SIZE - 1)

export function GomokuBoard({
  board,
  lastMove,
  winningLine = null,
  disabled = false,
  onPlay,
}: GomokuBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stars = useMemo(
    () => [
      [3, 3],
      [3, 7],
      [3, 11],
      [7, 3],
      [7, 7],
      [7, 11],
      [11, 3],
      [11, 7],
      [11, 11],
    ],
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const ratio = window.devicePixelRatio || 1
    canvas.width = SIZE * ratio
    canvas.height = SIZE * ratio
    canvas.style.width = `${SIZE}px`
    canvas.style.height = `${SIZE}px`
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

    ctx.clearRect(0, 0, SIZE, SIZE)

    const boardGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE)
    boardGrad.addColorStop(0, '#f6dfba')
    boardGrad.addColorStop(1, '#e2b67a')
    ctx.fillStyle = boardGrad
    ctx.fillRect(0, 0, SIZE, SIZE)

    ctx.strokeStyle = 'rgba(75, 48, 20, 0.55)'
    for (let i = 0; i < BOARD_SIZE; i += 1) {
      const pos = PADDING + i * CELL
      ctx.beginPath()
      ctx.moveTo(PADDING, pos)
      ctx.lineTo(SIZE - PADDING, pos)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(pos, PADDING)
      ctx.lineTo(pos, SIZE - PADDING)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(75, 48, 20, 0.7)'
    for (const [row, col] of stars) {
      const x = PADDING + col * CELL
      const y = PADDING + row * CELL
      ctx.beginPath()
      ctx.arc(x, y, 3.2, 0, Math.PI * 2)
      ctx.fill()
    }

    drawStones(ctx, board, lastMove, winningLine)
  }, [board, stars, lastMove, winningLine])

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const col = Math.round((x - PADDING) / CELL)
    const row = Math.round((y - PADDING) / CELL)
    if (row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE) return

    onPlay({ row, col })
  }

  return (
    <canvas
      ref={canvasRef}
      className={`gomoku-canvas ${disabled ? 'is-disabled' : ''}`}
      onClick={handleClick}
      aria-label="五子棋棋盘"
      role="img"
    />
  )
}

function drawStone(ctx: CanvasRenderingContext2D, x: number, y: number, stone: Stone) {
  const radius = 14
  const grad = ctx.createRadialGradient(x - 4, y - 4, 3, x, y, radius + 3)
  if (stone === 1) {
    grad.addColorStop(0, '#707070')
    grad.addColorStop(1, '#121212')
  } else {
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(1, '#d7d7d7')
  }

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawStones(
  ctx: CanvasRenderingContext2D,
  board: Board,
  lastMove: Move | null,
  winningLine: Move[] | null,
) {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] === 0) continue
      const x = PADDING + col * CELL
      const y = PADDING + row * CELL
      drawStone(ctx, x, y, board[row][col])
    }
  }

  if (lastMove) {
    const x = PADDING + lastMove.col * CELL
    const y = PADDING + lastMove.row * CELL
    ctx.strokeStyle = '#ff4f4f'
    ctx.lineWidth = 2
    ctx.strokeRect(x - 7, y - 7, 14, 14)
  }

  if (winningLine && winningLine.length) {
    ctx.strokeStyle = 'rgba(255, 56, 56, 0.95)'
    ctx.lineWidth = 4
    ctx.beginPath()
    winningLine.forEach((move, index) => {
      const x = PADDING + move.col * CELL
      const y = PADDING + move.row * CELL
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    ctx.fillStyle = 'rgba(255, 56, 56, 0.25)'
    for (const move of winningLine) {
      const x = PADDING + move.col * CELL
      const y = PADDING + move.row * CELL
      ctx.beginPath()
      ctx.arc(x, y, 8.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
