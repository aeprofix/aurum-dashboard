import { useState } from 'react'
import {
  User, Building2, Users, CreditCard, Key, Shield,
  Bell, Palette, Globe, Save, Eye, EyeOff, Copy,
  Plus, Trash2, Edit2, CheckCircle, AlertTriangle,
  RefreshCw, Download, Upload, LogOut, ChevronRight,
  Lock, Unlock, Mail, Smartphone, Monitor, Moon, Sun,
  Check, X, Camera
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { useTheme, type AccentColor } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsTab =
  | 'profile'
  | 'workspace'
  | 'team'
  | 'billing'
  | 'api'
  | 'security'
  | 'notifications'
  | 'appearance'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer'
  avatar: string
  status: 'active' | 'invited' | 'suspended'
  lastSeen: string
  gradient: boolean
}

interface ApiKey {
  id: string
  name: string
  prefix: string
  created: string
  lastUsed: string
  scopes: string[]
  active: boolean
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const TEAM_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Jane Doe',      email: 'jane@company.com',    role: 'Owner',  avatar: 'JD', status: 'active',   lastSeen: 'Now',        gradient: true  },
  { id: 'm2', name: 'Marcus Chen',   email: 'marcus@company.com',  role: 'Admin',  avatar: 'MC', status: 'active',   lastSeen: '2 hr ago',   gradient: false },
  { id: 'm3', name: 'Sarah Kim',     email: 'sarah@company.com',   role: 'Editor', avatar: 'SK', status: 'active',   lastSeen: '1 day ago',  gradient: true  },
  { id: 'm4', name: 'Tom Bradley',   email: 'tom@company.com',     role: 'Viewer', avatar: 'TB', status: 'active',   lastSeen: '3 days ago', gradient: false },
  { id: 'm5', name: 'Priya Nair',    email: 'priya@company.com',   role: 'Editor', avatar: 'PN', status: 'invited',  lastSeen: '—',          gradient: true  },
  { id: 'm6', name: 'Alex Johnson',  email: 'alex@company.com',    role: 'Viewer', avatar: 'AJ', status: 'suspended',lastSeen: '14 days ago',gradient: false },
]

const API_KEYS: ApiKey[] = [
  { id: 'k1', name: 'Production App',  prefix: 'aur_live_Kx8m…', created: '2025-01-15', lastUsed: '2 min ago', scopes: ['read', 'write', 'webhooks'], active: true  },
  { id: 'k2', name: 'Analytics SDK',   prefix: 'aur_live_Pq3n…', created: '2025-02-01', lastUsed: '1 hr ago',  scopes: ['read'],                     active: true  },
  { id: 'k3', name: 'CI/CD Pipeline',  prefix: 'aur_live_Zr7k…', created: '2025-03-10', lastUsed: '1 day ago', scopes: ['read', 'write'],            active: true  },
  { id: 'k4', name: 'Old Integration', prefix: 'aur_live_Wy2j…', created: '2024-08-20', lastUsed: '45 days ago',scopes: ['read'],                    active: false },
]

const ROLE_COLORS: Record<string, string> = {
  Owner:  'var(--accent)',
  Admin:  'var(--success)',
  Editor: 'var(--warning)',
  Viewer: 'var(--text-muted)',
}
const ROLE_BG: Record<string, string> = {
  Owner:  'var(--accent-soft)',
  Admin:  'rgba(0,212,170,0.12)',
  Editor: 'rgba(255,209,102,0.12)',
  Viewer: 'var(--bg-elevated)',
}

const STATUS_CFG: Record<string, { variant: 'success'|'warning'|'danger'; label: string }> = {
  active:    { variant: 'success', label: 'Active'    },
  invited:   { variant: 'warning', label: 'Invited'   },
  suspended: { variant: 'danger',  label: 'Suspended' },
}

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: User        },
  { id: 'workspace',     label: 'Workspace',     icon: Building2   },
  { id: 'team',          label: 'Team',          icon: Users       },
  { id: 'billing',       label: 'Billing',       icon: CreditCard  },
  { id: 'api',           label: 'API Keys',      icon: Key         },
  { id: 'security',      label: 'Security',      icon: Shield      },
  { id: 'notifications', label: 'Notifications', icon: Bell        },
  { id: 'appearance',    label: 'Appearance',    icon: Palette     },
]

// ─── Reusable setting row ──────────────────────────────────────────────────────

function SettingRow({
  label, description, children, divider = true,
}: { label: string; description?: string; children: React.ReactNode; divider?: boolean }) {
  return (
    <div className={cn('flex items-start justify-between gap-6 py-4', divider && 'border-b border-[var(--border)]')}>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn('w-10 h-6 rounded-full transition-all flex items-center px-0.5 flex-shrink-0', value ? 'bg-[var(--accent)]' : 'bg-[var(--bg-overlay)]')}
    >
      <div className={cn('w-5 h-5 rounded-full bg-white shadow transition-transform duration-200', value ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  )
}

// ─── Text Input ────────────────────────────────────────────────────────────────

function TextInput({ value, onChange, placeholder, type = 'text', className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-sans w-full',
        className
      )}
    />
  )
}

// ─── Invite Modal ──────────────────────────────────────────────────────────────

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole]   = useState('Editor')
  return (
    <Modal open={open} onClose={onClose} title="Invite Team Member" size="sm">
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Email Address</label>
          <TextInput value={email} onChange={setEmail} placeholder="colleague@company.com" type="email" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Role</label>
          <div className="grid grid-cols-2 gap-2">
            {['Admin', 'Editor', 'Viewer'].map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  'px-3 py-2.5 rounded-xl border text-[12px] font-semibold text-left transition-all',
                  role === r
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                )}
              >
                <span className="font-bold">{r}</span>
                <span className="block text-[10px] font-normal mt-0.5 opacity-70">
                  {r === 'Admin' ? 'Full access' : r === 'Editor' ? 'Edit content' : 'Read only'}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary"   size="md" className="flex-1" onClick={onClose} disabled={!email}>
            <Mail size={13} /> Send Invite
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const [name,     setName]     = useState('Jane Doe')
  const [email,    setEmail]    = useState('jane@company.com')
  const [bio,      setBio]      = useState('Super admin and co-founder at Aurum.')
  const [timezone, setTimezone] = useState('UTC+8 — Kuala Lumpur')
  const [saved,    setSaved]    = useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="space-y-1">
      {/* Avatar */}
      <div className="flex items-center gap-4 py-5 border-b border-[var(--border)]">
        <div className="relative">
          <Avatar initials="JD" size="xl" />
          <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
            <Camera size={11} />
          </button>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">Profile Photo</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">JPG, PNG or GIF. Max 2MB.</p>
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" size="sm"><Upload size={11} /> Upload</Button>
            <Button variant="ghost"     size="sm"><Trash2 size={11} /> Remove</Button>
          </div>
        </div>
      </div>

      <SettingRow label="Full Name" description="Your name as it appears across the platform.">
        <TextInput value={name} onChange={setName} className="w-52" />
      </SettingRow>
      <SettingRow label="Email Address" description="Sign-in email and where notifications are sent.">
        <TextInput value={email} onChange={setEmail} type="email" className="w-52" />
      </SettingRow>
      <SettingRow label="Bio" description="A short description shown on your profile.">
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={2}
          className="w-52 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-sans resize-none"
        />
      </SettingRow>
      <SettingRow label="Timezone" description="Used for scheduling and report timestamps." divider={false}>
        <select
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          className="h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] cursor-pointer font-sans w-52"
        >
          <option>UTC+8 — Kuala Lumpur</option>
          <option>UTC+0 — London</option>
          <option>UTC-5 — New York</option>
          <option>UTC+9 — Tokyo</option>
          <option>UTC+1 — Berlin</option>
        </select>
      </SettingRow>

      <div className="pt-4 flex gap-2">
        <Button variant="primary" size="md" onClick={save}>
          {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Changes</>}
        </Button>
        <Button variant="ghost" size="md">Discard</Button>
      </div>
    </div>
  )
}

// ─── Workspace Tab ────────────────────────────────────────────────────────────

function WorkspaceTab() {
  const [workspaceName, setWorkspaceName] = useState('Aurum Inc.')
  const [website, setWebsite]             = useState('https://aurum.io')
  const [industry, setIndustry]           = useState('SaaS / Technology')
  const [size, setSize]                   = useState('11–50 employees')

  return (
    <div className="space-y-1">
      <SettingRow label="Workspace Name" description="The name of your organisation displayed across the platform.">
        <TextInput value={workspaceName} onChange={setWorkspaceName} className="w-52" />
      </SettingRow>
      <SettingRow label="Website" description="Your company's public website URL.">
        <TextInput value={website} onChange={setWebsite} className="w-52" />
      </SettingRow>
      <SettingRow label="Industry" description="Used to tailor reports and benchmarks.">
        <select value={industry} onChange={e => setIndustry(e.target.value)} className="h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] outline-none cursor-pointer font-sans w-52">
          {['SaaS / Technology', 'E-commerce', 'Finance', 'Healthcare', 'Education', 'Other'].map(o => <option key={o}>{o}</option>)}
        </select>
      </SettingRow>
      <SettingRow label="Company Size" description="Number of employees in your organisation.">
        <select value={size} onChange={e => setSize(e.target.value)} className="h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] outline-none cursor-pointer font-sans w-52">
          {['1–10 employees', '11–50 employees', '51–200 employees', '201–1,000 employees', '1,000+ employees'].map(o => <option key={o}>{o}</option>)}
        </select>
      </SettingRow>
      <SettingRow label="Delete Workspace" description="Permanently delete your workspace and all data. This cannot be undone." divider={false}>
        <Button variant="danger" size="sm"><Trash2 size={12} /> Delete Workspace</Button>
      </SettingRow>
      <div className="pt-4">
        <Button variant="primary" size="md"><Save size={13} /> Save Changes</Button>
      </div>
    </div>
  )
}

// ─── Team Tab ──────────────────────────────────────────────────────────────────

function TeamTab() {
  const [members, setMembers] = useState(TEAM_MEMBERS)
  const [inviteOpen, setInviteOpen] = useState(false)

  function changeRole(id: string, role: TeamMember['role']) {
    setMembers(m => m.map(member => member.id === id ? { ...member, role } : member))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">Team Members</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{members.filter(m => m.status === 'active').length} active · {members.filter(m => m.status === 'invited').length} pending invite</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}><Plus size={12} /> Invite Member</Button>
      </div>

      <div className="space-y-2">
        {members.map(m => {
          const statusCfg = STATUS_CFG[m.status]
          return (
            <div key={m.id} className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all group">
              <Avatar initials={m.avatar} size="md" gradient={m.gradient} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-semibold text-[var(--text-primary)]">{m.name}</p>
                  {m.status !== 'active' && <Badge variant={statusCfg.variant} size="sm">{statusCfg.label}</Badge>}
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">{m.email}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                Last seen: {m.lastSeen}
              </div>
              <select
                value={m.role}
                onChange={e => changeRole(m.id, e.target.value as TeamMember['role'])}
                disabled={m.role === 'Owner'}
                className="h-8 px-2 rounded-lg border text-[11px] font-bold outline-none cursor-pointer font-sans disabled:cursor-default transition-colors"
                style={{
                  background: ROLE_BG[m.role],
                  color: ROLE_COLORS[m.role],
                  borderColor: ROLE_COLORS[m.role] + '30',
                }}
              >
                {['Owner','Admin','Editor','Viewer'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {m.role !== 'Owner' && (
                <button
                  onClick={() => setMembers(prev => prev.filter(x => x.id !== m.id))}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--danger)]"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  )
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────

function BillingTab() {
  const invoices = [
    { id: 'INV-2025-05', date: 'May 1, 2025',   amount: '$299.00', status: 'paid',    period: 'May 2025'   },
    { id: 'INV-2025-04', date: 'Apr 1, 2025',   amount: '$299.00', status: 'paid',    period: 'Apr 2025'   },
    { id: 'INV-2025-03', date: 'Mar 1, 2025',   amount: '$299.00', status: 'paid',    period: 'Mar 2025'   },
    { id: 'INV-2025-02', date: 'Feb 1, 2025',   amount: '$299.00', status: 'paid',    period: 'Feb 2025'   },
    { id: 'INV-2025-01', date: 'Jan 1, 2025',   amount: '$299.00', status: 'paid',    period: 'Jan 2025'   },
  ]

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="p-5 rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent-soft)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[var(--accent)] opacity-10 -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="default" size="md" className="mb-2">Current Plan</Badge>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Pro Plan</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">$299 / month · Renews June 1, 2025</p>
            <div className="flex gap-3 mt-3 flex-wrap">
              {['Unlimited projects', '48K active users', 'Priority support', 'Advanced analytics'].map(f => (
                <span key={f} className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                  <Check size={11} className="text-[var(--accent)]" />{f}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="primary"   size="sm">Upgrade to Enterprise</Button>
            <Button variant="secondary" size="sm">Manage Plan</Button>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Payment Method</p>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
          <div className="w-10 h-7 rounded-lg bg-gradient-to-br from-[#1a1f71] to-[#0070ba] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white">VISA</span>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-[var(--text-primary)]">Visa ending in 4242</p>
            <p className="text-[10px] text-[var(--text-muted)]">Expires 12/2027</p>
          </div>
          <Badge variant="success" dot size="sm">Default</Badge>
          <Button variant="ghost" size="sm"><Edit2 size={12} /></Button>
        </div>
        <Button variant="outline" size="sm" className="mt-2"><Plus size={12} /> Add Payment Method</Button>
      </div>

      {/* Invoice history */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Invoice History</p>
        <div className="space-y-1.5">
          {invoices.map(inv => (
            <div key={inv.id} className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all">
              <div className="w-8 h-8 rounded-xl bg-[rgba(0,212,170,0.12)] flex items-center justify-center">
                <CheckCircle size={14} className="text-[var(--success)]" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-[var(--text-primary)]">{inv.id}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{inv.date} · {inv.period}</p>
              </div>
              <span className="font-mono text-[13px] font-bold text-[var(--text-primary)]">{inv.amount}</span>
              <Button variant="ghost" size="sm"><Download size={12} /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── API Keys Tab ─────────────────────────────────────────────────────────────

function ApiKeysTab() {
  const [keys, setKeys]           = useState(API_KEYS)
  const [showKey, setShowKey]     = useState<string | null>(null)
  const [newKeyOpen, setNewKey]   = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [copied, setCopied]       = useState<string | null>(null)

  function copyKey(id: string) {
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  function toggleKey(id: string) {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, active: !k.active } : k))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">API Keys</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Manage authentication keys for API access.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setNewKey(true)}><Plus size={12} /> New Key</Button>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] flex items-start gap-3">
        <AlertTriangle size={14} className="text-[var(--warning)] mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-[var(--text-secondary)]">Never share API keys publicly. Treat them like passwords — rotate regularly and revoke unused keys.</p>
      </div>

      <div className="space-y-2">
        {keys.map(k => (
          <div
            key={k.id}
            className={cn(
              'p-4 rounded-2xl border transition-all',
              k.active ? 'border-[var(--border)] bg-[var(--bg-elevated)]' : 'border-dashed border-[var(--border)] opacity-60'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[12px] font-semibold text-[var(--text-primary)]">{k.name}</p>
                  <Badge variant={k.active ? 'success' : 'muted'} dot size="sm">{k.active ? 'Active' : 'Revoked'}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <code className="font-mono text-[11px] text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded">
                    {showKey === k.id ? 'aur_live_Kx8mN3p…FULL_KEY_HIDDEN' : k.prefix}
                  </code>
                  <button onClick={() => setShowKey(showKey === k.id ? null : k.id)} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    {showKey === k.id ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button onClick={() => copyKey(k.id)} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    {copied === k.id ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} />}
                  </button>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {k.scopes.map(s => (
                    <span key={s} className="text-[10px] font-mono font-semibold text-[var(--text-muted)] bg-[var(--bg-overlay)] px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <p className="text-[10px] text-[var(--text-muted)]">Created {k.created}</p>
                <p className="text-[10px] text-[var(--text-muted)]">Last used {k.lastUsed}</p>
                <div className="flex gap-1 justify-end mt-2">
                  <Toggle value={k.active} onChange={() => toggleKey(k.id)} />
                  <Button variant="danger" size="sm"><Trash2 size={11} /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={newKeyOpen} onClose={() => setNewKey(false)} title="Create New API Key" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Key Name</label>
            <TextInput value={newKeyName} onChange={setNewKeyName} placeholder="e.g. Mobile App, Webhook Server" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Permissions</label>
            <div className="space-y-2">
              {['Read', 'Write', 'Delete', 'Webhooks'].map(scope => (
                <label key={scope} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked={scope === 'Read'} className="accent-[var(--accent)] w-3.5 h-3.5" />
                  <span className="text-[12px] text-[var(--text-primary)]">{scope}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{scope === 'Read' ? '(recommended)' : ''}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setNewKey(false)}>Cancel</Button>
            <Button variant="primary"   size="md" className="flex-1" disabled={!newKeyName} onClick={() => setNewKey(false)}>
              <Key size={13} /> Generate Key
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const [mfaEnabled,     setMfa]      = useState(true)
  const [sessionTimeout, setSession]  = useState('30 days')
  const [loginAlerts,    setLoginAlerts] = useState(true)

  const sessions = [
    { device: 'MacBook Pro',        os: 'macOS 14',         location: 'Kuala Lumpur, MY', time: 'Active now',   icon: Monitor,     current: true  },
    { device: 'iPhone 15',          os: 'iOS 18',           location: 'Kuala Lumpur, MY', time: '2 hr ago',     icon: Smartphone,  current: false },
    { device: 'Windows Desktop',    os: 'Windows 11',       location: 'Singapore, SG',    time: '3 days ago',   icon: Monitor,     current: false },
  ]

  return (
    <div className="space-y-6">
      {/* Password */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Password</p>
        <div className="space-y-1">
          <SettingRow label="Current Password">
            <TextInput value="" onChange={() => {}} type="password" placeholder="••••••••" className="w-52" />
          </SettingRow>
          <SettingRow label="New Password">
            <TextInput value="" onChange={() => {}} type="password" placeholder="••••••••" className="w-52" />
          </SettingRow>
          <SettingRow label="Confirm Password" divider={false}>
            <TextInput value="" onChange={() => {}} type="password" placeholder="••••••••" className="w-52" />
          </SettingRow>
        </div>
        <Button variant="primary" size="sm" className="mt-3"><Lock size={12} /> Update Password</Button>
      </div>

      {/* 2FA */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Two-Factor Authentication</p>
        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-4">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', mfaEnabled ? 'bg-[rgba(0,212,170,0.12)]' : 'bg-[var(--bg-overlay)]')}>
            {mfaEnabled ? <Shield size={18} className="text-[var(--success)]" /> : <Unlock size={18} className="text-[var(--text-muted)]" />}
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-[var(--text-primary)]">{mfaEnabled ? '2FA is enabled' : '2FA is disabled'}</p>
            <p className="text-[11px] text-[var(--text-muted)]">Authenticator app (TOTP) · Backup codes available</p>
          </div>
          <Toggle value={mfaEnabled} onChange={setMfa} />
        </div>
      </div>

      {/* Settings */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Security Settings</p>
        <div className="space-y-1">
          <SettingRow label="Login Alerts" description="Get notified by email when a new device signs in.">
            <Toggle value={loginAlerts} onChange={setLoginAlerts} />
          </SettingRow>
          <SettingRow label="Session Timeout" description="Auto sign-out after period of inactivity." divider={false}>
            <select value={sessionTimeout} onChange={e => setSession(e.target.value)} className="h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] outline-none cursor-pointer font-sans">
              {['1 hour', '8 hours', '24 hours', '7 days', '30 days', 'Never'].map(o => <option key={o}>{o}</option>)}
            </select>
          </SettingRow>
        </div>
      </div>

      {/* Active sessions */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Active Sessions</p>
        <div className="space-y-2">
          {sessions.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-overlay)] flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-[var(--text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--text-primary)]">{s.device}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{s.os} · {s.location} · {s.time}</p>
                </div>
                {s.current
                  ? <Badge variant="success" dot size="sm">This device</Badge>
                  : <Button variant="danger" size="sm"><LogOut size={11} /> Revoke</Button>
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    email_orders:    true,  email_billing:   true,  email_security:  true,
    email_marketing: false, email_reports:   true,  push_orders:     true,
    push_billing:    false, push_security:   true,  push_reports:    false,
    push_marketing:  false, digest_daily:    false, digest_weekly:   true,
  })

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const sections = [
    {
      title: 'Email Notifications',
      icon: Mail,
      rows: [
        { key: 'email_orders',    label: 'New Orders',         desc: 'When a new order is placed' },
        { key: 'email_billing',   label: 'Billing Events',     desc: 'Payments, invoices, failures' },
        { key: 'email_security',  label: 'Security Alerts',    desc: 'New logins, suspicious activity' },
        { key: 'email_reports',   label: 'Scheduled Reports',  desc: 'Auto-generated report delivery' },
        { key: 'email_marketing', label: 'Product Updates',    desc: 'New features and announcements' },
      ],
    },
    {
      title: 'Push Notifications',
      icon: Bell,
      rows: [
        { key: 'push_orders',    label: 'New Orders',      desc: 'Real-time order alerts' },
        { key: 'push_security',  label: 'Security Alerts', desc: 'Immediate login notifications' },
        { key: 'push_billing',   label: 'Billing Events',  desc: 'Payment confirmations' },
        { key: 'push_reports',   label: 'Report Ready',    desc: 'When a report finishes generating' },
        { key: 'push_marketing', label: 'Product Updates', desc: 'Feature announcements' },
      ],
    },
    {
      title: 'Digest Emails',
      icon: RefreshCw,
      rows: [
        { key: 'digest_daily',  label: 'Daily Digest',  desc: 'Summary of daily activity at 9 AM' },
        { key: 'digest_weekly', label: 'Weekly Digest', desc: 'Weekly performance summary on Mondays' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {sections.map(section => {
        const Icon = section.icon
        return (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} className="text-[var(--accent)]" />
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">{section.title}</p>
            </div>
            <div className="space-y-0 rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] divide-y divide-[var(--border)]">
              {section.rows.map((row, i) => (
                <div key={row.key} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-overlay)] transition-colors">
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--text-primary)]">{row.label}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{row.desc}</p>
                  </div>
                  <Toggle value={prefs[row.key as keyof typeof prefs]} onChange={() => toggle(row.key as keyof typeof prefs)} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <Button variant="primary" size="md"><Save size={13} /> Save Preferences</Button>
    </div>
  )
}

// ─── Appearance Tab ────────────────────────────────────────────────────────────

function AppearanceTab() {
  const { mode, accent, setMode, setAccent } = useTheme()
  const [density, setDensity]   = useState<'comfortable' | 'compact'>('comfortable')
  const [fontSize, setFontSize] = useState('Medium')

  const ACCENTS: { id: AccentColor; hex: string; label: string }[] = [
    { id: 'purple',  hex: '#6c63ff', label: 'Purple'  },
    { id: 'emerald', hex: '#10b981', label: 'Emerald' },
    { id: 'rose',    hex: '#f43f5e', label: 'Rose'    },
    { id: 'amber',   hex: '#f59e0b', label: 'Amber'   },
    { id: 'blue',    hex: '#3b82f6', label: 'Blue'    },
  ]

  return (
    <div className="space-y-6">
      {/* Color mode */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Color Mode</p>
        <div className="grid grid-cols-2 gap-3">
          {(['dark', 'light'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer',
                mode === m ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:border-[var(--border-hover)]'
              )}
            >
              <div className={cn('w-12 h-8 rounded-lg flex items-center justify-center', m === 'dark' ? 'bg-[#0a0b0f]' : 'bg-[#f2f3f8]')}>
                {m === 'dark' ? <Moon size={16} className="text-[#f0f2f8]" /> : <Sun size={16} className="text-[#0f1117]" />}
              </div>
              <span className="text-[12px] font-semibold text-[var(--text-primary)] capitalize">{m} Mode</span>
              {mode === m && <Badge variant="default" size="sm"><Check size={9} /> Active</Badge>}
            </button>
          ))}
        </div>
      </div>

      {/* Accent */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Accent Color</p>
        <div className="flex gap-3 flex-wrap">
          {ACCENTS.map(a => (
            <button
              key={a.id}
              onClick={() => setAccent(a.id)}
              title={a.label}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={cn('w-9 h-9 rounded-full border-2 transition-all hover:scale-110', accent === a.id ? 'border-[var(--text-primary)] scale-110' : 'border-transparent')}
                style={{ background: a.hex, boxShadow: accent === a.id ? `0 0 0 3px var(--bg-surface), 0 0 0 5px ${a.hex}` : undefined }}
              />
              <span className="text-[9px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layout density */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Layout Density</p>
        <div className="grid grid-cols-2 gap-3">
          {(['comfortable', 'compact'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all',
                density === d ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:border-[var(--border-hover)]'
              )}
            >
              <div className="space-y-1">
                {d === 'comfortable'
                  ? [10,6,6].map((w,i) => <div key={i} className="h-1.5 rounded bg-[var(--border)]" style={{ width: w*4 }} />)
                  : [10,6,6,8].map((w,i) => <div key={i} className="h-1 rounded bg-[var(--border)]" style={{ width: w*4 }} />)
                }
              </div>
              <span className="text-[12px] font-semibold text-[var(--text-primary)] capitalize">{d}</span>
              {density === d && <Check size={13} className="text-[var(--accent)] ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Font Size</p>
        <div className="flex gap-2">
          {['Small', 'Medium', 'Large'].map(s => (
            <button
              key={s}
              onClick={() => setFontSize(s)}
              className={cn(
                'flex-1 py-2 rounded-xl border text-[12px] font-semibold transition-all',
                fontSize === s ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Button variant="primary" size="md"><Save size={13} /> Save Appearance</Button>
    </div>
  )
}

// ─── Main Settings Page ────────────────────────────────────────────────────────

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const ActiveTabContent = {
    profile:       ProfileTab,
    workspace:     WorkspaceTab,
    team:          TeamTab,
    billing:       BillingTab,
    api:           ApiKeysTab,
    security:      SecurityTab,
    notifications: NotificationsTab,
    appearance:    AppearanceTab,
  }[activeTab]

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Configure your workspace, team permissions, billing, and API keys.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-52 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left whitespace-nowrap transition-all text-[12px] font-semibold w-full',
                    activeTab === tab.id
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  {tab.label}
                  {tab.id === 'security' && <span className="ml-auto w-2 h-2 rounded-full bg-[var(--warning)] flex-shrink-0" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <Card className="flex-1 p-6 min-h-[500px]">
          <ActiveTabContent />
        </Card>
      </div>
    </div>
  )
}
