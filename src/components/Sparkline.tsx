import type { Snapshot } from '../types'

interface Props { points: Snapshot[]; value?: 'wpm' | 'rawWpm'; height?: number; title?: string }
export function Sparkline({ points, value = 'wpm', height = 160, title = 'Typing speed over time' }: Props) {
  const width = 600
  const padding = 28
  const values = points.map((p) => p[value])
  const top = Math.max(10, ...values) * 1.15
  const end = Math.max(1, ...points.map((p) => p.second))
  const project = (p: Snapshot) => ({
    x: padding + (p.second / end) * (width - padding * 2),
    y: height - padding - (p[value] / top) * (height - padding * 2),
  })
  const path = points.map((p, i) => { const { x, y } = project(p); return `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}` }).join(' ')
  return (
    <div className="chart-shell" role="img" aria-label={`${title}. ${points.length ? `Final ${value}: ${Math.round(points[points.length - 1]![value])}.` : 'No readings yet.'}`}>
      {points.length < 2 ? <div className="empty-chart">Speed chart appears as you type.</div> :
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" aria-hidden="true">
        {[0.25, 0.5, 0.75].map((n) => <line key={n} x1={padding} x2={width - padding} y1={height - padding - n * (height - padding * 2)} y2={height - padding - n * (height - padding * 2)} className="chart-grid" />)}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, index) => { const { x, y } = project(p); return <circle key={index} cx={x} cy={y} r="3" fill="var(--accent)" /> })}
        <text x={padding} y={height - 7} fill="var(--muted)" fontSize="11">0s</text>
        <text x={width - padding} y={height - 7} fill="var(--muted)" fontSize="11" textAnchor="end">{Math.round(end)}s</text>
      </svg>}
    </div>
  )
}
