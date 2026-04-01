'use client'
import { useState }   from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tokens }     from '@/lib/api'
import { Badge }      from '@/components/ui/Badge'
import { useRouter }  from 'next/navigation'
import clsx           from 'clsx'

const BUY_AMOUNTS = [
  { label: '$2',  cents: 200,  tokens: 200  },
  { label: '$5',  cents: 500,  tokens: 500  },
  { label: '$10', cents: 1000, tokens: 1000 },
  { label: '$25', cents: 2500, tokens: 2500 },
]

export default function WalletPage() {
  const router = useRouter()
  const qc     = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview'|'buy'|'redeem'|'transfer'>('overview')
  const [buyAmount, setBuyAmount] = useState(500)
  const [redeemAmount, setRedeemAmount] = useState(1000)
  const [transferTo, setTransferTo]     = useState('')
  const [transferAmt, setTransferAmt]   = useState(100)

  const { data: balance } = useQuery({
    queryKey: ['token-balance'],
    queryFn:  () => Tokens.balance().then(r => r.data),
    refetchInterval: 30_000,
  })

  const { data: history = [] } = useQuery({
    queryKey: ['token-history'],
    queryFn:  () => Tokens.history().then(r => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['token-balance'] })
    qc.invalidateQueries({ queryKey: ['token-history'] })
  }

  const buy = useMutation({
    mutationFn: () => Tokens.buy(buyAmount),
    onSuccess:  invalidate,
  })

  const redeem = useMutation({
    mutationFn: () => Tokens.redeem(redeemAmount),
    onSuccess:  invalidate,
  })

  const transfer = useMutation({
    mutationFn: () => Tokens.transfer(transferTo, transferAmt),
    onSuccess:  invalidate,
  })

  const redeemFee     = +(redeemAmount * 0.01 * 0.0075).toFixed(2)
  const redeemPayout  = +(redeemAmount * 0.01 - redeemFee).toFixed(2)
  const buyFee        = +(buyAmount * 0.01 * 0.0075).toFixed(2)
  const buyTotal      = +(buyAmount * 0.01 + buyFee).toFixed(2)
  const belowRedeemMin = redeemAmount < 1000

  const TABS = ['overview','buy','redeem','transfer'] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">←</button>
        <h1 className="font-display text-xl">Token wallet</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Balance card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Available balance</div>
          <div className="text-4xl font-medium text-brand-900">{(balance?.tokenBalance ?? 0).toLocaleString()}</div>
          <div className="text-sm text-gray-400 mt-1">tokens · ${balance?.valueUsd ?? '0.00'} value</div>
          <div className={clsx(
            'mt-3 text-xs px-2.5 py-1 rounded-full inline-block font-medium',
            balance?.canRedeem ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-500'
          )}>
            {balance?.canRedeem
              ? '✓ Eligible to redeem'
              : `Need ${(1000 - (balance?.tokenBalance ?? 0)).toLocaleString()} more tokens to redeem`
            }
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 bg-gray-100 p-1 rounded-xl">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={clsx(
                'flex-1 text-xs py-1.5 rounded-lg font-medium transition-all capitalize',
                activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >{t}</button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Recent activity</div>
            {history.slice(0, 10).map((tx: any) => (
              <div key={tx.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <Badge status={tx.txType} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 truncate">{tx.note ?? tx.txType}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
                <div className={clsx('text-sm font-medium flex-shrink-0', tx.tokenAmount > 0 ? 'text-green-700' : 'text-orange-700')}>
                  {tx.tokenAmount > 0 ? '+' : ''}{tx.tokenAmount.toLocaleString()}
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No transactions yet</div>
            )}
          </div>
        )}

        {/* Buy */}
        {activeTab === 'buy' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="text-sm font-medium">How many tokens?</div>
            <div className="grid grid-cols-4 gap-2">
              {BUY_AMOUNTS.map(a => (
                <button key={a.cents} onClick={() => setBuyAmount(a.tokens)}
                  className={clsx('border rounded-xl py-3 text-center transition-all',
                    buyAmount === a.tokens ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-400'
                  )}
                >
                  <div className="text-sm font-medium text-gray-900">{a.label}</div>
                  <div className="text-xs text-gray-400">{a.tokens.toLocaleString()}</div>
                </button>
              ))}
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Tokens received</span><span className="font-medium">{buyAmount.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs text-gray-400"><span>Purchase fee (0.75%)</span><span>+${buyFee}</span></div>
              <div className="flex justify-between font-medium border-t border-gray-200 pt-1.5"><span>Total charged</span><span>${buyTotal}</span></div>
            </div>
            <button
              onClick={() => buy.mutate()}
              disabled={buy.isPending}
              className="w-full bg-brand-400 hover:bg-brand-900 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-40 transition-colors"
            >
              {buy.isPending ? 'Processing…' : `Buy ${buyAmount.toLocaleString()} tokens`}
            </button>
          </div>
        )}

        {/* Redeem */}
        {activeTab === 'redeem' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-800">
              Minimum redemption is 1,000 tokens ($10). Fee: 0.75% deducted from payout.
              Available to active and inactive accounts.
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tokens to redeem</label>
              <input
                type="number" min="1000" step="100"
                value={redeemAmount}
                onChange={e => setRedeemAmount(Number(e.target.value))}
                className={clsx('w-full border rounded-lg px-3 py-2 text-sm focus:outline-none',
                  belowRedeemMin ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-brand-400'
                )}
              />
              {belowRedeemMin && <p className="text-xs text-red-600 mt-1">Minimum is 1,000 tokens</p>}
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Face value</span><span>${(redeemAmount * 0.01).toFixed(2)}</span></div>
              <div className="flex justify-between text-xs text-gray-400"><span>Redemption fee (0.75%)</span><span>−${redeemFee}</span></div>
              <div className="flex justify-between font-medium border-t border-gray-200 pt-1.5 text-green-700"><span>You receive</span><span>${redeemPayout}</span></div>
            </div>
            <button
              onClick={() => redeem.mutate()}
              disabled={belowRedeemMin || redeem.isPending || (balance?.tokenBalance ?? 0) < redeemAmount}
              className="w-full bg-brand-400 hover:bg-brand-900 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-40 transition-colors"
            >
              {redeem.isPending ? 'Processing…' : `Redeem ${redeemAmount.toLocaleString()} tokens`}
            </button>
          </div>
        )}

        {/* Transfer */}
        {activeTab === 'transfer' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Recipient member ID</label>
              <input
                value={transferTo}
                onChange={e => setTransferTo(e.target.value)}
                placeholder="User ID (UUID)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tokens to send</label>
              <input
                type="number" min="1"
                value={transferAmt}
                onChange={e => setTransferAmt(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">You send</span><span>{transferAmt.toLocaleString()} tokens</span></div>
              <div className="flex justify-between text-xs text-gray-400"><span>Transfer fee (0.25%)</span><span>−{Math.ceil(transferAmt * 0.0025)} tokens</span></div>
              <div className="flex justify-between font-medium border-t border-gray-200 pt-1.5"><span>They receive</span><span>{(transferAmt - Math.ceil(transferAmt * 0.0025)).toLocaleString()} tokens</span></div>
            </div>
            <button
              onClick={() => transfer.mutate()}
              disabled={!transferTo || transferAmt < 1 || transfer.isPending}
              className="w-full bg-brand-400 hover:bg-brand-900 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-40 transition-colors"
            >
              {transfer.isPending ? 'Sending…' : 'Send tokens'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
