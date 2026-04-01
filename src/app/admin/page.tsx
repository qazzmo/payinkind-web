'use client'
import { useQuery } from '@tanstack/react-query'
import { Admin }     from '@/lib/adminApi'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StatCard }    from '@/components/admin/StatCard'
import { DataTable }   from '@/components/admin/DataTable'
import { Badge }       from '@/components/ui/Badge'

export default function AdminOverviewPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn:  () => Admin.metrics().then(r => r.data),
    refetchInterval: 30_000,
  })

  const { data: recentExchanges } = useQuery({
    queryKey: ['admin-exchanges-recent'],
    queryFn:  () => Admin.exchanges({ status: undefined }).then(r => r.data?.slice(0, 8)),
  })

  const { data: ledgerCheck } = useQuery({
    queryKey: ['admin-ledger-check'],
    queryFn:  () => Admin.ledgerCheck().then(r => r.data),
    refetchInterval: 60_000,
  })

  if (isLoading) return (
    <AdminLayout>
      <div className="text-gray-400 text-sm">Loading metrics…</div>
    </AdminLayout>
  )

  const m = metrics
  const mrrUsd = ((m?.revenue.mrrCents ?? 0) / 100).toFixed(0)
  const feesUsd = ((m?.revenue.totalFeesCents ?? 0) / 100).toFixed(2)

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl">Overview</h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {ledgerCheck && (
          <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            ledgerCheck.balanced ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {ledgerCheck.balanced ? '✓ Ledger balanced' : '⚠ Ledger mismatch'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total members"
          value={m?.users.total ?? 0}
          sub={`+${m?.users.newThisMonth ?? 0} this month`}
          accent="green"
        />
        <StatCard
          label="Active subscribers"
          value={m?.users.activeSubs ?? 0}
          sub={`MRR $${mrrUsd}`}
          accent="purple"
        />
        <StatCard
          label="Exchanges completed"
          value={m?.exchanges.completed ?? 0}
          sub={`${m?.exchanges.completionRate ?? 0}% completion rate`}
          accent="blue"
        />
        <StatCard
          label="Total fees collected"
          value={`$${feesUsd}`}
          sub={`${m?.exchanges.thisWeek ?? 0} exchanges this week`}
          accent="amber"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total exchanges"
          value={m?.exchanges.total ?? 0}
          accent="green"
        />
        <StatCard
          label="Token purchases"
          value={`$${((m?.revenue.tokenPurchaseCents ?? 0) / 100).toFixed(2)}`}
          sub="Gross token sales"
          accent="amber"
        />
        <StatCard
          label="Exchanges this week"
          value={m?.exchanges.thisWeek ?? 0}
          accent="blue"
        />
      </div>

      {/* Recent exchanges */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium text-gray-900">Recent exchanges</h2>
        <a href="/admin/exchanges" className="text-xs text-brand-400 hover:underline">View all</a>
      </div>
      <DataTable
        cols={[
          { key: 'id',       header: 'ID',       width: '120px', render: r => <span className="font-mono text-xs text-gray-400">{r.id.slice(0, 8)}…</span> },
          { key: 'status',   header: 'Status',   width: '120px', render: r => <Badge status={r.status} /> },
          { key: 'valueA',   header: 'Value A',  render: r => `$${r.valueA.toFixed(2)}` },
          { key: 'valueB',   header: 'Value B',  render: r => `$${r.valueB.toFixed(2)}` },
          { key: 'cashTopUp',header: 'Cash',     render: r => r.cashTopUp > 0 ? `$${r.cashTopUp.toFixed(2)}` : '—' },
          { key: 'feeTotal', header: 'Fee',      render: r => `$${r.feeTotal.toFixed(2)}` },
          { key: 'createdAt',header: 'Created',  render: r => new Date(r.createdAt).toLocaleDateString() },
        ]}
        rows={recentExchanges ?? []}
        keyFn={r => r.id}
      />
    </AdminLayout>
  )
}
