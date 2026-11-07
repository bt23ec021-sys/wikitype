import type { Session, TestSettings, ThemeSetting } from '../types'

const PREFIX = 'wikitype:v1:'
const HISTORY_KEY = `${PREFIX}history`
const PREFERENCES_KEY = `${PREFIX}preferences`
export const DEFAULT_SETTINGS: TestSettings = { mode: 'time', duration: 30, length: 'medium' }
export interface Preferences { settings: TestSettings; theme: ThemeSetting }
export const DEFAULT_PREFERENCES: Preferences = { settings: DEFAULT_SETTINGS, theme: 'system' }

export function safelyRead(key: string): unknown {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as unknown : null } catch { return null }
}
export function safelyWrite(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
}
function validSettings(s: unknown): s is TestSettings {
  if (!s || typeof s !== 'object') return false
  const x = s as Partial<TestSettings>
  return ['time', 'passage', 'custom'].includes(x.mode ?? '') && [15, 30, 60, 120].includes(x.duration ?? 0) && ['short', 'medium', 'long'].includes(x.length ?? '')
}
export function getPreferences(): Preferences {
  const x = safelyRead(PREFERENCES_KEY)
  if (x && typeof x === 'object' && 'settings' in x && 'theme' in x) {
    const p = x as Partial<Preferences>
    if (validSettings(p.settings) && ['dark', 'light', 'system'].includes(p.theme ?? '')) return { settings: p.settings, theme: p.theme! }
  }
  return DEFAULT_PREFERENCES
}
export function savePreferences(p: Preferences): void { safelyWrite(PREFERENCES_KEY, p) }

function validSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false
  const x = value as Partial<Session>
  return typeof x.id === 'string' && typeof x.timestamp === 'string' && ['time', 'passage', 'custom'].includes(x.mode ?? '') &&
    typeof x.elapsedMs === 'number' && Number.isFinite(x.elapsedMs) && x.elapsedMs >= 0 &&
    !!x.metrics && typeof x.metrics.wpm === 'number' && Number.isFinite(x.metrics.wpm) &&
    typeof x.metrics.accuracy === 'number' && !!x.passage && typeof x.passage.title === 'string' && Array.isArray(x.snapshots)
}
export function getHistory(): Session[] {
  const payload = safelyRead(HISTORY_KEY)
  if (!payload || typeof payload !== 'object' || !('version' in payload) || !('sessions' in payload)) return []
  const data = payload as { version?: unknown; sessions?: unknown }
  if (data.version !== 1 || !Array.isArray(data.sessions)) return []
  return data.sessions.filter(validSession).slice(0, 100)
}
export function saveSession(session: Session): Session[] {
  const sessions = [session, ...getHistory().filter((item) => item.id !== session.id)].slice(0, 100)
  safelyWrite(HISTORY_KEY, { version: 1, sessions })
  return sessions
}
export function clearHistory(): void {
  try { localStorage.removeItem(HISTORY_KEY) } catch { /* storage disabled */ }
}
