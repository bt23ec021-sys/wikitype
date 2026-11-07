import type { PassageLength, TestMode, TestSettings } from '../types'

interface Props { settings: TestSettings; onChange: (settings: TestSettings) => void }
export function ModeControls({ settings, onChange }: Props) {
  const choose = (mode: TestMode) => onChange({ ...settings, mode })
  return (
    <div className="controls-wrap" aria-label="Test configuration">
      <div className="segmented" role="group" aria-label="Typing test mode">
        {([['time', 'Timed'], ['passage', 'Passage'], ['custom', 'Custom']] as const).map(([mode, label]) =>
          <button key={mode} aria-pressed={settings.mode === mode} className={settings.mode === mode ? 'selected' : ''} onClick={() => choose(mode)}>{label}</button>)}
      </div>
      {settings.mode === 'time' && <div className="option-row" role="group" aria-label="Test duration">
        {([15, 30, 60, 120] as const).map((duration) => <button key={duration} aria-pressed={settings.duration === duration} className={settings.duration === duration ? 'active' : ''} onClick={() => onChange({ ...settings, duration })}>{duration}s</button>)}
      </div>}
      {settings.mode === 'passage' && <div className="option-row" role="group" aria-label="Passage length">
        {(['short', 'medium', 'long'] as PassageLength[]).map((length) => <button key={length} aria-pressed={settings.length === length} className={settings.length === length ? 'active' : ''} onClick={() => onChange({ ...settings, length })}>{length}</button>)}
      </div>}
      {settings.mode === 'custom' && <span className="mode-help">Your words. Your pace.</span>}
    </div>
  )
}
