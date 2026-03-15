import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '../context/SearchContext'
import { useNotif } from '../context/NotifContext'
import { useTrackers } from '../context/TrackersContext'
import NotifPanel from './NotifPanel'

export default function Header() {
  const { query, setQuery }    = useSearch()
  const { unreadCount }        = useNotif()
  const { trackers }           = useTrackers()
  const [open, setOpen]     = useState(false)
  const [notifOpen, setNotifOpen]   = useState(false)
  const [notifFilter, setNotifFilter] = useState('All')
  const inputRef            = useRef(null)
  const wrapperRef          = useRef(null)
  const navigate            = useNavigate()

  const results = query.trim().length > 0
    ? trackers.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.location.toLowerCase().includes(query.toLowerCase()) ||
        t.owner.toLowerCase().includes(query.toLowerCase())
      )
    : []

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect() {
    setQuery('')
    setOpen(false)
    navigate('/trackers')
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setQuery('')
      setOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect()
    }
  }

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 z-30 relative"
    >
      {/* Search */}
      <div ref={wrapperRef} className="flex-1 max-w-md relative">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            🔍
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search trackers, locations, owners..."
            className="w-full pl-12 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-lg"
              >
                ×
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {open && query.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
            >
              {results.length === 0 ? (
                <div className="px-4 py-5 text-center text-slate-400 text-sm">
                  No results for <span className="font-medium text-slate-600">"{query}"</span>
                </div>
              ) : (
                <>
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ul>
                    {results.map((tracker, i) => (
                      <motion.li
                        key={tracker.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <button
                          onClick={() => handleSelect()}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          <span className="text-xl w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            {tracker.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              <Highlight text={tracker.name} query={query} />
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              📍 <Highlight text={tracker.location} query={query} /> · {tracker.owner}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`w-2 h-2 rounded-full ${
                              tracker.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                            }`} />
                            <span className="text-xs text-slate-500">{tracker.battery}%</span>
                          </div>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60">
                    <button
                      onClick={() => { setOpen(false); navigate('/trackers') }}
                      className="text-xs text-locus-600 hover:text-locus-700 font-medium transition-colors"
                    >
                      View all trackers →
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setNotifOpen(v => !v)}
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Notifications"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-locus-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      <NotifPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        filter={notifFilter}
        setFilter={setNotifFilter}
      />
    </motion.header>
  )
}

function Highlight({ text, query }) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-locus-100 text-locus-700 rounded px-0.5 font-medium not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
