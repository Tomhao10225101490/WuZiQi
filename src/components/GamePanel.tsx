import type { Player, Winner } from '../game/types'

interface GamePanelProps {
  currentPlayer: Player
  humanStone: Player
  aiStone: Player
  winner: Winner
  isDraw: boolean
  thinking: boolean
  difficulty: number
  onDifficultyChange: (next: number) => void
  onRestart: () => void
  onUndo: () => void
}

export function GamePanel({
  currentPlayer,
  humanStone,
  aiStone,
  winner,
  isDraw,
  thinking,
  difficulty,
  onDifficultyChange,
  onRestart,
  onUndo,
}: GamePanelProps) {
  const status = winner
    ? winner === humanStone
      ? '你赢了，漂亮！'
      : 'AI 获胜，再来一局。'
    : isDraw
      ? '平局，棋逢对手。'
      : thinking
        ? 'AI 正在思考...'
        : currentPlayer === humanStone
          ? '轮到你下子'
          : '轮到 AI'

  return (
    <section className="game-panel">
      <h1>五子棋 · 人机对战</h1>
      <p className="subtitle">高清棋盘，策略博弈，灵动反馈</p>
      <div className="status">{status}</div>

      <div className="meta-grid">
        <span>你执子：{humanStone === 1 ? '黑棋' : '白棋'}</span>
        <span>AI 执子：{aiStone === 1 ? '黑棋' : '白棋'}</span>
      </div>

      <label htmlFor="difficulty" className="difficulty-label">
        AI 深度：{difficulty}
      </label>
      <input
        id="difficulty"
        type="range"
        min={1}
        max={3}
        step={1}
        value={difficulty}
        onChange={(event) => onDifficultyChange(Number(event.target.value))}
      />

      <div className="actions">
        <button type="button" onClick={onUndo}>
          悔棋
        </button>
        <button type="button" onClick={onRestart}>
          重新开始
        </button>
      </div>
    </section>
  )
}
