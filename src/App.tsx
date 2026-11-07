import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpenText, Github, RefreshCcw, WifiOff } from 'lucide-react'
import type { Passage, Session, TestSettings } from './types'
import { Header, type Page } from './components/Header'
import { ModeControls } from './components/ModeControls'
import { TypingWorkspace } from './components/TypingWorkspace'
import { HistoryView } from './components/HistoryView'
import { AboutView } from './components/AboutView'
import { usePassages } from './hooks/usePassages'
import { useTheme } from './hooks/useTheme'
import { getHistory, getPreferences, savePreferences, saveSession, clearHistory } from './utils/storage'

const initialPreferences = getPreferences()

function App() {
  const [settings, setSettings] = useState<TestSettings>(initialPreferences.settings)
  const { theme, setTheme } = useTheme(initialPreferences.theme)
  const [page, setPage] = useState<Page>('test')
  const [customDraft, setCustomDraft] = useState('')
  const [customActive, setCustomActive] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [history, setHistory] = useState<Session[]>(getHistory)
  const savedIds = useRef(new Set<string>())
  const { passage, loading, warning, load, takePrepared } = usePassages(settings.length)
  useEffect(() => { savePreferences({ settings, theme }) }, [settings, theme])

  const onFinish = useCallback((session: Session) => {
    if (savedIds.current.has(session.id)) return
    savedIds.current.add(session.id)
    setHistory(saveSession(session))
  }, [])
  const restart = useCallback(() => setGeneration((n) => n + 1), [])
  const newPassage = useCallback(() => {
    if (settings.mode === 'custom') setSettings((previous) => ({ ...previous, mode: 'passage' }))
    setCustomActive(false)
    setGeneration((n) => n + 1)
    void load(settings.length)
  }, [load, settings.length, settings.mode])
  const changeSettings = useCallback((next: TestSettings) => {
    const changedLength = next.length !== settings.length
    const changedMode = next.mode !== settings.mode
    setSettings(next)
    setGeneration((n) => n + 1)
    setCustomActive(false)
    if (changedLength && (next.mode !== 'custom' || changedMode)) void load(next.length)
  }, [settings.length, settings.mode, load])
  const customPassage: Passage | null = customActive && customDraft.trim().length >= 30 ? {
    id: `custom-${generation}`, title: 'Your custom passage', text: customDraft.trim().normalize('NFC'), source: 'custom', adapted: false,
  } : null
  const selectedPassage = settings.mode === 'custom' ? customPassage : passage

  return <div className="app-shell">
    <Header page={page} onPage={setPage} theme={theme} onTheme={setTheme}/>
    <main className="container-wide site-main">
      {page === 'history' ? <HistoryView sessions={history} onClear={() => { clearHistory(); setHistory([]) }}/> : page === 'about' ? <AboutView/> : <>
        <div className="hero-heading"><div className="hero-eyebrow"><span className="eyebrow-line"/> THE ENCYCLOPEDIA IS YOUR PLAYGROUND</div><h1>Type something <em>worth reading.</em></h1><p>Build speed and accuracy one Wikipedia discovery at a time.</p></div>
        <ModeControls settings={settings} onChange={changeSettings}/>
        {settings.mode === 'custom' && !customActive ? <div className="panel custom-builder"><label htmlFor="custom-text">Your practice text</label><p>Write or paste at least 30 characters here. It stays in your browser.</p><textarea id="custom-text" rows={6} value={customDraft} onChange={(e) => setCustomDraft(e.currentTarget.value)} placeholder="Paste a paragraph or write something interesting to practice..."/><div className="builder-actions"><span>{customDraft.trim().length} characters · minimum 30</span><button className="btn btn-primary" disabled={customDraft.trim().length < 30} onClick={() => { setCustomActive(true); restart() }}>Start custom test <ArrowRight size={16}/></button></div></div>
          : settings.mode !== 'custom' && loading ? <div className="panel loading-panel" role="status"><div className="loading-spinner"/><h2>Finding your next discovery</h2><p>Picking a readable passage from Wikipedia...</p></div>
          : !selectedPassage ? <div className="panel loading-panel" role="alert"><WifiOff size={27}/><h2>Couldn't find a passage</h2><p>{warning ?? 'An unexpected error occurred.'}</p><button className="btn btn-primary" onClick={newPassage}><RefreshCcw size={16}/> Try again</button></div>
          : <TypingWorkspace key={`${settings.mode}-${generation}-${selectedPassage.id}`} passage={selectedPassage} settings={settings} onExtend={takePrepared} onFinish={onFinish} onRestart={restart} onNew={newPassage} onSettings={() => { setCustomActive(false); restart(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onHistory={() => setPage('history')}/>}
        {settings.mode !== 'custom' && warning && !loading && <p className="offline-alert"><WifiOff size={16}/> {warning} <button onClick={newPassage}>Retry Wikipedia</button></p>}
        <div className="value-row"><div><BookOpenText size={19}/><strong>Actually interesting text.</strong><span>Real knowledge, not random gibberish.</span></div><div><span className="sparkle">✳</span><strong>Made for focus.</strong><span>No accounts, ads, or distractions.</span></div><div><span className="lock-glyph">◇</span><strong>Only yours.</strong><span>Personal stats saved on this device.</span></div></div>
      </>}
    </main>
    <footer className="site-footer"><div className="container-wide footer-inner"><div><span className="footer-brand">WikiType<span className="accent-dot">.</span></span><span>Curious fingers. Faster typing.</span></div><div className="footer-links"><a href="https://github.com/new" target="_blank" rel="noopener noreferrer" title="Create a GitHub repository to publish this project"><Github size={15}/> Source on GitHub (add your URL)</a><a href="https://www.wikipedia.org/" target="_blank" rel="noopener noreferrer">Wikipedia</a><a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA</a></div></div></footer>
  </div>
}
export default App
