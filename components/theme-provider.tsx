'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type Theme = 'dark' | 'binance'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  isBinance: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'binance',
  setTheme: () => {},
  toggleTheme: () => {},
  isBinance: true,
})

function applyThemeClass(theme: Theme) {
  const root = document.documentElement
  if (theme === 'binance') {
    root.classList.add('binance')
  } else {
    root.classList.remove('binance')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('binance')

  useEffect(() => {
    const stored = localStorage.getItem('acap-theme') as Theme | null
    const resolved = stored === 'dark' ? 'dark' : 'binance'
    setThemeState(resolved)
    applyThemeClass(resolved)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('acap-theme', t)
    applyThemeClass(t)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'binance' ? 'dark' : 'binance')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isBinance: theme === 'binance' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
