import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useRef } from 'react'

export default function Home() {
  const navigate = useNavigate()
  const btnRef = useRef(null)
  const [magnet, setMagnet] = useState({ x: 0, y: 0 })

  // 磁吸效果：鼠标靠近时按钮轻微跟随
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
    <div
      className="relative flex flex-1 flex-col"
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {/* 背景光晕 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-[36rem] w-[36rem] animate-drift rounded-full bg-plasma/20 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] animate-drift rounded-full bg-acid/15 blur-[120px]" style={{ animationDelay: '4s' }} />
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 pb-10 pt-24 md:px-14 md:pt-14">
        {/* 顶部小标语 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-[11px] tracking-[0.3em] text-zinc-500"
        >
          WELCOME · 请慎重使用本工具
        </motion.div>

        {/* 海报式标题区 */}
        <div className="flex flex-col items-start">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(3.2rem,11vw,9rem)] font-bold leading-[0.88] tracking-tight"
          >
            无用
            <br />
            <span className="text-acid">工具箱</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-zinc-400 md:text-base"
          >
            这里没有任何能提高效率的东西。
            <br />
            但我们有一颗{' '}
            <span className="text-zinc-100">穿越时空</span>的按钮，
            <br />
            按下去，<span className="text-frost">你就真的会穿越</span>。
          </motion.p>

          {/* 时光机主入口 */}
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
              {/* 按钮内的旋转环 */}
              <span className="relative flex h-10 w-10 items-center justify-center md:h-12 md:w-12">
                <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-void/30 border-t-void" />
                <span className="font-mono text-sm font-bold md:text-base">⏱</span>
              </span>
              <div className="text-left">
                <div className="font-display text-xl font-bold leading-none md:text-2xl">
                  启动时光机
                </div>
                <div className="mt-1 font-mono text-[10px] tracking-widest text-void/60">
                  ENTER TIME MACHINE →
                </div>
              </div>
              {/* 扫光 */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </motion.button>

            <div className="mt-4 pl-2 font-mono text-[11px] text-zinc-500">
              * 副作用：会被偷走一段时间，且找不回来。
            </div>
          </motion.div>
        </div>

        {/* 底部指标条 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 font-mono text-[10px] tracking-wider text-zinc-500 md:max-w-md"
        >
          <div>
            <div className="text-zinc-200">1</div>
            <div className="mt-1">已上线工具</div>
          </div>
          <div>
            <div className="text-zinc-200">∞</div>
            <div className="mt-1">浪费时间潜力</div>
          </div>
          <div>
            <div className="text-acid">0%</div>
            <div className="mt-1">生产力提升</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
