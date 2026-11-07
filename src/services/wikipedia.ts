import type { Passage, PassageLength } from '../types'
import { offlinePassage } from '../data/fallbackPassages'
import { selectPassage } from '../utils/textProcessor'

export const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
const FETCH_TIMEOUT_MS = 4500
const MAX_ATTEMPTS = 3
const seen = new Set<number>()
let offlineIndex = 0

interface WikiPage { pageid: number; title: string; extract: string; fullurl?: string; ns: number }
export class WikipediaError extends Error {}
export class WikipediaRateLimitError extends WikipediaError {}
export function wikipediaUrl(): string {
  const params = new URLSearchParams({
    action: 'query', generator: 'random', grnnamespace: '0', grnlimit: '1',
    prop: 'extracts|info', explaintext: '1', exintro: '1', inprop: 'url',
    format: 'json', formatversion: '2', origin: '*',
  })
  return `${WIKIPEDIA_API}?${params.toString()}`
}

export function parseWikipedia(data: unknown, length: PassageLength): Passage | null {
  if (!data || typeof data !== 'object' || !('query' in data)) return null
  const query = (data as { query?: unknown }).query
  if (!query || typeof query !== 'object' || !('pages' in query)) return null
  const pages = (query as { pages: unknown }).pages
  if (!Array.isArray(pages) || pages.length !== 1) return null
  const p = pages[0] as Partial<WikiPage> | undefined
  if (!p || p.ns !== 0 || typeof p.pageid !== 'number' || !Number.isSafeInteger(p.pageid) || p.pageid <= 0 || typeof p.title !== 'string' || typeof p.extract !== 'string') return null
  const text = selectPassage(p.extract, length)
  if (!text || p.title.trim().length === 0) return null
  const canonical = `https://en.wikipedia.org/?curid=${p.pageid}`
  let url = canonical
  if (typeof p.fullurl === 'string') {
    try {
      const parsed = new URL(p.fullurl)
      if (parsed.protocol === 'https:' && parsed.hostname === 'en.wikipedia.org') url = parsed.href
    } catch { /* use canonical article URL */ }
  }
  return { id: `wiki-${p.pageid}-${length}`, pageId: p.pageid, title: p.title.trim(), text,
    source: 'wikipedia', url, adapted: text !== p.extract.trim(), license: 'CC BY-SA 4.0' }
}

function abortError(): DOMException { return new DOMException('Request cancelled', 'AbortError') }
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(abortError()); return }
    const timeout = setTimeout(() => { signal.removeEventListener('abort', aborted); resolve() }, ms)
    const aborted = () => { clearTimeout(timeout); reject(abortError()) }
    signal.addEventListener('abort', aborted, { once: true })
  })
}

/** Fetch a Wikipedia page. No proxy, cookies, API key, or cross-origin private headers. */
export async function fetchWikipediaOnce(length: PassageLength, signal: AbortSignal, fetcher: typeof fetch = fetch): Promise<Passage | null> {
  const controller = new AbortController()
  const onAbort = () => controller.abort()
  signal.addEventListener('abort', onAbort, { once: true })
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    if (signal.aborted) throw abortError()
    const response = await fetcher(wikipediaUrl(), { method: 'GET', mode: 'cors', credentials: 'omit', signal: controller.signal })
    if (response.status === 429) throw new WikipediaRateLimitError('Wikipedia rate limit reached')
    if (!response.ok) throw new WikipediaError(`Wikipedia returned HTTP ${response.status}`)
    const data: unknown = await response.json()
    if (data && typeof data === 'object' && 'error' in data) throw new WikipediaError('Wikipedia reported an API error')
    return parseWikipedia(data, length)
  } catch (cause) {
    if (signal.aborted) throw abortError()
    if (cause instanceof DOMException && cause.name === 'AbortError') throw new WikipediaError('Wikipedia took too long to respond')
    throw cause
  } finally {
    clearTimeout(timeout)
    signal.removeEventListener('abort', onAbort)
  }
}

/** Retry unsuitable articles, avoid duplicates, fall back visibly on transient failures. */
export async function acquirePassage(length: PassageLength, signal: AbortSignal, fetcher: typeof fetch = fetch): Promise<{ passage: Passage; warning?: string }> {
  // Browsers exposing an offline state can fall back immediately rather than waiting for timeouts.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const passage = offlinePassage(length, offlineIndex++)
    return { passage, warning: 'You appear to be offline. Practice with an original offline sample or retry Wikipedia when connected.' }
  }
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (signal.aborted) throw abortError()
    try {
      const passage = await fetchWikipediaOnce(length, signal, fetcher)
      if (passage?.pageId && !seen.has(passage.pageId)) {
        seen.add(passage.pageId)
        if (seen.size > 60) seen.clear()
        return { passage }
      }
    } catch (cause) {
      if (signal.aborted) throw cause
      if (cause instanceof WikipediaRateLimitError) break // Avoid hammering rate-limited Wikimedia APIs.
      // Pause gently between network errors; do not spin on rate limits.
      if (attempt < MAX_ATTEMPTS - 1) await delay(Math.min(450 * (attempt + 1), 1300), signal)
    }
  }
  const passage = offlinePassage(length, offlineIndex++)
  return { passage, warning: 'Wikipedia is unavailable or returned unsuitable text. You can still practice using an original offline sample.' }
}

export function resetSeenForTests(): void { seen.clear() }
