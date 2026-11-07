# Feature Guide

## Modes

**Timed:** Choose 15, 30, 60, or 120 seconds. The first typed character starts the countdown. A prepared follow-on excerpt is appended if you reach the end early; if it is not ready, the exercise finishes. A timer never runs during a network request. The countdown stops when the test is paused by Escape or tab visibility loss, and resumes only when you press Resume.

**Passage:** Choose short (~150–250 graphemes), medium (~250–500), or long (~500–900), subject to available sentence boundaries. The test finishes when the text length is reached. Elapsed time is shown instead of a deadline.

**Custom:** Enter or paste at least 30 characters into the _setup field_, then start. The custom text never goes to Wikipedia or any application server. This mode is completion-based, so length is your text rather than the passage-length selection.

## Controls and feedback

- Use a physical or mobile keyboard in the typing area, or tap/click it to focus.
- Untyped text is subtle, correct text is green, incorrect text is red and underlined, and the current position shows a cursor. Wrong spaces have a visible background.
- Backspace and text selection/replacement follow native textarea behavior; visual output is a derived representation.
- Paste/drop are disabled _during_ the measured exercise. Paste is allowed when authoring custom practice text.
- Restart creates a new exercise with the **same** passage. New article requests a replacement Wikipedia excerpt (and exits custom mode). Changing mode or duration resets the active test.
- Escape pauses a running test. Tab follows ordinary focus navigation. Enter activates a focused button. No global letter-key interception is used.
- The remaining-time indicator applies only to timed mode; passage/custom mode displays elapsed time.
- Source information displays the original title, article link, CC BY-SA attribution, and excerpt-shortening notice. Offline mode is marked explicitly with its separate CC0 license.

## Results and history

Final sessions include corrected speed, raw speed, accuracy, CPM, correct/incorrect counts, standardized five-character units, actual completed words, elapsed time, and passage progress. The SVG chart plots real measured samples. Sessions are saved locally (up to the last 100). History offers speed trend, personal best, average WPM, average current-text accuracy, total practice time and a deletion confirmation.

## Themes and accessibility

Light/dark/system theme selector follows `matchMedia` for system changes and persists the chosen setting. Form controls have labels and focus states; text errors are underlined as well as colored; live character echoes are not announced individually. Reduced-motion settings suppress cursors/animation. Layout adapts from phones to wide screens.

## Limitations

A small Wikipedia excerpt may be rejected repeatedly; this can increase load latency or result in the original offline sample. Keyboard autocorrect or voice input that replaces characters is treated as an actual text replacement. In browsers lacking `Intl.Segmenter`, combined emoji segmentation is imperfect. A browser may not support durable localStorage; tests work but history cannot persist. There is no cross-device sync or public ranking. Keyboard shortcuts deliberately avoid interfering with browser and assistive-technology navigation.
