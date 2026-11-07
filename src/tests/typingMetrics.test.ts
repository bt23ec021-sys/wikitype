import { describe, expect, it } from 'vitest'
import { calculateMetrics, countMatches, updateKeystrokes, completedWords } from '../utils/typingMetrics'

const empty = { attempts: 0, errors: 0 }
describe('typing metrics', () => {
  it('calculates 60 WPM for 150 correctly typed characters in 30 seconds', () => {
    const source = 'a'.repeat(150)
    const result = calculateMetrics(source, source, 30_000, { attempts: 150, errors: 0 })
    expect(result.wpm).toBeCloseTo(60)
    expect(result.rawWpm).toBeCloseTo(60)
    expect(result.cpm).toBeCloseTo(300)
    expect(result.accuracy).toBe(100)
    expect(result.progress).toBe(100)
  })
  it('distinguishes raw speed, adjusted speed and accuracy with an error', () => {
    const result = calculateMetrics('hxllo', 'hello', 60_000, { attempts: 5, errors: 1 })
    expect(result.wpm).toBeCloseTo(.8)
    expect(result.rawWpm).toBeCloseTo(1)
    expect(result.correct).toBe(4)
    expect(result.incorrect).toBe(1)
    expect(result.accuracy).toBe(80)
    expect(result.keystrokeAccuracy).toBe(80)
  })
  it('guards zero time and empty text', () => {
    const r = calculateMetrics('', 'hello', 0, empty)
    expect(r.wpm).toBe(0)
    expect(r.rawWpm).toBe(0)
    expect(r.accuracy).toBe(100)
    expect(r.progress).toBe(0)
  })
  it('records a corrected mistake in keystroke accuracy but not current-text accuracy', () => {
    let k = updateKeystrokes('', 'x', 'cat', empty)
    k = updateKeystrokes('x', '', 'cat', k)
    k = updateKeystrokes('', 'c', 'cat', k)
    expect(k).toEqual({ attempts: 2, errors: 1 })
    const r = calculateMetrics('c', 'cat', 1000, k)
    expect(r.accuracy).toBe(100)
    expect(r.keystrokeAccuracy).toBe(50)
  })
  it('counts extra characters as errors and whole Unicode graphemes as single units', () => {
    expect(countMatches('café😀x', 'café😀')).toMatchObject({ typed: 6, correct: 5, incorrect: 1 })
  })
  it('counts actual completed words without confusing them with standardized words', () => {
    expect(completedWords('hello world', 'hello world again')).toBe(2)
    const result = calculateMetrics('hello world', 'hello world again', 60_000, empty)
    expect(result.standardizedWords).toBe(2.2)
  })
  it('does not count a mistake in the middle of a word as a completed correct word', () => {
    expect(completedWords('hallo world', 'hello world')).toBe(0)
  })
})
