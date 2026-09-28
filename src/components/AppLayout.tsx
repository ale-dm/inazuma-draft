import type { ReactNode } from 'react'
import TopBar from './TopBar'
import SiteFooter from './SiteFooter'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      <TopBar />
      <main className="flex-1 min-w-0">{children}</main>
      <SiteFooter />
    </div>
  )
}
