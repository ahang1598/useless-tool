// 🔁 确认地狱 —— 点确认又弹确认，无限套娃的浪漫
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function ConfirmHell({ onClose }) {
  const { t } = useI18n()
  const [depth, setDepth] = useState(1)

  // 确认：层数 +1
  const confirm = () => setDepth((d) => d + 1)
  // 取消：层数 -1，到 0 就放你走
  const cancel = () => {
    if (depth <= 1) onClose()
    else setDepth((d) => d - 1)
  }

  // 文案：根据深度重复"确认"字样
  const word = t('confirm.yes')
  const title = word.repeat(Math.min(depth, 6)) + (depth > 6 ? '...' : '') + '?'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-void/95 backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute left-6 top-20 font-mono text-[11px] leading-relaxed text-zinc-600">
        <div>DEPTH: <span className="text-plasma">{depth}</span></div>
        <div className="text-zinc-700">{t('confirm.tip')}</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={depth}
          initial={{ scale: 0.9, opacity: 0, rotateX: -20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.9, opacity: 0, rotateX: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative w-[90%] max-w-md rounded-2xl border border-plasma/30 bg-[#13131c] p-8 shadow-[0_0_60px_-15px_rgba(255,45,117,0.4)]"
        >
          <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-plasma/70">
            LAYER {depth}
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight text-white md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-zinc-400">
            {t('confirm.tip')}
          </p>

          <div className="mt-6 flex gap-3">
            <motion.button
              onClick={confirm}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex-1 rounded-xl bg-plasma px-6 py-3.5 font-display text-sm font-bold text-white"
            >
              {t('confirm.yes')}
            </motion.button>
            <motion.button
              onClick={cancel}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex-1 rounded-xl border border-white/15 px-6 py-3.5 font-display text-sm font-bold text-zinc-300"
            >
              {t('confirm.no')}
            </motion.button>
          </div>

          {depth >= 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center font-mono text-[10px] text-zinc-500"
            >
              {t('confirm.hint')}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-1">
        {Array.from({ length: Math.min(depth, 20) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-1.5 w-1.5 rounded-full bg-plasma"
          />
        ))}
      </div>
    </motion.div>
  )
}
