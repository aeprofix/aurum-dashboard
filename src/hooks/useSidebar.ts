import { useState, useCallback, useEffect } from 'react'

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('aurum-sidebar') === 'collapsed'
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = useCallback(() => {
    setCollapsed(c => {
      const next = !c
      localStorage.setItem('aurum-sidebar', next ? 'collapsed' : 'expanded')
      return next
    })
  }, [])

  const openMobile = useCallback(() => setMobileOpen(true), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return { collapsed, toggle, mobileOpen, openMobile, closeMobile }
}
