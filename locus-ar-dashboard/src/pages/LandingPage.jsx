import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: '📍',
    title: 'Real-Time Tracking',
    desc: 'See exactly where your items are at any moment with live location updates.',
  },
  {
    icon: '📷',
    title: 'AR Search',
    desc: 'Point your camera and find lost items through augmented reality guidance.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Sharing',
    desc: 'Share trackers with your family. Everyone stays connected and nothing gets lost.',
  },
  {
    icon: '🔋',
    title: 'Smart Alerts',
    desc: 'Get notified when battery is low or a tracker goes offline.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-8 py-5 border-b border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-locus-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-locus-600/30">
            📍
          </div>
          <span className="font-display text-lg font-semibold">Locus AR</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 bg-locus-600 text-white text-sm font-medium rounded-lg hover:bg-locus-700 transition-colors"
            >
              Go to Dashboard →
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login?mode=signup')}
                className="px-5 py-2 bg-locus-600 text-white text-sm font-medium rounded-lg hover:bg-locus-700 transition-colors shadow-lg shadow-locus-600/25"
              >
                Get Started
              </motion.button>
            </>
          )}
        </div>
      </motion.header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-20 h-20 bg-locus-600 rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-2xl shadow-locus-600/30"
        >
          📍
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display text-5xl sm:text-6xl font-bold leading-tight max-w-2xl"
        >
          Never lose what{' '}
          <span className="text-locus-400">matters most</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-slate-400 text-lg max-w-xl leading-relaxed"
        >
          Locus AR tracks your keys, wallet, and anything important — with real-time updates, AR search, and family sharing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(user ? '/dashboard' : '/login?mode=signup')}
            className="px-8 py-3.5 bg-locus-600 text-white font-semibold rounded-xl hover:bg-locus-700 transition-colors shadow-xl shadow-locus-600/30 text-base"
          >
            {user ? 'Go to Dashboard →' : 'Get Started Free'}
          </motion.button>
          {!user && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 hover:text-white transition-colors text-base"
            >
              Sign In
            </motion.button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex gap-10 mt-16 text-center"
        >
          {[['10k+', 'Active Users'], ['99.9%', 'Uptime'], ['50ms', 'Update Speed']].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white">{val}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 bg-slate-800/50 border-t border-slate-800">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center font-display text-3xl font-bold mb-12"
        >
          Everything you need
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-locus-600/50 transition-colors"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-white mt-3 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center border-t border-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-400 mb-8">Create your free account in seconds.</p>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(user ? '/dashboard' : '/login?mode=signup')}
            className="px-10 py-4 bg-locus-600 text-white font-semibold rounded-xl hover:bg-locus-700 transition-colors shadow-xl shadow-locus-600/25 text-base"
          >
            {user ? 'Go to Dashboard →' : 'Create Free Account'}
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 Locus AR · Secure location tracking
      </footer>
    </div>
  )
}
