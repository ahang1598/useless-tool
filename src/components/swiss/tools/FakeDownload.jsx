// 📡 假装下载 —— 1TB 的"人生意义.zip"，2KB/s，预计剩余：永永远远
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function FakeDownload({ onClose }) {
  const { t } = useI18n()
  const TOTAL = 1099511627776
  const SPEED = 2048
  const [downloaded, setDownloaded] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const sec = (Date.now() - start) / 1000
      setElapsed(sec)
      setDownloaded(sec * SPEED * 1.5)
    }, 200)
    return () => clearInterval(id)
  }, [])

  const pct = (downloaded / TOTAL) * 100
  const fmtBytes = (b) => {
    if (b < 1024) return b.toFixed(0) + ' B'
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
    if (b < 1073741824) return (b / 1048576).toFixed(2) + ' MB'
    return (b / 1073741824).toFixed(3) + ' GB'
  }
  const fmtTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden bg-void"
    >
      <div className="w-[92%] max-w-lg rounded-2xl border border-frost/20 bg-[#0e0e16] p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-frost/15 text-2xl">📦</div>
          <div className="flex-1">
            <div className="font-display text-base font-bold text-white md:text-lg">{t('download.file')}</div>
            <div className="font-mono text-[11px] text-zinc-500">{t('download.size')} · {t('download.speed')}</div>
          </div>
        </div>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full bg-gradient-to-r from-frost to-acid"
            animate={{ width: `${Math.max(0.5, pct)}%` }}
          />
        </div>

        <div className="mt-3 flex items-baseline justify-between font-mono text-[11px]">
          <span className="text-zinc-400">
            {fmtBytes(downloaded)} <span className="text-zinc-600">/ {t('download.size')}</span>
          </span>
          <span className="text-frost">{pct.toFixed(8)}%</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 font-mono text-[11px]">
          <div>
            <div className="text-zinc-600">{t('download.elapsed')}</div>
            <div className="mt-1 text-zinc-300">{fmtTime(elapsed)}</div>
          </div>
          <div className="text-right">
            <div className="text-zinc-600">ETA</div>
            <div className="mt-1 text-plasma">∞</div>
          </div>
        </div>

        <div className="mt-4 text-center font-mono text-[10px] text-zinc-600">
          {t('download.tip')} · {t('download.hint')}
        </div>
      </div>
    </motion.div>
  )
}
