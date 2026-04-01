'use client'
import { useState }   from 'react'
import { useQuery }   from '@tanstack/react-query'
import { Listings }   from '@/lib/api'
import Link           from 'next/link'
import clsx           from 'clsx'

const SERVICE_FILTERS = [
  { slug:'all',         name:'All',          icon:'◉'  },
  { slug:'nanny',       name:'Nanny',         icon:'👶' },
  { slug:'gardening',   name:'Gardening',     icon:'🌿' },
  { slug:'cooking',     name:'Cooking',       icon:'🍲' },
  { slug:'cleaning',    name:'Cleaning',      icon:'🧹' },
  { slug:'music',       name:'Music',         icon:'🎵' },
  { slug:'adult-care',  name:'Adult care',    icon:'🧓' },
  { slug:'dog-walking', name:'Dog walking',   icon:'🐕' },
  { slug:'dropoff',     name:'Drop-off',      icon:'🚗' },
]

const AVATAR_COLORS = [
  'bg-green-100 text-green-800',
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-amber-100 text-amber-800',
  'bg-pink-100 text-pink-800',
]

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn:  () => Listings.list().then(r => r.data),
  })

  const filtered = activeFilter === 'all'
    ? listings
    : listings.filter((l: any) => l.serviceTypeSlug === activeFilter)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="font-display text-xl text-brand-900">Pay in <span className="italic">Kind</span></div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-brand-50 text-brand-900 px-2.5 py-1 rounded-full font-medium">Ravenna · Pod B</span>
          <Link href="/wallet" className="text-xs text-gray-500 hover:text-gray-900">Wallet</Link>
          <Link href="/profile" className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-900">AK</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Section heading */}
        <div className="mb-5">
          <h1 className="font-display text-2xl mb-1">Your pod</h1>
          <p className="text-sm text-gray-400">Services your neighbors are offering right now.</p>
        </div>

        {/* Service filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
          {SERVICE_FILTERS.map(f => (
            <button
              key={f.slug}
              onClick={() => setActiveFilter(f.slug)}
              className={clsx(
                'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border whitespace-nowrap font-medium transition-all flex-shrink-0',
                activeFilter === f.slug
                  ? 'bg-brand-400 text-white border-brand-400'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              )}
            >
              <span className="text-sm">{f.icon}</span>{f.name}
            </button>
          ))}
        </div>

        {/* Listings */}
        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-24" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🌿</div>
            <div className="text-sm">No listings yet in this category.</div>
            <div className="text-xs mt-1">Be the first to offer this service in your pod.</div>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((listing: any, i: number) => (
            <Link
              key={listing.id}
              href={`/exchange?listing=${listing.id}`}
              className="block bg-white rounded-xl border border-gray-100 hover:border-gray-300 p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0',
                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                )}>
                  {initials(listing.userName ?? 'Neighbor')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{listing.userName ?? 'Neighbor'}</span>
                    {listing.karmaScore >= 4.5 && (
                      <span className="text-xs bg-green-50 text-green-800 px-1.5 py-0.5 rounded-full">⭐ {listing.karmaScore}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{listing.podName ?? 'Pod B'} · 0.08 mi</div>
                  <div className="text-xs mt-1.5 inline-flex items-center gap-1 bg-brand-50 text-brand-900 px-2 py-0.5 rounded-full font-medium">
                    {listing.serviceTypeName ?? 'Service'}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-medium text-brand-900 text-sm">${listing.ratePerUnit}<span className="text-xs text-gray-400 font-normal">/{listing.unit?.replace('per_','')}</span></div>
                  {listing.cashPct > 0 && (
                    <div className="text-xs text-amber-700 mt-0.5">+{Math.round(listing.cashPct * 100)}% cash ok</div>
                  )}
                </div>
              </div>
              {listing.description && (
                <p className="text-xs text-gray-500 mt-2.5 line-clamp-2 ml-13">{listing.description}</p>
              )}
            </Link>
          ))}
        </div>

        {/* Post your own CTA */}
        <div className="mt-8 bg-brand-50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-brand-900">Offer a service</div>
            <div className="text-xs text-brand-600 mt-0.5">Let your pod know what you can do.</div>
          </div>
          <Link href="/listings/new" className="text-xs bg-brand-400 text-white px-3 py-2 rounded-lg hover:bg-brand-900 transition-colors font-medium">
            Post listing
          </Link>
        </div>
      </div>
    </div>
  )
}
