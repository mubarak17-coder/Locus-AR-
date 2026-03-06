import { motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatCard from './components/StatCard'
import TrackerList from './components/TrackerList'

export default function App() {
  const stats = [
    { label: 'Active Trackers', value: '12', icon: '🏷️', change: '+2 this week' },
    { label: 'Items Found Today', value: '3', icon: '✅', change: 'Saved 45 min' },
    { label: 'Family Members', value: '4', icon: '👨‍👩‍👧‍👦', change: 'All safe' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col min-h-screen"
      >
        <Header />

        <div className="flex-1 p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm">
              Overview of your trackers and recent activity
            </p>
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
      </motion.main>
    </div>
  )
}
