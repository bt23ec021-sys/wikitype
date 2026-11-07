import { describe, expect, it } from 'vitest'
import { normalizeExtract, selectPassage, splitSentences } from '../utils/textProcessor'

describe('text processing', () => {
  const paragraph = 'Astronomers observe distant planets with carefully designed instruments. Their measurements reveal patterns that are difficult to notice from Earth. Students often begin by exploring the motion of our own planet. Repeated observations lead to better models and new questions about the universe.'
  it('removes repeated whitespace and citation artifacts', () => {
    expect(normalizeExtract('  Hello  \n world [12]  now.  ')).toBe('Hello world now.')
  })
  it('handles empty input', () => { expect(selectPassage('', 'short')).toBeNull() })
  it('keeps multiple sentences in a usable short passage', () => {
    const text = selectPassage(paragraph, 'short')
    expect(text).toContain('Astronomers')
    expect(text!.length).toBeGreaterThan(100)
  })
  it('rejects too-short articles', () => { expect(selectPassage('Short sentence.', 'short')).toBeNull() })
  it('preserves NFC Unicode text and punctuation', () => {
    expect(normalizeExtract('Cafe\u0301 — déjà vu!')).toBe('Café — déjà vu!')
  })
  it('segments abbreviations and decimal numbers without splitting them into nonsense', () => {
    const split = splitSentences('Dr. Jones measured 3.14 units. It worked. Next came another test.')
    expect(split[0]).toContain('3.14')
    expect(split.length).toBe(3)
  })
  it('selects long passages from multiple sentences', () => {
    const long = Array(12).fill(paragraph).join(' ')
    const selection = selectPassage(long, 'long')
    expect(selection).not.toBeNull()
    expect(selection!.length).toBeGreaterThan(420)
    expect(selection!.length).toBeLessThan(1000)
  })
  it('does not crash with control characters', () => { expect(normalizeExtract('Hi\u0000 there\r\n again')).toBe('Hi there again') })
})
