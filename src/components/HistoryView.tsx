import { useState } from 'react'
import { Trash2, TrendingUp, Clock3, Award, Target } from 'lucide-react'
import type { Session } from '../types'
import { whole, oneDecimal, formatTime } from '../utils/formatters'

interface Props { sessions: Session[]; onClear: () => void }
export function HistoryView({ sessions, onClear }: Props) {
  const [confirm, setConfirm] = useState(false)
  const avg = (pick: (s: Session) => number) => sessions.length ? sessions.reduce((sum, s) => sum + pick(s), 0) / sessions.length : 0
  const best = sessions.reduce((max, s) => Math.max(max, s.metrics.wpm), 0)
  const ascending = [...sessions].reverse()
  const latest = ascending.slice(-25)
  const maxWpm = Math.max(10, ...latest.map((s) => s.metrics.wpm))
  return <section className="content-page" aria-labelledby="history-title">
    <div className="page-lead"><span className="eyebrow">YOUR JOURNEY</span><h1 id="history-title">Progress, not perfection<span className="accent-dot">.</span></h1><p>Your typing journey stays private and lives in this browser.</p></div>
    <div className="history-stats">
      {[[<Award size={17}/>, 'PERSONAL BEST', `${whole(best)} WPM`], [<TrendingUp size={17}/>, 'AVERAGE SPEED', `${whole(avg((s) => s.metrics.wpm))} WPM`], [<Target size={17}/>, 'AVERAGE ACCURACY', `${oneDecimal(avg((s) => s.metrics.accuracy))}%`], [<Clock3 size={17}/>, 'PRACTICE TIME', formatTime(sessions.reduce((sum, s) => sum + s.elapsedMs, 0))]] .map(([icon, label, value], i) => <div className="panel history-stat" key={i}><div className="history-icon">{icon}</div><span className="stat-label">{label}</span><strong>{value}</strong></div>)}
    </div>
    <div className="panel history-panel"><div className="section-heading"><h2>Speed progression</h2><span>{sessions.length} completed test{sessions.length === 1 ? '' : 's'}</span></div>
      {latest.length ? <div className="history-bars" role="img" aria-label={`Last ${latest.length} typing tests in chronological order, speeds from ${Math.round(Math.min(...latest.map((s) => s.metrics.wpm)))} to ${Math.round(maxWpm)} WPM`}>
        {latest.map((s) => <div className="history-bar-wrapper" key={s.id} title={`${new Date(s.timestamp).toLocaleDateString()}: ${whole(s.metrics.wpm)} WPM`}><div className="history-bar" style={{ height: `${Math.max(3, (s.metrics.wpm / maxWpm) * 100)}%` }}/></div>)}
      </div> : <p className="empty-state">Your progress chart will appear after your first finished test.</p>}
    </div>
    <div className="panel history-panel"><div className="section-heading"><h2>Recent sessions</h2>{sessions.length > 0 && <button className="text-button danger" onClick={() => setConfirm(true)}><Trash2 size={15}/> Clear history</button>}</div>
      {sessions.length ? <div className="table-scroll"><table className="history-table"><thead><tr><th>Date</th><th>Mode</th><th>WPM</th><th>Accuracy</th><th>Time</th><th>Source</th></tr></thead><tbody>{sessions.slice(0, 20).map((s) => <tr key={s.id}><td>{new Date(s.timestamp).toLocaleDateString()}</td><td className="capitalize">{s.mode}</td><td className="table-score">{whole(s.metrics.wpm)}</td><td>{oneDecimal(s.metrics.accuracy)}%</td><td>{formatTime(s.elapsedMs)}</td><td title={s.passage.title} className="table-ellipsis">{s.passage.title}</td></tr>)}</tbody></table></div> : <p className="empty-state">No sessions yet. Finish a typing test to start tracking your progress.</p>}
    </div>
    {confirm && <div className="modal-backdrop" role="presentation"><div className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc"><h3 id="confirm-title">Clear all local history?</h3><p id="confirm-desc">This permanently removes your saved sessions from this browser. It cannot be undone.</p><div className="confirm-actions"><button className="btn btn-secondary" onClick={() => setConfirm(false)}>Cancel</button><button className="btn btn-danger" onClick={() => { onClear(); setConfirm(false) }}>Delete sessions</button></div></div></div>}
  </section>
}
