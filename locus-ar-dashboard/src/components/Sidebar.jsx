import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Dashboard', icon: '📊', to: '/dashboard' },
  { label: 'Trackers', icon: '🏷️', to: '/trackers' },
  { label: 'Map', icon: '🗺️', to: '/map.html', external: true },
  { label: 'AR Search', icon: '📷', to: '/ar-search' },
  { label: 'Family', icon: '👨‍👩‍👧‍👦', to: '/family' },
  { label: 'Settings', icon: '⚙️', to: '/settings' },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-64 bg-slate-900 text-white flex flex-col shrink-0"
    >
      <div className="p-6 border-b border-slate-800">
        <button onClick={() => navigate('/')} className="text-left hover:opacity-80 transition-opacity">
          <h2 className="font-display text-xl font-semibold tracking-tight">Locus AR</h2>
          <p className="text-slate-400 text-xs mt-0.5">Never lose what matters</p>
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item, i) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              {item.external ? (
                <a
                  href={item.to}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </a>
              ) : (
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-locus-600 text-white shadow-lg shadow-locus-600/25'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </NavLink>
              )}
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50">
          <div className="w-9 h-9 rounded-full bg-locus-500 flex items-center justify-center text-sm font-medium shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.email ?? 'User'}</p>
            <p className="text-xs text-slate-400">Signed in</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all text-sm font-medium"
        >
          <span>🚪</span> Sign Out
        </motion.button>
      </div>
    </motion.aside>
  )
}
