// 🤖 验证码地狱 —— 永远过不了的人机验证
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

const EMOJIS = ['🐱', '🐶', '🐭', '🐹', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵']

function shuffleGrid() {
  return Array.from({ length: 9 }).map(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
}

export default function CaptchaHell({ onClose }) {
  const { t } = useI18n()
  const [grid, setGrid] = useState(shuffleGrid)
  const [selected, setSelected] = useState(new Set())
  const [fails, setFails] = useState(0)
  const [status, setStatus] = useState('idle')

  const toggle = (i) => {
    setStatus('idle')
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const verify = () => {
    setStatus('verifying')
    setTimeout(() => {
      setStatus('fail')
      setFails((n) => n + 1)
      setSelected(new Set())
      setGrid(shuffleGrid())
    }, 900)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-void"
    >
      <div className="w-[92%] max-w-md rounded-2xl border border-frost/20 bg-[#0e0e16] p-6 shadow-[0_0_50px_-15px_rgba(122,252,255,0.3)] md:p-8">
        <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-frost/70">reCAPTCHA_FROM_HELL</div>
        <h2 className="font-display text-xl font-bold text-white md:text-2xl">{t('captcha.title')}</h2>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-zinc-400">{t('captcha.tip')}</p>

        <div className="mt-5 grid grid-cols-3 gap-1.5">
          {grid.map((emoji, i) => (
            <motion.button
              key={i}
              onClick={() => toggle(i)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex aspect-square items-center justify-center rounded-lg border-2 text-3xl transition md:text-4xl ${
                selected.has(i)
                  ? 'border-frost bg-frost/15'
                  : 'border-white/8 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              {emoji}
              {selected.has(i) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-frost text-[10px] text-void"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {status === 'fail' && (
            <motion.div
              key="fail"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-lg border border-plasma/30 bg-plasma/10 px-4 py-2 text-center font-mono text-[11px] text-plasma"
            >
              ✕ {t('captcha.fail')} ({fails})
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={verify}
          disabled={selected.size === 0 || status === 'verifying'}
          whileHover={{ scale: selected.size > 0 ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-display text-sm font-bold transition ${
            selected.size === 0
              ? 'cursor-not-allowed bg-white/5 text-zinc-600'
              : 'bg-frost text-void'
          }`}
        >
          {status === 'verifying' ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ◌
              </motion.span>
              VERIFYING...
            </>
          ) : (
            <>✓ {t('captcha.verify')}</>
          )}
        </motion.button>

        <div className="mt-3 text-center font-mono text-[10px] text-zinc-600">
          {t('captcha.hint')}
        </div>
      </div>
    </motion.div>
  )
}
