export type TestMode = 'time' | 'passage' | 'custom'
export type PassageLength = 'short' | 'medium' | 'long'
export type TestStatus = 'loading' | 'ready' | 'running' | 'paused' | 'completed' | 'error'
export type PassageSource = 'wikipedia' | 'offline' | 'custom'
export type ThemeSetting = 'system' | 'dark' | 'light'

export interface Passage {
  id: string
  title: string
  text: string
  source: PassageSource
  url?: string
  pageId?: number
  adapted: boolean
  license?: string
}
export interface TestSettings {
  mode: TestMode
  duration: 15 | 30 | 60 | 120
  length: PassageLength
}
export interface Keystrokes {
  attempts: number
  errors: number
}
export interface TypingMetrics {
  wpm: number
  rawWpm: number
  cpm: number
  accuracy: number
  keystrokeAccuracy: number
  correct: number
  incorrect: number
  typed: number
  completedWords: number
  standardizedWords: number
  progress: number
}
export interface Snapshot { second: number; wpm: number; rawWpm: number; accuracy: number }
export interface Session {
  id: string
  timestamp: string
  mode: TestMode
  duration?: number
  length?: PassageLength
  elapsedMs: number
  metrics: TypingMetrics
  keystrokes: Keystrokes
  passage: Pick<Passage, 'id' | 'title' | 'source' | 'url' | 'adapted'>
  snapshots: Snapshot[]
  sources?: Array<Pick<Passage, 'title' | 'url' | 'source'>>
}
