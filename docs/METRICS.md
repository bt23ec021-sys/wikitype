# Typing Metrics — Exact Definitions

Elapsed time is measured with `performance.now()` from the first nonempty text change, excluding explicit pauses and periods when the tab is hidden. For a timed test, a completion at the deadline is clamped to the target duration. A minute is exactly 60,000 milliseconds; the formulas accept fractional milliseconds.

All character counts use Unicode **grapheme clusters**, not JavaScript UTF-16 code units. NFC normalization is applied to input. `Intl.Segmenter` is used when available; old browsers fall back to Unicode code points.

Define:

- `T`: current number of entered graphemes (deletions remove characters from this count).
- `C`: positions in current entered text that exactly match their expected grapheme.
- `I = T - C`: currently incorrect or extra graphemes.
- `M = elapsedMs / 60000`: active elapsed minutes.
- `K`: total graphemes inserted across all edits, including characters that were later deleted.
- `E`: inserted graphemes that did not match the target at their position, including corrected errors.
- `L`: passage grapheme length.

| Metric                              | Formula                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Adjusted WPM (primary)**          | `(C / 5) / M`                                                                                                                  |
| **Raw WPM**                         | `(T / 5) / M`                                                                                                                  |
| **CPM**                             | `T / M`                                                                                                                        |
| **Current-text accuracy (primary)** | `100 × C / T`                                                                                                                  |
| **Keystroke accuracy**              | `100 × (K − E) / K`                                                                                                            |
| **Correct characters**              | `C`                                                                                                                            |
| **Incorrect characters**            | `I`                                                                                                                            |
| **Total typed characters**          | `T`                                                                                                                            |
| **Standardized words**              | `T / 5` (may be fractional)                                                                                                    |
| **Passage progress**                | `min(100, 100 × T / L)`                                                                                                        |
| **Actual completed words**          | Count lexical word spans completely covered and correct in current text. Uses `Intl.Segmenter` word mode and Unicode fallback. |
| **Remaining time**                  | `max(0, configuredDurationMs − elapsedMs)` for timed tests                                                                     |

If `M = 0`, all rate metrics are 0 (never NaN or Infinity). If `T = 0`, current-text accuracy is 100% (no active errors); if `K = 0`, keystroke accuracy is also 100% by convention. Errors are positional: a wrong character is not forgiven just because it resembles a character elsewhere in the passage. Extra characters are incorrect. Missing expected characters beyond the current cursor affect **progress**, not accuracy, until typed.

## Worked example 1: fluent typing

A user types 150 correct graphemes in 30 seconds: `M = 0.5`, `T = C = 150`, `I = 0`. WPM = raw WPM = `(150 / 5) / 0.5 = 60`, CPM = `150 / 0.5 = 300`, current-text accuracy = 100%.

## Worked example 2: an uncorrected error

Expected `hello`, entered `hxllo` in 60 seconds: `T=5, C=4, I=1, M=1`. Adjusted WPM = 0.8, raw WPM = 1.0, CPM = 5, current-text accuracy = 80%.

## Worked example 3: corrected mistake

Expected `cat`. User types `x`, deletes it, and types `c`. Now `T=1`, `C=1`, `I=0`. Current-text accuracy = **100%**. However, two graphemes were inserted and one was wrong, so `K=2`, `E=1`, and keystroke accuracy is **50%**. This distinction is deliberate and displayed in results.

## Graphing

The test stores timestamped samples approximately once per elapsed active second using measured `performance.now()` and current content, plus a final completion sample. Samples are not interpolated or invented; browser throttling can cause gaps. History shows saved session summaries. WPM is based on the **currently present text** (not cumulative past typing) so backspace may lower raw WPM during the test. This policy is documented to prevent a misleading sense of speed.
