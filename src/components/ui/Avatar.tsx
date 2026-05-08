import { cn } from '@/lib/utils'

interface AvatarProps {
  initials: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  gradient?: boolean
}

const sizeStyles = {
  sm:  'w-7 h-7 text-[10px]',
  md:  'w-8 h-8 text-xs',
  lg:  'w-9 h-9 text-sm',
  xl:  'w-11 h-11 text-sm',
}

export function Avatar({ initials, size = 'md', className, gradient = true }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none',
        gradient
          ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] text-white'
          : 'bg-[var(--accent-soft)] text-[var(--accent)]',
        sizeStyles[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
