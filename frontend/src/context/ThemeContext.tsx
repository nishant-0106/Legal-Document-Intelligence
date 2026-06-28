import {
  createContext, useContext, useEffect, useState,
  type ReactNode,
} from 'react'
import { storage } from '@/lib/storage'
import type { Theme } from '@/types'

interface ThemeContextValue {
  theme: Theme
  isDark: boolean
  setTheme: (t: Theme) => void
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => storage.getTheme())
  const [isDark, setIsDark]     = useState(false)

  // Detect system preference and apply theme
  useEffect(() => {
    const updateTheme = () => {
      let effectiveTheme = theme
      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      }
      const dark = effectiveTheme === 'dark'
      setIsDark(dark)
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    updateTheme()

    // Listen for system theme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', updateTheme)
    return () => mq.removeEventListener('change', updateTheme)
  }, [theme])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    storage.setTheme(t)
  }

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
