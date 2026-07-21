// 🌈 反色滤镜 —— 整屏 filter:invert，五彩斑斓的黑终于有了
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function InvertFilter({ onClose }) {
  const { t } = useI18n()
  return (
    <motion.div
      initial={{ filter: 'invert(0)' }}
      animate={{ filter: 'invert(1) hue-rotate(180deg)' }}
      exit={{ filter: 'invert(0)' }}
      transition={{ duration: 0.4 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0f, #1a0a2a, #0a1a2a)' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-40 w-40 rounded-full bg-acid blur-2xl" />
        <div className="absolute right-[15%] top-[25%] h-52 w-52 rounded-full bg-plasma blur-2xl" />
        <div className="absolute bottom-[20%] left-[25%] h-48 w-48 rounded-full bg-frost blur-2xl" />
        <div className="absolute bottom-[15%] right-[10%] h-44 w-44 rounded-full bg-white/30 blur-2xl" />
      </div>

      <div className="relative flex flex-col items-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="text-[7rem] leading-none md:text-[10rem]"
        >
          🌈
        </motion.div>
        <div className="mt-4 font-display text-3xl font-bold md:text-5xl">
          {t('invert.title')}
        </div>
        <div className="mt-4 max-w-sm text-center font-mono text-[12px] leading-relaxed text-zinc-200">
          {t('invert.tip')}
        </div>
        <div className="mt-4 font-mono text-[10px] tracking-widest text-zinc-300">
          {t('invert.hint')}
        </div>
      </div>
    </motion.div>
  )
}
