// 💭 焦虑制造机 —— 随机弹赛博 PTSD 通知，纯纯精神攻击
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

let _id = 0

export default function AnxietyMachine({ onClose }) {
  const { t } = useI18n()
  const pool = t('anxietyNotifs')
  const icons = ['📞', '⏰', '📶', '💾', '🔔', '🔋', '👨‍💼', '📦', '👀', '💳', '💔', '❄️']
  const [notifs, setNotifs] = useState([])

  const fire = useCallback(() => {
    const msg = pool[Math.floor(Math.random() * pool.length)]
    const icon = icons[Math.floor(Math.random() * icons.length)]
    setNotifs((prev) => [
      ...prev.slice(-4),
      { id: ++_id, msg, icon },
    ])
  }, [pool, icons])

  useEffect(() => {
    fire()
    const id = setInterval(fire, 1800)
    return () => clearInterval(id)
  }, [fire])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] cursor-pointer overflow-hidden bg-gradient-to-br from-[#2a0a0a] to-[#0a0a0f]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-20 flex flex-col items-center text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[5rem] leading-none md:text-[7rem]"
        >
          💭
        </motion.div>
        <div className="mt-4 font-display text-3xl font-bold text-plasma md:text-5xl" style={{ textShadow: '0 0 20px rgba(255,45,117,0.5)' }}>
          {t('anxiety.title')}
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-widest text-zinc-500">
          {t('anxiety.tip')}
        </div>
      </div>

      {/* 通知栈：从右侧滑入，系统通知样式 */}
      <div className="absolute right-4 top-20 z-10 flex w-[88%] max-w-sm flex-col gap-2">
        <AnimatePresence>
          {notifs.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 120, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 120, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1a1a22]/95 p-3 shadow-lg backdrop-blur-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plasma/20 text-xl">
                {n.icon}
              </div>
              <div className="flex-1">
                <div className="font-mono text-[10px] tracking-wider text-zinc-500">NOTIFICATION · now</div>
                <div className="mt-0.5 font-display text-sm font-medium text-zinc-100">{n.msg}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-widest text-zinc-500">
        ANXIETY SPIKES: <span className="text-plasma">{_id}</span>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest text-zinc-600">
        {t('anxiety.hint')}
      </div>
    </motion.div>
  )
}
