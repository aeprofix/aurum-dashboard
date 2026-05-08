import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ThemeMode = 'dark' | 'light'
export type AccentColor = 'purple' | 'emerald' | 'rose' | 'amber' | 'blue'

interface ThemeContextValue {
  mode: ThemeMode
  accent: AccentColor
  setMode: (m: ThemeMode) => void
  setAccent: (a: AccentColor) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('aurum-theme') as ThemeMode) || 'dark'
  })
  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem('aurum-accent') as AccentColor) || 'purple'
  })

  const applyTheme = useCallback((m: ThemeMode, a: AccentColor) => {
    const root = document.documentElement
    root.classList.toggle('light', m === 'light')
    root.classList.toggle('dark', m === 'dark')
    root.setAttribute('data-color', a)
  }, [])

  useEffect(() => {
    applyTheme(mode, accent)
    localStorage.setItem('aurum-theme', mode)
  }, [mode, accent, applyTheme])

  const setMode = useCallback((m: ThemeMode) => setModeState(m), [])
  const setAccent = useCallback((a: AccentColor) => {
    setAccentState(a)
    localStorage.setItem('aurum-accent', a)
  }, [])
  const toggleMode = useCallback(() => setMode(mode === 'dark' ? 'light' : 'dark'), [mode, setMode])

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
