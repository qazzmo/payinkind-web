'use client'
import { useState }  from 'react'
import { useQuery }  from '@tanstack/react-query'
import { Admin }     from '@/lib/adminApi'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable }   from '@/components/admin/DataTable'
import { Badge }       from '@/components/ui/Badge'
import { StatCard }    from '@/components/admin/StatCard'

const TX_TYPES = ['all','purchase','transfer_in','transfer_out','redeem','exchange_fee','subscription_payment']

export default function AdminTokensPage() {
  const [txFilter, setTxFilter] = useState('all')

  const { data: ledger = [] } = useQuery({
    queryKey: ['admin-ledger', txFilter],
    queryFn:  () => Admin.tokenLedger({
      txType: txFilter === 'all' ? undefined : txFilter,
    }).then(r => r.data),
  })

  const { data: check } = useQuery({
    queryKey: ['admin-ledger-check'],
    queryFn:  () => Admin.ledgerCheck().then(r => r.data),
    refetchInterval: 60_000,
  })

  const totalCredits = ledger.filter((t: any) => t.tokenAmount > 0).reduce((s: number, t: any) => s + t.tokenAmount, 0)
  const totalDebits  = ledger.filter((t: any) => t.tokenAmount < 0).reduce((s: number, t: any) => s + Math.abs(t.tokenAmount), 0)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl">Token ledger</h1>
        <p className="text-sm text-gray-400 mt-1">Every token movement across the platform</p>
      </div>

      {/* Balance check */}
      {check && (
        <div className={`rounded-xl border px-4 py-3 mb-5 text-sm font-medium ${
          check.balanced
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {check.balanced
            ? `✓ Ledger balanced — ${check.totalIssued.toLocaleString()} tokens issued, ${check.totalInWallets.toLocaleString()} in wallets`
            : `⚠ Ledger mismatch — ${check.totalIssued.toLocaleString()} issued vs ${check.totalInWallets.toLocaleString()} in wallets`
          }
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Tokens in view (credits)" value={totalCredits.toLocaleString()} accent="green" />
        <StatCard label="Tokens in view (debits)"  value={totalDebits.toLocaleString()}  accent="amber" />
        <StatCard label="Net"                       value={(totalCredits - totalDebits).toLocaleString()} accent="blue" />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TX_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTxFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              txFilter === t
                ? 'bg-brand-400 text-white border-brand-400'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <DataTable
        cols={[
          { key: 'type',    header: 'Type',     width: '180px', render: r => <Badge status={r.txType} /> },
          { key: 'amount',  header: 'Tokens',   width: '100px', render: r => (
            <span className={r.tokenAmount > 0 ? 'text-green-700 font-medium' : 'text-orange-700 font-medium'}>
              {r.tokenAmount > 0 ? '+' : ''}{r.tokenAmount.toLocaleString()}
            </span>
          )},
          { key: 'cash',    header: 'Cash',     width: '100px', render: r => r.cashAmountCents
            ? `$${(r.cashAmountCents / 100).toFixed(2)}`
            : '—'
          },
          { key: 'fee',     header: 'Fee',      width: '90px',  render: r => r.feeCents
            ? `$${(r.feeCents / 100).toFixed(2)}`
            : '—'
          },
          { key: 'note',    header: 'Note',     render: r => <span className="text-xs text-gray-500">{r.note ?? '—'}</span> },
          { key: 'date',    header: 'Date',     width: '110px', render: r => new Date(r.createdAt).toLocaleDateString() },
        ]}
        rows={ledger}
        keyFn={r => r.id}
      />
    </AdminLayout>
  )
}
