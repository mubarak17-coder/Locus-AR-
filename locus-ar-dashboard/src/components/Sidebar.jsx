import { motion } from 'framer-motion'

const navItems = [
  { label: 'Dashboard', icon: '📊', href: '/', active: true },
  { label: 'Trackers', icon: '🏷️', href: '#', active: false },
  { label: 'Map', icon: '🗺️', href: '/map.html', active: false },
  { label: 'AR Search', icon: '📷', href: '#', active: false },
  { label: 'Family', icon: '👨‍👩‍👧‍👦', href: '#', active: false },
  { label: 'Settings', icon: '⚙️', href: '#', active: false },
]

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-64 bg-slate-900 text-white flex flex-col shrink-0"
    >
      <div className="p-6 border-b border-slate-800">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Locus AR
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Never lose what matters
        </p>
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
              <a
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  item.active
                    ? 'bg-locus-600 text-white shadow-lg shadow-locus-600/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </a>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50"
        >
          <div className="w-9 h-9 rounded-full bg-locus-500 flex items-center justify-center text-sm font-medium">
            U
          </div>
          <div>
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-slate-400">user@locus.ar</p>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  )
}
