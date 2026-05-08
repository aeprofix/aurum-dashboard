import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { DashboardPage } from '@/features/analytics/DashboardPage'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { OrdersPage } from '@/features/orders/OrdersPage'
import { CustomersPage } from '@/features/customers/CustomersPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { IntegrationsPage } from '@/features/integrations/IntegrationsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { useSidebar } from '@/hooks/useSidebar'
import { useCommandPalette } from '@/hooks/useCommandPalette'

const PAGES: Record<string, React.ComponentType> = {
  dashboard:    DashboardPage,
  analytics:    AnalyticsPage,
  orders:       OrdersPage,
  customers:    CustomersPage,
  products:     ProductsPage,
  reports:      ReportsPage,
  integrations: IntegrationsPage,
  settings:     SettingsPage,
}

export function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const { collapsed, toggle, mobileOpen, openMobile, closeMobile } = useSidebar()
  const { open: cmdOpen, openPalette, closePalette } = useCommandPalette()

  const sidebarW = collapsed ? 68 : 260

  const PageComponent = PAGES[activePage] || DashboardPage

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        activePage={activePage}
        onNavigate={(page) => { setActivePage(page); closeMobile() }}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />

      {/* Main content */}
      <div
        className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: `${sidebarW}px` }}
      >
        <Navbar
          onToggleSidebar={toggle}
          onOpenCmd={openPalette}
          onMobileMenuOpen={openMobile}
        />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <PageComponent />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={cmdOpen}
        onClose={closePalette}
        onNavigate={(page) => { setActivePage(page); closePalette() }}
      />
    </div>
  )
}
