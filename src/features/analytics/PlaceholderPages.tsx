import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  icon?: string
}

export function PlaceholderPage({ title, description, icon = '🚧' }: PlaceholderPageProps) {
  return (
    <div className="p-5 lg:p-6 flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: 'var(--accent-soft)' }}
        >
          {icon}
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{description}</p>
        <Button variant="primary" size="md">
          <Construction size={14} />
          Coming Soon
        </Button>
      </div>
    </div>
  )
}


