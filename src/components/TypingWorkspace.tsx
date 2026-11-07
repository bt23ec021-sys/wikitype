import { useEffect } from 'react'
import { ArrowRight, Info, Pause, Play, RotateCcw, RefreshCcw, Keyboard } from 'lucide-react'
import type { Passage, Session, TestSettings } from '../types'
import { useTypingTest } from '../hooks/useTypingTest'
import { StatsPanel } from './StatsPanel'
import { TypingArea } from './TypingArea'
import { Attribution } from './Attribution'
import { ResultsView } from './ResultsView'
import { Sparkline } from './Sparkline'

interface Props {
  passage: Passage
  settings: TestSettings
  onExtend: () => Passage | null
  onFinish: (result: Session) => void
  onRestart: () => void
  onNew: () => void
  onSettings: () => void
  onHistory: () => void
}
export function TypingWorkspace({ passage, settings, onExtend, onFinish, onRestart, onNew, onSettings, onHistory }: Props) {
  const test = useTypingTest(passage, settings, onExtend)
  useEffect(() => { if (test.result) onFinish(test.result) }, [test.result, onFinish])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && test.status === 'running') test.pause() }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [test.status, test.pause])
  if (test.result) return <ResultsView session={test.result} onRestart={onRestart} onNew={onNew} onSettings={onSettings} onHistory={onHistory}/>
  return <section className="workspace" aria-label="Typing test">
    <div className="test-surface">
      <div className="test-topline"><span className="status-indicator"><span className={`status-dot ${test.status === 'running' ? 'running' : ''}`}/>{test.status === 'running' ? 'IN PROGRESS' : test.status === 'paused' ? 'PAUSED' : 'READY WHEN YOU ARE'}</span><span className="test-index"><Keyboard size={15}/> {settings.mode === 'time' ? `${settings.duration}-second test` : settings.mode === 'passage' ? `${settings.length} passage` : 'custom practice'}</span></div>
      <StatsPanel metrics={test.metrics} elapsedMs={test.elapsedMs} mode={settings.mode} duration={settings.duration}/>
      <div className="progress-track" aria-label={`${settings.mode === 'time' ? 'Time' : 'Passage'} progress`} role="progressbar" aria-valuenow={Math.round(settings.mode === 'time' ? (test.elapsedMs / (settings.duration * 1000)) * 100 : test.metrics.progress)} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${settings.mode === 'time' ? Math.min(100, 100 * test.elapsedMs / (settings.duration * 1000)) : test.metrics.progress}%` }}/></div>
      <div className="typing-area-heading"><span>THE PASSAGE</span><span>{test.metrics.correct} correct · {test.metrics.incorrect} errors · {test.metrics.completedWords} words</span></div>
      <TypingArea input={test.input} expected={test.expected} status={test.status} onChange={test.onChange}/>
      {test.status === 'paused' && <div className="pause-overlay" role="status"><strong>Test paused</strong><p>Time stopped because you switched tabs or pressed Escape.</p><button className="btn btn-primary" onClick={test.resume}><Play size={15}/> Resume typing</button></div>}
      <div className="workspace-actions"><div className="left-actions"><button className="btn btn-primary" onClick={onRestart}><RotateCcw size={17}/> Restart</button><button className="btn btn-secondary" onClick={onNew}><RefreshCcw size={16}/> New article</button>{test.status === 'running' && <button className="icon-button" onClick={test.pause} title="Pause test" aria-label="Pause test"><Pause size={17}/></button>}</div><span className="utility-hint"><Info size={15}/> Tap the passage to type</span></div>
    </div>
    <Attribution sources={test.sources}/>
    <div className="under-test"><span><kbd>Esc</kbd> pause &nbsp;·&nbsp; <kbd>Tab</kbd> navigate &nbsp;·&nbsp; <kbd>Enter</kbd> activate buttons</span><span>Focus on progress, not perfection <ArrowRight size={14}/></span></div>
    {test.snapshots.length >= 2 && <div className="live-chart panel"><div className="section-heading"><h3>Live speed</h3><span>Measured WPM over time</span></div><Sparkline points={test.snapshots} height={110}/></div>}
    <p className="sr-only" id="typing-instructions">Reproduce the visible passage by typing in the text field. Pasting is disabled. For screen reader access, the current passage is: {test.expected}</p>
  </section>
}
