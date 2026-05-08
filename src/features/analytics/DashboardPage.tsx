import { useState, useEffect } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { KPICards } from '@/components/dashboard/KPICards'
import { OrdersTable } from '@/components/dashboard/OrdersTable'
import { TopProducts, ActivityFeed } from '@/components/dashboard/FeedWidgets'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { TrafficChart } from '@/components/charts/TrafficChart'
import { Button } from '@/components/ui/Button'
import { kpiData } from '@/lib/mockData'

export function DashboardPage() {
  const [loading, setLoading] = useState(true)

  // Simulate async data load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="p-5 lg:p-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Good morning, Jane 👋
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm">
            <Calendar size={13} />
            May 2025
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={13} />
            New Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards data={kpiData} loading={loading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mb-4">
        {loading ? (
          <>
            <div className="card p-5">
              <div className="skeleton h-5 w-32 rounded mb-4" />
              <div className="skeleton w-full h-52 rounded-xl" />
            </div>
            <div className="card p-5">
              <div className="skeleton h-5 w-28 rounded mb-4" />
              <div className="skeleton w-full h-52 rounded-xl" />
            </div>
          </>
        ) : (
          <>
            <RevenueChart />
            <TrafficChart />
          </>
        )}
      </div>

      {/* Bottom Row: Orders + Side widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
        <OrdersTable loading={loading} />
        <div className="flex flex-col gap-4">
          {loading ? (
            <>
              <div className="card p-5 space-y-3">
                <div className="skeleton h-4 w-28 rounded" />
                {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 w-full rounded-xl" />)}
              </div>
              <div className="card p-5 space-y-3">
                <div className="skeleton h-4 w-24 rounded" />
                {[1,2,3,4].map(i => <div key={i} className="skeleton h-12 w-full rounded-xl" />)}
              </div>
            </>
          ) : (
            <>
              <TopProducts />
              <ActivityFeed />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
