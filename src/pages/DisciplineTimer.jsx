import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/index.jsx'

// === 核心设定 ===
// 学习：计时 × 100 倍膨胀（你看起来在拼命，实际上在摸鱼）
// 休息：正常 1× 计时（残忍的真相）
const PHASE = { IDLE: 'idle', STUDY: 'study', REST: 'rest', PAUSED: 'paused' }
const STUDY_MULTIPLIER = 100
const STORAGE_KEY = 'ut-discipline'

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const d = JSON.parse(raw)
      return {
        studyRealMs: d.studyRealMs || 0,
        studyVirtualMs: d.studyVirtualMs || 0,
        restMs: d.restMs || 0,
      }
    }
  } catch (_) {
    // 控制：JSON 坏了就重置，主打一个优雅降级
  }
  return { studyRealMs: 0, studyVirtualMs: 0, restMs: 0 }
}

// ms → HH:MM:SS
function formatHMS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function DisciplineTimer() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const [phase, setPhase] = useState(PHASE.IDLE)
  const [pausedFrom, setPausedFrom] = useState(null)
  // 当前会话已累计的「显示」毫秒数（学习时已是膨胀后的值）
  const [sessionMs, setSessionMs] = useState(0)
  const [stats, setStats] = useState(loadStats)

  const rafRef = useRef(0)
  const lastTickRef = useRef(0)

  // 持久化累计数据，刷新页面也不丢（自律数据，必须存档）
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    } catch (_) {
      // 隐私模式 / 存储满了就放弃，不影响计时
    }
  }, [stats])

  // rAF 主循环：按当前阶段以不同速率累加
  useEffect(() => {
    if (phase !== PHASE.STUDY && phase !== PHASE.REST) return

    lastTickRef.current = performance.now()

    const loop = (now) => {
      const delta = now - lastTickRef.current
      lastTickRef.current = now

      if (phase === PHASE.STUDY) {
        // 100 倍膨胀：你「赚」到的虚拟学习时间 + 真实流逝
        const gain = delta * STUDY_MULTIPLIER
        setSessionMs((v) => v + gain)
        setStats((s) => ({
          ...s,
          studyRealMs: s.studyRealMs + delta,
          studyVirtualMs: s.studyVirtualMs + gain,
        }))
      } else if (phase === PHASE.REST) {
        // 休息正常走，不膨胀
        setSessionMs((v) => v + delta)
        setStats((s) => ({ ...s, restMs: s.restMs + delta }))
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase])

  const startStudy = () => {
    setSessionMs(0)
    setPausedFrom(null)
    setPhase(PHASE.STUDY)
  }
  const startRest = () => {
    setSessionMs(0)
    setPausedFrom(null)
    setPhase(PHASE.REST)
  }
  const pause = () => {
    setPausedFrom(phase)
    setPhase(PHASE.PAUSED)
  }
  const resume = () => {
    if (pausedFrom) setPhase(pausedFrom)
  }
  const stop = () => {
    setPhase(PHASE.IDLE)
    setPausedFrom(null)
    setSessionMs(0)
  }
  const resetAll = () => {
    if (typeof window !== 'undefined' && !window.confirm(t('disc.resetConfirm'))) return
    setStats({ studyRealMs: 0, studyVirtualMs: 0, restMs: 0 })
    setPhase(PHASE.IDLE)
    setPausedFrom(null)
    setSessionMs(0)
  }

  // 阶段色 & 文案
  const isStudy = phase === PHASE.STUDY || pausedFrom === PHASE.STUDY
  const isRest = phase === PHASE.REST || pausedFrom === PHASE.REST
  const isRunning = phase === PHASE.STUDY || phase === PHASE.REST
  const accent = isStudy ? 'acid' : isRest ? 'frost' : 'zinc'
  const accentHex = isStudy ? '#d4ff3a' : isRest ? '#7afcff' : '#52525b'

  // 自律指数 = 虚拟学习时长 / (虚拟学习 + 真实休息) × 100%
  // 由于学习被 100× 膨胀，所以你只要不全是休息，分数就好看（这就是自欺欺人）
  const denom = stats.studyVirtualMs + stats.restMs
  const discipline = denom > 0 ? Math.min(100, (stats.studyVirtualMs / denom) * 100) : 0

  // 圆环进度（每 60s 一圈，营造时钟呼吸感）
  const ringPct = (sessionMs / 1000) % 60
  const ringAngle = (ringPct / 60) * 360

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* 背景光晕：随阶段变色 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-1/3 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-[140px]"
          animate={{
            backgroundColor: isStudy
              ? 'rgba(212,255,58,0.18)'
              : isRest
              ? 'rgba(122,252,255,0.16)'
              : 'rgba(82,82,91,0.08)',
          }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="disc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative z-10 flex min-h-[100svh] flex-col px-6 pb-8 pt-[4.5rem] md:min-h-0 md:flex-1 md:px-14 md:pt-14"
        >
          {/* 顶部栏 */}
          <div className="mb-2 flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="font-mono text-[11px] tracking-widest text-zinc-500 transition hover:text-zinc-200"
            >
              {t('disc.back')}
            </button>
            <span
              className="font-mono text-[11px] tracking-[0.3em] transition-colors"
              style={{ color: accentHex }}
            >
              {t('disc.mono')}
            </span>
          </div>

          {/* 主舞台 */}
          <div className="flex flex-1 flex-col items-center justify-center py-6">
            {/* 阶段标签 */}
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-2 font-mono text-[11px] tracking-[0.4em]"
              style={{ color: accentHex }}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${isRunning ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: accentHex }}
              />
              {t(`disc.phase.${phase}`)}
              {phase === PHASE.PAUSED && pausedFrom && (
                <span className="text-zinc-500">· {t(`disc.phase.${pausedFrom}`)}</span>
              )}
            </motion.div>

            {/* 巨型计时器 + 圆环 */}
            <div className="relative flex h-64 w-64 items-center justify-center md:h-80 md:w-80">
              {/* 脉冲光圈 */}
              <motion.div
                className="absolute inset-0 rounded-full blur-2xl"
                animate={{ opacity: isRunning ? [0.4, 0.8, 0.4] : 0.25 }}
                transition={{ duration: 2.4, repeat: Infinity }}
                style={{ backgroundColor: `${accentHex}33` }}
              />
              {/* 外层旋转刻度 */}
              <svg className="absolute inset-0 animate-spin-slow" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="92"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
                {TICKS.map((a, i) => (
                  <line
                    key={i}
                    x1="100"
                    y1="10"
                    x2="100"
                    y2={i % 5 === 0 ? '22' : '16'}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="1"
                    transform={`rotate(${a} 100 100)`}
                  />
                ))}
              </svg>
              {/* 进度弧：根据会话秒数画圈 */}
              <svg className="absolute inset-0" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="84"
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="84"
                  fill="none"
                  stroke={accentHex}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="2 526"
                  style={{ transformOrigin: '100px 100px', rotate: `${ringAngle}deg` }}
                  animate={{ strokeDasharray: `${(ringPct / 60) * 526} 526` }}
                  transition={{ duration: 0.2 }}
                />
              </svg>

              {/* 中央时间 */}
              <div className="relative z-10 text-center">
                <motion.div
                  key={phase + '-time'}
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="font-display text-[clamp(2rem,7vw,3.5rem)] font-bold leading-none tracking-tight tabular-nums"
                  style={{ color: phase === PHASE.IDLE ? '#a1a1aa' : '#fff' }}
                >
                  {formatHMS(sessionMs)}
                </motion.div>
                <div className="mt-2 font-mono text-[10px] tracking-widest text-zinc-500">
                  {t('disc.currentSession')}
                </div>
                {/* 速率徽章 */}
                <motion.div
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] tracking-widest"
                  style={{
                    borderColor: `${accentHex}55`,
                    color: accentHex,
                    backgroundColor: `${accentHex}11`,
                  }}
                  animate={isRunning ? { scale: [1, 1.04, 1] } : {}}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  {isStudy ? `× ${STUDY_MULTIPLIER}` : isRest ? '× 1' : '× 0'}
                  <span className="text-zinc-500">{t('disc.speed')}</span>
                </motion.div>
              </div>
            </div>

            {/* 沙雕副文案 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-md text-center text-[12px] leading-relaxed text-zinc-500 md:text-[13px]"
            >
              {isStudy
                ? t('disc.hintStudy')
                : isRest
                ? t('disc.hintRest')
                : t('disc.hintIdle')}
            </motion.p>

            {/* 操作按钮组 */}
            <div className="mt-8 flex w-full max-w-lg flex-col items-center gap-3 md:flex-row md:justify-center">
              {/* 学习：主操作，acid */}
              <motion.button
                onClick={startStudy}
                disabled={phase === PHASE.STUDY}
                whileHover={{ scale: phase === PHASE.STUDY ? 1 : 1.03 }}
                whileTap={{ scale: phase === PHASE.STUDY ? 1 : 0.97 }}
                className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-4 font-display text-sm font-bold md:w-auto ${
                  phase === PHASE.STUDY
                    ? 'cursor-default bg-acid/30 text-acid'
                    : 'bg-acid text-void'
                }`}
              >
                <span>{t('disc.startStudy')}</span>
                <span className="font-mono text-[10px] tracking-widest opacity-70">×100</span>
                {phase !== PHASE.STUDY && (
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}
              </motion.button>

              {/* 休息：次操作，frost */}
              <motion.button
                onClick={startRest}
                disabled={phase === PHASE.REST}
                whileHover={{ scale: phase === PHASE.REST ? 1 : 1.03 }}
                whileTap={{ scale: phase === PHASE.REST ? 1 : 0.97 }}
                className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border px-6 py-4 font-display text-sm font-bold md:w-auto ${
                  phase === PHASE.REST
                    ? 'cursor-default border-frost/40 bg-frost/10 text-frost'
                    : 'border-frost/40 text-frost hover:bg-frost/10'
                }`}
              >
                <span>{t('disc.startRest')}</span>
                <span className="font-mono text-[10px] tracking-widest opacity-70">×1</span>
              </motion.button>
            </div>

            {/* 次级控制：暂停 / 继续 / 停止 */}
            <AnimatePresence>
              {phase !== PHASE.IDLE && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-center gap-4 font-mono text-[11px] tracking-widest"
                >
                  {phase === PHASE.PAUSED ? (
                    <button
                      onClick={resume}
                      className="text-zinc-300 underline-offset-4 transition hover:text-acid hover:underline"
                    >
                      {t('disc.resume')}
                    </button>
                  ) : (
                    <button
                      onClick={pause}
                      className="text-zinc-300 underline-offset-4 transition hover:text-acid hover:underline"
                    >
                      {t('disc.pause')}
                    </button>
                  )}
                  <span className="text-zinc-700">·</span>
                  <button
                    onClick={stop}
                    className="text-zinc-400 underline-offset-4 transition hover:text-plasma hover:underline"
                  >
                    {t('disc.stop')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* === 底部累计区 === */}
          <div className="border-t border-white/5 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-500">
                {t('disc.cumulativeMono')}
              </div>
              <button
                onClick={resetAll}
                className="font-mono text-[10px] tracking-widest text-zinc-600 underline-offset-4 transition hover:text-plasma hover:underline"
              >
                {t('disc.resetAll')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCell
                label={t('disc.statStudyVirtual')}
                value={formatHMS(stats.studyVirtualMs)}
                color="text-acid"
                tip={t('disc.statStudyVirtualTip')}
              />
              <StatCell
                label={t('disc.statStudyReal')}
                value={formatHMS(stats.studyRealMs)}
                color="text-zinc-200"
                tip={t('disc.statStudyRealTip')}
              />
              <StatCell
                label={t('disc.statRest')}
                value={formatHMS(stats.restMs)}
                color="text-frost"
                tip={t('disc.statRestTip')}
              />
              <StatCell
                label={t('disc.statDiscipline')}
                value={`${discipline.toFixed(1)}%`}
                color="text-plasma"
                tip={t('disc.statDisciplineTip')}
              />
            </div>

            {/* 自律指数进度条 */}
            <div className="mt-4">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-acid via-frost to-plasma"
                  animate={{ width: `${discipline}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <div className="mt-2 font-mono text-[10px] leading-relaxed text-zinc-600">
                * {t('disc.disclaimer').replace(/^\*\s*/, '')}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// 统计单元
function StatCell({ label, value, color, tip }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <div className="font-mono text-[9px] tracking-wider text-zinc-500">{label}</div>
      <motion.div
        key={value}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        className={`mt-1 font-display text-lg font-bold tabular-nums md:text-xl ${color}`}
      >
        {value}
      </motion.div>
      <div className="mt-0.5 text-[10px] leading-tight text-zinc-600">{tip}</div>
    </div>
  )
}

// 24 个刻度（每 15° 一个）
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15)
