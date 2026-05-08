import { useState, useMemo } from 'react'
import {
  Search, Plus, CheckCircle, XCircle, Settings, ExternalLink,
  RefreshCw, Zap, Shield, Clock, Activity, TrendingUp,
  AlertTriangle, ChevronRight, ToggleLeft, ToggleRight, Star
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'
type IntegrationCategory = 'Payments' | 'Communication' | 'Analytics' | 'CRM' | 'DevOps' | 'Marketing' | 'Storage' | 'Support'

interface Integration {
  id: string
  name: string
  description: string
  category: IntegrationCategory
  status: IntegrationStatus
  logo: string
  featured: boolean
  popularity: number
  connectedAt?: string
  lastSync?: string
  syncCount?: number
  docsUrl: string
  tags: string[]
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  { id: 'i1',  name: 'Stripe',       description: 'Accept payments, manage subscriptions, and handle billing.',   category: 'Payments',      status: 'connected',    logo: '💳', featured: true,  popularity: 98, connectedAt: '2023-01-15', lastSync: '2 min ago',   syncCount: 48210, docsUrl: '#', tags: ['Billing', 'Payments'] },
  { id: 'i2',  name: 'Slack',        description: 'Send alerts, reports, and notifications to your team.',        category: 'Communication', status: 'connected',    logo: '💬', featured: true,  popularity: 95, connectedAt: '2023-02-01', lastSync: '5 min ago',   syncCount: 12480, docsUrl: '#', tags: ['Alerts', 'Team'] },
  { id: 'i3',  name: 'HubSpot',      description: 'Sync contacts, deals, and marketing data with your CRM.',     category: 'CRM',           status: 'connected',    logo: '🔶', featured: true,  popularity: 90, connectedAt: '2023-03-10', lastSync: '1 hr ago',    syncCount: 8640,  docsUrl: '#', tags: ['CRM', 'Marketing'] },
  { id: 'i4',  name: 'Mixpanel',     description: 'Product analytics and user behavior tracking.',               category: 'Analytics',     status: 'connected',    logo: '📊', featured: false, popularity: 85, connectedAt: '2023-06-01', lastSync: '30 min ago',  syncCount: 5200,  docsUrl: '#', tags: ['Analytics', 'Events'] },
  { id: 'i5',  name: 'Intercom',     description: 'Customer messaging platform for support and engagement.',     category: 'Support',       status: 'error',        logo: '💭', featured: true,  popularity: 88, connectedAt: '2023-04-15', lastSync: '2 days ago',  syncCount: 3100,  docsUrl: '#', tags: ['Support', 'Chat'] },
  { id: 'i6',  name: 'GitHub',       description: 'Connect your repos for deployment and issue tracking.',       category: 'DevOps',        status: 'connected',    logo: '🐙', featured: false, popularity: 92, connectedAt: '2023-01-20', lastSync: '15 min ago',  syncCount: 9840,  docsUrl: '#', tags: ['DevOps', 'Code'] },
  { id: 'i7',  name: 'Mailchimp',    description: 'Email marketing campaigns, automation, and audiences.',       category: 'Marketing',     status: 'disconnected', logo: '📧', featured: false, popularity: 78, docsUrl: '#', tags: ['Email', 'Marketing'] },
  { id: 'i8',  name: 'Google Analytics', description: 'Web analytics for traffic, goals, and conversions.',    category: 'Analytics',     status: 'connected',    logo: '📈', featured: true,  popularity: 96, connectedAt: '2023-02-14', lastSync: '1 hr ago',    syncCount: 22100, docsUrl: '#', tags: ['Analytics', 'Web'] },
  { id: 'i9',  name: 'Salesforce',   description: 'Enterprise CRM for leads, opportunities, and forecasting.',  category: 'CRM',           status: 'disconnected', logo: '☁️', featured: false, popularity: 82, docsUrl: '#', tags: ['CRM', 'Enterprise'] },
  { id: 'i10', name: 'PagerDuty',    description: 'Incident management and on-call scheduling for ops.',        category: 'DevOps',        status: 'disconnected', logo: '🚨', featured: false, popularity: 72, docsUrl: '#', tags: ['Ops', 'Alerts'] },
  { id: 'i11', name: 'Twilio',       description: 'SMS, voice, and email messaging API.',                       category: 'Communication', status: 'pending',      logo: '📱', featured: false, popularity: 80, docsUrl: '#', tags: ['SMS', 'Voice'] },
  { id: 'i12', name: 'AWS S3',       description: 'Cloud object storage for backups and assets.',               category: 'Storage',       status: 'connected',    logo: '🪣', featured: false, popularity: 88, connectedAt: '2023-05-01', lastSync: '4 hr ago',    syncCount: 1420,  docsUrl: '#', tags: ['Storage', 'Cloud'] },
  { id: 'i13', name: 'Zendesk',      description: 'Customer service platform with ticketing and knowledge base.', category: 'Support',     status: 'disconnected', logo: '🎫', featured: false, popularity: 75, docsUrl: '#', tags: ['Support', 'Tickets'] },
  { id: 'i14', name: 'Segment',      description: 'Customer data platform to unify all your data sources.',     category: 'Analytics',     status: 'disconnected', logo: '🔵', featured: true,  popularity: 83, docsUrl: '#', tags: ['CDP', 'Data'] },
  { id: 'i15', name: 'SendGrid',     description: 'Transactional email delivery and marketing campaigns.',      category: 'Marketing',     status: 'connected',    logo: '✉️', featured: false, popularity: 86, connectedAt: '2023-03-20', lastSync: '2 hr ago',    syncCount: 18400, docsUrl: '#', tags: ['Email', 'Transactional'] },
]

const STATUS_CFG: Record<IntegrationStatus, { label: string; variant: 'success'|'danger'|'muted'|'warning'; icon: React.ElementType; color: string }> = {
  connected:    { label: 'Connected',    variant: 'success', icon: CheckCircle,  color: 'var(--success)' },
  disconnected: { label: 'Available',    variant: 'muted',   icon: XCircle,      color: 'var(--text-muted)' },
  error:        { label: 'Error',        variant: 'danger',  icon: AlertTriangle,color: 'var(--danger)' },
  pending:      { label: 'Pending',      variant: 'warning', icon: Clock,        color: 'var(--warning)' },
}

const CAT_ICONS: Record<IntegrationCategory, string> = {
  Payments:      '💳', Communication: '💬', Analytics: '📊',
  CRM:           '🤝', DevOps:        '⚙️', Marketing: '📣',
  Storage:       '🗄️', Support:      '🎧',
}

const CAT_COLOR: Record<IntegrationCategory, string> = {
  Payments:      '#10b981', Communication: '#6c63ff', Analytics: '#3b82f6',
  CRM:           '#f59e0b', DevOps:        '#8b92a8', Marketing: '#f43f5e',
  Storage:       '#00d4aa', Support:       '#a78bfa',
}

// ─── Integration Detail Modal ──────────────────────────────────────────────────

function IntegrationModal({ integration: ig, onClose }: { integration: Integration; onClose: () => void }) {
  const cfg = STATUS_CFG[ig.status]
  const isConnected = ig.status === 'connected'

  return (
    <Modal open={!!ig} onClose={onClose} title="" size="md">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5 -mt-2">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-[var(--bg-elevated)] border border-[var(--border)]">
          {ig.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-[var(--text-primary)]">{ig.name}</h2>
            {ig.featured && <Badge variant="default" size="sm"><Star size={9} className="fill-current" /> Featured</Badge>}
            <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">{ig.description}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: CAT_COLOR[ig.category] + '18', color: CAT_COLOR[ig.category] }}>{ig.category}</span>
            {ig.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">{t}</span>)}
          </div>
        </div>
      </div>

      {/* Stats (connected) */}
      {isConnected && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { l: 'Connected',  v: ig.connectedAt! },
            { l: 'Last Sync',  v: ig.lastSync!    },
            { l: 'Sync Events', v: ig.syncCount!.toLocaleString() },
          ].map(s => (
            <div key={s.l} className="p-3 rounded-2xl bg-[var(--bg-elevated)] text-center">
              <p className="text-[12px] font-bold text-[var(--text-primary)] font-mono">{s.v}</p>
              <p className="text-[9px] text-[var(--text-muted)]">{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {ig.status === 'error' && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,95,109,0.1)] border border-[rgba(255,95,109,0.2)] mb-4">
          <AlertTriangle size={15} className="text-[var(--danger)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-[var(--danger)]">Connection Error</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Authentication token expired. Reconnect to restore sync.</p>
          </div>
        </div>
      )}

      {/* Popularity */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-[11px] text-[var(--text-muted)]">Popularity among Aurum users</span>
          <span className="text-[11px] font-bold text-[var(--text-primary)] font-mono">{ig.popularity}%</span>
        </div>
        <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${ig.popularity}%`, background: CAT_COLOR[ig.category] }} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isConnected ? (
          <>
            <Button variant="secondary"  size="md" className="flex-1"><RefreshCw size={13} /> Sync Now</Button>
            <Button variant="secondary"  size="md" className="flex-1"><Settings size={13} /> Configure</Button>
            <Button variant="danger"     size="sm"><XCircle size={13} /></Button>
          </>
        ) : ig.status === 'error' ? (
          <Button variant="primary" size="md" className="flex-1"><RefreshCw size={13} /> Reconnect</Button>
        ) : (
          <>
            <Button variant="primary"   size="md" className="flex-1"><Zap size={13} /> Connect {ig.name}</Button>
            <Button variant="secondary" size="sm"><ExternalLink size={13} /></Button>
          </>
        )}
      </div>
    </Modal>
  )
}

// ─── Integration Card ──────────────────────────────────────────────────────────

function IntegrationCard({ integration: ig, onClick }: { integration: Integration; onClick: () => void }) {
  const cfg = STATUS_CFG[ig.status]
  const StatusIcon = cfg.icon
  const isConnected = ig.status === 'connected'

  return (
    <div
      onClick={onClick}
      className={cn(
        'card p-4 cursor-pointer hover:-translate-y-0.5 group relative overflow-hidden',
        ig.status === 'error' && 'border-[rgba(255,95,109,0.3)]'
      )}
    >
      {/* Top accent line for connected */}
      {isConnected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[20px]" style={{ background: CAT_COLOR[ig.category] }} />
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex-shrink-0">
          {ig.logo}
        </div>
        <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
      </div>

      <h3 className="text-[13px] font-bold text-[var(--text-primary)] mb-0.5">{ig.name}</h3>
      <p className="text-[11px] text-[var(--text-muted)] mb-3 line-clamp-2 leading-relaxed">{ig.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: CAT_COLOR[ig.category] + '18', color: CAT_COLOR[ig.category] }}>
          {ig.category}
        </span>
        {isConnected && ig.lastSync && (
          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1"><Activity size={9} />{ig.lastSync}</span>
        )}
        {!isConnected && (
          <span className="text-[10px] font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Connect <ChevronRight size={10} />
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const ALL_CATEGORIES: (IntegrationCategory | 'all')[] = ['all', 'Payments', 'Communication', 'Analytics', 'CRM', 'Marketing', 'DevOps', 'Storage', 'Support']

export function IntegrationsPage() {
  const [search, setSearch]       = useState('')
  const [catFilter, setCat]       = useState<IntegrationCategory | 'all'>('all')
  const [statusFilter, setStatus] = useState<IntegrationStatus | 'all'>('all')
  const [selected, setSelected]   = useState<Integration | null>(null)

  const filtered = useMemo(() =>
    INTEGRATIONS.filter(ig => {
      const ms = !search || ig.name.toLowerCase().includes(search.toLowerCase()) || ig.description.toLowerCase().includes(search.toLowerCase()) || ig.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const mc = catFilter === 'all' || ig.category === catFilter
      const mst = statusFilter === 'all' || ig.status === statusFilter
      return ms && mc && mst
    }), [search, catFilter, statusFilter])

  const connectedList   = INTEGRATIONS.filter(i => i.status === 'connected')
  const errorList       = INTEGRATIONS.filter(i => i.status === 'error')
  const featuredList    = INTEGRATIONS.filter(i => i.featured)
  const totalEvents     = connectedList.reduce((s, i) => s + (i.syncCount || 0), 0)

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Integrations Hub</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Connect your favorite tools — Stripe, Slack, HubSpot, and {INTEGRATIONS.length}+ more.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm"><RefreshCw size={12} /> Sync All</Button>
          <Button variant="primary"   size="sm"><Plus size={12} /> Request Integration</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Connected',    value: connectedList.length.toString(),      icon: CheckCircle,  color: 'var(--success)', sub: 'Active integrations' },
          { label: 'Sync Events',  value: totalEvents.toLocaleString(),         icon: Activity,     color: 'var(--accent)',  sub: 'All-time events'     },
          { label: 'Errors',       value: errorList.length.toString(),          icon: AlertTriangle,color: 'var(--danger)',  sub: 'Need attention'      },
          { label: 'Available',    value: INTEGRATIONS.length.toString() + '+', icon: Zap,          color: 'var(--warning)', sub: 'Browse catalog'      },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-4 hover:-translate-y-0.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color + '18' }}>
                <Icon size={16} style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{s.value}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Connected integrations status */}
      {connectedList.length > 0 && (
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Active Connections</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Live status of your connected integrations</p>
            </div>
            {errorList.length > 0 && (
              <Badge variant="danger" size="md"><AlertTriangle size={10} /> {errorList.length} need attention</Badge>
            )}
          </div>
          <div className="space-y-2">
            {[...INTEGRATIONS.filter(i => i.status === 'error'), ...INTEGRATIONS.filter(i => i.status === 'connected')].map(ig => {
              const cfg = STATUS_CFG[ig.status]
              const StatusIcon = cfg.icon
              return (
                <div
                  key={ig.id}
                  onClick={() => setSelected(ig)}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-2xl border cursor-pointer transition-all hover:border-[var(--border-hover)]',
                    ig.status === 'error' ? 'border-[rgba(255,95,109,0.3)] bg-[rgba(255,95,109,0.05)]' : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                  )}
                >
                  <span className="text-xl">{ig.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[var(--text-primary)]">{ig.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{ig.category}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
                    {ig.lastSync && <span className="flex items-center gap-1"><Clock size={9} /> {ig.lastSync}</span>}
                    {ig.syncCount && <span className="flex items-center gap-1 font-mono"><Activity size={9} /> {ig.syncCount.toLocaleString()} events</span>}
                  </div>
                  <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
                  <ChevronRight size={13} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Catalog */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations…"
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-sans" />
          </div>

          <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl flex-shrink-0 overflow-x-auto">
            {(['all', 'connected', 'disconnected', 'error'] as const).map(s => (
              <button key={s} onClick={() => setStatus(s as any)}
                className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize whitespace-nowrap transition-all', statusFilter === s ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-5">
          {ALL_CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all',
                catFilter === c
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]'
              )}
            >
              {c !== 'all' && <span>{CAT_ICONS[c as IntegrationCategory]}</span>}
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <Zap size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No integrations match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(ig => (
              <IntegrationCard key={ig.id} integration={ig} onClick={() => setSelected(ig)} />
            ))}
          </div>
        )}

        <p className="text-[11px] text-[var(--text-muted)] text-center mt-5">
          Showing {filtered.length} of {INTEGRATIONS.length} integrations.
          Can't find what you need? <button className="text-[var(--accent)] hover:underline">Request an integration →</button>
        </p>
      </Card>

      {selected && <IntegrationModal integration={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
