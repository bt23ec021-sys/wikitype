import type { PassageLength } from '../types'
import { graphemes } from './graphemes'

export const LENGTH_BOUNDS: Record<PassageLength, { min: number; ideal: number; max: number }> = {
  short: { min: 120, ideal: 210, max: 270 },
  medium: { min: 220, ideal: 360, max: 540 },
  long: { min: 430, ideal: 680, max: 950 },
}

export function normalizeExtract(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(/\[[\d,\s–-]+\]/gu, '') // editorial citation artifacts only
    .replace(/[\u200B-\u200D\uFEFF]/gu, '')
    .replace(/\p{Cc}/gu, (ch) => (/[\n\r\t]/u.test(ch) ? ' ' : ''))
    .replace(/\s+/gu, ' ')
    .trim()
}

/** English sentence splitting: Intl.Segmenter is preferred; fallback masks common abbreviations and decimals. */
export function splitSentences(text: string): string[] {
  const source = normalizeExtract(text)
  if (!source) return []
  if (typeof Intl.Segmenter === 'function') {
    const raw = Array.from(new Intl.Segmenter('en', { granularity: 'sentence' }).segment(source), ({ segment }) => segment.trim()).filter(Boolean)
    const merged: string[] = []
    for (const item of raw) {
      // ICU sentence boundaries can separate honorifics such as `Dr.` from the name.
      if (merged.length && /(?:\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e)\.|\b[A-Z]\.)$/iu.test(merged[merged.length - 1]!)) {
        merged[merged.length - 1] += ` ${item}`
      } else merged.push(item)
    }
    return merged
  }
  const marker = '\uE000'
  const masked = source
    .replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e)\./giu, (value) => value.replaceAll('.', marker))
    .replace(/(\d)\.(\d)/gu, `$1${marker}$2`)
    .replace(/\b(?:[A-Z]\.){2,}/gu, (value) => value.replaceAll('.', marker))
  return (masked.match(/[^.!?]+(?:[.!?]+[”"']?|$)/gu) ?? [masked])
    .map((v) => v.replaceAll(marker, '.').trim())
    .filter(Boolean)
}

/** Preserve sentences where possible, and never cut a word merely to fill an exact quota. */
export function selectPassage(extract: string, length: PassageLength): string | null {
  const sentences = splitSentences(extract).filter((s) => /\p{L}/u.test(s) && graphemes(s).length >= 15)
  if (!sentences.length) return null
  const limits = LENGTH_BOUNDS[length]
  let selected = ''
  for (const sentence of sentences) {
    const candidate = selected ? `${selected} ${sentence}` : sentence
    const candidateSize = graphemes(candidate).length
    if (candidateSize > limits.max && selected) break
    if (candidateSize > limits.max) {
      // Single oversized sentence: stop on a complete word with a visible ellipsis.
      const words = sentence.split(/\s+/u)
      let clipped = ''
      for (const word of words) {
        const next = clipped ? `${clipped} ${word}` : word
        if (graphemes(next).length > limits.ideal) break
        clipped = next
      }
      selected = clipped || sentence
      break
    }
    selected = candidate
    if (candidateSize >= limits.ideal) break
  }
  if (graphemes(selected).length < limits.min) return null
  return selected
}
