import { useCallback, useEffect, useRef, useState } from 'react'
import type { Passage, PassageLength } from '../types'
import { acquirePassage } from '../services/wikipedia'

export function usePassages(length: PassageLength) {
  const [passage, setPassage] = useState<Passage | null>(null)
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState<string | null>(null)
  const active = useRef<AbortController | null>(null)
  const prefetchController = useRef<AbortController | null>(null)
  const prepared = useRef<Passage | null>(null)
  const requestId = useRef(0)
  const prefetching = useRef(false)

  const prefetch = useCallback((size: PassageLength) => {
    if (prepared.current || prefetching.current) return
    prefetching.current = true
    const ctrl = new AbortController()
    prefetchController.current = ctrl
    void acquirePassage(size, ctrl.signal)
      .then(({ passage: next }) => { if (!ctrl.signal.aborted) prepared.current = next })
      .catch(() => { /* no next passage; current timed test ends when exhausted */ })
      .finally(() => { prefetching.current = false })
  }, [])

  const load = useCallback(async (size: PassageLength) => {
    active.current?.abort()
    prefetchController.current?.abort()
    prefetching.current = false
    prepared.current = null
    const ctrl = new AbortController()
    active.current = ctrl
    const serial = ++requestId.current
    setLoading(true)
    setWarning(null)
    try {
      const result = await acquirePassage(size, ctrl.signal)
      if (ctrl.signal.aborted || serial !== requestId.current) return
      setPassage(result.passage)
      setWarning(result.warning ?? null)
      setLoading(false)
      prefetch(size)
    } catch (error) {
      if (ctrl.signal.aborted || serial !== requestId.current) return
      setWarning(error instanceof Error ? error.message : 'Could not load passage')
      setLoading(false)
    }
  }, [prefetch])

  useEffect(() => {
    void load(length)
    return () => {
      active.current?.abort()
      prefetchController.current?.abort()
      requestId.current++
    }
    // Deliberately load on mount; changing mode/length is handled by explicit App handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const takePrepared = useCallback((): Passage | null => {
    const next = prepared.current
    if (next) {
      prepared.current = null
      prefetch(length)
    }
    return next
  }, [length, prefetch])

  return { passage, loading, warning, load, takePrepared }
}
