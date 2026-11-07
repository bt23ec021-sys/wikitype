import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ModeControls } from '../components/ModeControls'

describe('configuration controls', () => {
  it('updates timed duration without mutating the original settings', () => {
    const settings = { mode: 'time' as const, duration: 30 as const, length: 'medium' as const }
    const onChange = vi.fn()
    render(<ModeControls settings={settings} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '60s' }))
    expect(onChange).toHaveBeenCalledWith({ ...settings, duration: 60 })
    expect(settings.duration).toBe(30)
  })
  it('exposes passage length options when selected', () => {
    const onChange = vi.fn()
    render(<ModeControls settings={{ mode: 'passage', duration: 30, length: 'medium' }} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'long' }))
    expect(onChange).toHaveBeenCalledWith({ mode: 'passage', duration: 30, length: 'long' })
  })
})
