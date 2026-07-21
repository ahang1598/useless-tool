// 🔮 离谱占卜 —— 今日运势，比星座准（因为不准得坦荡）
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function FortuneTeller({ onClose }) {
  const { t } = useI18n()
  const fortunes = t('fortunes')
  const [fortune, setFortune] = useState(null)
  const [drawing, setDrawing] = useState(false)

  const draw = () => {
    setDrawing(true)
    setFortune(null)
    setTimeout(() => {
      setFortune(fortunes[Math.floor(Math.random() * fortunes.length)])
      setDrawing(false)
    }, 1400)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a0a2a] to-[#0a0a0f]"
    >
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full bg-white"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <div onClick={(e) => e.stopPropagation()} className="relative flex flex-col items-center px-6">
        <motion.div
          animate={{ rotate: drawing ? 360 : 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="relative flex h-44 w-44 items-center justify-center md:h-52 md:w-52"
        >
          <div className="absolute inset-0 rounded-full bg-frost/20 blur-3xl" />
          <div className="absolute inset-0 rounded-full border-2 border-frost/30 bg-[radial-gradient(circle_at_35%_30%,rgba(122,252,255,0.3),rgba(10,10,20,0.9))]" />
          <motion.div
            animate={{ scale: drawing ? [1, 1.2, 1] : [1, 1.05, 1] }}
            transition={{ duration: drawing ? 0.3 : 2, repeat: Infinity }}
            className="relative text-6xl md:text-7xl"
          >
            {drawing ? '🌀' : '🔮'}
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {fortune ? (
            <motion.div
              key={JSON.stringify(fortune)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <div className="font-display text-sm tracking-[0.3em] text-frost/70">{t('fortune.title')}</div>
              <div className="mt-4 flex gap-6">
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-acid">{t('fortune.good')}</div>
                  <div className="mt-1 font-display text-lg font-bold text-acid md:text-xl">{fortune.good}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-plasma">{t('fortune.bad')}</div>
                  <div className="mt-1 font-display text-lg font-bold text-plasma md:text-xl">{fortune.bad}</div>
                </div>
              </div>
            </motion.div>
          ) : drawing ? (
            <motion.div
              key="drawing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 font-mono text-[11px] tracking-widest text-frost/60"
            >
              consulting the universe
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          onClick={draw}
          disabled={drawing}
          whileHover={{ scale: drawing ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`mt-8 rounded-full px-10 py-4 font-display text-base font-bold transition ${
            drawing ? 'cursor-not-allowed bg-white/10 text-zinc-500' : 'bg-frost text-void'
          }`}
        >
          {fortune ? t('fortune.hint') : t('fortune.draw')}
        </motion.button>

        <div className="mt-4 font-mono text-[10px] tracking-widest text-zinc-600">
          {t('fortune.tip')}
        </div>
      </div>
    </motion.div>
  )
}
