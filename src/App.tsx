import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [winningLine, setWinningLine] = useState<Move[] | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [aiThinkingInfo, setAiThinkingInfo] = useState('')

  const aiStone: Player = humanStone === 1 ? 2 : 1
  const gameOver = winner !== 0 || isDraw
  const thinking = !gameOver && currentPlayer === aiStone
  const boardDisabled = gameOver || thinking || currentPlayer !== humanStone

  const safeDepth = useMemo(() => Math.max(1, Math.min(3, difficulty)), [difficulty])
  const aiMaxDepth = useMemo(() => [4, 6, 8][safeDepth - 1], [safeDepth])
  const aiTimeBudget = useMemo(() => [1800, 3200, 5000][safeDepth - 1], [safeDepth])

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer(1)
    setWinner(0)
    setIsDraw(false)
    setHistory([])
    setLastMove(null)
    setWinningLine(null)
    setAiThinkingInfo('')
  }

  const playTone = useCallback((freq: number, duration = 0.12) => {
    if (!soundEnabled) return
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = freq
    osc.type = 'triangle'
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
    osc.onended = () => void ctx.close()
  }, [soundEnabled])

  const applyMove = useCallback((move: Move, stone: Player) => {
    setBoard((prev) => {
      const next = cloneBoard(prev)
      const ok = placeStone(next, move, stone)
      if (!ok) return prev

      const result = getGameResult(next, move)
      setLastMove(move)
      setHistory((old) => [...old, move])
      setWinner(result.winner)
      setIsDraw(result.isDraw)
      setWinningLine(result.winningLine)
      playTone(stone === humanStone ? 600 : 450, 0.08)
      if (result.winner === humanStone) {
        playTone(840, 0.18)
      } else if (result.winner !== 0) {
        playTone(220, 0.2)
      }
      if (!result.gameOver) {
        setCurrentPlayer(stone === 1 ? 2 : 1)
      }
      return next
    })
  }, [humanStone, playTone])

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
    setWinningLine(null)
    setAiThinkingInfo('')
    setCurrentPlayer(humanStone)
  }

  useEffect(() => {
    if (gameOver || currentPlayer !== aiStone) {
      return
    }

    const timer = window.setTimeout(() => {
      const { move, depthReached, nodes, timeSpentMs } = getBestMove(
        board,
        aiStone,
        aiMaxDepth,
        aiTimeBudget,
      )
      setAiThinkingInfo(`AI 深度${depthReached} · 节点${nodes} · ${timeSpentMs}ms`)
      if (move) {
        applyMove(move, aiStone)
      }
    }, 220)

    return () => window.clearTimeout(timer)
  }, [aiMaxDepth, aiStone, aiTimeBudget, applyMove, board, currentPlayer, gameOver])

  return (
    <main className="app-shell">
      <GomokuBoard
        board={board}
        lastMove={lastMove}
        winningLine={winningLine}
        onPlay={handleHumanMove}
        disabled={boardDisabled}
      />
      <GamePanel
        currentPlayer={currentPlayer}
        humanStone={humanStone}
        aiStone={aiStone}
        winner={winner}
        isDraw={isDraw}
        thinking={thinking}
        difficulty={difficulty}
        aiThinkingInfo={aiThinkingInfo}
        soundEnabled={soundEnabled}
        onDifficultyChange={setDifficulty}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onRestart={resetGame}
        onUndo={handleUndo}
      />
      {gameOver ? (
        <section className="result-overlay" aria-live="polite">
          <div className="result-card">
            <h2>{isDraw ? '平局' : winner === humanStone ? '胜利' : '失败'}</h2>
            <p>
              {isDraw
                ? '棋逢对手，继续挑战。'
                : winner === humanStone
                  ? '你完成了漂亮的终结。'
                  : 'AI 抓住关键手完成终结。'}
            </p>
            <button type="button" onClick={resetGame}>
              再来一局
            </button>
          </div>
        </section>
      ) : null}
    </main>
  )
}

export default App
