import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  success: 'bg-[rgba(0,212,170,0.12)] text-[var(--success)]',
  warning: 'bg-[rgba(255,209,102,0.14)] text-[var(--warning)]',
  danger:  'bg-[rgba(255,95,109,0.12)] text-[var(--danger)]',
  info:    'bg-[rgba(96,165,250,0.14)] text-[var(--info)]',
  muted:   'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
}

const dotColors: Record<string, string> = {
  default: 'bg-[var(--accent)]',
  success: 'bg-[var(--success)]',
  warning: 'bg-[var(--warning)]',
  danger:  'bg-[var(--danger)]',
  info:    'bg-[var(--info)]',
  muted:   'bg-[var(--text-muted)]',
}

export function Badge({ children, variant = 'default', size = 'sm', dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}
