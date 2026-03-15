import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ICONS = ['🔑','👛','🎧','🎒','💼','🚗','📱','🎿','🧳','🐶','🏠','📷']
const FILTERS = ['All', 'Online', 'Offline']

function BatteryBar({ value }) {
  const color =
    value > 50 ? 'bg-emerald-500' :
    value > 20 ? 'bg-amber-500' :
    'bg-red-500'
  return (
    <div className="w-20">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Battery</span><span>{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

function AddModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🔑')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onAdd({ name: name.trim(), icon })
    setLoading(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">Add New Tracker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. My Keys"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`text-2xl h-11 rounded-lg flex items-center justify-center transition-all ${
                    icon === ic ? 'bg-locus-100 ring-2 ring-locus-500' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >{ic}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-locus-600 text-white text-sm font-medium hover:bg-locus-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Adding…' : 'Add Tracker'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function TrackersPage() {
  const navigate = useNavigate()
  const [trackers, setTrackers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [filter, setFilter]     = useState('All')
  const [search, setSearch]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId]   = useState(null)

  // ── Fetch ────────────────────────────────────────────────────
  useEffect(() => {
    fetchTrackers()

    // Realtime subscription
    const channel = supabase
      .channel('trackers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trackers' }, () => {
        fetchTrackers()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchTrackers() {
    const { data, error } = await supabase
      .from('trackers')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) { setError(error.message); setLoading(false); return }
    setTrackers(data)
    setLoading(false)
    setError(null)
  }

  // ── Add ──────────────────────────────────────────────────────
  async function handleAdd({ name, icon }) {
    const { error } = await supabase
      .from('trackers')
      .insert({ name, icon, status: 'online', last_seen: 'Just now', battery: 100, location: 'Unknown', owner: 'Yerassyl' })
    if (error) setError(error.message)
  }

  // ── Delete ───────────────────────────────────────────────────
  async function handleDelete(id) {
    setDeleteId(null)
    setTrackers(prev => prev.filter(t => t.id !== id))
    const { error } = await supabase.from('trackers').delete().eq('id', id)
    if (error) {
      setError(error.message)
      fetchTrackers()
    }
  }

  const filtered = trackers.filter(t => {
    const matchFilter =
      filter === 'All' ||
      (filter === 'Online'  && t.status === 'online') ||
      (filter === 'Offline' && t.status === 'offline')
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const onlineCount  = trackers.filter(t => t.status === 'online').length
  const offlineCount = trackers.filter(t => t.status === 'offline').length

  return (
    <>
      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">Trackers</h1>
            <p className="text-slate-500 text-sm">
              {loading ? 'Loading…' : `${onlineCount} online · ${offlineCount} offline · ${trackers.length} total`}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-locus-600 text-white text-sm font-medium rounded-lg hover:bg-locus-700 transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Add Tracker
          </motion.button>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between"
            >
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
          className="flex flex-col sm:flex-row gap-3 mt-6"
        >
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search trackers..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === f ? 'bg-locus-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >{f}</button>
            ))}
          </div>
        </motion.div>

        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }}
          className="mt-6 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                Loading trackers…
              </motion.p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm">No trackers found</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {filtered.map((tracker, i) => (
                  <motion.li
                    key={tracker.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {tracker.icon}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{tracker.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          📍 {tracker.location} · {tracker.last_seen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <BatteryBar value={tracker.battery} />
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tracker.status === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          tracker.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        {tracker.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/map.html')}
                          title="View on map"
                          className="p-2 rounded-lg text-slate-400 hover:text-locus-600 hover:bg-locus-50 transition-colors text-lg">
                          🗺️
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteId(tracker.id)}
                          title="Delete tracker"
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors text-lg">
                          🗑️
                        </motion.button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && <AddModal onAdd={handleAdd} onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-3xl mb-3">🗑️</p>
              <h2 className="font-display text-lg font-semibold text-slate-900 mb-1">Delete tracker?</h2>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
