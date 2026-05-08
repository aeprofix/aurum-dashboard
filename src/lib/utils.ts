import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value}`
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function getStatusClass(status: string): string {
  switch (status) {
    case 'completed':  return 'pill-completed'
    case 'pending':    return 'pill-pending'
    case 'cancelled':  return 'pill-cancelled'
    case 'processing': return 'pill-processing'
    default:           return ''
  }
}

export function interpolateText(template: string, highlight: string): { before: string; highlight: string; after: string } {
  const idx = template.indexOf('{name}') !== -1 ? template.indexOf('{name}') : template.indexOf('{bold}')
  const key = template.includes('{name}') ? '{name}' : '{bold}'
  if (idx === -1) return { before: template, highlight: '', after: '' }
  return {
    before: template.slice(0, idx),
    highlight,
    after: template.slice(idx + key.length),
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
