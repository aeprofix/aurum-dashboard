import { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { revenueData } from '@/lib/mockData'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

type Tab = 'revenue' | 'profit' | 'orders'

const TABS: { id: Tab; label: string }[] = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'profit',  label: 'Profit' },
  { id: 'orders',  label: 'Orders' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl p-3 text-sm">
      <p className="text-[var(--text-muted)] text-[11px] font-semibold mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-[12px]">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-[var(--text-secondary)] capitalize">{entry.name}:</span>
          <span className="font-semibold text-[var(--text-primary)] font-mono">
            {entry.name === 'orders'
              ? entry.value.toLocaleString()
              : `$${(entry.value / 1000).toFixed(0)}K`}
          </span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart() {
  const [activeTab, setActiveTab] = useState<Tab>('revenue')

  const barKey = activeTab
  const showTarget = activeTab === 'revenue'

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Revenue Overview</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Monthly performance vs target</p>
        </div>
        <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={revenueData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.85} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Sora' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Sora' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => activeTab === 'orders' ? `${v / 1000}K` : `$${v / 1000}K`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-soft)', radius: 8 }} />

          <Bar
            dataKey={barKey}
            fill="url(#barGrad)"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />

          {showTarget && (
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--accent2)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {showTarget && (
        <div className="flex gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent)' }} />
            Actual Revenue
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <span className="w-4 border-t-2 border-dashed border-[var(--accent2)] inline-block" />
            Target
          </span>
        </div>
      )}
    </Card>
  )
}
