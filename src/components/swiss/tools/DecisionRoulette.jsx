// 🎰 不靠谱决策器 —— 离谱选项轮盘，帮你做决定（但选项不友好）
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function DecisionRoulette({ onClose }) {
  const { t } = useI18n()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [angle, setAngle] = useState(0)

  const options = t('decisions')
  const slice = 360 / options.length

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    const turns = 5 + Math.floor(Math.random() * 4)
    const finalAngle = angle + turns * 360 + Math.random() * 360
    setAngle(finalAngle)

    setTimeout(() => {
      const norm = ((-finalAngle % 360) + 360) % 360
      const idx = Math.floor(norm / slice) % options.length
      setResult(options[idx])
      setSpinning(false)
    }, 3200)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden bg-void"
    >
      <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center">
        <div className="relative flex h-72 w-72 items-center justify-center md:h-80 md:w-80">
          <div className="absolute -top-2 left-1/2 z-20 -translate-x-1/2 text-3xl text-plasma" style={{ filter: 'drop-shadow(0 0 6px rgba(255,45,117,0.6))' }}>
            ▼
          </div>

          <motion.div
            animate={{ rotate: angle }}
            transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full rounded-full border-2 border-plasma/30"
            style={{
              background: `conic-gradient(${options
                .map((_, i) => {
                  const c = i % 2 === 0 ? 'rgba(255,45,117,0.18)' : 'rgba(122,252,255,0.12)'
                  return `${c} ${i * slice}deg ${(i + 1) * slice}deg`
                })
                .join(', ')})`,
            }}
          >
            {options.map((opt, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 origin-left font-mono text-[9px] text-zinc-300"
                style={{
                  transform: `rotate(${i * slice + slice / 2}deg) translateX(70px)`,
                  width: '90px',
                }}
              >
                {opt}
              </div>
            ))}
          </motion.div>

          <div className="absolute z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-plasma bg-[#13131c] font-mono text-xl">
            🎰
          </div>
        </div>

        <motion.div
          key={result}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-6 h-10 text-center"
        >
          {result && (
            <div className="font-display text-2xl font-bold text-plasma md:text-3xl">
              {result}
            </div>
          )}
        </motion.div>

        <motion.button
          onClick={spin}
          disabled={spinning}
          whileHover={{ scale: spinning ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`mt-2 rounded-full px-10 py-4 font-display text-base font-bold transition ${
            spinning ? 'cursor-not-allowed bg-white/10 text-zinc-500' : 'bg-plasma text-white'
          }`}
        >
          {spinning ? '···' : t('decision.spin')}
        </motion.button>

        <div className="mt-4 max-w-xs px-6 text-center font-mono text-[11px] leading-relaxed text-zinc-500">
          {t('decision.tip')}
        </div>
        <div className="mt-2 font-mono text-[10px] tracking-widest text-zinc-600">
          {t('decision.hint')}
        </div>
      </div>
    </motion.div>
  )
}
