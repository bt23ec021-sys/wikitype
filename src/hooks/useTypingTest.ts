import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Keystrokes, Passage, Session, Snapshot, TestSettings, TestStatus } from '../types'
import { graphemes } from '../utils/graphemes'
import { calculateMetrics, updateKeystrokes } from '../utils/typingMetrics'

type ExtendPassage = () => Passage | null
const ZERO_KEYS: Keystrokes = { attempts: 0, errors: 0 }

/** Owns the test's monotonic clock, state transitions and immutable result snapshot. */
export function useTypingTest(initial: Passage, settings: TestSettings, extendPassage: ExtendPassage) {
  const [status, setStatus] = useState<TestStatus>('ready')
  const [input, setInput] = useState('')
  const [expected, setExpected] = useState(initial.text)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [keys, setKeys] = useState<Keystrokes>(ZERO_KEYS)
  const [sources, setSources] = useState<Passage[]>([initial])
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [result, setResult] = useState<Session | null>(null)

  const statusRef = useRef<TestStatus>('ready')
  const inputRef = useRef('')
  const expectedRef = useRef(initial.text)
  const keysRef = useRef<Keystrokes>(ZERO_KEYS)
  const clockBase = useRef(0)
  const startedAt = useRef(0)
  const samplesRef = useRef<Snapshot[]>([])
  const lastSample = useRef(0)
  const lastFrameRender = useRef(0)
  const sourcesRef = useRef<Passage[]>([initial])
  const extendRef = useRef(extendPassage)
  extendRef.current = extendPassage

  const durationMs = settings.duration * 1000
  const nowElapsed = useCallback((now = performance.now()) =>
    clockBase.current + (statusRef.current === 'running' ? Math.max(0, now - startedAt.current) : 0), [])

  const sample = useCallback((time: number) => {
    const second = time / 1000
    if (second <= lastSample.current) return
    const metrics = calculateMetrics(inputRef.current, expectedRef.current, time, keysRef.current)
    const point = { second, wpm: metrics.wpm, rawWpm: metrics.rawWpm, accuracy: metrics.accuracy }
    samplesRef.current = [...samplesRef.current, point]
    lastSample.current = second
    setSnapshots(samplesRef.current)
  }, [])

  const finish = useCallback((at?: number) => {
    if (statusRef.current === 'completed') return
    const elapsed = Math.max(0, Math.min(at ?? nowElapsed(), settings.mode === 'time' ? durationMs : Number.POSITIVE_INFINITY))
    clockBase.current = elapsed
    statusRef.current = 'completed'
    setStatus('completed')
    setElapsedMs(elapsed)
    sample(elapsed)
    const metrics = calculateMetrics(inputRef.current, expectedRef.current, elapsed, keysRef.current)
    const source = sourcesRef.current[0]!
    const session: Session = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(), mode: settings.mode,
      ...(settings.mode === 'time' ? { duration: settings.duration } : { length: settings.length }),
      elapsedMs: elapsed, metrics, keystrokes: { ...keysRef.current },
      passage: { id: source.id, title: sourcesRef.current.length > 1 ? `${source.title} + ${sourcesRef.current.length - 1} more` : source.title, source: source.source, url: source.url, adapted: source.adapted },
      snapshots: [...samplesRef.current],
      sources: sourcesRef.current.map((p) => ({ title: p.title, url: p.url, source: p.source })),
    }
    setResult(session)
  }, [durationMs, nowElapsed, sample, settings.duration, settings.length, settings.mode])

  const onChange = useCallback((value: string) => {
    if (statusRef.current === 'completed' || statusRef.current === 'paused') return
    const next = value.normalize('NFC')
    if (statusRef.current === 'ready') {
      if (!next.length) return
      statusRef.current = 'running'
      startedAt.current = performance.now()
      setStatus('running')
    }
    const old = inputRef.current
    inputRef.current = next
    setInput(next)
    const updated = updateKeystrokes(old, next, expectedRef.current, keysRef.current)
    keysRef.current = updated
    setKeys(updated)
    const typedLength = graphemes(next).length
    const requiredLength = graphemes(expectedRef.current).length
    if (typedLength >= requiredLength && requiredLength > 0) {
      if (settings.mode === 'time' && nowElapsed() < durationMs) {
        const followOn = extendRef.current()
        if (followOn) {
          // A single separating space is visibly displayed and included in measured text.
          const extended = `${expectedRef.current} ${followOn.text}`
          expectedRef.current = extended
          sourcesRef.current = [...sourcesRef.current, followOn]
          setExpected(extended)
          setSources(sourcesRef.current)
        } else finish()
      } else finish()
    }
  }, [durationMs, finish, nowElapsed, settings.mode])

  const pause = useCallback(() => {
    if (statusRef.current !== 'running') return
    clockBase.current = nowElapsed()
    statusRef.current = 'paused'
    setStatus('paused')
    setElapsedMs(clockBase.current)
  }, [nowElapsed])

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return
    startedAt.current = performance.now()
    statusRef.current = 'running'
    setStatus('running')
  }, [])

  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === 'hidden') pause() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [pause])

  useEffect(() => {
    if (status !== 'running') return
    let frame = 0
    const tick = () => {
      const t = nowElapsed()
      if (settings.mode === 'time' && t >= durationMs) { finish(durationMs); return }
      if (t - lastFrameRender.current >= 100) { setElapsedMs(t); lastFrameRender.current = t }
      // One measured point per full second; time remains authoritative even when RAF is throttled.
      if (Math.floor(t / 1000) > Math.floor(lastSample.current)) sample(t)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [status, durationMs, finish, nowElapsed, sample, settings.mode])

  const metrics = useMemo(() => calculateMetrics(input, expected, elapsedMs, keys), [input, expected, elapsedMs, keys])
  return { status, input, expected, elapsedMs, sources, metrics, snapshots, result, onChange, pause, resume }
}
