// 🧭 薛定谔指南针 —— 指针永远疯狂乱转，指向"量子北"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function QuantumCompass({ onClose }) {
  const { t } = useI18n()
  const [angle, setAngle] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setAngle((prev) => prev + (Math.random() - 0.4) * 540)
    }, 80)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden bg-void"
    >
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-72 w-72 items-center justify-center rounded-full border-2 border-acid/30 bg-[radial-gradient(circle_at_30%_25%,#1a1a24,#0a0a0f)] shadow-[0_0_60px_-10px_rgba(212,255,58,0.3)] md:h-96 md:w-96">
          {/* 刻度 */}
          <svg className="absolute inset-2" viewBox="0 0 200 200">
            {Array.from({ length: 36 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="10"
                x2="100"
                y2={i % 9 === 0 ? '24' : '16'}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={i % 9 === 0 ? '1.5' : '1'}
                transform={`rotate(${i * 10} 100 100)`}
              />
            ))}
            {['N', 'E', 'S', 'W'].map((d, i) => (
              <text
                key={d}
                x="100"
                y="32"
                textAnchor="middle"
                fill={d === 'N' ? '#d4ff3a' : 'rgba(255,255,255,0.5)'}
                fontSize="12"
                fontFamily="monospace"
                transform={`rotate(${i * 90} 100 100)`}
              >
                {d}
              </text>
            ))}
          </svg>

          {/* 疯狂乱转的指针 */}
          <motion.svg
            className="absolute"
            style={{ width: '70%', height: '70%' }}
            viewBox="0 0 200 200"
            animate={{ rotate: angle }}
            transition={{ duration: 0.08, ease: 'linear' }}
          >
            <polygon points="100,20 92,100 108,100" fill="#ff2d75" />
            <polygon points="100,180 92,100 108,100" fill="rgba(255,255,255,0.7)" />
            <circle cx="100" cy="100" r="8" fill="#0a0a0f" stroke="#d4ff3a" strokeWidth="2" />
          </motion.svg>
        </div>

        <div className="mt-6 font-display text-2xl font-bold text-acid md:text-3xl">
          {t('compass.title')}
        </div>
        <div className="mt-2 max-w-xs px-6 text-center font-mono text-[11px] leading-relaxed text-zinc-500">
          {t('compass.tip')}
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-widest text-zinc-600">
          {t('compass.hint')}
        </div>
      </div>
    </motion.div>
  )
}
