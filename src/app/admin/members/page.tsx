'use client'
import { useState }   from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Admin }       from '@/lib/adminApi'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable }   from '@/components/admin/DataTable'
import { Badge }       from '@/components/ui/Badge'

const STATUS_FILTERS = ['all', 'active', 'pending_verification', 'inactive', 'suspended']

export default function AdminMembersPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const qc = useQueryClient()

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['admin-members', statusFilter],
    queryFn:  () => Admin.members({
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit:  100,
    }).then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      Admin.setMemberStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-members'] }),
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Members</h1>
          <p className="text-sm text-gray-400 mt-1">{members.length} shown</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
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
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {isLoading
        ? <div className="text-sm text-gray-400">Loading…</div>
        : (
          <DataTable
            cols={[
              { key: 'name',   header: 'Name',    render: r => (
                <div>
                  <div className="font-medium text-gray-900">{r.fullName}</div>
                  <div className="text-xs text-gray-400">{r.email}</div>
                </div>
              )},
              { key: 'status', header: 'Account', width: '150px', render: r => <Badge status={r.accountStatus} /> },
              { key: 'sub',    header: 'Sub',     width: '130px', render: r => r.subscriptionStatus
                ? <Badge status={r.subscriptionStatus} />
                : <span className="text-xs text-gray-400">No sub</span>
              },
              { key: 'karma',  header: 'Karma',   width: '80px',  render: r => (
                <span className={r.karmaScore >= 4 ? 'text-green-700' : 'text-orange-700'}>
                  {r.karmaScore.toFixed(1)}
                </span>
              )},
              { key: 'tokens', header: 'Tokens',  width: '90px',  render: r => r.tokenBalance.toLocaleString() },
              { key: 'joined', header: 'Joined',  width: '100px', render: r => new Date(r.createdAt).toLocaleDateString() },
              { key: 'actions',header: '',         width: '140px', render: r => (
                <div className="flex gap-2">
                  {r.accountStatus !== 'suspended' && (
                    <button
                      onClick={e => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: 'suspended' }) }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Suspend
                    </button>
                  )}
                  {r.accountStatus === 'suspended' && (
                    <button
                      onClick={e => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: 'active' }) }}
                      className="text-xs text-green-700 hover:underline"
                    >
                      Reinstate
                    </button>
                  )}
                </div>
              )},
            ]}
            rows={members}
            keyFn={r => r.id}
          />
        )}
    </AdminLayout>
  )
}
