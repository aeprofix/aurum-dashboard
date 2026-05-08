import { useState, useMemo } from 'react'
import {
  Search, Filter, Download, RefreshCw, ChevronDown, ChevronUp,
  ArrowUpRight, Eye, Trash2, CheckSquare, Square, MoreHorizontal,
  TrendingUp, ShoppingBag, Clock, XCircle, Package
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { cn, formatCurrency } from '@/lib/utils'
import type { Order } from '@/lib/mockData'

// ─── Extended mock orders ────────────────────────────────────────────────────

const ALL_ORDERS: (Order & { items: number; region: string })[] = [
  { id: '#ORD-8821', customer: 'Alice Johnson',  product: 'Enterprise Suite', amount: 999,  status: 'completed',  date: '2025-05-06', avatar: 'AJ', items: 1, region: 'US' },
  { id: '#ORD-8820', customer: 'Marcus Lee',     product: 'Starter Pack',     amount: 49,   status: 'pending',    date: '2025-05-06', avatar: 'ML', items: 2, region: 'UK' },
  { id: '#ORD-8819', customer: 'Sarah Chen',     product: 'Pro Plan',         amount: 299,  status: 'completed',  date: '2025-05-05', avatar: 'SC', items: 1, region: 'SG' },
  { id: '#ORD-8818', customer: 'Tom Williams',   product: 'Pro Plan',         amount: 299,  status: 'cancelled',  date: '2025-05-05', avatar: 'TW', items: 1, region: 'AU' },
  { id: '#ORD-8817', customer: 'Emma Davis',     product: 'Add-on Bundle',    amount: 79,   status: 'completed',  date: '2025-05-04', avatar: 'ED', items: 3, region: 'US' },
  { id: '#ORD-8816', customer: 'Raj Patel',      product: 'Starter Pack',     amount: 49,   status: 'processing', date: '2025-05-04', avatar: 'RP', items: 1, region: 'IN' },
  { id: '#ORD-8815', customer: 'Luna Park',      product: 'Enterprise Suite', amount: 999,  status: 'completed',  date: '2025-05-03', avatar: 'LP', items: 1, region: 'KR' },
  { id: '#ORD-8814', customer: 'Diego Reyes',    product: 'Support Premium',  amount: 199,  status: 'pending',    date: '2025-05-03', avatar: 'DR', items: 2, region: 'MX' },
  { id: '#ORD-8813', customer: 'Priya Sharma',   product: 'Pro Plan',         amount: 299,  status: 'completed',  date: '2025-05-02', avatar: 'PS', items: 1, region: 'IN' },
  { id: '#ORD-8812', customer: 'James Carter',   product: 'Enterprise Suite', amount: 999,  status: 'processing', date: '2025-05-02', avatar: 'JC', items: 1, region: 'US' },
  { id: '#ORD-8811', customer: 'Yuki Tanaka',    product: 'Add-on Bundle',    amount: 79,   status: 'completed',  date: '2025-05-01', avatar: 'YT', items: 4, region: 'JP' },
  { id: '#ORD-8810', customer: 'Nina Hofmann',   product: 'Starter Pack',     amount: 49,   status: 'cancelled',  date: '2025-05-01', avatar: 'NH', items: 1, region: 'DE' },
  { id: '#ORD-8809', customer: 'Ben Okafor',     product: 'Pro Plan',         amount: 299,  status: 'pending',    date: '2025-04-30', avatar: 'BO', items: 1, region: 'NG' },
  { id: '#ORD-8808', customer: 'Clara Müller',   product: 'Support Premium',  amount: 199,  status: 'completed',  date: '2025-04-30', avatar: 'CM', items: 2, region: 'DE' },
  { id: '#ORD-8807', customer: 'Ryan Mitchell',  product: 'Enterprise Suite', amount: 999,  status: 'completed',  date: '2025-04-29', avatar: 'RM', items: 1, region: 'CA' },
]

const STATUS_CONFIG: Record<Order['status'], { variant: 'success'|'warning'|'danger'|'info'; label: string; icon: React.ElementType }> = {
  completed:  { variant: 'success', label: 'Completed',  icon: CheckSquare },
  pending:    { variant: 'warning', label: 'Pending',    icon: Clock },
  cancelled:  { variant: 'danger',  label: 'Cancelled',  icon: XCircle },
  processing: { variant: 'info',    label: 'Processing', icon: Package },
}

const SUMMARY_STATS = [
  { label: 'Total Orders',   value: '15',      sub: 'This period',   icon: ShoppingBag, color: 'var(--accent)',  change: '+4.6%' },
  { label: 'Revenue',        value: '$6,321',  sub: 'Gross revenue', icon: TrendingUp,  color: 'var(--success)', change: '+18.2%' },
  { label: 'Pending',        value: '3',       sub: 'Awaiting action', icon: Clock,    color: 'var(--warning)', change: '' },
  { label: 'Cancelled',      value: '2',       sub: 'This period',   icon: XCircle,    color: 'var(--danger)',  change: '-1.3%' },
]

type SortField = 'id' | 'customer' | 'amount' | 'date' | 'status'
type StatusFilter = 'all' | Order['status']

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose }: { order: typeof ALL_ORDERS[0]; onClose: () => void }) {
  const cfg = STATUS_CONFIG[order.status]
  return (
    <Modal open={!!order} onClose={onClose} title={`Order ${order.id}`} size="md">
      <div className="space-y-4">
        {/* Status + amount */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)]">
          <div>
            <p className="text-[11px] text-[var(--text-muted)] mb-1">Order Total</p>
            <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">{formatCurrency(order.amount)}</p>
          </div>
          <Badge variant={cfg.variant} size="md" dot>{cfg.label}</Badge>
        </div>

        {/* Customer */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Customer</p>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)]">
            <Avatar initials={order.avatar} size="lg" />
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{order.customer}</p>
              <p className="text-xs text-[var(--text-muted)]">Region: {order.region}</p>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Details</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Product',   value: order.product },
              { label: 'Date',      value: order.date },
              { label: 'Items',     value: order.items.toString() },
              { label: 'Order ID',  value: order.id },
            ].map(d => (
              <div key={d.label} className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{d.label}</p>
                <p className="text-[12px] font-semibold text-[var(--text-primary)]">{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="primary" size="sm" className="flex-1">
            <ArrowUpRight size={13} /> View Full Order
          </Button>
          {order.status === 'pending' && (
            <Button variant="outline" size="sm" className="flex-1">Mark Completed</Button>
          )}
          {order.status !== 'cancelled' && (
            <Button variant="danger" size="sm">
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function OrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailOrder, setDetailOrder] = useState<typeof ALL_ORDERS[0] | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [productFilter, setProductFilter] = useState('all')

  const products = useMemo(() => ['all', ...Array.from(new Set(ALL_ORDERS.map(o => o.product)))], [])

  const filtered = useMemo(() => {
    let out = ALL_ORDERS.filter(o => {
      const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || o.status === statusFilter
      const matchProduct = productFilter === 'all' || o.product === productFilter
      return matchSearch && matchStatus && matchProduct
    })
    out.sort((a, b) => {
      const av = a[sortField] as string | number
      const bv = b[sortField] as string | number
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return out
  }, [search, statusFilter, sortField, sortDir, productFilter])

  const allSelected = filtered.length > 0 && filtered.every(o => selected.has(o.id))
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(o => o.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
      : <ChevronDown size={11} className="opacity-30" />

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Orders Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Full order lifecycle management with filtering, exports, and bulk actions.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={() => {}}>
            <RefreshCw size={12} /> Refresh
          </Button>
          <Button variant="primary" size="sm">
            <Download size={12} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {SUMMARY_STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-4 hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '18' }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                {s.change && (
                  <span className="text-[10px] font-bold flex items-center gap-0.5" style={{ color: s.change.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>
                    <TrendingUp size={9} />{s.change}
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{s.value}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Table card */}
      <Card className="p-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders, customers…"
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-sans"
            />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl flex-shrink-0 flex-wrap">
            {(['all', 'completed', 'pending', 'processing', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all duration-150',
                  statusFilter === s
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={() => setShowFilters(f => !f)}>
            <Filter size={12} /> Filters {showFilters ? '▲' : '▼'}
          </Button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] animate-fade-in">
            <div>
              <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Product</label>
              <select
                value={productFilter}
                onChange={e => setProductFilter(e.target.value)}
                className="h-8 px-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[12px] text-[var(--text-primary)] outline-none cursor-pointer font-sans"
              >
                {products.map(p => <option key={p} value={p}>{p === 'all' ? 'All Products' : p}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => { setProductFilter('all'); setSearch(''); setStatusFilter('all') }}>
                Clear all
              </Button>
            </div>
          </div>
        )}

        {/* Bulk action bar */}
        {someSelected && (
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--border)] animate-fade-in">
            <span className="text-[12px] font-semibold text-[var(--accent)]">{selected.size} selected</span>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm">Mark Completed</Button>
              <Button variant="danger"  size="sm"><Trash2 size={12} /> Delete</Button>
              <Button variant="ghost"   size="sm" onClick={() => setSelected(new Set())}>Deselect</Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-3 pl-1 pr-2 w-8">
                  <button onClick={toggleAll} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    {allSelected ? <CheckSquare size={15} style={{ color: 'var(--accent)' }} /> : <Square size={15} />}
                  </button>
                </th>
                {([
                  { key: 'id',       label: 'Order ID' },
                  { key: 'customer', label: 'Customer' },
                  { key: null,       label: 'Product' },
                  { key: 'amount',   label: 'Amount' },
                  { key: 'status',   label: 'Status' },
                  { key: 'date',     label: 'Date' },
                ] as { key: SortField | null; label: string }[]).map(col => (
                  <th
                    key={col.label}
                    className="pb-3 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
                  >
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[var(--text-muted)] text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingBag size={32} className="opacity-30" />
                      <p>No orders match your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((order, i) => {
                const isSelected = selected.has(order.id)
                const cfg = STATUS_CONFIG[order.status]
                return (
                  <tr
                    key={order.id}
                    className={cn(
                      'border-b border-[var(--border)] last:border-none transition-colors cursor-default group',
                      isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    <td className="py-3 pl-1 pr-2">
                      <button onClick={() => toggleOne(order.id)} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                        {isSelected ? <CheckSquare size={15} style={{ color: 'var(--accent)' }} /> : <Square size={15} />}
                      </button>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono text-[11px] font-semibold text-[var(--accent)]">{order.id}</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <Avatar initials={order.avatar} size="sm" gradient={i % 2 === 0} />
                        <div>
                          <p className="text-[12px] font-semibold text-[var(--text-primary)] whitespace-nowrap">{order.customer}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{order.region} · {order.items} item{order.items > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-[12px] text-[var(--text-secondary)]">{order.product}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono text-[13px] font-bold text-[var(--text-primary)]">{formatCurrency(order.amount)}</span>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-[11px] text-[var(--text-muted)]">{order.date}</span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-[12px] text-[var(--text-muted)]">
            Showing <strong className="text-[var(--text-secondary)]">{filtered.length}</strong> of <strong className="text-[var(--text-secondary)]">{ALL_ORDERS.length}</strong> orders
          </p>
          <div className="flex gap-1">
            {['←', '1', '2', '3', '→'].map((p, i) => (
              <button
                key={i}
                className={cn(
                  'w-8 h-8 rounded-lg text-[12px] font-semibold transition-all',
                  p === '1'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Order detail modal */}
      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}
    </div>
  )
}
