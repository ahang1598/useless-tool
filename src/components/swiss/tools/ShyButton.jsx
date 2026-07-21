// 🙈 躲猫猫按钮 —— 鼠标一靠近就溜，永远点不到，分手利器
import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function ShyButton({ onClose }) {
  const { t } = useI18n()
  const btnRef = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [escapes, setEscapes] = useState(0)

  const flee = useCallback(() => {
    const padding = 120
    const x = (Math.random() - 0.5) * (window.innerWidth - padding * 2)
    const y = (Math.random() - 0.5) * (window.innerHeight - padding * 2)
    setPos({ x, y })
    setEscapes((n) => n + 1)
  }, [])

  const onMove = useCallback(
    (e) => {
      const el = btnRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
      if (dist < 140) flee()
    },
    [flee]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={onMove}
      onTouchMove={(e) => {
        if (e.touches[0]) onMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY })
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-void"
    >
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-[5rem] leading-none opacity-20 md:text-[8rem]"
        >
          🙈
        </motion.div>
        <div className="mt-8 font-display text-3xl font-bold text-frost/40 md:text-5xl">
          {t('shy.title')}
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-widest text-zinc-600">
          {t('shy.hint')}
        </div>
        <div className="mt-1 font-mono text-[10px] text-zinc-700">
          {t('shy.tip')}
        </div>
      </div>

      <motion.button
        ref={btnRef}
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onMouseEnter={flee}
        onClick={flee}
        className="group absolute flex items-center gap-2 rounded-full border border-frost/50 bg-frost/10 px-6 py-4 font-display text-base font-bold text-frost backdrop-blur-sm md:text-xl"
      >
        <span className="text-2xl">👆</span>
        {t('shy.hint')}
      </motion.button>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-widest text-zinc-500">
        ESCAPES: <span className="text-frost">{escapes}</span>
      </div>
    </motion.div>
  )
}
