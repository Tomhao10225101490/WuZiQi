import { useEffect, useMemo, useState } from 'react'
import { getBestMove } from './ai/minimax'
import { GamePanel } from './components/GamePanel'
import { GomokuBoard } from './components/GomokuBoard'
import { cloneBoard, createEmptyBoard, placeStone } from './game/board'
import { getGameResult } from './game/rules'
import type { Move, Player } from './game/types'
import './App.css'

function App() {
  const [board, setBoard] = useState(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1)
  const [humanStone] = useState<Player>(1)
  const [difficulty, setDifficulty] = useState(2)
  const [winner, setWinner] = useState<Player | 0>(0)
  const [isDraw, setIsDraw] = useState(false)
  const [history, setHistory] = useState<Move[]>([])
  const [lastMove, setLastMove] = useState<Move | null>(null)

  const aiStone: Player = humanStone === 1 ? 2 : 1
  const gameOver = winner !== 0 || isDraw
  const thinking = !gameOver && currentPlayer === aiStone
  const boardDisabled = gameOver || thinking || currentPlayer !== humanStone

  const safeDepth = useMemo(() => Math.max(1, Math.min(3, difficulty)), [difficulty])

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer(1)
    setWinner(0)
    setIsDraw(false)
    setHistory([])
    setLastMove(null)
  }

  const applyMove = (move: Move, stone: Player) => {
    setBoard((prev) => {
      const next = cloneBoard(prev)
      const ok = placeStone(next, move, stone)
      if (!ok) return prev

      const result = getGameResult(next, move)
      setLastMove(move)
      setHistory((old) => [...old, move])
      setWinner(result.winner)
      setIsDraw(result.isDraw)
      if (!result.gameOver) {
        setCurrentPlayer(stone === 1 ? 2 : 1)
      }
      return next
    })
  }

  const handleHumanMove = (move: Move) => {
    if (boardDisabled || board[move.row][move.col] !== 0) return
    applyMove(move, humanStone)
  }

  const handleUndo = () => {
    if (history.length === 0 || thinking) return
    setBoard((prev) => {
      const next = cloneBoard(prev)
      const toUndo = history.length >= 2 ? history.slice(-2) : history.slice(-1)
      for (const move of toUndo) {
        next[move.row][move.col] = 0
      }
      return next
    })
    setHistory((prev) => {
      const remain = prev.slice(0, Math.max(0, prev.length - (prev.length >= 2 ? 2 : 1)))
      setLastMove(remain.length ? remain[remain.length - 1] : null)
      return remain
    })
    setWinner(0)
    setIsDraw(false)
    setCurrentPlayer(humanStone)
  }

  useEffect(() => {
    if (gameOver || currentPlayer !== aiStone) {
      return
    }

    const timer = window.setTimeout(() => {
      const { move } = getBestMove(board, aiStone, safeDepth)
      if (move) {
        applyMove(move, aiStone)
      }
    }, 220)

    return () => window.clearTimeout(timer)
  }, [aiStone, board, currentPlayer, gameOver, safeDepth])

  return (
    <main className="app-shell">
      <GomokuBoard board={board} lastMove={lastMove} onPlay={handleHumanMove} disabled={boardDisabled} />
      <GamePanel
        currentPlayer={currentPlayer}
        humanStone={humanStone}
        aiStone={aiStone}
        winner={winner}
        isDraw={isDraw}
        thinking={thinking}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onRestart={resetGame}
        onUndo={handleUndo}
      />
    </main>
  )
}

export default App
