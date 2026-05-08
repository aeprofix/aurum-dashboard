import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { TrendingUp, TrendingDown, Users, MousePointerClick, ShoppingCart, CreditCard, ArrowRight, Download, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

// ─── Mock data ──────────────────────────────────────────────────────────────

const userGrowthData = [
  { month: 'Nov', new: 1820, returning: 4200, churned: 310 },
  { month: 'Dec', new: 2100, returning: 4800, churned: 280 },
  { month: 'Jan', new: 1950, returning: 5100, churned: 340 },
  { month: 'Feb', new: 2400, returning: 5600, churned: 295 },
  { month: 'Mar', new: 2800, returning: 6200, churned: 260 },
  { month: 'Apr', new: 3100, returning: 6900, churned: 320 },
  { month: 'May', new: 3600, returning: 7400, churned: 230 },
]

const retentionData = [
  { cohort: 'Jan', w0: 100, w1: 68, w2: 54, w3: 46, w4: 41, w5: 38, w6: 35, w7: 33 },
  { cohort: 'Feb', w0: 100, w1: 71, w2: 57, w3: 49, w4: 43, w5: 40, w6: 37, w7: 35 },
  { cohort: 'Mar', w0: 100, w1: 65, w2: 52, w3: 44, w4: 39, w5: 36, w6: 33, w7: null },
  { cohort: 'Apr', w0: 100, w1: 73, w2: 59, w3: 51, w4: 45, w5: 42, w6: null, w7: null },
  { cohort: 'May', w0: 100, w1: 70, w2: 55, w3: 47, w4: 42, w5: null, w6: null, w7: null },
]

const funnelData = [
  { stage: 'Visitors',    count: 48320, pct: 100, icon: Users,            color: '#6c63ff' },
  { stage: 'Sign-ups',    count: 12480, pct: 25.8, icon: MousePointerClick, color: '#818cf8' },
  { stage: 'Trials',      count: 4960,  pct: 10.3, icon: ShoppingCart,     color: '#a78bfa' },
  { stage: 'Paid',        count: 1854,  pct: 3.84, icon: CreditCard,       color: '#00d4aa' },
]

const sessionData = [
  { day: 'Mon', sessions: 6200, pageviews: 18400, bounce: 42 },
  { day: 'Tue', sessions: 7100, pageviews: 21300, bounce: 38 },
  { day: 'Wed', sessions: 8400, pageviews: 25200, bounce: 35 },
  { day: 'Thu', sessions: 7800, pageviews: 23400, bounce: 37 },
  { day: 'Fri', sessions: 9200, pageviews: 27600, bounce: 33 },
  { day: 'Sat', sessions: 5100, pageviews: 15300, bounce: 48 },
  { day: 'Sun', sessions: 4600, pageviews: 13800, bounce: 51 },
]

const topPagesData = [
  { page: '/dashboard',    views: 14820, avg: '3m 12s', bounce: '28%', trend: 12.4 },
  { page: '/pricing',      views: 9340,  avg: '2m 44s', bounce: '42%', trend: 8.1 },
  { page: '/features',     views: 7210,  avg: '4m 01s', bounce: '31%', trend: -2.3 },
  { page: '/integrations', views: 5880,  avg: '3m 28s', bounce: '35%', trend: 19.7 },
  { page: '/blog',         views: 4620,  avg: '5m 15s', bounce: '22%', trend: 5.6 },
  { page: '/about',        views: 2940,  avg: '1m 52s', bounce: '55%', trend: -0.8 },
]

const geoData = [
  { country: '🇺🇸 United States', sessions: 18420, pct: 38.1 },
  { country: '🇬🇧 United Kingdom', sessions: 6840,  pct: 14.2 },
  { country: '🇩🇪 Germany',        sessions: 4920,  pct: 10.2 },
  { country: '🇫🇷 France',         sessions: 3610,  pct: 7.5  },
  { country: '🇨🇦 Canada',         sessions: 3200,  pct: 6.6  },
  { country: '🇦🇺 Australia',      sessions: 2880,  pct: 6.0  },
  { country: '🌍 Others',          sessions: 8450,  pct: 17.4 },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl p-3 text-sm min-w-[140px]">
      <p className="text-[var(--text-muted)] text-[11px] font-semibold mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-[12px] mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-[var(--text-secondary)] capitalize">{entry.name}:</span>
          <span className="font-bold text-[var(--text-primary)] font-mono ml-auto">
            {typeof entry.value === 'number' && entry.value > 1000
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Metric strip ────────────────────────────────────────────────────────────

const METRICS = [
  { label: 'Total Sessions',   value: '48,321', change: 11.4,  up: true  },
  { label: 'Avg. Session',     value: '3m 28s', change: 4.2,   up: true  },
  { label: 'Bounce Rate',      value: '38.4%',  change: -2.1,  up: false },
  { label: 'New Users',        value: '3,614',  change: 16.8,  up: true  },
  { label: 'Retention (30d)',  value: '41.2%',  change: 3.5,   up: true  },
  { label: 'NPS Score',        value: '72',     change: 8.0,   up: true  },
]

// ─── Retention Heatmap ───────────────────────────────────────────────────────

function RetentionHeatmap() {
  const weeks = ['W0', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']

  function getColor(val: number | null) {
    if (val === null) return 'var(--bg-elevated)'
    if (val >= 80) return 'rgba(108,99,255,0.85)'
    if (val >= 60) return 'rgba(108,99,255,0.65)'
    if (val >= 45) return 'rgba(108,99,255,0.45)'
    if (val >= 30) return 'rgba(108,99,255,0.28)'
    return 'rgba(108,99,255,0.14)'
  }

  function getTextColor(val: number | null) {
    if (val === null) return 'var(--text-muted)'
    return val >= 50 ? '#fff' : 'var(--text-primary)'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-collapse min-w-[540px]">
        <thead>
          <tr>
            <th className="text-left pb-2 pr-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Cohort</th>
            {weeks.map(w => (
              <th key={w} className="pb-2 px-1 font-semibold text-[var(--text-muted)] text-center">{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {retentionData.map(row => (
            <tr key={row.cohort}>
              <td className="py-1 pr-3 font-semibold text-[var(--text-secondary)]">{row.cohort}</td>
              {weeks.map((w, i) => {
                const key = `w${i}` as keyof typeof row
                const val = row[key] as number | null
                return (
                  <td key={w} className="py-1 px-1">
                    <div
                      className="h-8 w-full min-w-[42px] rounded-lg flex items-center justify-center font-bold transition-all cursor-default hover:opacity-80"
                      style={{
                        background: getColor(val),
                        color: getTextColor(val),
                      }}
                      title={val !== null ? `${val}% retained` : 'No data'}
                    >
                      {val !== null ? `${val}%` : '—'}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Funnel ──────────────────────────────────────────────────────────────────

function ConversionFunnel() {
  const max = funnelData[0].count
  return (
    <div className="space-y-3">
      {funnelData.map((step, i) => {
        const Icon = step.icon
        const widthPct = (step.count / max) * 100
        const dropPct = i > 0 ? (((funnelData[i - 1].count - step.count) / funnelData[i - 1].count) * 100).toFixed(1) : null
        return (
          <div key={step.stage}>
            {dropPct && (
              <div className="flex items-center gap-2 mb-1.5 ml-2">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-[var(--border-hover)] flex-shrink-0" />
                <span className="text-[10px] text-[var(--text-muted)]">
                  ↓ <strong className="text-[var(--danger)]">{dropPct}%</strong> drop-off
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: step.color + '20', color: step.color }}
              >
                <Icon size={15} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-semibold text-[var(--text-primary)]">{step.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-bold text-[var(--text-primary)]">{step.count.toLocaleString()}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{step.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${widthPct}%`, background: step.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const RANGE_TABS = ['7D', '30D', '90D', '12M']

export function AnalyticsPage() {
  const [range, setRange] = useState('30D')

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Advanced Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Deep-dive into cohorts, funnels, and retention metrics.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className="flex bg-[var(--bg-elevated)] rounded-xl p-1 gap-1">
            {RANGE_TABS.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200',
                  range === r
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm">
            <RefreshCw size={12} /> Refresh
          </Button>
          <Button variant="primary" size="sm">
            <Download size={12} /> Export
          </Button>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {METRICS.map(m => (
          <div key={m.label} className="card p-4 hover:-translate-y-0.5">
            <p className="text-[11px] text-[var(--text-muted)] mb-1.5 leading-tight">{m.label}</p>
            <p className="text-lg font-bold text-[var(--text-primary)] font-mono">{m.value}</p>
            <p
              className="text-[10px] font-semibold mt-1 flex items-center gap-1"
              style={{ color: m.up ? 'var(--success)' : 'var(--danger)' }}
            >
              {m.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {m.up ? '+' : ''}{m.change}% vs prev.
            </p>
          </div>
        ))}
      </div>

      {/* Row 1: User Growth + Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mb-4">
        {/* User Growth Area Chart */}
        <Card className="p-5">
          <SectionHeader
            title="User Growth"
            subtitle="New vs. returning vs. churned users over time"
            action={
              <div className="flex gap-3">
                {[['New','#6c63ff'],['Returning','#00d4aa'],['Churned','#ff5f6d']].map(([l,c]) => (
                  <span key={l} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}
                  </span>
                ))}
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userGrowthData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                {[['new','#6c63ff'],['returning','#00d4aa'],['churned','#ff5f6d']].map(([id, color]) => (
                  <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="returning" stroke="#00d4aa" strokeWidth={2} fill="url(#grad-returning)" />
              <Area type="monotone" dataKey="new"       stroke="#6c63ff" strokeWidth={2} fill="url(#grad-new)" />
              <Area type="monotone" dataKey="churned"   stroke="#ff5f6d" strokeWidth={2} fill="url(#grad-churned)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-5">
          <SectionHeader title="Conversion Funnel" subtitle="Visitor → Paid conversion" />
          <ConversionFunnel />
          <div className="mt-4 p-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--border)]">
            <p className="text-[11px] text-[var(--text-muted)]">Overall conversion</p>
            <p className="text-xl font-bold text-[var(--accent)] font-mono mt-0.5">3.84%</p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
              <TrendingUp size={9} className="text-[var(--success)]" />
              <span className="text-[var(--success)] font-semibold">+0.3pp</span> vs last period
            </p>
          </div>
        </Card>
      </div>

      {/* Row 2: Session chart + Geo */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mb-4">
        {/* Sessions chart */}
        <Card className="p-5">
          <SectionHeader
            title="Sessions & Engagement"
            subtitle="Daily sessions, pageviews & bounce rate"
            action={
              <div className="flex gap-3">
                {[['Sessions','#6c63ff'],['Pageviews','#00d4aa']].map(([l,c]) => (
                  <span key={l} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}
                  </span>
                ))}
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-soft)', radius: 8 }} />
              <Bar dataKey="pageviews" fill="#00d4aa" opacity={0.6} radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="sessions"  fill="var(--accent)"  radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
          {/* Bounce rate line */}
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-[var(--text-muted)]">Avg. Bounce Rate this week</span>
              <span className="text-[11px] font-bold text-[var(--text-primary)] font-mono">38.4%</span>
            </div>
            <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '38.4%', background: 'var(--warning)' }} />
            </div>
          </div>
        </Card>

        {/* Geo breakdown */}
        <Card className="p-5">
          <SectionHeader title="Top Countries" subtitle="Sessions by geography" />
          <div className="space-y-3">
            {geoData.map((row, i) => (
              <div key={row.country}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[var(--text-primary)]">{row.country}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--text-secondary)]">{row.sessions.toLocaleString()}</span>
                    <span className="text-[10px] text-[var(--text-muted)] w-8 text-right">{row.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.pct}%`,
                      background: i === 0 ? 'var(--accent)' : i === 1 ? '#818cf8' : i < 4 ? '#a78bfa' : 'var(--bg-overlay)',
                      opacity: 1 - i * 0.06,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Retention Heatmap */}
      <Card className="p-5 mb-4">
        <SectionHeader
          title="Cohort Retention Heatmap"
          subtitle="Weekly user retention by sign-up cohort — darker = higher retention"
          action={
            <Badge variant="info" size="md">Weekly</Badge>
          }
        />
        <RetentionHeatmap />
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[11px] text-[var(--text-muted)]">Retention scale:</span>
          {[['< 30%','rgba(108,99,255,0.14)'],['30–45%','rgba(108,99,255,0.28)'],['45–60%','rgba(108,99,255,0.45)'],['60–80%','rgba(108,99,255,0.65)'],['> 80%','rgba(108,99,255,0.85)']].map(([l,c]) => (
            <span key={l} className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
              <span className="w-4 h-4 rounded" style={{ background: c }} />{l}
            </span>
          ))}
        </div>
      </Card>

      {/* Row 4: Top Pages */}
      <Card className="p-5">
        <SectionHeader
          title="Top Pages"
          subtitle="Most visited pages this period"
          action={<Button variant="outline" size="sm">View full report <ArrowRight size={12} /></Button>}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Page', 'Views', 'Avg. Time', 'Bounce', 'Trend'].map(h => (
                  <th key={h} className="text-left pb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topPagesData.map(row => (
                <tr key={row.page} className="border-b border-[var(--border)] last:border-none hover:bg-[var(--bg-elevated)] transition-colors cursor-default">
                  <td className="py-3 px-2">
                    <span className="font-mono text-[12px] text-[var(--accent)] font-medium">{row.page}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-mono text-[12px] font-bold text-[var(--text-primary)]">{row.views.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-[12px] text-[var(--text-secondary)]">{row.avg}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-[12px] text-[var(--text-secondary)]">{row.bounce}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className="text-[12px] font-semibold flex items-center gap-1"
                      style={{ color: row.trend >= 0 ? 'var(--success)' : 'var(--danger)' }}
                    >
                      {row.trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {row.trend >= 0 ? '+' : ''}{row.trend}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
