import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import ReferralWidget from './ReferralWidget.jsx'

const titles = {
  '/app': 'לוח בקרה',
  '/app/matches': 'משחקים',
  '/app/predictions': 'הניחושים שלי',
  '/app/leaderboard': 'טבלת הליגה',
  '/competition': 'תחרות הפרסים',
  '/competition/leaderboard': 'טבלת התחרות',
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const title = titles[pathname] || 'ליגת הניחושים'

  return (
    <div className="min-h-screen bg-night bg-stadium-mesh">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Content is offset to the LEFT of the right-anchored sidebar (RTL) */}
      <div className="lg:mr-72">
        <Header onMenu={() => setOpen(true)} title={title} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
          <div className="mt-8 max-w-sm">
            <ReferralWidget />
          </div>
        </main>
      </div>
    </div>
  )
}
