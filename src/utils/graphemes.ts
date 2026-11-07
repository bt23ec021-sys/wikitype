/** Grapheme clusters, rather than JS code units, drive cursor positions and scoring. */
export function graphemes(value: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value), (x) => x.segment)
  }
  // Older browsers: code-point fallback; a combined emoji may occupy multiple positions.
  return Array.from(value)
}

export function commonPrefix(a: string[], b: string[]): number {
  let i = 0
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++
  return i
}
