// 🔦 手电筒 —— 一行 background:#fff 即最大输出
// 全屏纯白，亮度渐入，轻触熄灭
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function Flashlight({ onClose }) {
  const { t } = useI18n()
  return (
    <motion.div
      initial={{ backgroundColor: '#0a0a0f' }}
      animate={{ backgroundColor: '#ffffff' }}
      exit={{ backgroundColor: '#0a0a0f' }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-end pb-16"
    >
      {/* 底部提示：黑字在白底上 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <div className="font-display text-2xl font-bold text-black md:text-3xl">
          {t('flashlight.hint')}
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-widest text-black/50">
          {t('flashlight.tip')}
        </div>
      </motion.div>
    </motion.div>
  )
}
