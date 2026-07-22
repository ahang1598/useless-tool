import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/index.jsx'

// 时空碎片本体：菱形晶体 + 呼吸光晕 + 旋转虚线轨道 + 漂浮
export default function Shard({ onCollect }) {
  const { t } = useI18n()

  return (
    <motion.button
      aria-label="spacetime shard"
      onClick={onCollect}
      initial={{ scale: 0, opacity: 0, y: -40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 12 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      className="group relative h-16 w-16 cursor-pointer"
    >
      {/* 呼吸光晕 */}
      <span className="absolute inset-0 animate-pulse-glow rounded-full bg-frost/40 blur-xl" />
      <span className="absolute inset-2 rounded-full bg-acid/20 blur-md transition group-hover:bg-acid/40" />

      {/* 旋转虚线轨道 */}
      <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" stroke="rgba(212,255,58,0.3)" strokeWidth="1" strokeDasharray="2 6" />
      </svg>

      {/* 菱形晶体 */}
      <motion.svg
        className="absolute inset-0 m-auto h-7 w-7"
        viewBox="0 0 28 28"
        animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="shardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4ff3a" />
            <stop offset="100%" stopColor="#7afcff" />
          </linearGradient>
        </defs>
        <path
          d="M14 2 L26 14 L14 26 L2 14 Z"
          fill="url(#shardGrad)"
          stroke="#d4ff3a"
          strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 0 6px rgba(212,255,58,0.8))' }}
        />
        <path d="M14 2 L14 26 M2 14 L26 14" stroke="rgba(10,10,15,0.4)" strokeWidth="0.5" />
      </motion.svg>

      {/* 首次提示：极淡的脉冲箭头 */}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-widest text-acid/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        {t('egg.hint')}
      </span>
    </motion.button>
  )
}
