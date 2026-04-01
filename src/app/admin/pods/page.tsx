'use client'
import { useQuery }    from '@tanstack/react-query'
import { Admin }       from '@/lib/adminApi'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable }   from '@/components/admin/DataTable'

export default function AdminPodsPage() {
  const { data: pods = [], isLoading } = useQuery({
    queryKey: ['admin-pods'],
    queryFn:  () => Admin.pods().then(r => r.data),
  })

  const mainPods = pods.filter((p: any) => p.podType === 'main')
  const subPods  = pods.filter((p: any) => p.podType === 'sub')
  const nearSplit= subPods.filter((p: any) => p.memberCount >= 16)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Pods</h1>
          <p className="text-sm text-gray-400 mt-1">
            {mainPods.length} main · {subPods.length} sub · {nearSplit.length} near split threshold
          </p>
        </div>
      </div>

      {nearSplit.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
          ⚠ {nearSplit.length} sub-pod{nearSplit.length > 1 ? 's are' : ' is'} approaching the 20-member split threshold.
          The nightly job will handle splits automatically.
        </div>
      )}

      {isLoading
        ? <div className="text-sm text-gray-400">Loading…</div>
        : (
          <DataTable
            cols={[
              { key: 'name',    header: 'Pod name',   render: r => (
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.podType}</div>
                </div>
              )},
              { key: 'members', header: 'Members',    width: '100px', render: r => (
                <div className="flex items-center gap-2">
                  <div className={`font-medium ${r.memberCount >= 16 ? 'text-amber-700' : 'text-gray-700'}`}>
                    {r.memberCount}
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-16">
                    <div
                      className={`h-full rounded-full ${r.memberCount >= 16 ? 'bg-amber-400' : 'bg-brand-400'}`}
                      style={{ width: `${Math.min(100, (r.memberCount / 20) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">/ 20</span>
                </div>
              )},
              { key: 'radius',  header: 'Radius',     width: '90px',  render: r => `${r.radiusMiles} mi` },
              { key: 'lat',     header: 'Center',     width: '160px', render: r => `${Number(r.centerLat).toFixed(4)}, ${Number(r.centerLng).toFixed(4)}` },
              { key: 'active',  header: 'Active',     width: '80px',  render: r => r.isActive
                ? <span className="text-green-700 text-xs font-medium">Active</span>
                : <span className="text-gray-400 text-xs">Inactive</span>
              },
              { key: 'created', header: 'Created',    width: '100px', render: r => new Date(r.createdAt).toLocaleDateString() },
            ]}
            rows={pods}
            keyFn={r => r.id}
          />
        )}
    </AdminLayout>
  )
}
