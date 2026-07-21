// 🔊 扩音器 —— Web Audio 合成 1kHz 长鸣测试音
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function Megaphone({ onClose }) {
  const { t } = useI18n()
  const ctxRef = useRef(null)
  const [freq, setFreq] = useState(1000)

  useEffect(() => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      const ctx = new AC()
      ctxRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 1000
      gain.gain.value = 0.15
      osc.connect(gain).connect(ctx.destination)
      osc.start()

      const id = setInterval(() => {
        const f = 800 + Math.random() * 400
        setFreq(Math.round(f))
        osc.frequency.linearRampToValueAtTime(f, ctx.currentTime + 0.3)
      }, 600)

      return () => {
        clearInterval(id)
        osc.stop()
        ctx.close()
      }
    } catch (e) {
      // AudioContext 不可用就静默降级
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden bg-void"
    >
      {/* 声波扩散圈 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-acid"
            initial={{ width: 60, height: 60, opacity: 0.8 }}
            animate={{ width: [60, 700], height: [60, 700], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="text-[8rem] leading-none md:text-[12rem]"
        >
          🔊
        </motion.div>
        <div className="mt-4 font-display text-2xl font-bold text-acid md:text-3xl">
          {freq} Hz
        </div>
        <div className="mt-1 font-mono text-[11px] tracking-widest text-zinc-500">
          {t('megaphone.title')}
        </div>
        <div className="mt-4 max-w-xs px-6 text-center font-mono text-[11px] leading-relaxed text-zinc-500">
          {t('megaphone.tip')}
        </div>
        <div className="mt-4 font-mono text-[10px] tracking-widest text-zinc-600">
          {t('megaphone.hint')}
        </div>
      </div>
    </motion.div>
  )
}
