import clsx from 'clsx'

interface StatCardProps {
  label:   string
  value:   string | number
  sub?:    string
  accent?: 'green' | 'amber' | 'blue' | 'purple' | 'red'
}

const ACCENT = {
  green:  'text-brand-900',
  amber:  'text-amber-700',
  blue:   'text-blue-700',
  purple: 'text-purple-700',
  red:    'text-red-700',
}

export function StatCard({ label, value, sub, accent = 'green' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{label}</div>
      <div className={clsx('text-3xl font-medium', ACCENT[accent])}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
