import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const ROLE_COLORS = {
  Admin:  'bg-locus-100 text-locus-700',
  Member: 'bg-slate-100 text-slate-600',
}

const MEMBER_COLORS = ['bg-locus-500','bg-pink-400','bg-emerald-500','bg-amber-400','bg-sky-500','bg-violet-500','bg-rose-400','bg-teal-500']

function BatteryDot({ value }) {
  const color = value > 50 ? 'bg-emerald-500' : value > 20 ? 'bg-amber-500' : 'bg-red-500'
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} title={`${value}%`} />
}

function InviteModal({ onInvite, onClose, loading }) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole]   = useState('Member')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    onInvite({ name: name.trim(), email: email.trim(), role })
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
        <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">Invite Family Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amir"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <div className="flex gap-2">
              {['Member', 'Admin'].map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    role === r ? 'bg-locus-600 text-white border-locus-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>{r}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || !email.trim() || loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-locus-600 text-white text-sm font-medium hover:bg-locus-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function MemberCard({ member, onDelete, index }) {
  const [expanded, setExpanded] = useState(false)
  const trackers    = member.trackers ?? []
  const onlineCount = trackers.filter(t => t.status === 'online').length

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-full ${member.color} flex items-center justify-center text-white font-semibold text-base shrink-0`}>
            {member.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-slate-900 text-sm">{member.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role]}`}>
                {member.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{member.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {trackers.length === 0 ? 'No trackers' : `${onlineCount}/${trackers.length} online`}
          </span>
          {trackers.length > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setExpanded(v => !v)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              {expanded ? 'Hide' : 'Show'} trackers
            </motion.button>
          )}
          {member.role !== 'Admin' && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(member.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors text-base"
              title="Remove member">
              🗑️
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {trackers.map(tracker => (
                <div key={tracker.id} className="flex items-center justify-between px-5 py-3 bg-slate-50/60">
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-9 h-9 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                      {tracker.icon}
                    </span>
                    <span className="text-sm text-slate-700 font-medium">{tracker.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BatteryDot value={tracker.battery} />
                    <span className="text-xs text-slate-500">{tracker.battery}%</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      tracker.status === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tracker.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {tracker.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FamilyPage() {
  const [members, setMembers]       = useState([])
  const [trackers, setTrackers]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [deleteId, setDeleteId]     = useState(null)
  const [error, setError]           = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const [{ data: mem }, { data: trk }] = await Promise.all([
      supabase.from('family_members').select('*').order('created_at'),
      supabase.from('trackers').select('*').order('created_at'),
    ])
    if (mem) setMembers(mem)
    if (trk) setTrackers(trk)
    setLoading(false)
  }

  // Attach trackers to members by owner name
  const membersWithTrackers = members.map(m => ({
    ...m,
    trackers: trackers.filter(t => t.owner === m.name),
  }))

  async function handleInvite({ name, email, role }) {
    setInviteLoading(true)
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const color    = MEMBER_COLORS[members.length % MEMBER_COLORS.length]
    const { data, error } = await supabase
      .from('family_members')
      .insert({ name, email, role, avatar: initials, color })
      .select()
      .single()
    if (error) setError(error.message)
    else setMembers(prev => [...prev, data])
    setInviteLoading(false)
    setShowModal(false)
  }

  async function handleDelete(id) {
    setDeleteId(null)
    const { error } = await supabase.from('family_members').delete().eq('id', id)
    if (error) setError(error.message)
    else setMembers(prev => prev.filter(m => m.id !== id))
  }

  const totalTrackers = trackers.length
  const totalOnline   = trackers.filter(t => t.status === 'online').length

  return (
    <>
      <div className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">Family</h1>
            <p className="text-slate-500 text-sm">
              {loading ? 'Loading…' : `${members.length} members · ${totalTrackers} trackers · ${totalOnline} online`}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-locus-600 text-white text-sm font-medium rounded-lg hover:bg-locus-700 transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Invite Member
          </motion.button>
        </motion.div>

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

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-3 gap-4 mt-6"
        >
          {[
            { label: 'Members',        value: members.length, icon: '👨‍👩‍👧‍👦' },
            { label: 'Total Trackers', value: totalTrackers,  icon: '🏷️' },
            { label: 'Online Now',     value: totalOnline,    icon: '✅' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4"
            >
              <span className="text-2xl w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">{s.icon}</span>
              <div>
                <p className="text-2xl font-display font-semibold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }}
          className="mt-6 space-y-3"
        >
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                Loading members…
              </motion.p>
            </div>
          ) : (
            <AnimatePresence>
              {membersWithTrackers.map((member, i) => (
                <MemberCard key={member.id} member={member} index={i} onDelete={id => setDeleteId(id)} />
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && <InviteModal onInvite={handleInvite} onClose={() => setShowModal(false)} loading={inviteLoading} />}
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
              <p className="text-3xl mb-3">👤</p>
              <h2 className="font-display text-lg font-semibold text-slate-900 mb-1">Remove member?</h2>
              <p className="text-sm text-slate-500 mb-6">They will lose access to the family group.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
