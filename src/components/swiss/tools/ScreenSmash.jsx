// 🔨 碎屏特效 —— 点击处生成放射状裂纹，纯 SVG 不负责维修
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function ScreenSmash({ onClose }) {
  const { t } = useI18n()
  const [cracks, setCracks] = useState([])

  const smash = useCallback((e) => {
    const x = e.clientX
    const y = e.clientY
    setCracks((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x,
        y,
        lines: Array.from({ length: 8 + Math.floor(Math.random() * 5) }).map(() => ({
          angle: Math.random() * 360,
          len: 40 + Math.random() * 80,
          branches: Math.random() > 0.5,
        })),
      },
    ])
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={smash}
      className="fixed inset-0 z-[60] cursor-crosshair overflow-hidden bg-gradient-to-br from-[#0a0a0f] to-[#15151f]"
    >
      <svg className="absolute inset-0 h-full w-full">
        {cracks.map((c) => (
          <g key={c.id} stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="none" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}>
            {c.lines.map((ln, i) => {
              const rad = (ln.angle * Math.PI) / 180
              const ex = c.x + Math.cos(rad) * ln.len
              const ey = c.y + Math.sin(rad) * ln.len
              const midX = c.x + Math.cos(rad) * ln.len * 0.5
              const midY = c.y + Math.sin(rad) * ln.len * 0.5
              return (
                <g key={i}>
                  <motion.path
                    d={`M ${c.x} ${c.y} L ${ex} ${ey}`}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.15 }}
                  />
                  {ln.branches && (
                    <motion.path
                      d={`M ${midX} ${midY} L ${midX + Math.cos(rad + 0.5) * ln.len * 0.3} ${midY + Math.sin(rad + 0.5) * ln.len * 0.3}`}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      strokeWidth="0.8"
                    />
                  )}
                </g>
              )
            })}
            <motion.circle
              cx={c.x}
              cy={c.y}
              r="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              fill="rgba(255,255,255,0.9)"
            />
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center">
        <div className="font-display text-2xl font-bold text-white/90 md:text-3xl">
          {t('smash.title')}
        </div>
        <div className="mt-2 max-w-xs px-6 text-center font-mono text-[11px] leading-relaxed text-zinc-400">
          {t('smash.tip')}
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-widest text-zinc-500">
          {t('smash.hint')}
        </div>
      </div>

      {cracks.length > 0 && (
        <div className="pointer-events-none absolute right-4 bottom-4 font-mono text-[10px] text-zinc-600">
          × {cracks.length}
        </div>
      )}
    </motion.div>
  )
}
