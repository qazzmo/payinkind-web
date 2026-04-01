'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Admin }       from '@/lib/adminApi'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable }   from '@/components/admin/DataTable'
import { Badge }       from '@/components/ui/Badge'

const STATUS_FILTERS = ['all', 'proposed', 'accepted', 'completed', 'cancelled', 'disputed']

export default function AdminExchangesPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const qc = useQueryClient()

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-exchanges', statusFilter],
    queryFn:  () => Admin.exchanges({
      status: statusFilter === 'all' ? undefined : statusFilter,
    }).then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      Admin.setExchangeStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-exchanges'] }),
  })

  const totalValue  = rows.reduce((s: number, r: any) => s + r.valueA + r.valueB, 0)
  const totalFees   = rows.reduce((s: number, r: any) => s + r.feeTotal, 0)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Exchanges</h1>
          <p className="text-sm text-gray-400 mt-1">
            {rows.length} shown · ${ totalValue.toFixed(2) } total value · ${ totalFees.toFixed(2) } fees
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              statusFilter === s
                ? 'bg-brand-400 text-white border-brand-400'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading
        ? <div className="text-sm text-gray-400">Loading…</div>
        : (
          <DataTable
            cols={[
              { key: 'id',      header: 'ID',      width: '100px', render: r => <span className="font-mono text-xs text-gray-400">{r.id.slice(0,8)}…</span> },
              { key: 'status',  header: 'Status',  width: '120px', render: r => <Badge status={r.status} /> },
              { key: 'valueA',  header: 'Value A', width: '90px',  render: r => `$${Number(r.valueA).toFixed(2)}` },
              { key: 'valueB',  header: 'Value B', width: '90px',  render: r => `$${Number(r.valueB).toFixed(2)}` },
              { key: 'cash',    header: 'Cash',    width: '80px',  render: r => r.cashTopUp > 0 ? `$${Number(r.cashTopUp).toFixed(2)}` : '—' },
              { key: 'fee',     header: 'Fee',     width: '80px',  render: r => `$${Number(r.feeTotal).toFixed(2)}` },
              { key: 'date',    header: 'Date',    width: '100px', render: r => new Date(r.createdAt).toLocaleDateString() },
              { key: 'actions', header: '',         width: '150px', render: r => (
                <div className="flex gap-2">
                  {r.status === 'disputed' && (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: 'completed' }) }}
                        className="text-xs text-green-700 hover:underline"
                      >Resolve</button>
                      <button
                        onClick={e => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: 'cancelled' }) }}
                        className="text-xs text-red-600 hover:underline"
                      >Cancel</button>
                    </>
                  )}
                </div>
              )},
            ]}
            rows={rows}
            keyFn={r => r.id}
          />
        )}
    </AdminLayout>
  )
}
