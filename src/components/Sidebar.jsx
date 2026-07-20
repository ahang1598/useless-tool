import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// 未来分门别类的入口。当前只有一项正式启用，其余为「即将到来」占位
const CATEGORIES = [
  {
    id: 'time-machine',
    name: '时光机',
    en: 'Time Machine',
    to: '/time-machine',
    desc: '把等待包装成穿越',
    enabled: true,
  },
  { id: 'phantom', name: '薛定谔的猫', en: 'Schrödinger', desc: '不看就活着', enabled: false },
  { id: 'echo', name: '回音壁', en: 'Echo Wall', desc: '对空气说话', enabled: false },
  { id: 'void', name: '黑洞回收站', en: 'Black Hole', desc: '删了就是没了', enabled: false },
  { id: 'dice', name: '人生骰子', en: 'Life Dice', desc: '交给概率', enabled: false },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* 移动端顶部条：在小屏显示，控制抽屉 */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/5 bg-void/80 px-4 py-3 backdrop-blur-md md:hidden">
        <span className="font-mono text-xs tracking-widest text-acid">USELESS//TOOL</span>
        <button
          aria-label="切换菜单"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10"
        >
          <div className="space-y-1.5">
            <span className={`block h-px w-5 bg-zinc-100 transition ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block h-px w-5 bg-zinc-100 transition ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-5 bg-zinc-100 transition ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {/* 抽屉 / 桌面常驻侧栏 */}
      <AnimatePresence>
        {(open || typeof window !== 'undefined') && (
          <motion.aside
            className={`fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-white/5 bg-[#08080c] px-5 py-6 transition-transform duration-300 md:translate-x-0 ${
              open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
            initial={false}
          >
            {/* 品牌 */}
            <div className="hidden md:block">
              <div className="font-mono text-[10px] tracking-[0.3em] text-acid/70">USELESS//TOOL</div>
              <div className="mt-1 font-display text-2xl font-bold leading-none">
                无用<span className="text-acid">工具</span>
              </div>
              <div className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                专门收录<span className="text-zinc-300">没有用</span>的功能。
                <br />
                认真的，没用。
              </div>
            </div>

            {/* 分类列表 */}
            <nav className="mt-8 flex-1 space-y-1 overflow-y-auto">
              <div className="mb-3 font-mono text-[10px] tracking-widest text-zinc-600">
                CATEGORIES
              </div>
              {CATEGORIES.map((c) =>
                c.enabled ? (
                  <NavLink
                    key={c.id}
                    to={c.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `group block rounded-lg px-3 py-2.5 transition ${
                        isActive
                          ? 'bg-acid/10 text-acid'
                          : 'text-zinc-300 hover:bg-white/[0.03] hover:text-zinc-100'
                      }`
                    }
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-[15px] font-medium">{c.name}</span>
                      <span className="font-mono text-[9px] tracking-wider text-zinc-600">
                        {c.en}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-500 group-hover:text-zinc-400">
                      {c.desc}
                    </div>
                  </NavLink>
                ) : (
                  <div
                    key={c.id}
                    className="block cursor-not-allowed rounded-lg px-3 py-2.5 opacity-40"
                    title="即将到来"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-[15px] font-medium">{c.name}</span>
                      <span className="font-mono text-[9px] tracking-wider text-zinc-600">
                        SOON
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-600">{c.desc}</div>
                  </div>
                )
              )}
            </nav>

            {/* 页脚 */}
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="font-mono text-[10px] leading-relaxed text-zinc-600">
                v0.0.1 · still useless
                <br />
                <span className="text-zinc-700">© 你正在浪费时间</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 移动端遮罩 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  )
}
