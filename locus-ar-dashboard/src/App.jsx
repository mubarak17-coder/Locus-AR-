import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SearchProvider }  from './context/SearchContext'
import { NotifProvider }   from './context/NotifContext'
import { TrackersProvider, useTrackers } from './context/TrackersContext'
import Sidebar      from './components/Sidebar'
import Header       from './components/Header'
import StatCard     from './components/StatCard'
import TrackerList  from './components/TrackerList'
import TrackersPage from './pages/TrackersPage'
import FamilyPage   from './pages/FamilyPage'
import SettingsPage from './pages/SettingsPage'
import ARSearchPage from './pages/ARSearchPage'
import LoginPage    from './pages/LoginPage'
import LandingPage  from './pages/LandingPage'

function Dashboard() {
  const { trackers, loading } = useTrackers()

  const activeCount = trackers.filter(t => t.status === 'online').length
  const foundToday  = trackers.filter(t => t.last_seen.includes('min') || t.last_seen === 'Just now').length

  const stats = [
    { label: 'Active Trackers',   value: loading ? '…' : String(activeCount), icon: '🏷️', change: `${trackers.length} total` },
    { label: 'Items Found Today', value: loading ? '…' : String(foundToday),  icon: '✅', change: 'Recently updated' },
    { label: 'Family Members',    value: '4',                                  icon: '👨‍👩‍👧‍👦', change: 'All connected' },
  ]

  return (
    <div className="flex-1 p-8 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-500 text-sm">Overview of your trackers and recent activity</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
      >
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8"
      >
        <TrackerList />
      </motion.div>
    </div>
  )
}

function AppShell() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-slate-400 text-sm"
        >
          Loading…
        </motion.p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Protected routes */}
      {user ? (
        <Route path="/*" element={
          <NotifProvider>
          <TrackersProvider>
          <SearchProvider>
            <div className="flex min-h-screen bg-slate-50">
              <Sidebar />
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col min-h-screen"
              >
                <Header />
                <Routes>
                  <Route path="/dashboard"  element={<Dashboard />} />
                  <Route path="/trackers"   element={<TrackersPage />} />
                  <Route path="/ar-search"  element={<ARSearchPage />} />
                  <Route path="/family"     element={<FamilyPage />} />
                  <Route path="/settings"   element={<SettingsPage />} />
                  <Route path="*"           element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </motion.main>
            </div>
          </SearchProvider>
          </TrackersProvider>
          </NotifProvider>
        } />
      ) : (
        <Route path="/*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
