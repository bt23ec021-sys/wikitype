import { BookOpenText, ChartNoAxesCombined, Keyboard, Moon, Sun, Monitor } from 'lucide-react'
import type { ThemeSetting } from '../types'

export type Page = 'test' | 'history' | 'about'
interface Props { page: Page; onPage: (page: Page) => void; theme: ThemeSetting; onTheme: (theme: ThemeSetting) => void }
export function Header({ page, onPage, theme, onTheme }: Props) {
  const nextTheme: ThemeSetting = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system'
  return (
    <header className="site-header">
      <div className="container-wide header-inner">
        <button className="brand" onClick={() => onPage('test')} aria-label="WikiType home">
          <span className="brand-mark"><BookOpenText size={22} strokeWidth={2.3}/></span>
          <span>Wiki<span className="brand-accent">Type</span><span className="brand-dot">.</span></span>
        </button>
        <nav className="header-nav" aria-label="Main navigation">
          <button className={`nav-link ${page === 'test' ? 'active' : ''}`} onClick={() => onPage('test')} aria-current={page === 'test' ? 'page' : undefined}><Keyboard size={16}/> <span>Type</span></button>
          <button className={`nav-link ${page === 'history' ? 'active' : ''}`} onClick={() => onPage('history')} aria-current={page === 'history' ? 'page' : undefined}><ChartNoAxesCombined size={16}/> <span>History</span></button>
          <button className={`nav-link ${page === 'about' ? 'active' : ''}`} onClick={() => onPage('about')} aria-current={page === 'about' ? 'page' : undefined}>About</button>
        </nav>
        <button className="icon-button theme-button" onClick={() => onTheme(nextTheme)} title={`Theme: ${theme}. Click to change.`} aria-label={`Theme ${theme}; switch to ${nextTheme}`}>
          {theme === 'dark' ? <Moon size={19}/> : theme === 'light' ? <Sun size={19}/> : <Monitor size={19}/>}
        </button>
      </div>
    </header>
  )
}
