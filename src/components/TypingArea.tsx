import { useEffect, useMemo, useRef, useState } from 'react'
import { graphemes } from '../utils/graphemes'
import type { TestStatus } from '../types'

interface Props { expected: string; input: string; status: TestStatus; onChange: (value: string) => void }
export function TypingArea({ expected, input, status, onChange }: Props) {
  const chars = useMemo(() => graphemes(expected), [expected])
  const entered = useMemo(() => graphemes(input), [input])
  const cursor = entered.length
  const current = useRef<HTMLSpanElement | null>(null)
  const control = useRef<HTMLTextAreaElement | null>(null)
  const composing = useRef(false)
  const [compositionDraft, setCompositionDraft] = useState(input)
  useEffect(() => { if (status === 'ready') control.current?.focus({ preventScroll: true }) }, [status])
  useEffect(() => { if (typeof current.current?.scrollIntoView === 'function') current.current.scrollIntoView({ block: 'nearest', inline: 'nearest' }) }, [cursor])

  return <div className={`typing-shell ${status === 'paused' ? 'is-paused' : ''}`}>
    <div className="typing-scroll" aria-hidden="true">
      <div className="typing-characters">
        {chars.map((ch, i) => {
          const state = i >= cursor ? 'untyped' : entered[i] === ch ? 'correct' : 'incorrect'
          return <span key={i} ref={i === cursor ? current : null} className={`char ${state} ${i === cursor ? 'cursor' : ''} ${ch === ' ' && state === 'incorrect' ? 'bad-space' : ''}`}>{ch}</span>
        })}
        {entered.slice(chars.length).map((ch, i) => <span key={`extra-${i}`} className="char incorrect bad-space">{ch}</span>)}
        {cursor === chars.length && <span ref={current} className="char cursor end-cursor"/>}
      </div>
    </div>
    <textarea ref={control} className="typing-capture" aria-label="Type the passage shown on screen" aria-describedby="typing-instructions" value={composing.current ? compositionDraft : input}
      onCompositionStart={() => { composing.current = true; setCompositionDraft(input) }}
      onCompositionEnd={(event) => {
        composing.current = false
        const committed = event.currentTarget.value
        setCompositionDraft(committed)
        onChange(committed)
      }}
      onChange={(event) => {
        const next = event.currentTarget.value
        if (composing.current || (event.nativeEvent as InputEvent).isComposing) setCompositionDraft(next)
        else onChange(next)
      }}
      onPaste={(event) => event.preventDefault()}
      onDrop={(event) => event.preventDefault()}
      onBeforeInput={(event) => { const inputEvent = event.nativeEvent as InputEvent; if (['insertFromPaste', 'insertFromDrop'].includes(inputEvent.inputType)) event.preventDefault() }}
      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} rows={4}
      disabled={status === 'completed' || status === 'paused'} />
    {status === 'ready' && <div className="focus-hint" aria-hidden="true">click here or start typing to begin</div>}
  </div>
}
