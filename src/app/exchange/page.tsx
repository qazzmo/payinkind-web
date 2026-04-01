'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Listings, Exchanges } from '@/lib/api'
import { useExchangeCalc }     from '@/hooks/useExchangeCalc'
import clsx from 'clsx'

function ExchangeForm() {
  const params   = useSearchParams()
  const router   = useRouter()
  const theirListingId = params.get('listing') ?? ''

  const [myListingId, setMyListingId] = useState('')
  const [qtyA, setQtyA]     = useState(1)
  const [qtyB, setQtyB]     = useState(1)
  const [cashTopUp, setCash] = useState(0)
  const [scheduledAt, setScheduled] = useState('')
  const [step, setStep]     = useState<'configure'|'confirm'>('configure')

  const { data: theirListing }  = useQuery({
    queryKey: ['listing', theirListingId],
    queryFn:  () => Listings.list().then(r => r.data.find((l: any) => l.id === theirListingId)),
    enabled:  !!theirListingId,
  })

  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings'],
    queryFn:  () => Listings.my().then(r => r.data),
  })

  const myListing = myListings.find((l: any) => l.id === myListingId)

  const calc = useExchangeCalc({
    rateA:    myListing?.ratePerUnit   ?? 0,
    rateB:    theirListing?.ratePerUnit ?? 0,
    qtyA,
    cashTopUp,
  })

  const propose = useMutation({
    mutationFn: () => Exchanges.propose({
      listingAId:  myListingId,
      listingBId:  theirListingId,
      qtyA, qtyB:  Math.floor(calc.suggestedQtyB),
      cashTopUp,
      scheduledAt: scheduledAt || undefined,
    }),
    onSuccess: (res) => router.push(`/exchange/${res.data.id}`),
  })

  const canPropose = myListingId && theirListingId && calc.cashOk && calc.valueA > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">←</button>
        <h1 className="font-display text-xl">Propose exchange</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Their side */}
        {theirListing && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">They offer</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{theirListing.serviceTypeName ?? 'Service'}</div>
                <div className="text-xs text-gray-400 mt-0.5">${theirListing.ratePerUnit}/{theirListing.unit?.replace('per_','')}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQtyB(q => Math.max(0.5, q - 0.5))} className="w-7 h-7 rounded-full border border-gray-200 text-sm hover:bg-gray-50">−</button>
                <span className="w-10 text-center text-sm font-medium">{Math.floor(calc.suggestedQtyB)}</span>
                <button onClick={() => setQtyB(q => q + 0.5)} className="w-7 h-7 rounded-full border border-gray-200 text-sm hover:bg-gray-50">+</button>
                <span className="text-xs text-gray-400">hrs</span>
              </div>
            </div>
          </div>
        )}

        {/* Your side */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">You offer</div>
          <select
            value={myListingId}
            onChange={e => setMyListingId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-brand-400"
          >
            <option value="">Select one of your listings…</option>
            {myListings.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.serviceTypeName ?? 'Service'} · ${l.ratePerUnit}/{l.unit?.replace('per_','')}
              </option>
            ))}
          </select>
          {myListing && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">${myListing.ratePerUnit} × {qtyA} hrs = <strong className="text-gray-700">${calc.valueA.toFixed(2)}</strong></span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQtyA(q => Math.max(0.5, q - 0.5))} className="w-7 h-7 rounded-full border border-gray-200 text-sm hover:bg-gray-50">−</button>
                <span className="w-8 text-center text-sm font-medium">{qtyA}</span>
                <button onClick={() => setQtyA(q => q + 0.5)} className="w-7 h-7 rounded-full border border-gray-200 text-sm hover:bg-gray-50">+</button>
              </div>
            </div>
          )}
        </div>

        {/* Cash top-up */}
        <div className={clsx(
          'bg-white rounded-xl border p-4',
          !calc.cashOk ? 'border-red-300' : 'border-gray-100'
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Cash top-up</div>
            <div className="text-xs text-gray-400">max ${calc.maxCashTopUp.toFixed(2)} (25%)</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">$</span>
            <input
              type="number" min="0" step="0.50"
              value={cashTopUp}
              onChange={e => setCash(Number(e.target.value))}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-400"
            />
          </div>
          {!calc.cashOk && (
            <p className="text-xs text-red-600 mt-1.5">Exceeds 25% cap of ${calc.maxCashTopUp.toFixed(2)}</p>
          )}
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Proposed date & time</div>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduled(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
          />
        </div>

        {/* Fee summary */}
        {myListing && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Your service</span><span>${calc.valueA.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Their service</span><span>${calc.valueB.toFixed(2)}</span></div>
            {cashTopUp > 0 && <div className="flex justify-between"><span className="text-gray-500">Cash top-up</span><span>${cashTopUp.toFixed(2)}</span></div>}
            <div className="flex justify-between border-t border-gray-200 pt-1.5 text-xs text-gray-400">
              <span>Your fee (0.75%)</span><span>−${calc.feeA.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Their fee (0.75%)</span><span>−${calc.feeB.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button
          disabled={!canPropose || propose.isPending}
          onClick={() => propose.mutate()}
          className="w-full bg-brand-400 hover:bg-brand-900 text-white font-medium py-3 rounded-xl disabled:opacity-40 transition-colors text-sm"
        >
          {propose.isPending ? 'Sending…' : 'Send proposal to neighbor'}
        </button>

        {propose.isError && (
          <p className="text-xs text-red-600 text-center">Failed to send — please try again.</p>
        )}
      </div>
    </div>
  )
}

export default function ExchangePage() {
  return <Suspense><ExchangeForm /></Suspense>
}
