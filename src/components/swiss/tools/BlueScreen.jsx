// 💀 蓝屏模拟器 —— 经典 Windows BSOD，吓哭一办公室
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function BlueScreen({ onClose }) {
  const { t } = useI18n()
  const [progress, setProgress] = useState(0)
  const [code] = useState(
    () => '0x' + Array.from({ length: 8 }).map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')
  )

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.random() * 8))
    }, 400)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={progress >= 100 ? onClose : undefined}
      className={`fixed inset-0 z-[60] flex flex-col justify-center bg-[#0078d7] px-[8%] py-[10%] text-white ${progress >= 100 ? 'cursor-pointer' : ''}`}
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      <div className="max-w-3xl">
        <div className="text-[8rem] font-light leading-none md:text-[12rem]">:(</div>

        <div className="mt-6 text-2xl font-light leading-snug md:text-3xl">
          {t('bluescreen.tip')}
        </div>
        <div className="mt-6 text-base font-light leading-relaxed text-white/90 md:text-lg">
          {t('bluescreen.collecting')}
        </div>

        <div className="mt-3 h-2 w-full max-w-md overflow-hidden bg-white/20">
          <motion.div
            className="h-full bg-white"
            animate={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-sm font-light text-white/80">
          {Math.floor(progress)}% {t('bluescreen.complete')}
        </div>

        <div className="mt-10 flex flex-col gap-1 text-sm font-light text-white/80 md:flex-row md:gap-8">
          <span>{t('bluescreen.code')}: {code}</span>
          <span>kernel32.sys</span>
          <span>0x0000C0DE</span>
        </div>

        {progress >= 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 font-mono text-xs text-white/60"
          >
            {t('bluescreen.hint')}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
