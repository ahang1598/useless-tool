import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/index.jsx'

// 顶部提示卡：显示奖励特效名
export default function Toast({ effectId, onDone }) {
  const { t } = useI18n()
  return (
    <motion.div
      className="fixed left-1/2 top-6 z-[70] -translate-x-1/2 md:top-10"
      initial={{ opacity: 0, y: -30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-acid/40 bg-[#0c0c14]/95 px-5 py-3 shadow-[0_0_30px_rgba(212,255,58,0.25)] backdrop-blur-md">
        <span className="text-xl">✦</span>
        <div>
          <div className="font-display text-sm font-bold text-acid">{t('egg.toastTitle')}</div>
          <div className="mt-0.5 font-mono text-[11px] text-zinc-400">{t('egg.toastSub')}</div>
          <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px]">
            <span className="text-zinc-500">{t('egg.reward')}:</span>
            <span className="font-bold text-frost">{t(`egg.effects.${effectId}`)}</span>
            <span className="text-zinc-600">· {t('egg.toastDur')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
