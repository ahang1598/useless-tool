// ⏳ 永恒加载 —— 进度条永远卡在 99%，"就差一点点了宝贝"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function EternalLoading({ onClose }) {
  const { t } = useI18n()
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
      setProgress((p) => {
        if (p >= 99) return 99 + Math.random() * 0.8
        return p + Math.random() * 12
      })
    }, 300)
    return () => clearInterval(id)
  }, [])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-void"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-frost/15 blur-[120px]" />

      <div className="relative flex flex-col items-center">
        <div className="relative flex h-32 w-32 items-center justify-center md:h-40 md:w-40">
          <svg className="absolute inset-0 animate-spin-slow" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#7afcff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60 276"
            />
          </svg>
          <div className="font-display text-3xl font-bold text-frost md:text-4xl">
            {progress.toFixed(1)}%
          </div>
        </div>

        <div className="mt-8 font-display text-2xl font-bold text-white md:text-3xl">
          {t('loading.title')}
        </div>

        <div className="mt-5 h-1.5 w-64 overflow-hidden rounded-full bg-white/10 md:w-80">
          <motion.div
            className="h-full bg-gradient-to-r from-frost to-acid"
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 max-w-xs text-center font-mono text-[11px] leading-relaxed text-zinc-400">
          {progress >= 99 ? t('loading.hint') : t('loading.tip')}
        </div>

        <div className="mt-6 font-mono text-[10px] tracking-widest text-zinc-600">
          ⏱ {formatTime(elapsed)}
        </div>
      </div>
    </motion.div>
  )
}
