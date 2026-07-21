import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/index.jsx'

const PHASE = { IDLE: 'idle', TRAVELING: 'traveling', SUCCESS: 'success' }

const MIN_MS = 5 * 1000
const MAX_MS = 24 * 60 * 60 * 1000

const PRESETS = [
  { key: 's5', ms: 5 * 1000 },
  { key: 's30', ms: 30 * 1000 },
  { key: 'm1', ms: 60 * 1000 },
  { key: 'm10', ms: 10 * 60 * 1000 },
  { key: 'h1', ms: 60 * 60 * 1000 },
  { key: 'h24', ms: 24 * 60 * 60 * 1000 },
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function TimeMachine() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const [phase, setPhase] = useState(PHASE.IDLE)
  const [duration, setDuration] = useState(5 * 1000)
  const [remain, setRemain] = useState(0)
  const [logs, setLogs] = useState([])
  const [successLine, setSuccessLine] = useState('')
  const [departTime, setDepartTime] = useState(null)
  const timerRef = useRef(null)
  const logTimerRef = useRef(null)

  const minLog = Math.log(MIN_MS)
  const maxLog = Math.log(MAX_MS)
  const toSliderValue = (ms) => ((Math.log(ms) - minLog) / (maxLog - minLog)) * 1000
  const fromSliderValue = (v) => Math.exp(minLog + (v / 1000) * (maxLog - minLog))

  const formatDuration = (ms) => {
    const s = Math.floor(ms / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    const u = t('tm.unit')
    const parts = []
    if (h) parts.push(`${h} ${u.h}`)
    if (m) parts.push(`${m} ${u.m}`)
    if (sec || (!h && !m)) parts.push(`${sec} ${u.s}`)
    return parts.join(' ')
  }

  const formatCountdown = (ms) => {
    const total = Math.ceil(ms / 1000)
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    const pad = (n) => String(n).padStart(2, '0')
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
  }

  const startTravel = () => {
    setPhase(PHASE.TRAVELING)
    setRemain(duration)
    setDepartTime(new Date())
    setLogs([pick(t('travelLogs'))])

    const startAt = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startAt
      const left = Math.max(0, duration - elapsed)
      setRemain(left)
      if (left <= 0) {
        clearInterval(timerRef.current)
        clearInterval(logTimerRef.current)
        setSuccessLine(pick(t('successLines')))
        setPhase(PHASE.SUCCESS)
      }
    }, 100)

    logTimerRef.current = setInterval(() => {
      setLogs((prev) => [...prev.slice(-3), pick(t('travelLogs'))])
    }, 3500)
  }

  const abort = () => {
    clearInterval(timerRef.current)
    clearInterval(logTimerRef.current)
    setPhase(PHASE.IDLE)
    setLogs([])
  }

  const reset = () => {
    setPhase(PHASE.IDLE)
    setLogs([])
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(logTimerRef.current)
    }
  }, [])

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {/* === 设定阶段 === */}
        {phase === PHASE.IDLE && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative flex min-h-[100svh] flex-col items-center px-6 pb-6 pt-[4.5rem] md:min-h-0 md:flex-1 md:justify-center md:gap-8 md:px-14 md:pt-14"
          >
            {/* 漂浮时间符号背景 */}
            <FloatingSymbols />

            {/* 顶部栏：统一流式，避免 absolute 脱离单列 */}
            <div className="relative z-10 mb-2 flex items-center gap-3 md:mb-4">
              <button
                onClick={() => navigate('/')}
                className="font-mono text-[11px] tracking-widest text-zinc-500 hover:text-zinc-200"
              >
                {t('tm.back')}
              </button>
              <span className="font-mono text-[11px] tracking-[0.3em] text-acid">{t('tm.mono')}</span>
            </div>

            {/* 核心内容区：始终单列堆叠 */}
            <div className="relative z-10 flex w-full max-w-2xl flex-1 flex-col justify-center md:block md:flex-none">
              {/* 标题 */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-[clamp(2rem,6.5vw,5rem)] font-bold leading-[0.95] tracking-tight md:text-[clamp(2.5rem,8vw,5rem)]"
              >
                {t('tm.title1')}
                <br />
                <span className="text-frost">{t('tm.title2')}</span>
              </motion.h1>

              <p className="mt-2 max-w-md text-[12px] leading-relaxed text-zinc-400 md:mt-4 md:text-[15px]">
                {t('tm.intro')}<span className="text-zinc-200">{t('tm.introHl')}</span>{t('tm.introEnd')}
              </p>

              {/* 巨大时长仪式区：旋转刻度环 + 脉冲光圈 + 数字 */}
              <div className="my-5 flex items-center justify-center md:my-8 md:justify-start">
                <div className="relative flex h-40 w-40 items-center justify-center md:h-52 md:w-52">
                  {/* 脉冲光圈 */}
                  <div className="absolute inset-0 animate-pulse-glow rounded-full bg-frost/15 blur-2xl" />
                  {/* 旋转刻度环 */}
                  <svg className="absolute inset-0 animate-spin-slow" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(212,255,58,0.15)" strokeWidth="1" />
                    <circle cx="100" cy="100" r="92" fill="none" stroke="#d4ff3a" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 580" />
                    {TICKS.map((a, i) => (
                      <line key={i} x1="100" y1="10" x2="100" y2={i % 5 === 0 ? '22' : '16'} stroke="rgba(255,255,255,0.25)" strokeWidth="1" transform={`rotate(${a} 100 100)`} />
                    ))}
                  </svg>
                  {/* 反向内环 */}
                  <svg className="absolute inset-4 animate-spin-rev" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(122,252,255,0.2)" strokeWidth="1" strokeDasharray="2 10" />
                  </svg>
                  {/* 中央数字 */}
                  <motion.div
                    key={duration}
                    initial={{ opacity: 0.5, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center"
                  >
                    <div className="font-display text-2xl font-bold leading-none text-acid md:text-4xl">
                      {formatDuration(duration)}
                    </div>
                    <div className="mt-1 font-mono text-[9px] tracking-widest text-zinc-500">
                      {t('tm.target')}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* 仪器状态条：跳动的假数据，增加沙雕沉浸感 */}
              <StatusPanel />
            </div>

            {/* 底部交互区：紧随核心区，单列堆叠 */}
            <div className="relative z-10 mt-4 w-full md:mt-8 md:max-w-2xl">
              {/* 对数滑块 */}
              <div>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={toSliderValue(duration)}
                  onChange={(e) => setDuration(Math.round(fromSliderValue(+e.target.value)))}
                  className="slider w-full"
                  style={sliderStyle}
                />
                <div className="mt-2 flex justify-between font-mono text-[10px] tracking-widest text-zinc-600">
                  <span>{t('tm.rangeStart')}</span>
                  <span>{t('tm.rangeEnd')}</span>
                </div>
              </div>

              {/* 预设 */}
              <div className="mt-4 flex flex-wrap gap-2 md:mt-6">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setDuration(p.ms)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition md:px-4 md:py-2 ${
                      duration === p.ms
                        ? 'border-acid bg-acid/10 text-acid'
                        : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-zinc-200'
                    }`}
                  >
                    {t(`tm.preset.${p.key}`)}
                  </button>
                ))}
              </div>

              {/* 启动按钮 */}
              <motion.button
                onClick={startTravel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative mt-5 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-frost px-8 py-4 text-void md:mt-8 md:w-auto md:py-5"
              >
                <span className="font-display text-base font-bold md:text-lg">{t('tm.launch')}</span>
                <span className="font-mono text-xs tracking-widest text-void/60">{t('tm.launchMono')}</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.button>

              <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600 md:mt-4">
                * {t('tm.note').replace(/^\*\s*/, '')}
              </p>
            </div>
          </motion.div>
        )}

        {/* === 穿越中 === */}
        {phase === PHASE.TRAVELING && (
          <motion.div
            key="traveling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-black px-6"
          >
            <Wormhole />

            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-mono text-[11px] tracking-[0.4em] text-frost/80"
              >
                {t('tm.travelingMono')}
              </motion.div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 font-display text-[clamp(3rem,12vw,7rem)] font-bold leading-none text-white"
              >
                {formatCountdown(remain)}
              </motion.div>

              <div className="mt-2 font-mono text-xs tracking-widest text-zinc-500">{t('tm.remain')}</div>

              <div className="mt-10 h-24 w-full max-w-md overflow-hidden text-left">
                <AnimatePresence mode="popLayout">
                  {logs.slice(-3).map((log, i) => (
                    <motion.div
                      key={`${logs.length}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 py-1 font-mono text-[12px] text-zinc-300"
                    >
                      <span className="text-acid">{'>'}</span>
                      <span>{log}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-6 h-1 w-full max-w-md overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-frost to-acid"
                  animate={{ width: `${((duration - remain) / duration) * 100}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>

              <button
                onClick={abort}
                className="mt-10 font-mono text-[10px] tracking-widest text-zinc-600 underline-offset-4 hover:text-zinc-400 hover:underline"
              >
                {t('tm.abort')}
              </button>
            </div>
          </motion.div>
        )}

        {/* === 成功 === */}
        {phase === PHASE.SUCCESS && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-acid/20" />
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-2 border-acid"
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <motion.path
                  d="M10 24 L20 34 L38 14"
                  stroke="#d4ff3a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 mt-8 text-center"
            >
              <div className="font-mono text-[11px] tracking-[0.4em] text-acid">{t('tm.arrivalMono')}</div>
              <h2 className="mt-3 font-display text-[clamp(2.5rem,9vw,5rem)] font-bold leading-none">
                {t('tm.success')}
                <span className="text-acid">{t('tm.successAccent')}</span>
              </h2>

              <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-zinc-300">{successLine}</p>

              {departTime && (
                <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-4 border-t border-white/10 pt-6 text-left font-mono text-[11px]">
                  <div>
                    <div className="text-zinc-600">{t('tm.departure')}</div>
                    <div className="mt-1 text-zinc-300">{departTime.toLocaleTimeString('zh-CN')}</div>
                  </div>
                  <div>
                    <div className="text-zinc-600">{t('tm.arrival')}</div>
                    <div className="mt-1 text-frost">{new Date().toLocaleTimeString('zh-CN')}</div>
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={reset}
                  className="rounded-full bg-acid px-6 py-3 font-display text-sm font-bold text-void"
                >
                  {t('tm.again')}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="rounded-full border border-white/20 px-6 py-3 font-mono text-xs tracking-widest text-zinc-300 hover:border-white/50"
                >
                  {t('tm.home')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 漂浮的时间符号背景
function FloatingSymbols() {
  const items = [
    { s: '⏰', x: 8, y: 18, size: 1.8, d: 7 },
    { s: '⌛', x: 82, y: 14, size: 2.2, d: 9 },
    { s: '🌀', x: 14, y: 70, size: 2.6, d: 11 },
    { s: '✨', x: 88, y: 60, size: 1.4, d: 6 },
    { s: '⌖', x: 70, y: 82, size: 1.6, d: 8 },
    { s: '⏳', x: 24, y: 44, size: 1.5, d: 10 },
    { s: '∞', x: 60, y: 28, size: 2, d: 12 },
    { s: '๑', x: 44, y: 88, size: 1.3, d: 7.5 },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <motion.span
          key={i}
          className="absolute font-mono text-zinc-600/30 select-none"
          style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: `${it.size}rem` }}
          animate={{ y: [0, -18, 0], opacity: [0.15, 0.45, 0.15], rotate: [0, 8, 0] }}
          transition={{ duration: it.d, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
        >
          {it.s}
        </motion.span>
      ))}
    </div>
  )
}

// 仪器状态条：跳动的假数据
function StatusPanel() {
  const [, force] = useState(0)
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1600)
    return () => clearInterval(id)
  }, [])
  const rnd = (a, b) => a + Math.random() * (b - a)
  const rows = [
    { label: 'QUANTUM STABILITY', val: rnd(94, 99.8).toFixed(1) + '%', color: 'bg-acid', pct: rnd(88, 99) },
    { label: 'ENTROPY RESERVE', val: rnd(40, 80).toFixed(0) + ' TB', color: 'bg-frost', pct: rnd(40, 80) },
    { label: 'TIMELINE COherence', val: rnd(0.8, 1.2).toFixed(3) + ' τ', color: 'bg-plasma', pct: rnd(55, 95) },
  ]
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 py-1.5">
          <div className="w-36 shrink-0 font-mono text-[9px] tracking-wider text-zinc-500">{r.label}</div>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={`h-full ${r.color}`}
              animate={{ width: `${r.pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <div className="w-20 shrink-0 text-right font-mono text-[10px] text-zinc-300">{r.val}</div>
        </div>
      ))}
    </div>
  )
}

function Wormhole() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="absolute h-40 w-40 animate-pulse-glow rounded-full bg-frost/40 blur-3xl" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`absolute rounded-full border ${i % 2 === 0 ? 'animate-spin-slow' : 'animate-spin-rev'}`}
          style={{
            width: `${(i + 1) * 18}vmax`,
            height: `${(i + 1) * 18}vmax`,
            borderColor: i % 2 === 0 ? 'rgba(212,255,58,0.12)' : 'rgba(122,252,255,0.10)',
            borderTopColor: i % 2 === 0 ? 'rgba(212,255,58,0.5)' : 'rgba(122,252,255,0.5)',
            animationDuration: `${4 + i * 2}s`,
          }}
        />
      ))}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.r}px`,
            height: `${s.r}px`,
            opacity: s.o,
            animation: `twinkle ${s.d}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes twinkle {0%,100%{opacity:0.2} 50%{opacity:1}}`}</style>
    </div>
  )
}

// 刻度环的 12 个角度
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15)

const STARS = Array.from({ length: 40 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 2 + 0.5,
  o: Math.random() * 0.6 + 0.2,
  d: Math.random() * 3 + 2,
  delay: Math.random() * 3,
}))

const sliderStyle = {
  height: '4px',
  background: 'linear-gradient(to right, #d4ff3a, #7afcff)',
  borderRadius: '999px',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
}
