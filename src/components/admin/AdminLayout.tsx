'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const NAV = [
  { href: '/admin',               label: 'Overview',      icon: '▦' },
  { href: '/admin/members',       label: 'Members',       icon: '👥' },
  { href: '/admin/exchanges',     label: 'Exchanges',     icon: '⇄'  },
  { href: '/admin/pods',          label: 'Pods',          icon: '◉'  },
  { href: '/admin/tokens',        label: 'Token ledger',  icon: '🪙' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '✓'  },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="font-display text-lg text-brand-900">Pay in Kind</div>
          <div className="text-xs text-gray-400 mt-0.5">Admin dashboard</div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                path === n.href
                  ? 'bg-brand-50 text-brand-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="text-base w-5 text-center">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
          v0.1.0 · beta
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}
