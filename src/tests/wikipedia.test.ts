import { describe, expect, it, vi, beforeEach } from 'vitest'
import { acquirePassage, fetchWikipediaOnce, parseWikipedia, resetSeenForTests, wikipediaUrl } from '../services/wikipedia'

const body = Array(8).fill('A historical community developed sophisticated systems for sharing information across great distances.').join(' ')
const ok = { query: { pages: [{ pageid: 37, ns: 0, title: 'Example', extract: body, fullurl: 'https://en.wikipedia.org/wiki/Example' }] } }
const response = (data: unknown): Response => ({ ok: true, json: async () => data } as Response)
describe('Wikipedia API', () => {
  beforeEach(() => resetSeenForTests())
  it('forms browser CORS request with the expected parameters', () => {
    const url = new URL(wikipediaUrl())
    expect(url.searchParams.get('origin')).toBe('*')
    expect(url.searchParams.get('generator')).toBe('random')
    expect(url.searchParams.get('explaintext')).toBe('1')
  })
  it('parses canonical URL and article provenance', () => {
    const p = parseWikipedia(ok, 'short')
    expect(p).toMatchObject({ title: 'Example', pageId: 37, source: 'wikipedia' })
    expect(p!.url).toContain('wikipedia.org')
  })
  it('rejects malformed, empty, and wrong-namespace responses', () => {
    expect(parseWikipedia({}, 'short')).toBeNull()
    expect(parseWikipedia({ query: { pages: [] } }, 'short')).toBeNull()
    expect(parseWikipedia({ query: { pages: [{ pageid: 1, ns: 1, title: 'Bad', extract: body }] } }, 'short')).toBeNull()
    expect(parseWikipedia({ query: { pages: [{ pageid: 1, ns: 0, title: 'Bad', extract: '' }] } }, 'short')).toBeNull()
  })
  it('fetches valid response using browser fetch', async () => {
    const mocked = vi.fn(async () => response(ok)) as unknown as typeof fetch
    const p = await fetchWikipediaOnce('short', new AbortController().signal, mocked)
    expect(p?.pageId).toBe(37)
    expect(mocked).toHaveBeenCalledOnce()
  })
  it('surfaces network errors for caller handling', async () => {
    const mocked = vi.fn(async () => { throw new TypeError('Network down') }) as unknown as typeof fetch
    await expect(fetchWikipediaOnce('short', new AbortController().signal, mocked)).rejects.toThrow('Network down')
  })
  it('honors an already-aborted request', async () => {
    const ctrl = new AbortController(); ctrl.abort()
    await expect(fetchWikipediaOnce('short', ctrl.signal, vi.fn() as unknown as typeof fetch)).rejects.toMatchObject({ name: 'AbortError' })
  })
  it('uses explicitly labelled offline samples after retries are exhausted', async () => {
    const mocked = vi.fn(async () => response({ query: { pages: [] } })) as unknown as typeof fetch
    const result = await acquirePassage('short', new AbortController().signal, mocked)
    expect(result.passage.source).toBe('offline')
    expect(result.passage.url).toBeUndefined()
    expect(result.warning).toContain('Wikipedia')
    expect(mocked).toHaveBeenCalledTimes(3)
  })
})
