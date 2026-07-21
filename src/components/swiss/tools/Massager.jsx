// 📳 按摩器 —— navigator.vibrate 让手机抽搐，桌面靠画面抖动表达
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function Massager({ onClose }) {
  const { t } = useI18n()
  const [level, setLevel] = useState(5)

  useEffect(() => {
    // 手机端持续震动循环
    let id
    const vibe = () => {
      if (navigator.vibrate) navigator.vibrate(100)
      id = setTimeout(vibe, 150)
    }
    vibe()
    return () => clearTimeout(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden bg-void"
    >
      <motion.div
        animate={{
          x: [0, -3, 3, -2, 2, 0],
          y: [0, 2, -2, 3, -3, 0],
        }}
        transition={{ duration: 0.08, repeat: Infinity }}
        className="flex flex-col items-center"
      >
        <div className="text-[8rem] leading-none md:text-[12rem]">📳</div>
        <div className="mt-4 font-display text-2xl font-bold text-acid md:text-3xl">
          LV.{level} · {t('massager.title')}
        </div>
        <div className="mt-2 max-w-xs px-6 text-center font-mono text-[11px] leading-relaxed text-zinc-500">
          {t('massager.tip')}
        </div>

        {/* 假档位条 */}
        <div className="mt-6 flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-8 w-2 rounded-full"
              animate={{
                backgroundColor: i < level ? '#d4ff3a' : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
        <div className="mt-2 font-mono text-[10px] tracking-widest text-zinc-600">
          {t('massager.hint')}
        </div>
      </motion.div>

      <LevelTicker onTick={setLevel} />
    </motion.div>
  )
}

function LevelTicker({ onTick }) {
  useEffect(() => {
    const id = setInterval(() => onTick(5 + Math.floor(Math.random() * 5)), 400)
    return () => clearInterval(id)
  }, [onTick])
  return null
}
