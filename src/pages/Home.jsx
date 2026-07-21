import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { useI18n } from '../i18n/index.jsx'
import AiDetectOverlay from '../components/AiDetectOverlay.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const btnRef = useRef(null)
  const [magnet, setMagnet] = useState({ x: 0, y: 0 })
  const [aiOpen, setAiOpen] = useState(false)

  const handleMove = (e) => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = (e.clientX - cx) * 0.2
    const dy = (e.clientY - cy) * 0.2
    setMagnet({ x: dx, y: dy })
  }

  const reset = () => setMagnet({ x: 0, y: 0 })

  return (
    <div className="relative flex flex-1 flex-col" onMouseMove={handleMove} onMouseLeave={reset}>
      {/* 背景光晕 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-[36rem] w-[36rem] animate-drift rounded-full bg-plasma/20 blur-[120px]" />
        <div
          className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] animate-drift rounded-full bg-acid/15 blur-[120px]"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 pb-10 pt-24 md:px-14 md:pt-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-[11px] tracking-[0.3em] text-zinc-500"
        >
          {t('home.welcome')}
        </motion.div>

        <div className="flex flex-col items-start">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(3.2rem,11vw,9rem)] font-bold leading-[0.88] tracking-tight"
          >
            {t('home.hero1')}
            <br />
            <span className="text-acid">{t('home.hero2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-zinc-400 md:text-base"
          >
            {t('home.body1')}
            <br />
            {t('home.body2')} <span className="text-zinc-100">{t('home.body3')}</span> {t('home.body4')}
            <br />
            {t('home.body5')}
            <span className="text-frost">{t('home.body6')}</span>{t('home.body7')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <motion.button
              ref={btnRef}
              onClick={() => navigate('/time-machine')}
              animate={{ x: magnet.x, y: magnet.y }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center gap-5 overflow-hidden rounded-full bg-acid px-8 py-5 text-void md:px-10 md:py-6"
            >
              <span className="relative flex h-10 w-10 items-center justify-center md:h-12 md:w-12">
                <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-void/30 border-t-void" />
                <span className="font-mono text-sm font-bold md:text-base">⏱</span>
              </span>
              <div className="text-left">
                <div className="font-display text-xl font-bold leading-none md:text-2xl">
                  {t('home.cta')}
                </div>
                <div className="mt-1 font-mono text-[10px] tracking-widest text-void/60">
                  {t('home.ctaMono')}
                </div>
              </div>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </motion.button>

            <div className="mt-4 pl-2 font-mono text-[11px] text-zinc-500">
              * {t('home.sideEffect').replace(/^\*\s*/, '')}
            </div>
          </motion.div>

          {/* 次级按钮组：AI 智能检测 + 赛博瑞士军刀 */}
          <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setAiOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-white/15 bg-white/[0.03] px-6 py-4 text-zinc-200 backdrop-blur-sm md:px-7 md:py-5"
          >
            <span className="relative flex h-8 w-8 items-center justify-center md:h-10 md:w-10">
              <span className="absolute inset-0 animate-pulse-glow rounded-full bg-frost/30 blur-md" />
              <span className="relative font-mono text-xs font-bold md:text-sm">AI</span>
            </span>
            <div className="text-left">
              <div className="font-display text-base font-bold leading-none md:text-lg">{t('aid.title1')}{t('aid.title2')}</div>
              <div className="mt-1 font-mono text-[10px] tracking-widest text-zinc-500">{t('aid.mono')}</div>
            </div>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-frost/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate('/swiss-army')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-acid/40 bg-acid/[0.06] px-6 py-4 text-zinc-100 backdrop-blur-sm md:px-7 md:py-5"
          >
            <span className="relative flex h-8 w-8 items-center justify-center md:h-10 md:w-10">
              <span className="absolute inset-0 animate-pulse-glow rounded-full bg-acid/30 blur-md" />
              <span className="relative font-mono text-sm md:text-base">💻</span>
            </span>
            <div className="text-left">
              <div className="font-display text-base font-bold leading-none md:text-lg">{t('swiss.title1')}{t('swiss.title2')}</div>
              <div className="mt-1 font-mono text-[10px] tracking-widest text-acid/70">{t('swiss.mono')}</div>
            </div>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-acid/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 font-mono text-[10px] tracking-wider text-zinc-500 md:max-w-md"
        >
          <div>
            <div className="text-zinc-200">3</div>
            <div className="mt-1">{t('home.stats.tools')}</div>
          </div>
          <div>
            <div className="text-zinc-200">∞</div>
            <div className="mt-1">{t('home.stats.waste')}</div>
          </div>
          <div>
            <div className="text-acid">0%</div>
            <div className="mt-1">{t('home.stats.productivity')}</div>
          </div>
        </motion.div>
      </div>

      {/* AI 智能检测弹窗 */}
      <AiDetectOverlay open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  )
}
