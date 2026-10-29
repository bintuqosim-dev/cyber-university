'use client'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('dark')
  useEffect(() => {
    setTheme(getTheme())
    const h = () => setTheme(getTheme())
    window.addEventListener('themechange', h)
    return () => window.removeEventListener('themechange', h)
  }, [])
  return theme
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme()

  const toggle = () => {
    const next: Theme = getTheme() === 'light' ? 'dark' : 'light'
    const root = document.documentElement
    root.classList.add('theme-fade')
    root.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch {}
    window.dispatchEvent(new Event('themechange'))
    setTimeout(() => root.classList.remove('theme-fade'), 300)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'light' ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
      title={theme === 'light' ? 'Tungi rejim' : 'Kunduzgi rejim'}
      className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:text-fg hover:bg-gray-800 transition-colors ${className}`}
    >
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  )
}
