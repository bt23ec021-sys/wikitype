import { useEffect, useState } from 'react'
import type { ThemeSetting } from '../types'

export function useTheme(initial: ThemeSetting) {
  const [theme, setTheme] = useState<ThemeSetting>(initial)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
  return { theme, setTheme }
}
