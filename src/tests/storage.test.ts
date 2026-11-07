import { beforeEach, describe, expect, it } from 'vitest'
import { clearHistory, getHistory, getPreferences, savePreferences, saveSession } from '../utils/storage'
import { calculateMetrics } from '../utils/typingMetrics'
import type { Session } from '../types'

const session: Session = {
  id: '1', timestamp: '2026-11-01T10:00:00.000Z', mode: 'passage', length: 'short', elapsedMs: 30000,
  passage: { id: 'a', title: 'Example', source: 'wikipedia', adapted: true },
  metrics: calculateMetrics('hello', 'hello', 30000, { attempts: 5, errors: 0 }), keystrokes: { attempts: 5, errors: 0 }, snapshots: [],
}
describe('storage', () => {
  beforeEach(() => localStorage.clear())
  it('persists and retrieves versioned history', () => {
    saveSession(session)
    expect(getHistory()).toHaveLength(1)
    expect(getHistory()[0]?.id).toBe('1')
    clearHistory()
    expect(getHistory()).toHaveLength(0)
  })
  it('recovers from corrupted JSON and mismatched versions', () => {
    localStorage.setItem('wikitype:v1:history', '{bad json')
    expect(getHistory()).toEqual([])
    localStorage.setItem('wikitype:v1:history', JSON.stringify({ version: 2, sessions: [session] }))
    expect(getHistory()).toEqual([])
  })
  it('persists theme and settings', () => {
    savePreferences({ settings: { mode: 'time', duration: 60, length: 'medium' }, theme: 'dark' })
    expect(getPreferences().theme).toBe('dark')
    expect(getPreferences().settings.duration).toBe(60)
  })
})
