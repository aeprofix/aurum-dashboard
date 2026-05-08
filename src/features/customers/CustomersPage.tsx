import { useState, useMemo } from 'react'
import {
  Search, Filter, Download, Users, TrendingUp, TrendingDown,
  Star, Mail, Globe, ChevronDown, ChevronUp, Eye, UserPlus,
  MoreHorizontal, Crown, Zap, Shield, Package, RefreshCw,
  BarChart2, Clock, DollarSign, Activity
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { cn, formatCurrency } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type Segment = 'champion' | 'loyal' | 'at_risk' | 'new' | 'dormant'
type SortField = 'name' | 'ltv' | 'orders' | 'joined' | 'lastSeen'

interface Customer {
  id: string
  name: string
  email: string
  avatar: string
  country: string
  flag: string
  segment: Segment
  ltv: number
  orders: number
  avgOrder: number
  joined: string
  lastSeen: string
  tags: string[]
  plan: string
  nps: number
  spendTrend: number[]
  radarScores: { metric: string; value: number }[]
  recentOrders: { id: string; amount: number; date: string; status: string }[]
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const CUSTOMERS: Customer[] = [
  {
    id: 'c1', name: 'Alice Johnson', email: 'alice@techcorp.io', avatar: 'AJ',
    country: 'United States', flag: '🇺🇸', segment: 'champion', ltv: 14820, orders: 18,
    avgOrder: 823, joined: '2023-01-14', lastSeen: '2025-05-06', tags: ['VIP', 'Enterprise'],
    plan: 'Enterprise', nps: 9,
    spendTrend: [800,950,1100,900,1300,1200,1400,1100,1600,1500,1800,1820],
    radarScores: [
      { metric: 'Loyalty',    value: 95 },
      { metric: 'Spend',      value: 90 },
      { metric: 'Engagement', value: 88 },
      { metric: 'Recency',    value: 92 },
      { metric: 'Frequency',  value: 85 },
    ],
    recentOrders: [
      { id: '#ORD-8821', amount: 999, date: '2025-05-06', status: 'completed' },
      { id: '#ORD-8740', amount: 999, date: '2025-04-06', status: 'completed' },
      { id: '#ORD-8661', amount: 299, date: '2025-03-06', status: 'completed' },
    ],
  },
  {
    id: 'c2', name: 'Marcus Lee', email: 'marcus@startupx.co', avatar: 'ML',
    country: 'United Kingdom', flag: '🇬🇧', segment: 'loyal', ltv: 5840, orders: 11,
    avgOrder: 531, joined: '2023-06-02', lastSeen: '2025-05-06', tags: ['Pro', 'Early Adopter'],
    plan: 'Pro', nps: 8,
    spendTrend: [200,300,250,400,350,480,420,500,460,540,520,580],
    radarScores: [
      { metric: 'Loyalty',    value: 82 },
      { metric: 'Spend',      value: 68 },
      { metric: 'Engagement', value: 75 },
      { metric: 'Recency',    value: 90 },
      { metric: 'Frequency',  value: 70 },
    ],
    recentOrders: [
      { id: '#ORD-8820', amount: 49, date: '2025-05-06', status: 'pending' },
      { id: '#ORD-8745', amount: 299, date: '2025-04-08', status: 'completed' },
    ],
  },
  {
    id: 'c3', name: 'Sarah Chen', email: 'sarah@designlabs.com', avatar: 'SC',
    country: 'Singapore', flag: '🇸🇬', segment: 'champion', ltv: 11200, orders: 14,
    avgOrder: 800, joined: '2023-03-19', lastSeen: '2025-05-05', tags: ['VIP', 'Pro'],
    plan: 'Pro', nps: 10,
    spendTrend: [600,700,650,800,750,900,850,950,1000,1100,1050,1200],
    radarScores: [
      { metric: 'Loyalty',    value: 88 },
      { metric: 'Spend',      value: 85 },
      { metric: 'Engagement', value: 95 },
      { metric: 'Recency',    value: 88 },
      { metric: 'Frequency',  value: 80 },
    ],
    recentOrders: [
      { id: '#ORD-8819', amount: 299, date: '2025-05-05', status: 'completed' },
      { id: '#ORD-8730', amount: 999, date: '2025-04-01', status: 'completed' },
    ],
  },
  {
    id: 'c4', name: 'Tom Williams', email: 'tom@cloudventures.net', avatar: 'TW',
    country: 'Australia', flag: '🇦🇺', segment: 'at_risk', ltv: 2100, orders: 5,
    avgOrder: 420, joined: '2024-01-08', lastSeen: '2025-03-12', tags: ['Pro'],
    plan: 'Pro', nps: 5,
    spendTrend: [400,450,380,420,350,300,280,250,220,200,180,160],
    radarScores: [
      { metric: 'Loyalty',    value: 45 },
      { metric: 'Spend',      value: 50 },
      { metric: 'Engagement', value: 30 },
      { metric: 'Recency',    value: 20 },
      { metric: 'Frequency',  value: 35 },
    ],
    recentOrders: [
      { id: '#ORD-8818', amount: 299, date: '2025-05-05', status: 'cancelled' },
    ],
  },
  {
    id: 'c5', name: 'Emma Davis', email: 'emma@pixelcraft.io', avatar: 'ED',
    country: 'United States', flag: '🇺🇸', segment: 'loyal', ltv: 4320, orders: 9,
    avgOrder: 480, joined: '2023-09-22', lastSeen: '2025-05-04', tags: ['Pro', 'Beta Tester'],
    plan: 'Pro', nps: 9,
    spendTrend: [300,350,320,400,380,450,420,500,470,520,490,560],
    radarScores: [
      { metric: 'Loyalty',    value: 78 },
      { metric: 'Spend',      value: 65 },
      { metric: 'Engagement', value: 85 },
      { metric: 'Recency',    value: 82 },
      { metric: 'Frequency',  value: 72 },
    ],
    recentOrders: [
      { id: '#ORD-8817', amount: 79, date: '2025-05-04', status: 'completed' },
      { id: '#ORD-8720', amount: 299, date: '2025-03-20', status: 'completed' },
    ],
  },
  {
    id: 'c6', name: 'Raj Patel', email: 'raj@fusiontech.in', avatar: 'RP',
    country: 'India', flag: '🇮🇳', segment: 'new', ltv: 98, orders: 1,
    avgOrder: 98, joined: '2025-04-28', lastSeen: '2025-05-04', tags: ['Starter'],
    plan: 'Starter', nps: 7,
    spendTrend: [0,0,0,0,0,0,0,0,0,0,0,98],
    radarScores: [
      { metric: 'Loyalty',    value: 20 },
      { metric: 'Spend',      value: 15 },
      { metric: 'Engagement', value: 55 },
      { metric: 'Recency',    value: 95 },
      { metric: 'Frequency',  value: 10 },
    ],
    recentOrders: [
      { id: '#ORD-8816', amount: 49, date: '2025-05-04', status: 'processing' },
    ],
  },
  {
    id: 'c7', name: 'Luna Park', email: 'luna@novasoft.kr', avatar: 'LP',
    country: 'South Korea', flag: '🇰🇷', segment: 'champion', ltv: 18600, orders: 22,
    avgOrder: 845, joined: '2022-11-05', lastSeen: '2025-05-03', tags: ['VIP', 'Enterprise', 'Partner'],
    plan: 'Enterprise', nps: 10,
    spendTrend: [900,1000,950,1100,1200,1300,1250,1400,1500,1600,1700,1800],
    radarScores: [
      { metric: 'Loyalty',    value: 98 },
      { metric: 'Spend',      value: 96 },
      { metric: 'Engagement', value: 92 },
      { metric: 'Recency',    value: 88 },
      { metric: 'Frequency',  value: 95 },
    ],
    recentOrders: [
      { id: '#ORD-8815', amount: 999, date: '2025-05-03', status: 'completed' },
      { id: '#ORD-8710', amount: 999, date: '2025-04-03', status: 'completed' },
    ],
  },
  {
    id: 'c8', name: 'Diego Reyes', email: 'diego@creativelab.mx', avatar: 'DR',
    country: 'Mexico', flag: '🇲🇽', segment: 'at_risk', ltv: 1480, orders: 4,
    avgOrder: 370, joined: '2024-03-11', lastSeen: '2025-02-28', tags: ['Pro'],
    plan: 'Pro', nps: 4,
    spendTrend: [350,400,380,420,350,300,280,200,180,160,140,130],
    radarScores: [
      { metric: 'Loyalty',    value: 35 },
      { metric: 'Spend',      value: 40 },
      { metric: 'Engagement', value: 25 },
      { metric: 'Recency',    value: 15 },
      { metric: 'Frequency',  value: 30 },
    ],
    recentOrders: [
      { id: '#ORD-8814', amount: 199, date: '2025-05-03', status: 'pending' },
    ],
  },
  {
    id: 'c9', name: 'Priya Sharma', email: 'priya@analytiq.in', avatar: 'PS',
    country: 'India', flag: '🇮🇳', segment: 'loyal', ltv: 3960, orders: 8,
    avgOrder: 495, joined: '2023-12-01', lastSeen: '2025-05-02', tags: ['Pro', 'Beta Tester'],
    plan: 'Pro', nps: 8,
    spendTrend: [200,250,280,320,350,380,420,450,480,500,520,550],
    radarScores: [
      { metric: 'Loyalty',    value: 74 },
      { metric: 'Spend',      value: 62 },
      { metric: 'Engagement', value: 80 },
      { metric: 'Recency',    value: 85 },
      { metric: 'Frequency',  value: 68 },
    ],
    recentOrders: [
      { id: '#ORD-8813', amount: 299, date: '2025-05-02', status: 'completed' },
    ],
  },
  {
    id: 'c10', name: 'Nina Hofmann', email: 'nina@digitalhaus.de', avatar: 'NH',
    country: 'Germany', flag: '🇩🇪', segment: 'dormant', ltv: 640, orders: 3,
    avgOrder: 213, joined: '2024-06-14', lastSeen: '2024-11-20', tags: ['Starter'],
    plan: 'Starter', nps: 6,
    spendTrend: [200,220,200,180,200,180,60,0,0,0,0,0],
    radarScores: [
      { metric: 'Loyalty',    value: 25 },
      { metric: 'Spend',      value: 20 },
      { metric: 'Engagement', value: 15 },
      { metric: 'Recency',    value: 5  },
      { metric: 'Frequency',  value: 20 },
    ],
    recentOrders: [
      { id: '#ORD-8810', amount: 49, date: '2025-05-01', status: 'cancelled' },
    ],
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const SEGMENT_CONFIG: Record<Segment, { label: string; variant: 'success'|'info'|'danger'|'default'|'muted'; icon: React.ElementType; color: string; description: string }> = {
  champion: { label: 'Champion',  variant: 'success', icon: Crown,  color: '#00d4aa', description: 'High spend, high frequency, recently active' },
  loyal:    { label: 'Loyal',     variant: 'info',    icon: Star,   color: '#6c63ff', description: 'Regular buyers with strong engagement' },
  at_risk:  { label: 'At Risk',   variant: 'danger',  icon: Zap,    color: '#ff5f6d', description: 'Declining activity — needs re-engagement' },
  new:      { label: 'New',       variant: 'default', icon: UserPlus,color:'#f59e0b', description: 'Joined recently, still onboarding' },
  dormant:  { label: 'Dormant',   variant: 'muted',   icon: Shield, color: '#4a5068', description: 'Inactive for 90+ days' },
}

const PLAN_COLOR: Record<string, string> = {
  Enterprise: '#00d4aa',
  Pro:        '#6c63ff',
  Starter:    '#f59e0b',
}

// ─── Customer Detail Modal ────────────────────────────────────────────────────

function CustomerModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const seg = SEGMENT_CONFIG[customer.segment]
  const SegIcon = seg.icon

  return (
    <Modal open={!!customer} onClose={onClose} title="" size="lg">
      {/* Profile header */}
      <div className="flex items-start gap-4 mb-5 -mt-2">
        <Avatar initials={customer.avatar} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-[var(--text-primary)]">{customer.name}</h2>
            <Badge variant={seg.variant} size="sm">
              <SegIcon size={10} /> {seg.label}
            </Badge>
          </div>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{customer.email}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
              <Globe size={10} /> {customer.flag} {customer.country}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
              <Clock size={10} /> Joined {customer.joined}
            </span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: (PLAN_COLOR[customer.plan] || '#888') + '18', color: PLAN_COLOR[customer.plan] || '#888' }}
            >
              {customer.plan}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-[var(--text-muted)]">NPS Score</p>
          <p className="text-2xl font-bold font-mono" style={{ color: customer.nps >= 8 ? 'var(--success)' : customer.nps >= 6 ? 'var(--warning)' : 'var(--danger)' }}>
            {customer.nps}/10
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Lifetime Value', value: formatCurrency(customer.ltv), icon: DollarSign, color: 'var(--success)' },
          { label: 'Total Orders',   value: customer.orders,              icon: Package,    color: 'var(--accent)' },
          { label: 'Avg. Order',     value: formatCurrency(customer.avgOrder), icon: BarChart2, color: 'var(--warning)' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="p-3 rounded-2xl bg-[var(--bg-elevated)] text-center">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: s.color + '18' }}>
                <Icon size={15} style={{ color: s.color }} />
              </div>
              <p className="text-base font-bold font-mono text-[var(--text-primary)]">{s.value}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Spend trend */}
        <div>
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">12-Month Spend</p>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={customer.spendTrend.map((v, i) => ({ m: i + 1, v }))} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="cgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" hide />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length
                    ? <div className="text-[11px] bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-2 py-1 font-mono font-bold text-[var(--accent)]">${payload[0].value}</div>
                    : null
                }
              />
              <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2} fill="url(#cgrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div>
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">RFM Profile</p>
          <ResponsiveContainer width="100%" height={100}>
            <RadarChart data={customer.radarScores} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'Sora' }} />
              <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Tags</p>
        <div className="flex gap-1.5 flex-wrap">
          {customer.tags.map(tag => (
            <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">{tag}</span>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Recent Orders</p>
        <div className="space-y-1.5">
          {customer.recentOrders.map(o => (
            <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-elevated)]">
              <span className="font-mono text-[11px] font-bold text-[var(--accent)]">{o.id}</span>
              <span className="text-[11px] text-[var(--text-muted)]">{o.date}</span>
              <span className="font-mono text-[12px] font-bold text-[var(--text-primary)]">{formatCurrency(o.amount)}</span>
              <Badge
                variant={o.status === 'completed' ? 'success' : o.status === 'pending' ? 'warning' : o.status === 'cancelled' ? 'danger' : 'info'}
                size="sm" dot
              >
                {o.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5">
        <Button variant="primary" size="sm" className="flex-1"><Mail size={13} /> Send Email</Button>
        <Button variant="secondary" size="sm" className="flex-1"><Activity size={13} /> View Activity</Button>
        <Button variant="ghost" size="sm"><MoreHorizontal size={14} /></Button>
      </div>
    </Modal>
  )
}

// ─── Segment Summary Card ─────────────────────────────────────────────────────

function SegmentCard({ seg, count, ltv }: { seg: Segment; count: number; ltv: number }) {
  const cfg = SEGMENT_CONFIG[seg]
  const Icon = cfg.icon
  return (
    <div className="card p-4 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cfg.color + '18' }}>
          <Icon size={16} style={{ color: cfg.color }} />
        </div>
        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
      </div>
      <p className="text-2xl font-bold font-mono text-[var(--text-primary)] mb-0.5">{count}</p>
      <p className="text-[11px] text-[var(--text-muted)] mb-1">customers</p>
      <p className="text-[11px] text-[var(--text-secondary)]">Avg. LTV: <strong className="font-mono text-[var(--text-primary)]">{formatCurrency(Math.round(ltv))}</strong></p>
      <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-snug">{cfg.description}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewMode = 'table' | 'grid'

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState<Segment | 'all'>('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('ltv')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Segment summaries
  const segmentSummaries = useMemo(() => {
    const segs: Segment[] = ['champion', 'loyal', 'at_risk', 'new', 'dormant']
    return segs.map(seg => {
      const group = CUSTOMERS.filter(c => c.segment === seg)
      const avgLtv = group.length ? group.reduce((s, c) => s + c.ltv, 0) / group.length : 0
      return { seg, count: group.length, ltv: avgLtv }
    })
  }, [])

  const filtered = useMemo(() => {
    let out = CUSTOMERS.filter(c => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase())
      const matchSeg  = segmentFilter === 'all' || c.segment === segmentFilter
      const matchPlan = planFilter === 'all' || c.plan === planFilter
      return matchSearch && matchSeg && matchPlan
    })
    out.sort((a, b) => {
      const av = a[sortField] as string | number
      const bv = b[sortField] as string | number
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return out
  }, [search, segmentFilter, planFilter, sortField, sortDir])

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
      : <ChevronDown size={11} className="opacity-30" />

  const totalLTV = CUSTOMERS.reduce((s, c) => s + c.ltv, 0)
  const avgLTV   = Math.round(totalLTV / CUSTOMERS.length)

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Customer Directory</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">CRM-grade profiles, segments, and lifetime value tracking.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm"><RefreshCw size={12} /> Refresh</Button>
          <Button variant="secondary" size="sm"><Download size={12} /> Export</Button>
          <Button variant="primary"   size="sm"><UserPlus size={12} /> Add Customer</Button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Customers', value: CUSTOMERS.length.toString(),     icon: Users,       color: 'var(--accent)',  change: '+9.1%',  up: true  },
          { label: 'Total LTV',       value: formatCurrency(totalLTV),         icon: DollarSign,  color: 'var(--success)', change: '+18.2%', up: true  },
          { label: 'Avg. LTV',        value: formatCurrency(avgLTV),           icon: TrendingUp,  color: 'var(--warning)', change: '+4.6%',  up: true  },
          { label: 'Churn Risk',      value: `${CUSTOMERS.filter(c => c.segment === 'at_risk' || c.segment === 'dormant').length}`,
                                                                               icon: TrendingDown, color: 'var(--danger)', change: '-2 this month', up: false },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-4 hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '18' }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <span className="text-[10px] font-bold flex items-center gap-0.5" style={{ color: s.up ? 'var(--success)' : 'var(--danger)' }}>
                  {s.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{s.change}
                </span>
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{s.value}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Segment cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        {segmentSummaries.map(s => <SegmentCard key={s.seg} {...s} />)}
      </div>

      {/* Directory table */}
      <Card className="p-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, country…"
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-sans"
            />
          </div>

          {/* Segment filter tabs */}
          <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl flex-shrink-0 flex-wrap">
            {(['all', 'champion', 'loyal', 'at_risk', 'new', 'dormant'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSegmentFilter(s)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all duration-150',
                  segmentFilter === s
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {s === 'at_risk' ? 'At Risk' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={() => setShowFilters(f => !f)}>
            <Filter size={12} /> {showFilters ? 'Hide' : 'Filters'}
          </Button>

          {/* View toggle */}
          <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl">
            {(['table', 'grid'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all',
                  viewMode === v ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {v === 'table' ? '☰ Table' : '⊞ Grid'}
              </button>
            ))}
          </div>
        </div>

        {/* Extra filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] animate-fade-in">
            <div>
              <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Plan</label>
              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                className="h-8 px-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[12px] text-[var(--text-primary)] outline-none cursor-pointer font-sans"
              >
                {['all', 'Enterprise', 'Pro', 'Starter'].map(p => (
                  <option key={p} value={p}>{p === 'all' ? 'All Plans' : p}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => { setPlanFilter('all'); setSearch(''); setSegmentFilter('all') }}>Clear all</Button>
            </div>
          </div>
        )}

        {/* Table view */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {([
                    { key: 'name',     label: 'Customer' },
                    { key: null,       label: 'Segment' },
                    { key: null,       label: 'Plan' },
                    { key: 'ltv',      label: 'LTV' },
                    { key: 'orders',   label: 'Orders' },
                    { key: 'lastSeen', label: 'Last Seen' },
                    { key: 'joined',   label: 'Joined' },
                  ] as { key: SortField | null; label: string }[]).map(col => (
                    <th key={col.label} className="pb-3 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      {col.key ? (
                        <button onClick={() => handleSort(col.key!)} className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors">
                          {col.label} <SortIcon field={col.key} />
                        </button>
                      ) : col.label}
                    </th>
                  ))}
                  <th className="pb-3 px-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const seg = SEGMENT_CONFIG[c.segment]
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-[var(--border)] last:border-none hover:bg-[var(--bg-elevated)] transition-colors cursor-default group"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <Avatar initials={c.avatar} size="md" gradient={i % 2 === 0} />
                          <div>
                            <p className="text-[12px] font-semibold text-[var(--text-primary)]">{c.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">{c.flag} {c.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2"><Badge variant={seg.variant} dot size="sm">{seg.label}</Badge></td>
                      <td className="py-3 px-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: (PLAN_COLOR[c.plan] || '#888') + '18', color: PLAN_COLOR[c.plan] || '#888' }}>
                          {c.plan}
                        </span>
                      </td>
                      <td className="py-3 px-2"><span className="font-mono text-[13px] font-bold text-[var(--text-primary)]">{formatCurrency(c.ltv)}</span></td>
                      <td className="py-3 px-2"><span className="text-[12px] text-[var(--text-secondary)]">{c.orders}</span></td>
                      <td className="py-3 px-2"><span className="text-[11px] text-[var(--text-muted)]">{c.lastSeen}</span></td>
                      <td className="py-3 px-2"><span className="text-[11px] text-[var(--text-muted)]">{c.joined}</span></td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-[var(--text-muted)]">
                    <div className="flex flex-col items-center gap-2"><Users size={32} className="opacity-30" /><p>No customers match your filters.</p></div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid view */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c, i) => {
              const seg = SEGMENT_CONFIG[c.segment]
              const SegIcon = seg.icon
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="card p-4 cursor-pointer hover:-translate-y-1 hover:border-[var(--accent)]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={c.avatar} size="lg" gradient={i % 2 === 0} />
                      <div>
                        <p className="text-[13px] font-bold text-[var(--text-primary)]">{c.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{c.flag} {c.country}</p>
                      </div>
                    </div>
                    <Badge variant={seg.variant} size="sm"><SegIcon size={9} /> {seg.label}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { l: 'LTV',    v: formatCurrency(c.ltv) },
                      { l: 'Orders', v: c.orders.toString() },
                      { l: 'NPS',    v: `${c.nps}/10` },
                    ].map(s => (
                      <div key={s.l} className="text-center p-2 rounded-xl bg-[var(--bg-elevated)]">
                        <p className="font-mono text-[12px] font-bold text-[var(--text-primary)]">{s.v}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {c.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-[12px] text-[var(--text-muted)]">
            Showing <strong className="text-[var(--text-secondary)]">{filtered.length}</strong> of <strong className="text-[var(--text-secondary)]">{CUSTOMERS.length}</strong> customers
          </p>
          <div className="flex gap-1">
            {['←', '1', '→'].map((p, i) => (
              <button key={i} className={cn('w-8 h-8 rounded-lg text-[12px] font-semibold transition-all', p === '1' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]')}>{p}</button>
            ))}
          </div>
        </div>
      </Card>

      {selectedCustomer && <CustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
    </div>
  )
}
