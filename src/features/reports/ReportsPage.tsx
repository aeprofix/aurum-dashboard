import { useState, useMemo } from 'react'
import {
  FileText, Download, Calendar, Clock, RefreshCw, Plus,
  TrendingUp, Users, ShoppingBag, DollarSign, BarChart2,
  CheckCircle, AlertCircle, Loader, Search, Filter,
  Mail, Trash2, Edit2, Play, Pause, Eye, ChevronDown,
  ArrowUpRight, FileSpreadsheet, FilePieChart, FileBarChart,
  Bell, Star
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn, formatCurrency } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportStatus = 'ready' | 'generating' | 'failed' | 'scheduled'
type ReportFormat = 'PDF' | 'CSV' | 'XLSX'
type ReportCategory = 'Revenue' | 'Users' | 'Orders' | 'Marketing' | 'Custom'
type ScheduleFreq = 'daily' | 'weekly' | 'monthly'

interface Report {
  id: string
  name: string
  description: string
  category: ReportCategory
  format: ReportFormat
  status: ReportStatus
  size: string
  createdAt: string
  generatedAt: string
  icon: React.ElementType
  starred: boolean
  downloads: number
}

interface ScheduledReport {
  id: string
  name: string
  frequency: ScheduleFreq
  nextRun: string
  recipients: string[]
  format: ReportFormat
  active: boolean
  category: ReportCategory
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const REPORTS: Report[] = [
  { id: 'r1',  name: 'Monthly Revenue Summary',      description: 'Full breakdown of revenue, MRR, ARR, and growth metrics.',          category: 'Revenue',   format: 'PDF',  status: 'ready',      size: '2.4 MB', createdAt: '2025-05-01', generatedAt: '2025-05-06 09:00', icon: DollarSign,    starred: true,  downloads: 48 },
  { id: 'r2',  name: 'Customer LTV Analysis',        description: 'Lifetime value distribution, cohort comparison, and segments.',     category: 'Users',     format: 'PDF',  status: 'ready',      size: '3.1 MB', createdAt: '2025-05-01', generatedAt: '2025-05-06 08:30', icon: Users,         starred: true,  downloads: 32 },
  { id: 'r3',  name: 'Orders Export (May 2025)',     description: 'All orders with status, customer, and product detail.',             category: 'Orders',    format: 'CSV',  status: 'ready',      size: '840 KB', createdAt: '2025-05-01', generatedAt: '2025-05-06 08:00', icon: ShoppingBag,   starred: false, downloads: 71 },
  { id: 'r4',  name: 'Conversion Funnel Report',    description: 'Visitor-to-paid funnel with drop-off analysis per channel.',        category: 'Marketing', format: 'PDF',  status: 'ready',      size: '1.8 MB', createdAt: '2025-05-01', generatedAt: '2025-05-05 18:00', icon: BarChart2,     starred: false, downloads: 19 },
  { id: 'r5',  name: 'Product Performance XLSX',    description: 'Revenue, margin, and sales per product and variant.',               category: 'Revenue',   format: 'XLSX', status: 'ready',      size: '1.2 MB', createdAt: '2025-05-01', generatedAt: '2025-05-05 14:00', icon: FileBarChart,  starred: true,  downloads: 27 },
  { id: 'r6',  name: 'User Growth Report Q1',       description: 'New signups, churn, and net growth across Q1 2025.',               category: 'Users',     format: 'PDF',  status: 'ready',      size: '2.0 MB', createdAt: '2025-04-01', generatedAt: '2025-04-07 10:00', icon: TrendingUp,    starred: false, downloads: 55 },
  { id: 'r7',  name: 'Campaign ROI Export',         description: 'Marketing spend vs. revenue attribution by campaign.',             category: 'Marketing', format: 'CSV',  status: 'ready',      size: '420 KB', createdAt: '2025-05-01', generatedAt: '2025-05-04 11:30', icon: FilePieChart,  starred: false, downloads: 14 },
  { id: 'r8',  name: 'Executive Dashboard PDF',     description: 'High-level KPIs and charts for leadership review.',                category: 'Custom',    format: 'PDF',  status: 'generating', size: '—',      createdAt: '2025-05-06', generatedAt: '—',              icon: FileText,      starred: false, downloads: 0  },
  { id: 'r9',  name: 'Refund & Chargeback Log',     description: 'All refund and chargeback events with reason codes.',             category: 'Orders',    format: 'CSV',  status: 'failed',     size: '—',      createdAt: '2025-05-05', generatedAt: '—',              icon: AlertCircle,   starred: false, downloads: 0  },
  { id: 'r10', name: 'API Usage Statistics',        description: 'API call volume, latency, and error rates per endpoint.',         category: 'Custom',    format: 'XLSX', status: 'ready',      size: '640 KB', createdAt: '2025-05-01', generatedAt: '2025-05-03 16:00', icon: FileSpreadsheet, starred: false, downloads: 9 },
]

const SCHEDULED: ScheduledReport[] = [
  { id: 's1', name: 'Weekly Revenue Digest',      frequency: 'weekly',  nextRun: '2025-05-12', recipients: ['ceo@company.com', 'cfo@company.com'],      format: 'PDF',  active: true,  category: 'Revenue'   },
  { id: 's2', name: 'Daily Orders CSV',           frequency: 'daily',   nextRun: '2025-05-07', recipients: ['ops@company.com'],                          format: 'CSV',  active: true,  category: 'Orders'    },
  { id: 's3', name: 'Monthly User Report',        frequency: 'monthly', nextRun: '2025-06-01', recipients: ['growth@company.com', 'ceo@company.com'],    format: 'PDF',  active: true,  category: 'Users'     },
  { id: 's4', name: 'Monthly Marketing Summary',  frequency: 'monthly', nextRun: '2025-06-01', recipients: ['marketing@company.com'],                    format: 'XLSX', active: false, category: 'Marketing' },
]

const FORMAT_COLORS: Record<ReportFormat, string> = { PDF: '#f43f5e', CSV: '#10b981', XLSX: '#3b82f6' }
const FORMAT_BG: Record<ReportFormat, string>     = { PDF: 'rgba(244,63,94,0.12)', CSV: 'rgba(16,185,129,0.12)', XLSX: 'rgba(59,130,246,0.12)' }
const CAT_COLORS: Record<ReportCategory, string>  = { Revenue: '#6c63ff', Users: '#00d4aa', Orders: '#f59e0b', Marketing: '#f43f5e', Custom: '#8b92a8' }

const STATUS_CFG: Record<ReportStatus, { label: string; variant: 'success'|'info'|'danger'|'warning'; icon: React.ElementType }> = {
  ready:      { label: 'Ready',      variant: 'success', icon: CheckCircle },
  generating: { label: 'Generating', variant: 'info',    icon: Loader      },
  failed:     { label: 'Failed',     variant: 'danger',  icon: AlertCircle },
  scheduled:  { label: 'Scheduled',  variant: 'warning', icon: Clock       },
}

const FREQ_LABEL: Record<ScheduleFreq, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }

// Chart data
const volumeData = [
  { month: 'Nov', reports: 28 }, { month: 'Dec', reports: 34 },
  { month: 'Jan', reports: 42 }, { month: 'Feb', reports: 38 },
  { month: 'Mar', reports: 55 }, { month: 'Apr', reports: 61 },
  { month: 'May', reports: 44 },
]
const formatDist = [
  { name: 'PDF',  value: 52, color: '#f43f5e' },
  { name: 'CSV',  value: 31, color: '#10b981' },
  { name: 'XLSX', value: 17, color: '#3b82f6' },
]

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

const ChartTip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl px-3 py-2 text-[12px]">
      <p className="text-[var(--text-muted)] text-[10px] mb-0.5">{label}</p>
      <p className="font-bold text-[var(--text-primary)]">{payload[0].value} reports</p>
    </div>
  ) : null

// ─── New Report Modal ──────────────────────────────────────────────────────────

function NewReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep]           = useState(1)
  const [selectedType, setType]   = useState<ReportCategory | ''>('')
  const [selectedFmt, setFmt]     = useState<ReportFormat | ''>('')
  const [reportName, setName]     = useState('')
  const [scheduleOn, setSchedule] = useState(false)

  const TYPES: { cat: ReportCategory; icon: React.ElementType; desc: string }[] = [
    { cat: 'Revenue',   icon: DollarSign,  desc: 'MRR, ARR, revenue breakdown' },
    { cat: 'Users',     icon: Users,       desc: 'Growth, churn, LTV analysis' },
    { cat: 'Orders',    icon: ShoppingBag, desc: 'Order history and status'     },
    { cat: 'Marketing', icon: TrendingUp,  desc: 'Campaigns, ROI, attribution'  },
    { cat: 'Custom',    icon: FileText,    desc: 'Build your own report'        },
  ]

  function reset() { setStep(1); setType(''); setFmt(''); setName(''); setSchedule(false) }

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} title="Generate New Report" size="md">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all',
              step >= s ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
            )}>{s}</div>
            {s < 3 && <div className={cn('flex-1 h-0.5 rounded transition-all', step > s ? 'bg-[var(--accent)]' : 'bg-[var(--border)]')} />}
          </div>
        ))}
      </div>

      {/* Step 1 – Report type */}
      {step === 1 && (
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Choose report type</p>
          <div className="grid grid-cols-1 gap-2">
            {TYPES.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.cat}
                  onClick={() => setType(t.cat)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all',
                    selectedType === t.cat
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-elevated)]'
                  )}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: CAT_COLORS[t.cat] + '20', color: CAT_COLORS[t.cat] }}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--text-primary)]">{t.cat}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{t.desc}</p>
                  </div>
                  {selectedType === t.cat && <CheckCircle size={15} className="ml-auto text-[var(--accent)] flex-shrink-0" />}
                </button>
              )
            })}
          </div>
          <Button variant="primary" size="md" className="w-full mt-4" onClick={() => setStep(2)} disabled={!selectedType}>
            Next — Choose Format
          </Button>
        </div>
      )}

      {/* Step 2 – Format + name */}
      {step === 2 && (
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Format & details</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['PDF', 'CSV', 'XLSX'] as ReportFormat[]).map(f => (
              <button
                key={f}
                onClick={() => setFmt(f)}
                className={cn(
                  'flex flex-col items-center gap-2 py-4 rounded-2xl border text-center transition-all',
                  selectedFmt === f ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]'
                )}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: FORMAT_BG[f] }}>
                  <FileText size={16} style={{ color: FORMAT_COLORS[f] }} />
                </div>
                <span className="text-[12px] font-bold" style={{ color: FORMAT_COLORS[f] }}>{f}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{f === 'PDF' ? 'Formatted' : f === 'CSV' ? 'Raw data' : 'Spreadsheet'}</span>
              </button>
            ))}
          </div>
          <div className="mb-4">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Report Name</label>
            <input
              value={reportName}
              onChange={e => setName(e.target.value)}
              placeholder={`${selectedType} Report — May 2025`}
              className="w-full h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-sans"
            />
          </div>
          <label className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all', scheduleOn ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--bg-elevated)]')}>
            <input type="checkbox" checked={scheduleOn} onChange={e => setSchedule(e.target.checked)} className="accent-[var(--accent)]" />
            <div>
              <p className="text-[12px] font-semibold text-[var(--text-primary)]">Schedule recurring</p>
              <p className="text-[10px] text-[var(--text-muted)]">Auto-generate and email this report</p>
            </div>
          </label>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="primary"   size="md" className="flex-1" onClick={() => setStep(3)} disabled={!selectedFmt}>
              Next — Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 – Review */}
      {step === 3 && (
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Review & generate</p>
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 mb-5">
            {[
              { label: 'Type',     value: selectedType },
              { label: 'Format',   value: selectedFmt, color: FORMAT_COLORS[selectedFmt as ReportFormat] },
              { label: 'Name',     value: reportName || `${selectedType} Report — May 2025` },
              { label: 'Schedule', value: scheduleOn ? 'Weekly auto-generate' : 'One-time' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-[12px]">
                <span className="text-[var(--text-muted)]">{row.label}</span>
                <span className="font-semibold text-[var(--text-primary)]" style={{ color: (row as any).color }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="primary"   size="md" className="flex-1" onClick={() => { onClose(); reset() }}>
              <Play size={13} /> Generate Report
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Report Row ────────────────────────────────────────────────────────────────

function ReportRow({ report, onPreview }: { report: Report; onPreview: () => void }) {
  const [starred, setStarred] = useState(report.starred)
  const cfg = STATUS_CFG[report.status]
  const StatusIcon = cfg.icon

  return (
    <tr className="border-b border-[var(--border)] last:border-none hover:bg-[var(--bg-elevated)] transition-colors cursor-default group">
      <td className="py-3 px-3">
        <button onClick={() => setStarred(s => !s)} className="transition-colors">
          <Star size={13} className={cn('transition-colors', starred ? 'fill-[var(--warning)] text-[var(--warning)]' : 'text-[var(--border-hover)] hover:text-[var(--warning)]')} />
        </button>
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: CAT_COLORS[report.category] + '18' }}>
            <report.icon size={16} style={{ color: CAT_COLORS[report.category] }} />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-primary)]">{report.name}</p>
            <p className="text-[10px] text-[var(--text-muted)] max-w-[280px] truncate">{report.description}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-2">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: CAT_COLORS[report.category] + '18', color: CAT_COLORS[report.category] }}>
          {report.category}
        </span>
      </td>
      <td className="py-3 px-2">
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: FORMAT_BG[report.format], color: FORMAT_COLORS[report.format] }}>
          {report.format}
        </span>
      </td>
      <td className="py-3 px-2">
        <Badge variant={cfg.variant} dot size="sm">
          {report.status === 'generating'
            ? <span className="flex items-center gap-1"><Loader size={9} className="animate-spin" /> {cfg.label}</span>
            : cfg.label}
        </Badge>
      </td>
      <td className="py-3 px-2 hidden lg:table-cell">
        <span className="text-[11px] text-[var(--text-muted)]">{report.generatedAt !== '—' ? report.generatedAt.split(' ')[0] : '—'}</span>
      </td>
      <td className="py-3 px-2 hidden xl:table-cell">
        <span className="font-mono text-[11px] text-[var(--text-muted)]">{report.size}</span>
      </td>
      <td className="py-3 px-2">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {report.status === 'ready' && (
            <>
              <button onClick={onPreview} className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all" title="Preview">
                <Eye size={12} />
              </button>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--accent)] text-white hover:opacity-90 transition-all" title="Download">
                <Download size={12} />
              </button>
            </>
          )}
          {report.status === 'failed' && (
            <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-overlay)] text-[var(--danger)] hover:bg-[rgba(255,95,109,0.1)] transition-all" title="Retry">
              <RefreshCw size={12} />
            </button>
          )}
          <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[rgba(255,95,109,0.1)] transition-all" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const [newOpen, setNewOpen]         = useState(false)
  const [search, setSearch]           = useState('')
  const [catFilter, setCatFilter]     = useState<ReportCategory | 'all'>('all')
  const [fmtFilter, setFmtFilter]     = useState<ReportFormat | 'all'>('all')
  const [previewReport, setPreview]   = useState<Report | null>(null)
  const [scheduledList, setScheduled] = useState(SCHEDULED)

  const filtered = useMemo(() => REPORTS.filter(r => {
    const ms = !search || r.name.toLowerCase().includes(search.toLowerCase())
    const mc = catFilter === 'all' || r.category === catFilter
    const mf = fmtFilter === 'all' || r.format === fmtFilter
    return ms && mc && mf
  }), [search, catFilter, fmtFilter])

  const readyCount      = REPORTS.filter(r => r.status === 'ready').length
  const scheduledCount  = SCHEDULED.filter(s => s.active).length
  const totalDownloads  = REPORTS.reduce((s, r) => s + r.downloads, 0)
  const generatingCount = REPORTS.filter(r => r.status === 'generating').length

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Reports & Exports</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Generate, schedule, and export detailed business reports.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm"><RefreshCw size={12} /> Refresh</Button>
          <Button variant="primary"   size="sm" onClick={() => setNewOpen(true)}><Plus size={12} /> New Report</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Reports Ready',    value: readyCount.toString(),       icon: CheckCircle, color: 'var(--success)', change: 'Available now' },
          { label: 'Scheduled Active', value: scheduledCount.toString(),   icon: Calendar,    color: 'var(--accent)',  change: 'Auto-running'  },
          { label: 'Total Downloads',  value: totalDownloads.toString(),   icon: Download,    color: 'var(--warning)', change: 'All time'      },
          { label: 'Generating Now',   value: generatingCount.toString(),  icon: Loader,      color: 'var(--info)',    change: 'In queue'      },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-4 hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '18' }}>
                  <Icon size={16} style={{ color: s.color }} className={s.label === 'Generating Now' && generatingCount > 0 ? 'animate-spin' : ''} />
                </div>
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{s.value}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{s.change}</p>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mb-6">
        {/* Volume chart */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Report Generation Volume</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Reports generated per month</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={volumeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="vgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Sora' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="reports" stroke="var(--accent)" strokeWidth={2} fill="url(#vgrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Format distribution */}
        <Card className="p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Format Distribution</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Report types breakdown</p>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={formatDist} cx="50%" cy="50%" innerRadius={30} outerRadius={46} dataKey="value" strokeWidth={0} paddingAngle={3}>
                  {formatDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {formatDist.map(d => (
                <div key={d.name}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[11px] font-semibold" style={{ color: d.color }}>{d.name}</span>
                    <span className="text-[11px] font-mono font-bold text-[var(--text-primary)]">{d.value}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Reports table */}
      <Card className="p-5 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…"
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-sans" />
          </div>
          <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl flex-shrink-0 flex-wrap">
            {(['all', 'Revenue', 'Users', 'Orders', 'Marketing', 'Custom'] as const).map(c => (
              <button key={c} onClick={() => setCatFilter(c as any)}
                className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all', catFilter === c ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl flex-shrink-0">
            {(['all', 'PDF', 'CSV', 'XLSX'] as const).map(f => (
              <button key={f} onClick={() => setFmtFilter(f as any)}
                className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all', fmtFilter === f ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-3 pl-3 pr-2 w-8" />
                <th className="pb-3 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Report</th>
                <th className="pb-3 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Category</th>
                <th className="pb-3 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Format</th>
                <th className="pb-3 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="pb-3 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] hidden lg:table-cell">Generated</th>
                <th className="pb-3 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] hidden xl:table-cell">Size</th>
                <th className="pb-3 px-2 w-24" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-[var(--text-muted)] text-sm">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" /><p>No reports match your filters.</p>
                </td></tr>
              ) : filtered.map(r => (
                <ReportRow key={r.id} report={r} onPreview={() => setPreview(r)} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Scheduled reports */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Scheduled Reports</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Auto-generate and email reports on a schedule</p>
          </div>
          <Button variant="outline" size="sm"><Plus size={12} /> Add Schedule</Button>
        </div>
        <div className="space-y-2">
          {scheduledList.map(s => (
            <div key={s.id} className={cn(
              'flex items-center gap-4 p-4 rounded-2xl border transition-all',
              s.active ? 'border-[var(--border)] bg-[var(--bg-elevated)]' : 'border-dashed border-[var(--border)] opacity-60'
            )}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: CAT_COLORS[s.category] + '18' }}>
                <Calendar size={15} style={{ color: CAT_COLORS[s.category] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[var(--text-primary)]">{s.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1"><RefreshCw size={9} />{FREQ_LABEL[s.frequency]}</span>
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1"><Clock size={9} />Next: {s.nextRun}</span>
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1"><Mail size={9} />{s.recipients.length} recipients</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: FORMAT_BG[s.format], color: FORMAT_COLORS[s.format] }}>{s.format}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setScheduled(prev => prev.map(r => r.id === s.id ? { ...r, active: !r.active } : r))}
                  className={cn('w-8 h-5 rounded-full transition-all flex items-center px-0.5', s.active ? 'bg-[var(--accent)]' : 'bg-[var(--bg-overlay)]')}
                >
                  <div className={cn('w-4 h-4 rounded-full bg-white shadow transition-transform', s.active ? 'translate-x-3' : 'translate-x-0')} />
                </button>
                <button className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Edit2 size={13} /></button>
                <button className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <NewReportModal open={newOpen} onClose={() => setNewOpen(false)} />

      {/* Preview modal */}
      {previewReport && (
        <Modal open={!!previewReport} onClose={() => setPreview(null)} title={previewReport.name} size="md">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: CAT_COLORS[previewReport.category] + '18' }}>
                <previewReport.icon size={22} style={{ color: CAT_COLORS[previewReport.category] }} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[var(--text-primary)]">{previewReport.name}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{previewReport.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: 'Format',    v: previewReport.format,      c: FORMAT_COLORS[previewReport.format] },
                { l: 'Category',  v: previewReport.category,    c: CAT_COLORS[previewReport.category] },
                { l: 'Size',      v: previewReport.size,        c: undefined },
                { l: 'Generated', v: previewReport.generatedAt, c: undefined },
                { l: 'Downloads', v: previewReport.downloads.toString(), c: undefined },
              ].map(row => (
                <div key={row.l} className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                  <p className="text-[10px] text-[var(--text-muted)]">{row.l}</p>
                  <p className="text-[12px] font-semibold mt-0.5" style={{ color: row.c || 'var(--text-primary)' }}>{row.v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="primary"   size="md" className="flex-1"><Download size={13} /> Download {previewReport.format}</Button>
              <Button variant="secondary" size="md" className="flex-1"><Mail size={13} /> Email Report</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
