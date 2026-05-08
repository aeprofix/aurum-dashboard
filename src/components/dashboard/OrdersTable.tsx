import { useState } from 'react'
import { ordersData, type Order } from '@/lib/mockData'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const STATUS_MAP: Record<Order['status'], { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  completed:  { variant: 'success', label: 'Completed' },
  pending:    { variant: 'warning', label: 'Pending' },
  cancelled:  { variant: 'danger',  label: 'Cancelled' },
  processing: { variant: 'info',    label: 'Processing' },
}

interface OrdersTableProps {
  loading?: boolean
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex items-center gap-4 py-2">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-3 w-28 rounded" />
            <div className="skeleton h-2.5 w-20 rounded" />
          </div>
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function OrdersTable({ loading }: OrdersTableProps) {
  const [sortField, setSortField] = useState<keyof Order>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = [...ordersData].sort((a, b) => {
    const av = a[sortField] as string | number
    const bv = b[sortField] as string | number
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const handleSort = (field: keyof Order) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortBtn = ({ field, label }: { field: keyof Order; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
    >
      {label}
      {sortField === field && (
        <ChevronDown
          size={10}
          className={cn('transition-transform', sortDir === 'asc' && 'rotate-180')}
        />
      )}
    </button>
  )

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Orders</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{ordersData.length} orders this week</p>
        </div>
        <Button variant="outline" size="sm">
          View all <ArrowUpRight size={12} />
        </Button>
      </div>

      {loading ? <TableSkeleton /> : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left pb-3 px-1"><SortBtn field="id" label="Order" /></th>
                <th className="text-left pb-3 px-1"><SortBtn field="customer" label="Customer" /></th>
                <th className="text-left pb-3 px-1 hidden sm:table-cell"><SortBtn field="product" label="Product" /></th>
                <th className="text-left pb-3 px-1"><SortBtn field="amount" label="Amount" /></th>
                <th className="text-left pb-3 px-1"><SortBtn field="status" label="Status" /></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((order, i) => {
                const status = STATUS_MAP[order.status]
                return (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--border)] last:border-none hover:bg-[var(--bg-elevated)] transition-colors cursor-default group"
                  >
                    <td className="py-3 px-1">
                      <span className="font-mono text-[11px] text-[var(--accent)] font-semibold">
                        {order.id}
                      </span>
                    </td>
                    <td className="py-3 px-1">
                      <div className="flex items-center gap-2">
                        <Avatar initials={order.avatar} size="sm" gradient={i % 2 === 0} />
                        <span className="text-[12px] text-[var(--text-primary)] font-medium whitespace-nowrap">
                          {order.customer}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-1 hidden sm:table-cell">
                      <span className="text-[12px] text-[var(--text-secondary)]">{order.product}</span>
                    </td>
                    <td className="py-3 px-1">
                      <span className="font-mono text-[13px] font-bold text-[var(--text-primary)]">
                        {formatCurrency(order.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-1">
                      <Badge variant={status.variant} dot>{status.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
