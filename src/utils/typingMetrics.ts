import type { Keystrokes, TypingMetrics } from '../types'
import { commonPrefix, graphemes } from './graphemes'

/** A correct unit is a grapheme that matches the expected grapheme at its position. */
export function countMatches(input: string, expected: string) {
  const actual = graphemes(input.normalize('NFC'))
  const target = graphemes(expected.normalize('NFC'))
  const correct = actual.reduce((sum, unit, i) => sum + Number(unit === target[i]), 0)
  return { typed: actual.length, correct, incorrect: actual.length - correct, target: target.length }
}

/** Correctly completed lexical words (not the five-character speed convention). */
export function completedWords(input: string, expected: string): number {
  const target = graphemes(expected)
  const actual = graphemes(input)
  let count = 0
  // Use Unicode word boundaries where supported; fallback to Unicode-aware lexical spans.
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('en', { granularity: 'word' })
    for (const part of segmenter.segment(expected)) {
      if (!part.isWordLike) continue
      const end = graphemes(expected.slice(0, part.index + part.segment.length)).length
      if (end <= actual.length && target.slice(0, end).every((c, i) => actual[i] === c)) count++
    }
    return count
  }
  const words = expected.matchAll(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’]*/gu)
  for (const part of words) {
    const end = graphemes(expected.slice(0, (part.index ?? 0) + part[0].length)).length
    if (end <= actual.length && target.slice(0, end).every((c, i) => actual[i] === c)) count++
  }
  return count
}

export function calculateMetrics(input: string, expected: string, elapsedMs: number, keys: Keystrokes): TypingMetrics {
  const { typed, correct, incorrect, target } = countMatches(input, expected)
  const minutes = elapsedMs > 0 ? elapsedMs / 60_000 : 0
  const perMinute = (n: number) => (minutes ? n / minutes : 0)
  return {
    wpm: perMinute(correct / 5),
    rawWpm: perMinute(typed / 5),
    cpm: perMinute(typed),
    accuracy: typed ? (100 * correct) / typed : 100,
    keystrokeAccuracy: keys.attempts ? (100 * (keys.attempts - keys.errors)) / keys.attempts : 100,
    correct, incorrect, typed,
    completedWords: completedWords(input, expected),
    standardizedWords: typed / 5,
    progress: target ? Math.min(100, (100 * typed) / target) : 0,
  }
}

/** Account for inserted/replaced graphemes; backspace does not erase past mistakes. */
export function updateKeystrokes(before: string, after: string, expected: string, previous: Keystrokes): Keystrokes {
  const oldChars = graphemes(before)
  const newChars = graphemes(after)
  const expectedChars = graphemes(expected)
  const start = commonPrefix(oldChars, newChars)
  let suffix = 0
  while (suffix < oldChars.length - start && suffix < newChars.length - start && oldChars[oldChars.length - 1 - suffix] === newChars[newChars.length - 1 - suffix]) suffix++
  const stop = newChars.length - suffix
  let errors = 0
  for (let i = start; i < stop; i++) if (newChars[i] !== expectedChars[i]) errors++
  return { attempts: previous.attempts + stop - start, errors: previous.errors + errors }
}
