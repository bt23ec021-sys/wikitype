import { ArrowRight, RotateCcw, SlidersHorizontal, History, Trophy } from 'lucide-react'
import type { Session } from '../types'
import { whole, oneDecimal, formatTime } from '../utils/formatters'
import { Sparkline } from './Sparkline'

interface Props { session: Session; onRestart: () => void; onNew: () => void; onSettings: () => void; onHistory: () => void }
export function ResultsView({ session, onRestart, onNew, onSettings, onHistory }: Props) {
  const { metrics: m } = session
  return <section className="results-view" aria-labelledby="result-title">
    <div className="result-intro"><span className="pill"><Trophy size={14}/> SESSION COMPLETE</span><h2 id="result-title">Well typed<span className="accent-dot">.</span></h2><p>Here's how your practice went.</p></div>
    <div className="result-featured">
      <div><span className="stat-label">ADJUSTED SPEED</span><div className="hero-score">{whole(m.wpm)} <small>WPM</small></div></div>
      <div className="result-main-metrics"><div><span className="stat-label">RAW SPEED</span><strong>{whole(m.rawWpm)} <small>WPM</small></strong></div><div><span className="stat-label">ACCURACY</span><strong>{oneDecimal(m.accuracy)}<small>%</small></strong></div><div><span className="stat-label">TIME</span><strong>{formatTime(session.elapsedMs)}</strong></div></div>
    </div>
    <div className="panel chart-panel"><div className="section-heading"><h3>Speed over time</h3><span>Measured performance · WPM</span></div><Sparkline points={session.snapshots} /></div>
    <div className="panel detail-panel"><div className="section-heading"><h3>Session breakdown</h3><span>{new Date(session.timestamp).toLocaleString()}</span></div>
      <dl className="detail-grid">
        {[
          ['Characters per min', whole(m.cpm)], ['Correct characters', String(m.correct)], ['Incorrect characters', String(m.incorrect)],
          ['Total typed', String(m.typed)], ['5-character words', oneDecimal(m.standardizedWords)],
          ['Completed actual words', String(m.completedWords)], ['Keystroke accuracy', `${oneDecimal(m.keystrokeAccuracy)}%`],
          ['Passage progress', `${oneDecimal(m.progress)}%`], ['Total key attempts', String(session.keystrokes.attempts)],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      <p className="result-source">Source: {session.passage.title} · {session.passage.source === 'wikipedia' ? 'Wikipedia' : session.passage.source === 'offline' ? 'Offline sample' : 'Custom text'} {session.passage.url && <a href={session.passage.url} target="_blank" rel="noopener noreferrer">Read original ↗</a>}</p>
      {session.sources && session.sources.length > 1 && <div className="result-more-sources"><strong>Additional passages:</strong> {session.sources.slice(1).map((p, i) => p.url ? <a key={i} href={p.url} target="_blank" rel="noopener noreferrer">{p.title}</a> : <span key={i}>{p.title}</span>)}</div>}
    </div>
    <div className="result-actions"><button className="btn btn-primary" onClick={onRestart}><RotateCcw size={17}/> Restart same passage</button><button className="btn btn-secondary" onClick={onNew}>New Wikipedia article <ArrowRight size={16}/></button><button className="btn btn-ghost" onClick={onSettings}><SlidersHorizontal size={16}/> Settings</button><button className="btn btn-ghost" onClick={onHistory}><History size={16}/> History</button></div>
  </section>
}
