import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Tooltip } from '@/components/ui/Tooltip'
import {
  LayoutDashboard, Activity, ShoppingBag, Users,
  Package, FileText, Zap, Settings, LogOut, ChevronRight
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  badge?: string | number
  section?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, section: 'Main' },
  { id: 'analytics',   label: 'Analytics',    icon: Activity },
  { id: 'orders',      label: 'Orders',       icon: ShoppingBag, badge: 24 },
  { id: 'customers',   label: 'Customers',    icon: Users },
  { id: 'products',    label: 'Products',     icon: Package, section: 'Management' },
  { id: 'reports',     label: 'Reports',      icon: FileText },
  { id: 'integrations',label: 'Integrations', icon: Zap },
  { id: 'settings',    label: 'Settings',     icon: Settings, section: 'System' },
]

interface SidebarProps {
  collapsed: boolean
  activePage: string
  onNavigate: (page: string) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, activePage, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  const sidebarWidth = collapsed ? '68px' : '260px'

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[95] md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        style={{ width: sidebarWidth }}
        className={cn(
          'fixed left-0 top-0 h-full z-[100] flex flex-col',
          'bg-[var(--bg-surface)] border-r border-[var(--border)]',
          'transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'overflow-hidden',
          // Mobile
          'max-md:translate-x-[-100%] max-md:w-[260px]',
          mobileOpen && 'max-md:translate-x-0 max-md:shadow-2xl',
        )}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center px-5 border-b border-[var(--border)] flex-shrink-0 gap-2.5"
          style={{ minHeight: '64px' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 0 16px var(--accent-glow)',
            }}
          >
            A
          </div>
          <span
            className="text-lg font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] bg-clip-text text-transparent whitespace-nowrap transition-[opacity,width] duration-200"
            style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto', overflow: 'hidden' }}
          >
            Aurum
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 scrollbar-none">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activePage === item.id
            const Icon = item.icon
            const showSection = item.section && !collapsed

            return (
              <div key={item.id}>
                {item.section && (
                  <div
                    className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] px-2.5 pt-3 pb-1 whitespace-nowrap transition-opacity duration-200"
                    style={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 'auto', overflow: 'hidden' }}
                  >
                    {item.section}
                  </div>
                )}
                {collapsed ? (
                  <Tooltip content={item.label} position="right">
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        'w-full flex items-center justify-center h-10 rounded-xl mb-0.5 transition-all duration-150',
                        isActive ? 'nav-active' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      <Icon size={17} />
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 h-10 rounded-xl mb-0.5 transition-all duration-150 text-left overflow-hidden',
                      isActive ? 'nav-active' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] font-bold bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-2.5 border-t border-[var(--border)]">
          <div className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-[var(--bg-elevated)] transition-all overflow-hidden">
            <Avatar initials="JD" size="md" />
            <div
              className="flex-1 min-w-0 transition-[opacity,width] duration-200"
              style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto', overflow: 'hidden' }}
            >
              <div className="text-[13px] font-semibold text-[var(--text-primary)] whitespace-nowrap">Jane Doe</div>
              <div className="text-[11px] text-[var(--text-muted)]">Super Admin</div>
            </div>
            {!collapsed && (
              <LogOut size={14} className="text-[var(--text-muted)] flex-shrink-0 ml-auto" />
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
