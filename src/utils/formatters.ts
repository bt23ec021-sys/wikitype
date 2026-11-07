export const oneDecimal = (value: number) => Number.isFinite(value) ? value.toFixed(1) : '0.0'
export const whole = (value: number) => String(Math.round(Number.isFinite(value) ? value : 0))
export function formatTime(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}
