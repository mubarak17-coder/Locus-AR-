import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrackers } from '../context/TrackersContext'

// Map COCO-SSD labels → tracker icons/names
const LABEL_MAP = {
  backpack:   { icon: '🎒', name: 'Backpack' },
  handbag:    { icon: '👛', name: 'Wallet' },
  suitcase:   { icon: '🧳', name: 'Luggage' },
  'cell phone': { icon: '📱', name: 'Phone' },
  laptop:     { icon: '💼', name: 'Laptop' },
  keyboard:   { icon: '⌨️', name: 'Keyboard' },
  car:        { icon: '🚗', name: 'Car Keys' },
  dog:        { icon: '🐶', name: 'Pet Tracker' },
  cat:        { icon: '🐱', name: 'Pet Tracker' },
  person:     { icon: '👤', name: 'Family Member' },
  umbrella:   { icon: '☂️', name: 'Umbrella' },
  bottle:     { icon: '🏷️', name: 'Tracker' },
  cup:        { icon: '🏷️', name: 'Tracker' },
  book:       { icon: '🏷️', name: 'Tracker' },
  scissors:   { icon: '✂️', name: 'Tracker' },
  'sports ball': { icon: '⚽', name: 'Sports Gear' },
  bicycle:    { icon: '🚲', name: 'Bicycle' },
  motorcycle: { icon: '🏍️', name: 'Motorcycle' },
}

const CONFIDENCE_THRESHOLD = 0.55

export default function ARSearchPage() {
  const { trackers } = useTrackers()
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const modelRef   = useRef(null)
  const rafRef     = useRef(null)
  const streamRef  = useRef(null)

  const [cameraOn,    setCameraOn]    = useState(false)
  const [modelState,  setModelState]  = useState('idle') // idle | loading | ready | error
  const [detections,  setDetections]  = useState([])
  const [matched,     setMatched]     = useState(null) // tracker matched to detection
  const [camError,    setCamError]    = useState(null)

  // ── Load model ────────────────────────────────────────────────
  async function loadModel() {
    if (modelRef.current) return true
    setModelState('loading')
    try {
      const cocoSsd = await import('@tensorflow-models/coco-ssd')
      await import('@tensorflow/tfjs')
      modelRef.current = await cocoSsd.load()
      setModelState('ready')
      return true
    } catch (e) {
      setModelState('error')
      return false
    }
  }

  // ── Start camera ──────────────────────────────────────────────
  async function startCamera() {
    setCamError(null)
    const ok = await loadModel()
    if (!ok) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
    } catch (e) {
      setCamError('Camera access denied. Please allow camera permissions.')
    }
  }

  // ── Stop camera ───────────────────────────────────────────────
  function stopCamera() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    const ctx = canvasRef.current?.getContext('2d')
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setCameraOn(false)
    setDetections([])
    setMatched(null)
  }

  // ── Detection loop ────────────────────────────────────────────
  const detect = useCallback(async () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    const model  = modelRef.current
    if (!video || !canvas || !model || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect)
      return
    }

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')

    const preds = await model.detect(video)
    const filtered = preds.filter(p => p.score >= CONFIDENCE_THRESHOLD)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    filtered.forEach(pred => {
      const [x, y, w, h] = pred.bbox
      const mapped = LABEL_MAP[pred.class]
      const color = mapped ? '#6366f1' : '#94a3b8'
      const label = mapped ? `${mapped.icon} ${mapped.name}` : pred.class

      // Bounding box
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.shadowColor = color
      ctx.shadowBlur = 8
      ctx.strokeRect(x, y, w, h)
      ctx.shadowBlur = 0

      // Label background
      ctx.fillStyle = color
      const fontSize = Math.max(13, canvas.width * 0.016)
      ctx.font = `bold ${fontSize}px system-ui`
      const textW = ctx.measureText(label).width
      ctx.fillRect(x, y - fontSize - 8, textW + 16, fontSize + 10)

      // Label text
      ctx.fillStyle = '#ffffff'
      ctx.fillText(label, x + 8, y - 6)

      // Confidence
      ctx.fillStyle = color + 'cc'
      ctx.font = `${fontSize * 0.8}px system-ui`
      ctx.fillText(`${Math.round(pred.score * 100)}%`, x + 8, y + h - 6)
    })

    setDetections(filtered)

    // Match to trackers
    const hit = filtered.find(p => LABEL_MAP[p.class])
    if (hit) {
      const mapped = LABEL_MAP[hit.class]
      const tracker = trackers.find(t =>
        t.name.toLowerCase().includes(mapped.name.toLowerCase()) ||
        mapped.name.toLowerCase().includes(t.name.toLowerCase()) ||
        t.icon === mapped.icon
      )
      setMatched(tracker ?? { name: mapped.name, icon: mapped.icon, status: 'online', location: 'Detected', battery: null })
    } else {
      setMatched(null)
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [trackers])

  // Start detect loop when camera turns on
  useEffect(() => {
    if (cameraOn) {
      rafRef.current = requestAnimationFrame(detect)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [cameraOn, detect])

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [])

  return (
    <div className="flex-1 flex flex-col p-8 overflow-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">AR Search</h1>
          <p className="text-slate-500 text-sm">Point your camera to find and identify nearby items</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={cameraOn ? stopCamera : startCamera}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm ${
            cameraOn
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-locus-600 text-white hover:bg-locus-700'
          }`}
        >
          {cameraOn ? '⏹ Stop Camera' : '📷 Start Camera'}
        </motion.button>
      </motion.div>

      {/* Camera / Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Video */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${cameraOn ? '' : 'hidden'}`}
          muted playsInline
        />

        {/* Canvas overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full ${cameraOn ? '' : 'hidden'}`}
        />

        {/* Scanning animation */}
        {cameraOn && (
          <motion.div
            className="absolute inset-x-0 h-0.5 bg-locus-400/60 shadow-lg"
            style={{ boxShadow: '0 0 12px #818cf8' }}
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Placeholder when off */}
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl"
            >
              📷
            </motion.div>
            <div className="text-center">
              <p className="font-medium text-slate-300">Camera is off</p>
              <p className="text-sm mt-1">Click "Start Camera" to begin scanning</p>
            </div>
          </div>
        )}

        {/* Loading model */}
        {modelState === 'loading' && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-locus-400 border-t-transparent rounded-full"
            />
            <p className="text-white text-sm font-medium">Loading AI model…</p>
          </div>
        )}

        {/* Corner brackets */}
        {cameraOn && (
          <>
            {[
              'top-4 left-4 border-t-2 border-l-2',
              'top-4 right-4 border-t-2 border-r-2',
              'bottom-4 left-4 border-b-2 border-l-2',
              'bottom-4 right-4 border-b-2 border-r-2',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 ${cls} border-locus-400 rounded-sm`} />
            ))}
          </>
        )}

        {/* Matched tracker overlay */}
        <AnimatePresence>
          {matched && cameraOn && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md rounded-xl px-4 py-3 flex items-center gap-3 border border-locus-500/40"
            >
              <span className="text-3xl">{matched.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{matched.name}</p>
                <p className="text-slate-300 text-xs mt-0.5">
                  📍 {matched.location ?? 'Detected'} ·{' '}
                  <span className={matched.status === 'online' ? 'text-emerald-400' : 'text-slate-400'}>
                    {matched.status ?? 'detected'}
                  </span>
                  {matched.battery != null && ` · 🔋 ${matched.battery}%`}
                </p>
              </div>
              <span className="text-xs text-locus-400 font-medium bg-locus-900/50 px-2 py-1 rounded-lg">
                FOUND
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {(camError || modelState === 'error') && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          >
            ⚠️ {camError ?? 'Failed to load AI model. Please refresh the page.'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live detections list */}
      <AnimatePresence>
        {cameraOn && detections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-6"
          >
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Detected objects ({detections.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {detections.map((d, i) => {
                const mapped = LABEL_MAP[d.class]
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-slate-200 px-3 py-3 flex items-center gap-3 shadow-sm"
                  >
                    <span className="text-2xl">{mapped?.icon ?? '🔍'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {mapped?.name ?? d.class}
                      </p>
                      <p className="text-xs text-slate-400">{Math.round(d.score * 100)}% confidence</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {!cameraOn && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: '🔍', title: 'AI Detection', desc: 'Powered by COCO-SSD — identifies 80+ object types in real time' },
            { icon: '📍', title: 'Tracker Match', desc: 'Detected objects are matched against your registered trackers' },
            { icon: '⚡', title: 'Live Feed', desc: 'Scans every frame continuously for instant recognition' },
          ].map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
            >
              <span className="text-2xl">{tip.icon}</span>
              <p className="text-sm font-semibold text-slate-800 mt-2 mb-1">{tip.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
