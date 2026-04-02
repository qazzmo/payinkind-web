'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Auth, Listings } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import clsx from 'clsx'

const SERVICES = [
  { slug:'nanny', name:'Nanny services', icon:'👶', unit:'per_hour', defaultRate:45 },
  { slug:'gardening', name:'Gardening', icon:'🌿', unit:'per_hour', defaultRate:40 },
  { slug:'cooking', name:'Home cooking', icon:'🍲', unit:'per_session', defaultRate:35 },
  { slug:'cleaning', name:'House keeping', icon:'🧹', unit:'per_hour', defaultRate:30 },
  { slug:'music', name:'Music teaching', icon:'🎵', unit:'per_hour', defaultRate:55 },
  { slug:'adult-care', name:'Adult care', icon:'🧓', unit:'per_hour', defaultRate:40 },
  { slug:'dog-walking', name:'Dog walking', icon:'🐕', unit:'per_hour', defaultRate:25 },
  { slug:'dropoff', name:'Drop-off / airport', icon:'🚗', unit:'per_trip', defaultRate:50 },
]

const STEPS = ['Profile','Location','You offer','Your rates','You need','Membership']

export default function OnboardingPage() {
  const router = useRouter()
  const setTokens = useAuthStore(s => s.setTokens)
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({ fullName:'', email:'', phone:'', password:'' })
  const [location, setLocation] = useState({ address:'', city:'', state:'WA', zip:'' })
  const [offered, setOffered] = useState(new Set())
  const [wanted, setWanted] = useState(new Set())
  const [rates, setRates] = useState({})
  const [plan, setPlan] = useState('member')

  const register = useMutation({
    mutationFn: () => Auth.register({ ...profile, address: location.address, city: location.city, state: location.state, zip: location.zip }),
    onSuccess: async ({ data }) => {
      setTokens(data.token, data.refreshToken, data.userId)
      router.push('/discover')
    },
  })

  const canAdvance = () => {
    if (step === 0) return profile.fullName && profile.email && profile.password.length >= 8
    if (step === 1) return location.address && location.city && location.zip
    if (step === 2) return offered.size > 0
    return true
  }

  const toggleOffered = (slug) => {
    const next = new Set(offered)
    next.has(slug) ? next.delete(slug) : next.add(slug)
    setOffered(next)
  }

  const toggleWanted = (slug) => {
    const next = new Set(wanted)
    next.has(slug) ? next.delete(slug) : next.add(slug)
    setWanted(next)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-lg p-8">
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0', i < step ? 'bg-brand-400 text-white' : i === step ? 'border-2 border-brand-400 text-brand-900' : 'border border-gray-200 text-gray-400')}>{i < step ? '✓' : i + 1}</div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-brand-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <h1 className="font-display text-2xl mb-1">Welcome to Pay in Kind</h1>
            <p className="text-sm text-gray-400 mb-6">Set up your profile to get started.</p>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Full name" value={profile.fullName} onChange={e => setProfile(p => ({...p, fullName: e.target.value}))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Email address" type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Phone (optional)" type="tel" value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Password (min 8 chars)" type="password" value={profile.password} onChange={e => setProfile(p => ({...p, password: e.target.value}))} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl mb-1">Where do you live?</h1>
            <p className="text-sm text-gray-400 mb-6">Used to place you in the right pod. Only your pod is visible to neighbors.</p>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Street address" value={location.address} onChange={e => setLocation(l => ({...l, address: e.target.value}))} />
              <div className="grid grid-cols-2 gap-3">
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="City" value={location.city} onChange={e => setLocation(l => ({...l, city: e.target.value}))} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="ZIP" value={location.zip} onChange={e => setLocation(l => ({...l, zip: e.target.value}))} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl mb-1">What can you offer?</h1>
            <p className="text-sm text-gray-400 mb-5">Services you can provide to neighbors.</p>
            <div className="grid grid-cols-4 gap-2">
              {SERVICES.map(s => (
                <button key={s.slug} onClick={() => toggleOffered(s.slug)} className={clsx('border rounded-xl p-3 text-center transition-all', offered.has(s.slug) ? 'border-brand-400 bg-brand-50' : 'border-gray-200')}>
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-xs font-medium leading-tight text-gray-700">{s.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="font-display text-2xl mb-1">Set your rates</h1>
            <p className="text-sm text-gray-400 mb-5">Neighbors see these before proposing an exchange.</p>
            <div className="divide-y divide-gray-100">
              {[...offered].map(slug => {
                const svc = SERVICES.find(s
cat > src/app/onboarding/page.tsx << 'ENDOFFILE'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Auth, Listings } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import clsx from 'clsx'

const SERVICES = [
  { slug:'nanny', name:'Nanny services', icon:'👶', unit:'per_hour', defaultRate:45 },
  { slug:'gardening', name:'Gardening', icon:'🌿', unit:'per_hour', defaultRate:40 },
  { slug:'cooking', name:'Home cooking', icon:'🍲', unit:'per_session', defaultRate:35 },
  { slug:'cleaning', name:'House keeping', icon:'🧹', unit:'per_hour', defaultRate:30 },
  { slug:'music', name:'Music teaching', icon:'🎵', unit:'per_hour', defaultRate:55 },
  { slug:'adult-care', name:'Adult care', icon:'🧓', unit:'per_hour', defaultRate:40 },
  { slug:'dog-walking', name:'Dog walking', icon:'🐕', unit:'per_hour', defaultRate:25 },
  { slug:'dropoff', name:'Drop-off / airport', icon:'🚗', unit:'per_trip', defaultRate:50 },
]

const STEPS = ['Profile','Location','You offer','Your rates','You need','Membership']

export default function OnboardingPage() {
  const router = useRouter()
  const setTokens = useAuthStore(s => s.setTokens)
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({ fullName:'', email:'', phone:'', password:'' })
  const [location, setLocation] = useState({ address:'', city:'', state:'WA', zip:'' })
  const [offered, setOffered] = useState(new Set())
  const [wanted, setWanted] = useState(new Set())
  const [rates, setRates] = useState({})
  const [plan, setPlan] = useState('member')

  const register = useMutation({
    mutationFn: () => Auth.register({ ...profile, address: location.address, city: location.city, state: location.state, zip: location.zip }),
    onSuccess: async ({ data }) => {
      setTokens(data.token, data.refreshToken, data.userId)
      router.push('/discover')
    },
  })

  const canAdvance = () => {
    if (step === 0) return profile.fullName && profile.email && profile.password.length >= 8
    if (step === 1) return location.address && location.city && location.zip
    if (step === 2) return offered.size > 0
    return true
  }

  const toggleOffered = (slug) => {
    const next = new Set(offered)
    next.has(slug) ? next.delete(slug) : next.add(slug)
    setOffered(next)
  }

  const toggleWanted = (slug) => {
    const next = new Set(wanted)
    next.has(slug) ? next.delete(slug) : next.add(slug)
    setWanted(next)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-lg p-8">
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0', i < step ? 'bg-brand-400 text-white' : i === step ? 'border-2 border-brand-400 text-brand-900' : 'border border-gray-200 text-gray-400')}>{i < step ? '✓' : i + 1}</div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-brand-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <h1 className="font-display text-2xl mb-1">Welcome to Pay in Kind</h1>
            <p className="text-sm text-gray-400 mb-6">Set up your profile to get started.</p>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Full name" value={profile.fullName} onChange={e => setProfile(p => ({...p, fullName: e.target.value}))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Email address" type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Phone (optional)" type="tel" value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Password (min 8 chars)" type="password" value={profile.password} onChange={e => setProfile(p => ({...p, password: e.target.value}))} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl mb-1">Where do you live?</h1>
            <p className="text-sm text-gray-400 mb-6">Used to place you in the right pod. Only your pod is visible to neighbors.</p>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="Street address" value={location.address} onChange={e => setLocation(l => ({...l, address: e.target.value}))} />
              <div className="grid grid-cols-2 gap-3">
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="City" value={location.city} onChange={e => setLocation(l => ({...l, city: e.target.value}))} />
                <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400" placeholder="ZIP" value={location.zip} onChange={e => setLocation(l => ({...l, zip: e.target.value}))} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl mb-1">What can you offer?</h1>
            <p className="text-sm text-gray-400 mb-5">Services you can provide to neighbors.</p>
            <div className="grid grid-cols-4 gap-2">
              {SERVICES.map(s => (
                <button key={s.slug} onClick={() => toggleOffered(s.slug)} className={clsx('border rounded-xl p-3 text-center transition-all', offered.has(s.slug) ? 'border-brand-400 bg-brand-50' : 'border-gray-200')}>
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-xs font-medium leading-tight text-gray-700">{s.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="font-display text-2xl mb-1">Set your rates</h1>
            <p className="text-sm text-gray-400 mb-5">Neighbors see these before proposing an exchange.</p>
            <div className="divide-y divide-gray-100">
              {[...offered].map(slug => {
                const svc = SERVICES.find(s => s.slug === slug)
                return (
                  <div key={slug} className="flex items-center gap-3 py-3">
                    <span className="text-lg">{svc.icon}</span>
                    <span className="flex-1 text-sm font-medium">{svc.name}</span>
                    <span className="text-sm text-gray-400">$</span>
                    <input type="number" min="1" value={rates[slug] ?? svc.defaultRate} onChange={e => setRates(r => ({...r, [slug]: Number(e.target.value)}))} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:border-brand-400" />
                    <span className="text-xs text-gray-400">/{svc.unit.replace('per_','')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="font-display text-2xl mb-1">What do you need?</h1>
            <p className="text-sm text-gray-400 mb-5">Services you'd like from neighbors. Helps them find you.</p>
            <div className="grid grid-cols-4 gap-2">
              {SERVICES.map(s => (
                <button key={s.slug} onClick={() => toggleWanted(s.slug)} className={clsx('border rounded-xl p-3 text-center transition-all', wanted.has(s.slug) ? 'border-amber-400 bg-amber-50' : 'border-gray-200')}>
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-xs font-medium leading-tight text-gray-700">{s.name}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Optional — you can skip this and add later.</p>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="font-display text-2xl mb-1">Choose your plan</h1>
            <p className="text-sm text-gray-400 mb-5">Browse for free or subscribe to start exchanging.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['free','member']).map(p => (
                <button key={p} onClick={() => setPlan(p)} className={clsx('border rounded-xl p-4 text-left', plan === p ? 'border-brand-400 border-2' : 'border-gray-200')}>
                  <div className="text-sm font-medium mb-1">{p === 'free' ? 'Explorer' : 'Community'}</div>
                  <div className="text-2xl font-medium text-brand-900">{p === 'free' ? '$0' : '$4'}<span className="text-sm font-normal text-gray-400">/mo</span></div>
                  <div className="text-xs text-gray-400 mt-1">{p === 'free' ? 'Browse only' : '6-month min'}</div>
                </button>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Offering</span><span className="font-medium">{offered.size} services</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Looking for</span><span className="font-medium">{wanted.size} services</span></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => s - 1)} className={clsx('text-sm text-gray-400 hover:text-gray-700', step === 0 && 'invisible')}>Back</button>
          <button disabled={!canAdvance() || register.isPending} onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : register.mutate()} className="bg-brand-400 hover:bg-brand-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg disabled:opacity-40 transition-colors">
            {step === 4 && wanted.size === 0 ? 'Skip for now' : step < STEPS.length - 1 ? 'Continue' : register.isPending ? 'Setting up…' : 'Join Pay in Kind'}
          </button>
        </div>
      </div>
    </div>
  )
}
