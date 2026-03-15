import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotif } from '../context/NotifContext'

const TYPE_STYLES = {
  offline: { dot: 'bg-slate-400',   bg: 'bg-slate-100'   },
  battery: { dot: 'bg-red-500',     bg: 'bg-red-50'      },
  found:   { dot: 'bg-emerald-500', bg: 'bg-emerald-50'  },
  family:  { dot: 'bg-locus-500',   bg: 'bg-locus-50'    },
  online:  { dot: 'bg-emerald-500', bg: 'bg-emerald-50'  },
}

const FILTERS = ['All', 'Unread', 'Battery', 'Offline', 'Family']

export default function NotifPanel({ open, onClose, filter, setFilter }) {
  const { notifs, unreadCount, markRead, markAllRead, remove, clearAll } = useNotif()
  const panelRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handle(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  const filtered = notifs.filter(n => {
    if (filter === 'Unread')  return !n.read
    if (filter === 'Battery') return n.type === 'battery'
    if (filter === 'Offline') return n.type === 'offline'
    if (filter === 'Family')  return n.type === 'family'
    return true
  })

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 16, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-14 right-6 z-50 w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 5rem)' }}
          >
            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-semibold text-slate-900 text-base">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-locus-600 text-white px-2 py-0.5 rounded-full font-medium">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-locus-600 hover:text-locus-700 font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifs.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 overflow-x-auto">
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filter === f
                        ? 'bg-locus-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <div className="py-14 text-center text-slate-400">
                  <p className="text-3xl mb-2">🔔</p>
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  <AnimatePresence initial={false}>
                    {filtered.map(notif => {
                      const style = TYPE_STYLES[notif.type] ?? TYPE_STYLES.online
                      return (
                        <motion.li
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`group relative flex items-start gap-3 px-5 py-4 transition-colors ${
                            notif.read ? 'bg-white' : 'bg-locus-50/40'
                          } hover:bg-slate-50`}
                          onClick={() => markRead(notif.id)}
                        >
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center text-lg shrink-0 mt-0.5`}>
                            {notif.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm leading-snug ${notif.read ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{notif.body}</p>
                            <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={e => { e.stopPropagation(); remove(notif.id) }}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all text-lg leading-none"
                            title="Dismiss"
                          >
                            ×
                          </button>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
                <p className="text-xs text-slate-400 text-center">
                  {notifs.length} notification{notifs.length !== 1 ? 's' : ''} total
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
