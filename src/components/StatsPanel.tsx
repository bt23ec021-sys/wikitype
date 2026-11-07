import type { TestMode, TypingMetrics } from '../types'
import { formatTime, whole } from '../utils/formatters'

interface Props { metrics: TypingMetrics; elapsedMs: number; mode: TestMode; duration: number }
export function StatsPanel({ metrics, elapsedMs, mode, duration }: Props) {
  const remaining = Math.max(0, duration * 1000 - elapsedMs)
  return (
    <div className="live-stats" aria-label="Live typing statistics">
      <div className="stat-primary"><span className="stat-label">WPM</span><strong>{whole(metrics.wpm)}</strong></div>
      <div className="stat-divider"/>
      <div className="stat-secondary"><span className="stat-label">ACCURACY</span><strong>{whole(metrics.accuracy)}<small>%</small></strong></div>
      <div className="stat-secondary hide-tiny"><span className="stat-label">RAW WPM</span><strong>{whole(metrics.rawWpm)}</strong></div>
      <div className="stat-secondary hide-mobile"><span className="stat-label">CPM</span><strong>{whole(metrics.cpm)}</strong></div>
      <div className="stat-secondary"><span className="stat-label">{mode === 'time' ? 'REMAINING' : 'ELAPSED'}</span><strong className="clock-text">{formatTime(mode === 'time' ? remaining : elapsedMs)}</strong></div>
    </div>
  )
}
