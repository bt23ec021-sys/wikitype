import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { TypingWorkspace } from '../components/TypingWorkspace'
import type { Passage, TestSettings } from '../types'

const passage: Passage = { id: 'p', title: 'Practice', text: 'Hello world.', source: 'offline', adapted: false }
const passageSettings: TestSettings = { mode: 'passage', length: 'short', duration: 30 }
const create = (settings = passageSettings) => render(<TypingWorkspace passage={passage} settings={settings} onExtend={() => null} onFinish={vi.fn()} onRestart={vi.fn()} onNew={vi.fn()} onSettings={vi.fn()} onHistory={vi.fn()}/> )
afterEach(() => { cleanup(); vi.useRealTimers() })
describe('test lifecycle', () => {
  it('does not start the clock until first input', () => {
    create()
    expect(screen.getByText('READY WHEN YOU ARE')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: /type the passage/i }), { target: { value: 'H' } })
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument()
  })
  it('offers restart without retaining the previous input in a new session', () => {
    const onRestart = vi.fn()
    const mounted = render(<TypingWorkspace key="first" passage={passage} settings={passageSettings} onExtend={() => null} onFinish={vi.fn()} onRestart={onRestart} onNew={vi.fn()} onSettings={vi.fn()} onHistory={vi.fn()}/> )
    fireEvent.change(screen.getByRole('textbox', { name: /type the passage/i }), { target: { value: 'He' } })
    fireEvent.click(screen.getByRole('button', { name: 'Restart', exact: true }))
    expect(onRestart).toHaveBeenCalledOnce()
    mounted.rerender(<TypingWorkspace key="second" passage={passage} settings={passageSettings} onExtend={() => null} onFinish={vi.fn()} onRestart={onRestart} onNew={vi.fn()} onSettings={vi.fn()} onHistory={vi.fn()}/> )
    expect(screen.getByRole('textbox', { name: /type the passage/i })).toHaveValue('')
  })
  it('completes when passage text is fully entered', () => {
    create()
    fireEvent.change(screen.getByRole('textbox', { name: /type the passage/i }), { target: { value: 'Hello world.' } })
    expect(screen.getByText(/well typed/i)).toBeInTheDocument()
  })
  it('pauses on escape and allows resume', () => {
    create()
    fireEvent.change(screen.getByRole('textbox', { name: /type the passage/i }), { target: { value: 'H' } })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByText('Test paused')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /resume typing/i }))
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument()
  })
  it('finishes on timeout using monotonic time', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date', 'setTimeout', 'clearTimeout'] })
    create({ ...passageSettings, mode: 'time', duration: 15 })
    fireEvent.change(screen.getByRole('textbox', { name: /type the passage/i }), { target: { value: 'H' } })
    act(() => { vi.advanceTimersByTime(15_500) })
    expect(screen.getByText(/well typed/i)).toBeInTheDocument()
  })
})
