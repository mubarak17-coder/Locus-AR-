import { motion } from 'framer-motion'

export default function Header() {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0"
    >
      <div className="flex-1 max-w-md">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            🔍
          </span>
          <input
            type="search"
            placeholder="Search trackers, items..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Notifications"
        >
          <span className="text-xl">🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-locus-500 rounded-full" />
        </motion.button>
      </div>
    </motion.header>
  )
}
