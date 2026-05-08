import { topProducts, activityFeed } from '@/lib/mockData'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, interpolateText } from '@/lib/utils'

// ─── Top Products ────────────────────────────────────────────────────────────

export function TopProducts() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Products</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">By revenue this month</p>
        </div>
        <Button variant="outline" size="sm">
          Details <ArrowUpRight size={12} />
        </Button>
      </div>

      <div className="space-y-0.5">
        {topProducts.map((product, i) => (
          <div
            key={product.id}
            className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-none hover:pl-1 transition-all duration-200 cursor-default group"
          >
            <span className="text-[11px] font-bold text-[var(--text-muted)] w-4 text-center flex-shrink-0">
              {i + 1}
            </span>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'var(--accent-soft)' }}
            >
              {product.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate">{product.name}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{product.category}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[13px] font-bold text-[var(--text-primary)] font-mono">
                {formatCurrency(product.revenue)}
              </p>
              <p
                className="text-[10px] font-semibold flex items-center justify-end gap-0.5"
                style={{ color: product.change >= 0 ? 'var(--success)' : 'var(--danger)' }}
              >
                {product.change >= 0
                  ? <TrendingUp size={9} />
                  : <TrendingDown size={9} />
                }
                {Math.abs(product.change)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

export function ActivityFeed() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Activity Feed</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Latest system events</p>
        </div>
        <Button variant="outline" size="sm">All activity</Button>
      </div>

      <div className="space-y-0">
        {activityFeed.map((item, i) => {
          const parts = interpolateText(item.text, item.highlight)
          return (
            <div
              key={item.id}
              className="flex gap-3 py-2.5 border-b border-[var(--border)] last:border-none cursor-default"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                style={{ background: 'var(--accent-soft)' }}
              >
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[var(--text-primary)] leading-snug">
                  {parts.before}
                  <span className="text-[var(--accent)] font-semibold">{parts.highlight}</span>
                  {parts.after}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{item.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
