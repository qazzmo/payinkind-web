import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title:       'Pay in Kind',
  description: 'Exchange services with your neighbors',
  manifest:    '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Pay in Kind' },
}

export const viewport: Viewport = {
  themeColor:    '#1D9E75',
  width:         'device-width',
  initialScale:  1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
