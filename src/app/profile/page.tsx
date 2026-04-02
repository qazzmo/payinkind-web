'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Listings } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import clsx from 'clsx'

const SERVICES = [
  { slug:'nanny', name:'Nanny services', icon:'👶' },
  { slug:'gardening', name:'Gardening', icon:'🌿' },
  { slug:'cooking', name:'Home cooking', icon:'🍲' },
  { slug:'cleaning', name:'House keeping', icon:'🧹' },
  { slug:'music', name:'Music teaching', icon:'🎵' },
  { slug:'adult-care', name:'Adult care', icon:'🧓' },
  { slug:'dog-walking', name:'Dog walking', icon:'🐕' },
  { slug:'dropoff', name:'Drop-off / airport', icon:'🚗' },
]

export default function ProfilePage() {
  const router = useRouter()
  const logout = useAuthStore(s => s.logout)
  const [editingWanted, setEditingWanted] = useState(false)
  const [wantedSelected, setWantedSelected] = useState(new Set())

  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => Listings.my().then(r => r.data),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">←</button>
        <h1 className="font-display text-xl">My profile</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center font-display text-2xl text-brand-900">AK</div>
            <div>
              <div className="font-medium text-lg">Your Name</div>
              <div className="text-sm text-gray-400 mt-0.5">Ravenna · Pod B</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <di
cat > src/app/profile/page.tsx << 'ENDOFFILE'
'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Listings } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import clsx from 'clsx'

const SERVICES = [
  { slug:'nanny', name:'Nanny services', icon:'👶' },
  { slug:'gardening', name:'Gardening', icon:'🌿' },
  { slug:'cooking', name:'Home cooking', icon:'🍲' },
  { slug:'cleaning', name:'House keeping', icon:'🧹' },
  { slug:'music', name:'Music teaching', icon:'🎵' },
  { slug:'adult-care', name:'Adult care', icon:'🧓' },
  { slug:'dog-walking', name:'Dog walking', icon:'🐕' },
  { slug:'dropoff', name:'Drop-off / airport', icon:'🚗' },
]

export default function ProfilePage() {
  const router = useRouter()
  const logout = useAuthStore(s => s.logout)
  const [editingWanted, setEditingWanted] = useState(false)
  const [wantedSelected, setWantedSelected] = useState(new Set())

  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => Listings.my().then(r => r.data),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">←</button>
        <h1 className="font-display text-xl">My profile</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center font-display text-2xl text-brand-900">AK</div>
            <div>
              <div className="font-medium text-lg">Your Name</div>
              <div className="text-sm text-gray-400 mt-0.5">Ravenna · Pod B</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">Token balance</div>
              <div className="font-medium text-brand-900">0 tokens</div>
            </div>
            <button onClick={() => router.push('/wallet')} className="text-xs bg-brand-400 text-white px-3 py-1.5 rounded-lg hover:bg-brand-900 transition-colors">Wallet</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-900">What I offer</h2>
            <button onClick={() => router.push('/discover')} className="text-xs text-brand-400 hover:underline">+ Add service</button>
          </div>
          {myListings.length === 0 ? (
            <p className="text-sm text-gray-400">No services yet.</p>
          ) : (
            <div className="space-y-2">
              {myListings.map((l: any) => (
                <div key={l.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-none">
                  <span className="text-lg">{SERVICES.find(s => s.slug === l.serviceTypeSlug)?.icon || '🔧'}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{l.serviceTypeName || l.serviceTypeSlug}</div>
                    <div className="text-xs text-gray-400">${l.ratePerUnit}/{l.unit?.replace('per_','')}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === 'active' ? 'bg-brand-50 text-brand-900' : 'bg-gray-100 text-gray-500'}`}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-900">What I need</h2>
            <button onClick={() => setEditingWanted(!editingWanted)} className="text-xs text-brand-400 hover:underline">{editingWanted ? 'Done' : 'Edit'}</button>
          </div>
          {editingWanted ? (
            <div className="grid grid-cols-4 gap-2">
              {SERVICES.map(s => (
                <button key={s.slug} onClick={() => { const next = new Set(wantedSelected); next.has(s.slug) ? next.delete(s.slug) : next.add(s.slug); setWantedSelected(next) }}
                  className={clsx('border rounded-xl p-2 text-center transition-all', wantedSelected.has(s.slug) ? 'border-amber-400 bg-amber-50' : 'border-gray-200')}>
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-xs font-medium leading-tight text-gray-700">{s.name}</div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              {wantedSelected.size === 0 ? (
                <p className="text-sm text-gray-400">Tap Edit to add what you need from neighbors.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[...wantedSelected].map(slug => {
                    const svc = SERVICES.find(s => s.slug === slug)
                    return svc ? <span key={slug} className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">{svc.icon} {svc.name}</span> : null
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={() => { logout(); router.push('/onboarding') }} className="w-full text-sm text-red-500 hover:text-red-700 py-2">Sign out</button>
      </div>
    </div>
  )
}
