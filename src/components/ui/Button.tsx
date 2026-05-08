import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  children: React.ReactNode
}

const variantStyles: Record<string, string> = {
  primary:   'bg-[var(--accent)] text-white border-transparent shadow-[0_4px_12px_var(--accent-glow)] hover:opacity-90 hover:shadow-[0_6px_20px_var(--accent-glow)]',
  secondary: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]',
  ghost:     'bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
  danger:    'bg-[rgba(255,95,109,0.12)] text-[var(--danger)] border-[rgba(255,95,109,0.2)] hover:bg-[rgba(255,95,109,0.2)]',
  outline:   'bg-transparent text-[var(--accent)] border-[var(--accent-soft)] hover:bg-[var(--accent-soft)]',
}

const sizeStyles: Record<string, string> = {
  sm:   'h-7 px-3 text-xs gap-1.5',
  md:   'h-9 px-4 text-sm gap-2',
  lg:   'h-11 px-6 text-sm gap-2',
  icon: 'h-9 w-9 p-0 justify-center',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center font-semibold rounded-xl border transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
