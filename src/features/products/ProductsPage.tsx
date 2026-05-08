import { useState, useMemo } from 'react'
import {
  Search, Filter, Download, Plus, Eye, Edit2, Trash2,
  TrendingUp, TrendingDown, Package, DollarSign, Star,
  ChevronDown, ChevronUp, BarChart2, RefreshCw, Copy,
  CheckSquare, Square, MoreHorizontal, Tag, Layers,
  AlertTriangle, ArrowUpRight, ShoppingCart, Zap
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn, formatCurrency } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type ProductStatus = 'active' | 'draft' | 'archived' | 'low_stock'
type ProductCategory = 'Subscription' | 'License' | 'One-time' | 'Service' | 'Add-on'
type SortField = 'name' | 'price' | 'revenue' | 'sales' | 'stock' | 'rating'

interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
  sku: string
}

interface Product {
  id: string
  name: string
  description: string
  category: ProductCategory
  status: ProductStatus
  price: number
  comparePrice?: number
  revenue: number
  sales: number
  stock: number
  rating: number
  reviews: number
  emoji: string
  tags: string[]
  variants: ProductVariant[]
  salesHistory: { month: string; value: number }[]
  margin: number
  sku: string
  createdAt: string
  updatedAt: string
  featured: boolean
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Pro Plan', description: 'Everything you need to scale your business. Unlimited projects, advanced analytics, and priority support.',
    category: 'Subscription', status: 'active', price: 299, comparePrice: 399, revenue: 84320, sales: 282,
    stock: 999, rating: 4.8, reviews: 214, emoji: '💎', tags: ['Popular', 'Best Value'],
    sku: 'PRO-MONTHLY', createdAt: '2023-01-01', updatedAt: '2025-05-01', featured: true, margin: 78,
    variants: [
      { id: 'v1', name: 'Monthly', price: 299, stock: 999, sku: 'PRO-M' },
      { id: 'v2', name: 'Annual (save 20%)', price: 2868, stock: 999, sku: 'PRO-A' },
    ],
    salesHistory: [
      { month: 'Jan', value: 5800 }, { month: 'Feb', value: 6200 }, { month: 'Mar', value: 7100 },
      { month: 'Apr', value: 6800 }, { month: 'May', value: 8200 }, { month: 'Jun', value: 7900 },
      { month: 'Jul', value: 8600 }, { month: 'Aug', value: 9100 }, { month: 'Sep', value: 8400 },
      { month: 'Oct', value: 9800 }, { month: 'Nov', value: 9200 }, { month: 'Dec', value: 7220 },
    ],
  },
  {
    id: 'p2', name: 'Enterprise Suite', description: 'Full-featured enterprise solution with SSO, custom integrations, dedicated infrastructure, and a dedicated success manager.',
    category: 'License', status: 'active', price: 999, comparePrice: undefined, revenue: 61100, sales: 61,
    stock: 999, rating: 4.9, reviews: 48, emoji: '🏢', tags: ['Enterprise', 'Custom'],
    sku: 'ENT-SUITE', createdAt: '2023-01-01', updatedAt: '2025-04-15', featured: true, margin: 85,
    variants: [
      { id: 'v3', name: 'Up to 50 seats',    price: 999,  stock: 999, sku: 'ENT-50'  },
      { id: 'v4', name: 'Up to 200 seats',   price: 2499, stock: 999, sku: 'ENT-200' },
      { id: 'v5', name: 'Unlimited seats',   price: 4999, stock: 999, sku: 'ENT-UNL' },
    ],
    salesHistory: [
      { month: 'Jan', value: 3000 }, { month: 'Feb', value: 4000 }, { month: 'Mar', value: 4500 },
      { month: 'Apr', value: 5000 }, { month: 'May', value: 5500 }, { month: 'Jun', value: 6000 },
      { month: 'Jul', value: 5200 }, { month: 'Aug', value: 6800 }, { month: 'Sep', value: 6200 },
      { month: 'Oct', value: 7100 }, { month: 'Nov', value: 6600 }, { month: 'Dec', value: 1200 },
    ],
  },
  {
    id: 'p3', name: 'Starter Pack', description: 'Perfect for individuals and small teams getting started. Core features with generous limits.',
    category: 'Subscription', status: 'active', price: 49, comparePrice: 69, revenue: 29450, sales: 601,
    stock: 999, rating: 4.5, reviews: 389, emoji: '🚀', tags: ['Starter', 'Popular'],
    sku: 'STR-MONTHLY', createdAt: '2023-01-01', updatedAt: '2025-05-02', featured: false, margin: 72,
    variants: [
      { id: 'v6', name: 'Monthly', price: 49,  stock: 999, sku: 'STR-M' },
      { id: 'v7', name: 'Annual',  price: 470, stock: 999, sku: 'STR-A' },
    ],
    salesHistory: [
      { month: 'Jan', value: 1800 }, { month: 'Feb', value: 2100 }, { month: 'Mar', value: 2400 },
      { month: 'Apr', value: 2200 }, { month: 'May', value: 2800 }, { month: 'Jun', value: 2600 },
      { month: 'Jul', value: 3000 }, { month: 'Aug', value: 3200 }, { month: 'Sep', value: 2900 },
      { month: 'Oct', value: 3400 }, { month: 'Nov', value: 3100 }, { month: 'Dec', value: 3950 },
    ],
  },
  {
    id: 'p4', name: 'Add-on Bundle', description: 'Expand your plan with extra storage, API calls, and white-label options.',
    category: 'Add-on', status: 'active', price: 79, comparePrice: 99, revenue: 18920, sales: 239,
    stock: 999, rating: 4.3, reviews: 122, emoji: '📦', tags: ['Add-on'],
    sku: 'ADDON-BUNDLE', createdAt: '2023-06-01', updatedAt: '2025-04-20', featured: false, margin: 68,
    variants: [
      { id: 'v8',  name: 'Storage +100GB', price: 29, stock: 999, sku: 'ADD-STG' },
      { id: 'v9',  name: 'API +500K calls',price: 49, stock: 999, sku: 'ADD-API' },
      { id: 'v10', name: 'White-label',    price: 79, stock: 999, sku: 'ADD-WL'  },
    ],
    salesHistory: [
      { month: 'Jan', value: 1200 }, { month: 'Feb', value: 1400 }, { month: 'Mar', value: 1600 },
      { month: 'Apr', value: 1500 }, { month: 'May', value: 1800 }, { month: 'Jun', value: 1700 },
      { month: 'Jul', value: 1600 }, { month: 'Aug', value: 2000 }, { month: 'Sep', value: 1900 },
      { month: 'Oct', value: 2100 }, { month: 'Nov', value: 1920 }, { month: 'Dec', value: 280  },
    ],
  },
  {
    id: 'p5', name: 'Support Premium', description: '24/7 dedicated support with < 1 hr response time, a dedicated account manager, and quarterly business reviews.',
    category: 'Service', status: 'active', price: 199, comparePrice: undefined, revenue: 12780, sales: 64,
    stock: 50, rating: 4.7, reviews: 41, emoji: '⚡', tags: ['Service', 'SLA'],
    sku: 'SUP-PREMIUM', createdAt: '2023-03-15', updatedAt: '2025-03-01', featured: false, margin: 60,
    variants: [
      { id: 'v11', name: 'Monthly', price: 199, stock: 50,  sku: 'SUP-M' },
      { id: 'v12', name: 'Annual',  price: 1908, stock: 50, sku: 'SUP-A' },
    ],
    salesHistory: [
      { month: 'Jan', value: 800 }, { month: 'Feb', value: 900 }, { month: 'Mar', value: 1000 },
      { month: 'Apr', value: 950 }, { month: 'May', value: 1100 }, { month: 'Jun', value: 1200 },
      { month: 'Jul', value: 1050 }, { month: 'Aug', value: 1300 }, { month: 'Sep', value: 1150 },
      { month: 'Oct', value: 1400 }, { month: 'Nov', value: 1280 }, { month: 'Dec', value: 600  },
    ],
  },
  {
    id: 'p6', name: 'Analytics Pro', description: 'Advanced analytics module with custom dashboards, cohort analysis, funnel tracking, and data export.',
    category: 'Add-on', status: 'low_stock', price: 59, comparePrice: 79, revenue: 8260, sales: 140,
    stock: 12, rating: 4.6, reviews: 87, emoji: '📊', tags: ['Analytics', 'Add-on'],
    sku: 'ANA-PRO', createdAt: '2024-01-10', updatedAt: '2025-04-28', featured: false, margin: 74,
    variants: [
      { id: 'v13', name: 'Monthly', price: 59, stock: 12, sku: 'ANA-M' },
    ],
    salesHistory: [
      { month: 'Jan', value: 400 }, { month: 'Feb', value: 550 }, { month: 'Mar', value: 600 },
      { month: 'Apr', value: 700 }, { month: 'May', value: 750 }, { month: 'Jun', value: 820 },
      { month: 'Jul', value: 780 }, { month: 'Aug', value: 900 }, { month: 'Sep', value: 860 },
      { month: 'Oct', value: 960 }, { month: 'Nov', value: 920 }, { month: 'Dec', value: 520  },
    ],
  },
  {
    id: 'p7', name: 'Developer API', description: 'Full API access with higher rate limits, webhooks, sandbox environment, and dedicated developer support.',
    category: 'License', status: 'draft', price: 149, comparePrice: undefined, revenue: 0, sales: 0,
    stock: 999, rating: 0, reviews: 0, emoji: '🔧', tags: ['Developer', 'API', 'Coming Soon'],
    sku: 'DEV-API', createdAt: '2025-04-01', updatedAt: '2025-05-05', featured: false, margin: 82,
    variants: [
      { id: 'v14', name: 'Standard',   price: 149, stock: 999, sku: 'API-STD' },
      { id: 'v15', name: 'Enterprise', price: 499, stock: 999, sku: 'API-ENT' },
    ],
    salesHistory: Array(12).fill({ month: '', value: 0 }).map((_, i) => ({ month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], value: 0 })),
  },
  {
    id: 'p8', name: 'Legacy Starter', description: 'Deprecated starter plan — no longer sold to new customers.',
    category: 'Subscription', status: 'archived', price: 29, comparePrice: undefined, revenue: 4200, sales: 145,
    stock: 0, rating: 3.8, reviews: 98, emoji: '📁', tags: ['Archived'],
    sku: 'LEG-STR', createdAt: '2022-06-01', updatedAt: '2024-12-31', featured: false, margin: 55,
    variants: [],
    salesHistory: Array(12).fill({ month: '', value: 0 }).map((_, i) => ({ month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], value: i < 6 ? 700 : 0 })),
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProductStatus, { label: string; variant: 'success'|'warning'|'danger'|'muted'|'info'; dot?: boolean }> = {
  active:    { label: 'Active',    variant: 'success', dot: true },
  draft:     { label: 'Draft',     variant: 'muted',   dot: true },
  archived:  { label: 'Archived',  variant: 'danger',  dot: true },
  low_stock: { label: 'Low Stock', variant: 'warning', dot: true },
}

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  Subscription: '#6c63ff',
  License:      '#00d4aa',
  'One-time':   '#ffd166',
  Service:      '#f43f5e',
  'Add-on':     '#f59e0b',
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl px-3 py-2 text-[12px]">
      <p className="text-[var(--text-muted)] text-[10px] mb-1">{label}</p>
      <p className="font-bold text-[var(--text-primary)] font-mono">${payload[0].value?.toLocaleString()}</p>
    </div>
  )
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star
            key={s}
            size={10}
            className={s <= Math.round(rating) ? 'fill-[var(--warning)] text-[var(--warning)]' : 'text-[var(--border-hover)]'}
          />
        ))}
      </div>
      <span className="text-[11px] text-[var(--text-muted)]">{rating > 0 ? `${rating} (${reviews})` : 'No reviews'}</span>
    </div>
  )
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview'|'variants'|'analytics'>('overview')
  const statusCfg = STATUS_CONFIG[product.status]

  return (
    <Modal open={!!product} onClose={onClose} title="" size="lg">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5 -mt-2">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: 'var(--accent-soft)' }}
        >
          {product.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-base font-bold text-[var(--text-primary)]">{product.name}</h2>
            {product.featured && <Badge variant="default" size="sm"><Star size={9} className="fill-current" /> Featured</Badge>}
            <Badge variant={statusCfg.variant} dot size="sm">{statusCfg.label}</Badge>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="font-mono text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded">SKU: {product.sku}</span>
            <span className="text-[11px]" style={{ color: CATEGORY_COLORS[product.category] }}>● {product.category}</span>
            <StarRating rating={product.rating} reviews={product.reviews} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-[var(--text-muted)]">Price</p>
          <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">{formatCurrency(product.price)}</p>
          {product.comparePrice && (
            <p className="text-[11px] text-[var(--text-muted)] line-through">{formatCurrency(product.comparePrice)}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl mb-4">
        {(['overview', 'variants', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all',
              activeTab === tab ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Revenue',  value: formatCurrency(product.revenue), icon: DollarSign, color: 'var(--success)' },
              { label: 'Sales',    value: product.sales.toLocaleString(),   icon: ShoppingCart, color: 'var(--accent)' },
              { label: 'Margin',   value: `${product.margin}%`,             icon: BarChart2,  color: 'var(--warning)' },
              { label: 'In Stock', value: product.stock === 999 ? '∞' : product.stock.toString(), icon: Package, color: product.stock < 20 ? 'var(--danger)' : 'var(--info)' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="p-3 rounded-2xl bg-[var(--bg-elevated)] text-center">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ background: s.color + '18' }}>
                    <Icon size={13} style={{ color: s.color }} />
                  </div>
                  <p className="font-mono text-[13px] font-bold text-[var(--text-primary)]">{s.value}</p>
                  <p className="text-[9px] text-[var(--text-muted)]">{s.label}</p>
                </div>
              )
            })}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Tags</p>
            <div className="flex gap-1.5 flex-wrap">
              {product.tags.map(tag => (
                <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">{tag}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[11px] text-[var(--text-muted)]">
            <p>Created: <span className="text-[var(--text-secondary)]">{product.createdAt}</span></p>
            <p>Updated: <span className="text-[var(--text-secondary)]">{product.updatedAt}</span></p>
          </div>
        </div>
      )}

      {/* Variants tab */}
      {activeTab === 'variants' && (
        <div>
          {product.variants.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)] text-sm">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p>No variants defined for this product.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {product.variants.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                      <Layers size={13} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[var(--text-primary)]">{v.name}</p>
                      <p className="font-mono text-[10px] text-[var(--text-muted)]">SKU: {v.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono text-[13px] font-bold text-[var(--text-primary)]">{formatCurrency(v.price)}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Stock: {v.stock === 999 ? '∞' : v.stock}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--accent)]">
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2"><Plus size={12} /> Add Variant</Button>
            </div>
          )}
        </div>
      )}

      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Monthly Revenue (12 months)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={product.salesHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}K`} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--accent-soft)', radius: 4 }} />
              <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Peak Month',  value: (() => { const m = product.salesHistory.reduce((a,b) => b.value > a.value ? b : a, product.salesHistory[0]); return m.month })() },
              { label: 'Avg/Month',   value: formatCurrency(Math.round(product.revenue / 12)) },
              { label: 'Trend',       value: product.salesHistory[11]?.value > product.salesHistory[0]?.value ? '↑ Growing' : '↓ Declining' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-[var(--bg-elevated)] text-center">
                <p className="text-[12px] font-bold text-[var(--text-primary)]">{s.value}</p>
                <p className="text-[9px] text-[var(--text-muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-5">
        <Button variant="primary"    size="sm" className="flex-1"><Edit2 size={13} /> Edit Product</Button>
        <Button variant="secondary"  size="sm" className="flex-1"><Copy size={13} /> Duplicate</Button>
        {product.status !== 'archived' && (
          <Button variant="danger" size="sm"><Trash2 size={13} /></Button>
        )}
      </div>
    </Modal>
  )
}

// ─── Revenue Bar Chart for catalog ───────────────────────────────────────────

function RevenueByCategory() {
  const data = ['Subscription','License','Service','Add-on'].map(cat => ({
    category: cat,
    revenue: PRODUCTS.filter(p => p.category === cat).reduce((s, p) => s + p.revenue, 0),
  }))
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}K`} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--accent-soft)', radius: 4 }} />
        <Bar dataKey="revenue" radius={[4,4,0,0]} maxBarSize={32}>
          {data.map((_, i) => (
            <rect key={i} fill={Object.values(CATEGORY_COLORS)[i] || 'var(--accent)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Product Row (table) ──────────────────────────────────────────────────────

function ProductRow({
  product, index, selected, onToggle, onOpen,
}: {
  product: Product
  index: number
  selected: boolean
  onToggle: () => void
  onOpen: () => void
}) {
  const statusCfg = STATUS_CONFIG[product.status]
  const isLowStock = product.stock > 0 && product.stock < 20

  return (
    <tr className={cn(
      'border-b border-[var(--border)] last:border-none transition-colors cursor-default group',
      selected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-elevated)]'
    )}>
      <td className="py-3 pl-2 pr-1">
        <button onClick={onToggle} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
          {selected ? <CheckSquare size={15} style={{ color: 'var(--accent)' }} /> : <Square size={15} />}
        </button>
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'var(--accent-soft)' }}>
            {product.emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate">{product.name}</p>
              {product.featured && <Star size={10} className="fill-[var(--warning)] text-[var(--warning)] flex-shrink-0" />}
            </div>
            <p className="font-mono text-[10px] text-[var(--text-muted)]">{product.sku}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-2">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: CATEGORY_COLORS[product.category] + '18', color: CATEGORY_COLORS[product.category] }}>
          {product.category}
        </span>
      </td>
      <td className="py-3 px-2">
        <div>
          <p className="font-mono text-[13px] font-bold text-[var(--text-primary)]">{formatCurrency(product.price)}</p>
          {product.comparePrice && (
            <p className="font-mono text-[10px] text-[var(--text-muted)] line-through">{formatCurrency(product.comparePrice)}</p>
          )}
        </div>
      </td>
      <td className="py-3 px-2">
        <p className="font-mono text-[12px] font-bold text-[var(--text-primary)]">{formatCurrency(product.revenue)}</p>
        <p className="text-[10px] text-[var(--text-muted)]">{product.sales} sales</p>
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-1.5">
          {isLowStock && <AlertTriangle size={11} className="text-[var(--warning)] flex-shrink-0" />}
          <span className={cn('text-[12px] font-mono', isLowStock && 'text-[var(--warning)] font-bold')}>
            {product.stock === 999 ? '∞' : product.stock}
          </span>
        </div>
      </td>
      <td className="py-3 px-2">
        <StarRating rating={product.rating} reviews={product.reviews} />
      </td>
      <td className="py-3 px-2">
        <Badge variant={statusCfg.variant} dot size="sm">{statusCfg.label}</Badge>
      </td>
      <td className="py-3 px-2">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onOpen} className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all" title="View">
            <Eye size={12} />
          </button>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all" title="Edit">
            <Edit2 size={12} />
          </button>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[rgba(255,95,109,0.1)] transition-all" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('revenue')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const filtered = useMemo(() => {
    let out = PRODUCTS.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const matchStatus   = statusFilter === 'all'   || p.status === statusFilter
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter
      return matchSearch && matchStatus && matchCategory
    })
    out.sort((a, b) => {
      const av = a[sortField] as string | number
      const bv = b[sortField] as string | number
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return out
  }, [search, statusFilter, categoryFilter, sortField, sortDir])

  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id))

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map(p => p.id)))
  }
  function toggleOne(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }
  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
      : <ChevronDown size={11} className="opacity-30" />

  const totalRevenue = PRODUCTS.reduce((s, p) => s + p.revenue, 0)
  const totalSales   = PRODUCTS.reduce((s, p) => s + p.sales, 0)
  const avgMargin    = Math.round(PRODUCTS.filter(p => p.status === 'active').reduce((s, p) => s + p.margin, 0) / PRODUCTS.filter(p => p.status === 'active').length)
  const lowStockCount = PRODUCTS.filter(p => p.stock > 0 && p.stock < 20).length

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Product Catalog</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your product inventory, pricing, and variants.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm"><RefreshCw size={12} /> Refresh</Button>
          <Button variant="secondary" size="sm"><Download size={12} /> Export</Button>
          <Button variant="primary"   size="sm"><Plus size={12} /> Add Product</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: PRODUCTS.filter(p => p.status !== 'archived').length.toString(), icon: Package,    color: 'var(--accent)',  change: '+2 this month', up: true  },
          { label: 'Catalog Revenue',value: formatCurrency(totalRevenue),                                    icon: DollarSign, color: 'var(--success)', change: '+18.2%',       up: true  },
          { label: 'Total Sales',    value: totalSales.toLocaleString(),                                     icon: ShoppingCart,color:'var(--warning)', change: '+4.6%',        up: true  },
          { label: 'Low Stock',      value: lowStockCount.toString(),                                        icon: AlertTriangle,color:'var(--danger)', change: `${lowStockCount} items`,  up: false },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-4 hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '18' }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <span className="text-[10px] font-bold flex items-center gap-0.5" style={{ color: s.up ? 'var(--success)' : 'var(--danger)' }}>
                  {s.up ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}{s.change}
                </span>
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{s.value}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts + top performers */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.6fr] gap-4 mb-6">
        {/* Revenue by category */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Revenue by Category</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Breakdown across product types</p>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <span key={cat} className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-sm" style={{ background: color }} />{cat}
              </span>
            ))}
          </div>
          <RevenueByCategory />
        </Card>

        {/* Top performers mini-table */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Performers</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Ranked by revenue</p>
            </div>
            <Badge variant="default" size="sm"><Zap size={9} /> Live</Badge>
          </div>
          <div className="space-y-2">
            {PRODUCTS
              .filter(p => p.status === 'active')
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((p, i) => {
                const maxRev = PRODUCTS[0].revenue
                return (
                  <div key={p.id} className="flex items-center gap-3 group">
                    <span className="text-[11px] font-bold text-[var(--text-muted)] w-4 flex-shrink-0">{i + 1}</span>
                    <span className="text-lg flex-shrink-0">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-[var(--text-primary)] truncate">{p.name}</span>
                        <span className="font-mono text-[11px] font-bold text-[var(--text-primary)] ml-2 flex-shrink-0">{formatCurrency(p.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(p.revenue / maxRev) * 100}%`, background: 'var(--accent)' }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-[var(--success)] flex-shrink-0">
                      <TrendingUp size={9} />{p.margin}%
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>
      </div>

      {/* Product table */}
      <Card className="p-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, SKUs, tags…"
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-sans"
            />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl flex-shrink-0 flex-wrap">
            {(['all', 'active', 'draft', 'low_stock', 'archived'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all capitalize',
                  statusFilter === s ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {s === 'low_stock' ? 'Low Stock' : s.charAt(0).toUpperCase() + s.slice(1)}
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
                className={cn('px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all', viewMode === v ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}
              >
                {v === 'table' ? '☰' : '⊞'}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] animate-fade-in">
            <div>
              <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as any)}
                className="h-8 px-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[12px] text-[var(--text-primary)] outline-none cursor-pointer font-sans"
              >
                <option value="all">All Categories</option>
                {(['Subscription','License','One-time','Service','Add-on'] as ProductCategory[]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter('all'); setSearch(''); setStatusFilter('all') }}>Clear all</Button>
            </div>
          </div>
        )}

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--border)] animate-fade-in">
            <span className="text-[12px] font-semibold text-[var(--accent)]">{selected.size} selected</span>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm"><Tag size={12} /> Bulk Tag</Button>
              <Button variant="danger"  size="sm"><Trash2 size={12} /> Archive</Button>
              <Button variant="ghost"   size="sm" onClick={() => setSelected(new Set())}>Deselect</Button>
            </div>
          </div>
        )}

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-3 pl-2 pr-1 w-8">
                    <button onClick={toggleAll} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                      {allSelected ? <CheckSquare size={15} style={{ color: 'var(--accent)' }} /> : <Square size={15} />}
                    </button>
                  </th>
                  {([
                    { key: 'name',     label: 'Product' },
                    { key: null,       label: 'Category' },
                    { key: 'price',    label: 'Price' },
                    { key: 'revenue',  label: 'Revenue' },
                    { key: 'stock',    label: 'Stock' },
                    { key: 'rating',   label: 'Rating' },
                    { key: null,       label: 'Status' },
                  ] as { key: SortField | null; label: string }[]).map(col => (
                    <th key={col.label} className="pb-3 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      {col.key ? (
                        <button onClick={() => handleSort(col.key!)} className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors">
                          {col.label} <SortIcon field={col.key} />
                        </button>
                      ) : col.label}
                    </th>
                  ))}
                  <th className="pb-3 px-2 w-24" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="py-16 text-center text-sm text-[var(--text-muted)]">
                    <div className="flex flex-col items-center gap-2"><Package size={32} className="opacity-30" /><p>No products match your filters.</p></div>
                  </td></tr>
                ) : filtered.map((p, i) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    index={i}
                    selected={selected.has(p.id)}
                    onToggle={() => toggleOne(p.id)}
                    onOpen={() => setDetailProduct(p)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid view */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p, i) => {
              const statusCfg = STATUS_CONFIG[p.status]
              return (
                <div
                  key={p.id}
                  onClick={() => setDetailProduct(p)}
                  className="card p-4 cursor-pointer hover:-translate-y-1 hover:border-[var(--accent)] group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--accent-soft)' }}>
                      {p.emoji}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={statusCfg.variant} dot size="sm">{statusCfg.label}</Badge>
                      {p.featured && <Star size={11} className="fill-[var(--warning)] text-[var(--warning)]" />}
                    </div>
                  </div>
                  <h3 className="text-[13px] font-bold text-[var(--text-primary)] mb-0.5">{p.name}</h3>
                  <p className="text-[10px] text-[var(--text-muted)] mb-3 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-base font-bold text-[var(--text-primary)]">{formatCurrency(p.price)}</span>
                    {p.comparePrice && <span className="font-mono text-[11px] text-[var(--text-muted)] line-through">{formatCurrency(p.comparePrice)}</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { l: 'Revenue', v: formatCurrency(p.revenue) },
                      { l: 'Sales',   v: p.sales.toString() },
                      { l: 'Margin',  v: `${p.margin}%` },
                    ].map(s => (
                      <div key={s.l} className="text-center p-2 rounded-xl bg-[var(--bg-elevated)]">
                        <p className="font-mono text-[11px] font-bold text-[var(--text-primary)]">{s.v}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <StarRating rating={p.rating} reviews={p.reviews} />
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-[12px] text-[var(--text-muted)]">
            Showing <strong className="text-[var(--text-secondary)]">{filtered.length}</strong> of <strong className="text-[var(--text-secondary)]">{PRODUCTS.length}</strong> products
          </p>
          <div className="flex gap-1">
            {['←', '1', '→'].map((p, i) => (
              <button key={i} className={cn('w-8 h-8 rounded-lg text-[12px] font-semibold transition-all', p === '1' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]')}>{p}</button>
            ))}
          </div>
        </div>
      </Card>

      {detailProduct && <ProductModal product={detailProduct} onClose={() => setDetailProduct(null)} />}
    </div>
  )
}
