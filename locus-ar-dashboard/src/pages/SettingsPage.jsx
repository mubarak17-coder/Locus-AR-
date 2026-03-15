import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

function Section({ title, description, children, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.06 * index }}
      className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="font-display font-semibold text-slate-900 text-base">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </motion.div>
  )
}

function Row({ label, description, children }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        value ? 'bg-locus-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
          value ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function SavedBadge({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium"
        >
          ✓ Saved
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export default function SettingsPage() {
  // Profile
  const [name, setName]       = useState('Yerassyl Mubarak')
  const [email, setEmail]     = useState('yerassyl@locus.ar')
  const [phone, setPhone]     = useState('+7 701 000 0000')
  const [savedProfile, setSavedProfile] = useState(false)

  // Notifications
  const [notifPush,    setNotifPush]    = useState(true)
  const [notifEmail,   setNotifEmail]   = useState(false)
  const [notifLowBatt, setNotifLowBatt] = useState(true)
  const [notifOffline, setNotifOffline] = useState(true)
  const [notifFamily,  setNotifFamily]  = useState(true)

  // Preferences
  const [language,    setLanguage]    = useState('en')
  const [units,       setUnits]       = useState('metric')
  const [mapStyle,    setMapStyle]    = useState('dark')
  const [updateFreq,  setUpdateFreq]  = useState('30')

  // Privacy
  const [shareLocation, setShareLocation] = useState(true)
  const [analytics,     setAnalytics]     = useState(false)

  // Photo
  const photoInputRef = useRef(null)
  const [photoUrl, setPhotoUrl] = useState(null)

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (file) setPhotoUrl(URL.createObjectURL(file))
  }

  // Password modal
  const [showPwModal,  setShowPwModal]  = useState(false)
  const [pwCurrent,    setPwCurrent]    = useState('')
  const [pwNew,        setPwNew]        = useState('')
  const [pwConfirm,    setPwConfirm]    = useState('')
  const [savedPw,      setSavedPw]      = useState(false)

  function handleSavePassword(e) {
    e.preventDefault()
    if (!pwCurrent || pwNew !== pwConfirm || pwNew.length < 6) return
    setSavedPw(true)
    setTimeout(() => {
      setSavedPw(false)
      setShowPwModal(false)
      setPwCurrent(''); setPwNew(''); setPwConfirm('')
    }, 1500)
  }

  // 2FA modal
  const [show2FAModal, setShow2FAModal] = useState(false)

  // Danger zone modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm,   setDeleteConfirm]   = useState('')
  const [deleted,         setDeleted]         = useState(false)

  function handleSaveProfile(e) {
    e.preventDefault()
    setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 2500)
  }

  async function handleDeleteAccount() {
    await Promise.all([
      supabase.from('trackers').delete().neq('id', 0),
      supabase.from('family_members').delete().neq('id', 0),
      supabase.from('notifications').delete().neq('id', 0),
    ])
    setShowDeleteModal(false)
    setDeleteConfirm('')
    setDeleted(true)
  }

  return (
    <>
      <div className="flex-1 p-8 overflow-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your account and application preferences</p>
        </motion.div>

        <div className="space-y-6">

          {/* ── Profile ── */}
          <Section title="Profile" description="Your personal information" index={1}>
            <div className="px-6 py-5">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-locus-500 flex items-center justify-center text-white text-xl font-semibold shrink-0 overflow-hidden">
                  {photoUrl
                    ? <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" />
                    : name.split(' ').map(w => w[0]).join('').slice(0, 2)
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">{email}</p>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="mt-1.5 text-xs text-locus-600 hover:text-locus-700 font-medium transition-colors"
                  >
                    Change photo
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-5 py-2.5 bg-locus-600 text-white text-sm font-medium rounded-lg hover:bg-locus-700 transition-colors"
                  >
                    Save Changes
                  </motion.button>
                  <SavedBadge show={savedProfile} />
                </div>
              </form>
            </div>
          </Section>

          {/* ── Notifications ── */}
          <Section title="Notifications" description="Choose what you want to be notified about" index={2}>
            <Row label="Push Notifications" description="Receive alerts on your device">
              <Toggle value={notifPush} onChange={setNotifPush} />
            </Row>
            <Row label="Email Notifications" description="Get summaries in your inbox">
              <Toggle value={notifEmail} onChange={setNotifEmail} />
            </Row>
            <Row label="Low Battery Alert" description="When a tracker drops below 20%">
              <Toggle value={notifLowBatt} onChange={setNotifLowBatt} />
            </Row>
            <Row label="Tracker Goes Offline" description="Notify when a device disconnects">
              <Toggle value={notifOffline} onChange={setNotifOffline} />
            </Row>
            <Row label="Family Activity" description="When family members update their trackers">
              <Toggle value={notifFamily} onChange={setNotifFamily} />
            </Row>
          </Section>

          {/* ── Preferences ── */}
          <Section title="Preferences" description="Customize the app behaviour" index={3}>
            <Row label="Language" description="Interface language">
              <Select
                value={language}
                onChange={setLanguage}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'ru', label: 'Русский' },
                  { value: 'kk', label: 'Қазақша' },
                  { value: 'ar', label: 'العربية' },
                ]}
              />
            </Row>
            <Row label="Distance Units" description="How distances are displayed">
              <Select
                value={units}
                onChange={setUnits}
                options={[
                  { value: 'metric',   label: 'Metric (m, km)' },
                  { value: 'imperial', label: 'Imperial (ft, mi)' },
                ]}
              />
            </Row>
            <Row label="Map Style" description="Default map appearance">
              <Select
                value={mapStyle}
                onChange={setMapStyle}
                options={[
                  { value: 'dark',     label: 'Dark' },
                  { value: 'light',    label: 'Light' },
                  { value: 'streets',  label: 'Streets' },
                  { value: 'satellite',label: 'Satellite' },
                ]}
              />
            </Row>
            <Row label="Update Frequency" description="How often tracker positions refresh">
              <Select
                value={updateFreq}
                onChange={setUpdateFreq}
                options={[
                  { value: '10',  label: 'Every 10 sec' },
                  { value: '30',  label: 'Every 30 sec' },
                  { value: '60',  label: 'Every 1 min' },
                  { value: '300', label: 'Every 5 min' },
                ]}
              />
            </Row>
          </Section>

          {/* ── Privacy & Security ── */}
          <Section title="Privacy & Security" description="Control your data and access" index={4}>
            <Row label="Share Location with Family" description="Family members can see your position">
              <Toggle value={shareLocation} onChange={setShareLocation} />
            </Row>
            <Row label="Analytics" description="Help improve Locus AR with anonymous usage data">
              <Toggle value={analytics} onChange={setAnalytics} />
            </Row>
            <Row label="Password" description="Last changed 3 months ago">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPwModal(true)}
                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Change Password
              </motion.button>
            </Row>
            <Row label="Two-Factor Auth" description="Add an extra layer of security">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShow2FAModal(true)}
                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Enable 2FA
              </motion.button>
            </Row>
          </Section>

          {/* ── Danger Zone ── */}
          <Section title="Danger Zone" index={5}>
            <Row label="Delete Account" description="Permanently remove your account and all data">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete Account
              </motion.button>
            </Row>
          </Section>

        </div>
      </div>

      {/* Account deleted screen */}
      <AnimatePresence>
        {deleted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-4"
          >
            <p className="text-5xl">✅</p>
            <h2 className="font-display text-xl font-semibold text-slate-900">Account deleted</h2>
            <p className="text-sm text-slate-500">All your data has been permanently removed.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPwModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPwModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">Change Password</h2>
              <form onSubmit={handleSavePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
                  <input type="password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                  <input type="password" value={pwNew} onChange={e => setPwNew(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-locus-500/20 focus:border-locus-500 transition-all" />
                </div>
                {pwNew && pwConfirm && pwNew !== pwConfirm && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowPwModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    disabled={!pwCurrent || pwNew.length < 6 || pwNew !== pwConfirm || savedPw}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-locus-600 text-white text-sm font-medium hover:bg-locus-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {savedPw ? '✓ Saved' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShow2FAModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-4xl mb-3">🔐</p>
              <h2 className="font-display text-lg font-semibold text-slate-900 mb-2">Two-Factor Authentication</h2>
              <p className="text-sm text-slate-500 mb-6">2FA via authenticator app is coming soon. You'll be notified when it's available.</p>
              <button onClick={() => setShow2FAModal(false)}
                className="w-full px-4 py-2.5 rounded-lg bg-locus-600 text-white text-sm font-medium hover:bg-locus-700 transition-colors">
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-3xl mb-3">⚠️</p>
              <h2 className="font-display text-lg font-semibold text-slate-900 mb-1">
                Delete your account?
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                All your trackers, family data and history will be permanently deleted. This cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Type <span className="font-mono text-red-500">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteConfirm !== 'DELETE'}
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
