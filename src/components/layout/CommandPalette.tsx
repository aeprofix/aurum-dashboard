import { useState, useEffect, useRef } from 'react'
import { Search, LayoutDashboard, Activity, ShoppingBag, Users, Package, FileText, Sun, Moon, Zap, ArrowRight } from 'lucide-react'
import { useTheme, type AccentColor } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  hint?: string
  group: string
  icon: React.ElementType | string
  action: () => void
  color?: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const { toggleMode, setAccent } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)

  const navigate = (page: string) => { onNavigate(page); onClose() }

  const ALL_ITEMS: CommandItem[] = [
    { id: 'dashboard',    label: 'Go to Dashboard',    hint: 'Overview',    group: 'Navigate', icon: LayoutDashboard, action: () => navigate('dashboard') },
    { id: 'analytics',   label: 'Go to Analytics',    hint: 'Charts',      group: 'Navigate', icon: Activity,       action: () => navigate('analytics') },
    { id: 'orders',      label: 'View Orders',         hint: '24 pending',  group: 'Navigate', icon: ShoppingBag,    action: () => navigate('orders') },
    { id: 'customers',   label: 'View Customers',      hint: 'All users',   group: 'Navigate', icon: Users,          action: () => navigate('customers') },
    { id: 'products',    label: 'Manage Products',     hint: 'Catalog',     group: 'Navigate', icon: Package,        action: () => navigate('products') },
    { id: 'reports',     label: 'View Reports',        hint: 'Export data', group: 'Navigate', icon: FileText,       action: () => navigate('reports') },
    { id: 'light',       label: 'Switch to Light Mode',hint: 'Theme',       group: 'Appearance', icon: Sun,          action: () => { toggleMode(); onClose() } },
    { id: 'dark',        label: 'Switch to Dark Mode', hint: 'Theme',       group: 'Appearance', icon: Moon,         action: () => { toggleMode(); onClose() } },
    { id: 'purple',  label: 'Theme: Purple',  group: 'Colors', icon: '🟣', color: '#6c63ff', action: () => { setAccent('purple' as AccentColor);  onClose() } },
    { id: 'emerald', label: 'Theme: Emerald', group: 'Colors', icon: '🟢', color: '#10b981', action: () => { setAccent('emerald' as AccentColor); onClose() } },
    { id: 'rose',    label: 'Theme: Rose',    group: 'Colors', icon: '🔴', color: '#f43f5e', action: () => { setAccent('rose' as AccentColor);    onClose() } },
    { id: 'amber',   label: 'Theme: Amber',   group: 'Colors', icon: '🟡', color: '#f59e0b', action: () => { setAccent('amber' as AccentColor);   onClose() } },
    { id: 'blue',    label: 'Theme: Blue',    group: 'Colors', icon: '🔵', color: '#3b82f6', action: () => { setAccent('blue' as AccentColor);    onClose() } },
  ]

  const filtered = query.trim()
    ? ALL_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()) || i.group.toLowerCase().includes(query.toLowerCase()))
    : ALL_ITEMS

  // Group items
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  const flatItems = Object.values(groups).flat()

  useEffect(() => {
    if (open) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => { setSelected(0) }, [query])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, flatItems.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter')     { e.preventDefault(); flatItems[selected]?.action() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, flatItems, selected])

  if (!open) return null

  let itemIndex = 0

  return (
    <div
      className="fixed inset-0 z-[900] flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] rounded-[20px] shadow-2xl overflow-hidden animate-cmd-in border border-[var(--border-hover)] bg-[var(--bg-surface)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
          <Search size={15} className="text-[var(--text-muted)] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <Zap size={13} />
            </button>
          )}
        </div>

        {/* Items */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-2 py-1.5 pt-2">
                {group}
              </div>
              {items.map(item => {
                const idx = itemIndex++
                const isSelected = idx === selected
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelected(idx)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-100',
                      isSelected
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 text-sm">
                      {typeof Icon === 'string' ? Icon : <Icon size={14} />}
                    </div>
                    <span className="text-[13px] font-medium flex-1">{item.label}</span>
                    {item.hint && (
                      <span className="text-[11px] text-[var(--text-muted)]">{item.hint}</span>
                    )}
                    {isSelected && <ArrowRight size={12} className="text-[var(--accent)] ml-1" />}
                  </button>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">
              No results for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
          {[['↑↓','navigate'], ['↵','select'], ['esc','close']].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <kbd className="font-mono text-[10px] bg-[var(--bg-overlay)] border border-[var(--border)] px-1.5 py-0.5 rounded">{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
