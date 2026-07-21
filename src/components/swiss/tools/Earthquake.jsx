// 🎢 地震模式 —— 整屏疯狂抖动，"请勿惊慌这只是 CSS keyframes"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function Earthquake({ onClose }) {
  const { t } = useI18n()
  const [magnitude, setMagnitude] = useState(7.2)

  useEffect(() => {
    const id = setInterval(() => {
      setMagnitude(6 + Math.random() * 2.5)
    }, 600)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] cursor-pointer overflow-hidden bg-gradient-to-b from-[#2a0a0a] to-[#0a0a0f]"
    >
      <motion.div
        animate={{
          x: [0, -8, 6, -4, 8, -6, 0],
          y: [0, 4, -6, 8, -4, 6, 0],
        }}
        transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-[7rem] leading-none md:text-[10rem]"
        >
          ⚠️
        </motion.div>
        <div className="mt-2 font-display text-4xl font-bold text-red-400 md:text-6xl" style={{ textShadow: '0 0 20px rgba(255,45,117,0.6)' }}>
          M {magnitude.toFixed(1)}
        </div>
        <div className="mt-1 font-mono text-[11px] tracking-widest text-red-300/70">
          {t('quake.magnitude')}
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center">
        <div className="font-display text-2xl font-bold text-white md:text-3xl">
          {t('quake.title')}
        </div>
        <div className="mt-2 max-w-xs px-6 text-center font-mono text-[11px] leading-relaxed text-zinc-400">
          {t('quake.tip')}
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-widest text-zinc-500">
          {t('quake.hint')}
        </div>
      </div>

      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute inset-x-0 top-0 h-1 bg-red-500"
      />
    </motion.div>
  )
}
