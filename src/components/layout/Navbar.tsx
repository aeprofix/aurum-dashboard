import { useState, useRef, useEffect } from 'react'
import { Menu, Search, Bell, Sun, Moon, Palette, X, CheckCheck } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useTheme, type AccentColor } from '@/hooks/useTheme'
import { notifications } from '@/lib/mockData'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onToggleSidebar: () => void
  onOpenCmd: () => void
  onMobileMenuOpen: () => void
}

const ACCENT_COLORS: { id: AccentColor; hex: string; label: string }[] = [
  { id: 'purple',  hex: '#6c63ff', label: 'Purple'  },
  { id: 'emerald', hex: '#10b981', label: 'Emerald' },
  { id: 'rose',    hex: '#f43f5e', label: 'Rose'    },
  { id: 'amber',   hex: '#f59e0b', label: 'Amber'   },
  { id: 'blue',    hex: '#3b82f6', label: 'Blue'    },
]

export function Navbar({ onToggleSidebar, onOpenCmd, onMobileMenuOpen }: NavbarProps) {
  const { mode, accent, setMode, toggleMode, setAccent } = useTheme()
  const [notifOpen, setNotifOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [notifList, setNotifList] = useState(notifications)
  const notifRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifList.filter(n => n.unread).length

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => setNotifList(n => n.map(item => ({ ...item, unread: false })))

  return (
    <header
      className="h-16 flex items-center px-5 gap-3 border-b border-[var(--border)] bg-[var(--bg-surface)] sticky top-0 z-[90] flex-shrink-0"
    >
      {/* Desktop sidebar toggle */}
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="hidden md:flex">
        <Menu size={16} />
      </Button>

      {/* Mobile menu */}
      <Button variant="ghost" size="icon" onClick={onMobileMenuOpen} className="md:hidden">
        <Menu size={16} />
      </Button>

      {/* Search */}
      <button
        onClick={onOpenCmd}
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-xl flex-1 max-w-sm text-left',
          'bg-[var(--bg-elevated)] border border-[var(--border)]',
          'hover:border-[var(--border-hover)] transition-all duration-200',
          'text-[var(--text-muted)] text-sm'
        )}
      >
        <Search size={13} className="flex-shrink-0" />
        <span className="text-[13px] flex-1">Search or press</span>
        <span className="flex gap-1 ml-auto">
          <kbd className="font-mono text-[10px] bg-[var(--bg-overlay)] border border-[var(--border)] px-1.5 py-0.5 rounded">⌘</kbd>
          <kbd className="font-mono text-[10px] bg-[var(--bg-overlay)] border border-[var(--border)] px-1.5 py-0.5 rounded">K</kbd>
        </span>
      </button>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button variant="ghost" size="icon" onClick={() => { setNotifOpen(o => !o); setThemeOpen(false) }} className="relative">
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] border border-[var(--bg-surface)]" />
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-[20px] shadow-2xl border border-[var(--border)] bg-[var(--bg-surface)] z-50 animate-slide-down overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-[10px] bg-[var(--accent)] text-white font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </span>
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifList.map(n => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-none hover:bg-[var(--bg-elevated)] transition-colors cursor-default"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--accent-soft)] text-sm flex-shrink-0">
                      {n.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[var(--text-primary)] leading-snug">
                        {n.message.split(n.boldPart).map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && <strong className="text-[var(--accent)]">{n.boldPart}</strong>}
                          </span>
                        ))}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{n.time}</p>
                    </div>
                    {n.unread && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-[var(--border)]">
                <button className="text-[12px] text-[var(--accent)] w-full text-center hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <div className="relative" ref={themeRef}>
          <Button variant="ghost" size="icon" onClick={() => { setThemeOpen(o => !o); setNotifOpen(false) }}>
            <Palette size={16} />
          </Button>

          {themeOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-[20px] shadow-2xl border border-[var(--border)] bg-[var(--bg-surface)] z-50 animate-slide-down p-4">
              <p className="text-[12px] font-semibold text-[var(--text-primary)] mb-3">Appearance</p>

              {/* Mode */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Mode</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['dark', 'light'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-medium transition-all',
                        mode === m
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                      )}
                    >
                      {m === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Accent Color</p>
                <div className="flex gap-2 flex-wrap">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setAccent(c.id)}
                      title={c.label}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                        accent === c.id ? 'border-[var(--text-primary)] scale-110' : 'border-transparent'
                      )}
                      style={{ background: c.hex, boxShadow: accent === c.id ? `0 0 0 2px var(--bg-surface)` : undefined }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <Avatar initials="JD" size="lg" className="cursor-pointer hover:opacity-90 transition-opacity" />
      </div>
    </header>
  )
}
