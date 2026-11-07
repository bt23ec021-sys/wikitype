import { ArrowUpRight, BookOpen, WifiOff, PenLine } from 'lucide-react'
import type { Passage } from '../types'

export function Attribution({ sources }: { sources: Passage[] }) {
  const first = sources[0]
  if (!first) return null
  return <><div className="source-note">
    <span className="source-icon">{first.source === 'wikipedia' ? <BookOpen size={18}/> : first.source === 'offline' ? <WifiOff size={18}/> : <PenLine size={18}/>}</span>
    <div className="source-copy"><span className="source-eyebrow">{first.source === 'wikipedia' ? 'FROM THE FREE ENCYCLOPEDIA' : first.source === 'offline' ? 'OFFLINE PRACTICE SAMPLE' : 'YOUR OWN WRITING'}</span>
      <strong>{first.title}{sources.length > 1 ? ` + ${sources.length - 1} more` : ''}</strong>
      <small>{first.source === 'wikipedia' ? <>Wikipedia contributors · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>{first.adapted ? ' · shortened for practice' : ''}</> : first.source === 'offline' ? 'Original WikiType copy · CC0 · not from Wikipedia' : 'Stored only during this practice session'}</small>
    </div>
    {first.url && <a className="source-link" href={first.url} target="_blank" rel="noopener noreferrer">Read original <ArrowUpRight size={15}/></a>}
  </div>
  {sources.length > 1 && <div className="additional-sources"><strong>Also in this test:</strong>{sources.slice(1).map((p) => p.url ? <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">{p.title} ↗</a> : <span key={p.id}>{p.title} ({p.source})</span>)}</div>}
  </>
}
