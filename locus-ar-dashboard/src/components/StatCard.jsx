import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon, change, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md p-6 transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <p className="text-2xl font-display font-semibold text-slate-900 mt-1">
            {value}
          </p>
          {change && (
            <p className="text-xs text-emerald-600 mt-2 font-medium">{change}</p>
          )}
        </div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 + index * 0.05, type: 'spring', stiffness: 200 }}
          className="text-2xl w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center"
        >
          {icon}
        </motion.span>
      </div>
    </motion.div>
  )
}
