import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { trafficSources } from '@/lib/mockData'
import { Card } from '@/components/ui/Card'

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl p-3">
      <div className="flex items-center gap-2 text-[12px]">
        <span className="w-2 h-2 rounded-full" style={{ background: d.payload.color }} />
        <span className="text-[var(--text-secondary)]">{d.name}:</span>
        <span className="font-bold text-[var(--text-primary)]">{d.value}%</span>
      </div>
    </div>
  )
}

export function TrafficChart() {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Traffic Sources</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">This month's distribution</p>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
        {trafficSources.map(src => (
          <div key={src.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: src.color }} />
            <span className="text-[11px] text-[var(--text-secondary)] truncate">{src.name}</span>
            <span className="ml-auto text-[11px] font-bold text-[var(--text-primary)] font-mono">{src.value}%</span>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={trafficSources}
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {trafficSources.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ top: 0 }}
        >
          <span className="text-xl font-bold text-[var(--text-primary)] font-mono">92K</span>
          <span className="text-[10px] text-[var(--text-muted)]">Visitors</span>
        </div>
      </div>
    </Card>
  )
}
