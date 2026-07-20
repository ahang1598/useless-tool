import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/index.jsx'

const PHASE = { IDLE: 'idle', SCAN: 'scan', DONE: 'done' }
const DURATION = 5000 // 5 秒，雷打不动

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function AiDetectOverlay({ open, onClose }) {
  const { t } = useI18n()
  const [phase, setPhase] = useState(PHASE.IDLE)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const [verdict, setVerdict] = useState('')
  const timersRef = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach(clearInterval)
    timersRef.current = []
  }

  const reset = () => {
    clearTimers()
    setPhase(PHASE.IDLE)
    setProgress(0)
    setLogs([])
    setVerdict('')
  }

  const startScan = () => {
    setPhase(PHASE.SCAN)
    setProgress(0)
    setLogs([pick(t('aidSteps'))])

    const startAt = Date.now()
    const progTimer = setInterval(() => {
      const elapsed = Date.now() - startAt
      const p = Math.min(100, (elapsed / DURATION) * 100)
      setProgress(p)
      if (elapsed >= DURATION) {
        clearTimers()
        setVerdict(pick(t('aidVerdicts')))
        setTimeout(() => setPhase(PHASE.DONE), 250)
      }
    }, 50)

    const logTimer = setInterval(() => {
      setLogs((prev) => [...prev.slice(-4), pick(t('aidSteps'))])
    }, 480)

    timersRef.current = [progTimer, logTimer]
  }

  // 组件卸载兜底清定时器，防止内存泄漏
  useEffect(() => () => clearTimers(), [])

  // 每次打开都重置回待机态
  useEffect(() => {
    if (open) reset()
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c14] shadow-[0_0_80px_-20px_rgba(212,255,58,0.3)]"
          >
            {/* 顶部光晕 */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-acid/20 blur-[80px]" />

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 font-mono text-xs text-zinc-400 transition hover:border-white/30 hover:text-zinc-100"
              aria-label="close"
            >
              ✕
            </button>

            <div className="relative z-10 px-6 py-8 md:px-10 md:py-10">
              <div className="mb-6 font-mono text-[10px] tracking-[0.3em] text-acid/80">
                {t('aid.mono')}
              </div>

              <AnimatePresence mode="wait">
                {/* === 待机阶段 === */}
                {phase === PHASE.IDLE && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h2 className="font-display text-[clamp(2rem,6vw,3rem)] font-bold leading-[0.95] tracking-tight">
                      {t('aid.title1')}
                      <br />
                      <span className="text-acid">{t('aid.title2')}</span>
                    </h2>
                    <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-zinc-400 md:text-sm">
                      {t('aid.intro')}
                      <span className="text-zinc-100">{t('aid.introHl')}</span>
                      {t('aid.introEnd')}
                    </p>

                    <motion.button
                      onClick={startScan}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="group mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-acid px-6 py-4 text-void"
                    >
                      <span className="font-display text-base font-bold md:text-lg">{t('aid.start')}</span>
                      <span className="font-mono text-xs tracking-widest text-void/60">{t('aid.startMono')}</span>
                    </motion.button>

                    <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600">
                      * {t('aid.note').replace(/^\*\s*/, '')}
                    </p>
                  </motion.div>
                )}

                {/* === 推理中 === */}
                {phase === PHASE.SCAN && (
                  <motion.div
                    key="scan"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="font-mono text-[10px] tracking-[0.4em] text-frost/80">{t('aid.scanningMono')}</div>

                    {/* 中央神经核心 */}
                    <div className="my-6 flex h-32 items-center justify-center">
                      <NeuralCore />
                    </div>

                    {/* 百分比 + 进度条 */}
                    <div className="flex items-baseline justify-between">
                      <motion.div
                        key={Math.floor(progress)}
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 1 }}
                        className="font-display text-4xl font-bold text-acid md:text-5xl"
                      >
                        {Math.floor(progress)}%
                      </motion.div>
                      <span className="font-mono text-[10px] tracking-widest text-zinc-500">{t('aid.remain')}</span>
                    </div>

                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full bg-gradient-to-r from-frost to-acid"
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: 'linear' }}
                      />
                    </div>

                    {/* 终端日志流 */}
                    <div className="mt-5 h-28 overflow-hidden rounded-lg border border-white/5 bg-black/40 px-3 py-2">
                      <AnimatePresence mode="popLayout">
                        {logs.slice(-4).map((log, i) => (
                          <motion.div
                            key={`${logs.length}-${i}`}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 py-0.5 font-mono text-[11px] text-zinc-300"
                          >
                            <span className="text-acid">{'>'}</span>
                            <span>{log}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* === 出结果 === */}
                {phase === PHASE.DONE && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="font-mono text-[10px] tracking-[0.4em] text-acid">{t('aid.resultMono')}</div>

                    {/* 大对勾 */}
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                      className="my-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-acid"
                    >
                      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
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

                    <h2 className="font-display text-[clamp(2rem,7vw,3.2rem)] font-bold leading-[0.95] tracking-tight">
                      {t('aid.result1')}
                      <span className="text-acid">{t('aid.result2')}</span>
                    </h2>
                    <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-zinc-300 md:text-base">
                      {t('aid.resultDesc')}
                    </p>

                    {/* 假装很专业的指标面板 */}
                    <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 font-mono text-[11px]">
                      <div>
                        <div className="text-zinc-600">{t('aid.confidence')}</div>
                        <div className="mt-1 text-acid">99.99%</div>
                      </div>
                      <div>
                        <div className="text-zinc-600">{t('aid.battery')}</div>
                        <div className="mt-1 text-frost">{t('aid.powered')}</div>
                      </div>
                      <div>
                        <div className="text-zinc-600">{t('aid.status')}</div>
                        <div className="mt-1 text-zinc-200">{t('aid.normal')}</div>
                      </div>
                    </div>

                    <p className="mt-5 max-w-sm font-mono text-[11px] leading-relaxed text-zinc-500">{verdict}</p>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <button
                        onClick={startScan}
                        className="rounded-full bg-acid px-5 py-2.5 font-display text-sm font-bold text-void"
                      >
                        {t('aid.again')}
                      </button>
                      <button
                        onClick={onClose}
                        className="rounded-full border border-white/20 px-5 py-2.5 font-mono text-xs tracking-widest text-zinc-300 hover:border-white/50"
                      >
                        {t('aid.close')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 神经核心：同心旋转环 + 中央脉冲，主打一个赛博感
function NeuralCore() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <div className="absolute h-16 w-16 animate-pulse-glow rounded-full bg-acid/40 blur-2xl" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`absolute rounded-full border ${i % 2 === 0 ? 'animate-spin-slow' : 'animate-spin-rev'}`}
          style={{
            width: `${(i + 1) * 4}rem`,
            height: `${(i + 1) * 4}rem`,
            borderColor: i % 2 === 0 ? 'rgba(212,255,58,0.15)' : 'rgba(122,252,255,0.12)',
            borderTopColor: i % 2 === 0 ? 'rgba(212,255,58,0.7)' : 'rgba(122,252,255,0.7)',
            animationDuration: `${3 + i * 1.5}s`,
          }}
        />
      ))}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-acid font-mono text-[10px] font-bold text-void"
      >
        AI
      </motion.div>
    </div>
  )
}
