import { motion } from 'framer-motion'

const trackers = [
  { id: 1, name: 'Keys', icon: '🔑', status: 'online', lastSeen: '2 min ago', battery: 85 },
  { id: 2, name: 'Wallet', icon: '👛', status: 'online', lastSeen: '5 min ago', battery: 72 },
  { id: 3, name: 'Headphones', icon: '🎧', status: 'online', lastSeen: '1 min ago', battery: 94 },
  { id: 4, name: 'Backpack', icon: '🎒', status: 'offline', lastSeen: '2 hours ago', battery: 12 },
]

export default function TrackerList() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-display font-semibold text-slate-900">
          Recent Trackers
        </h3>
        <p className="text-slate-500 text-sm mt-0.5">
          Your linked devices and their status
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {trackers.map((tracker, i) => (
          <motion.div
            key={tracker.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.05, duration: 0.3 }}
            whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
            className="flex items-center justify-between px-6 py-4 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                {tracker.icon}
              </span>
              <div>
                <p className="font-medium text-slate-900">{tracker.name}</p>
                <p className="text-sm text-slate-500">{tracker.lastSeen}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    tracker.status === 'online'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      tracker.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {tracker.status}
                </span>
              </div>
              <div className="w-16">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Battery</span>
                  <span>{tracker.battery}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tracker.battery}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      tracker.battery > 50
                        ? 'bg-emerald-500'
                        : tracker.battery > 20
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="text-slate-400 hover:text-locus-600 text-xl transition-colors"
                title="View on map"
              >
                →
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
