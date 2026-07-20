import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/index.jsx'

// 分类的固定英文代号（不随语言变）
const CATEGORIES = [
  { id: 'time-machine', code: 'Time Machine', to: '/time-machine', enabled: true },
  { id: 'discipline', code: 'Discipline', to: '/discipline', enabled: true },
  { id: 'phantom', code: 'Schrödinger', enabled: false },
  { id: 'echo', code: 'Echo Wall', enabled: false },
  { id: 'void', code: 'Black Hole', enabled: false },
  { id: 'dice', code: 'Life Dice', enabled: false },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const { t, lang, toggle } = useI18n()

  return (
    <>
      {/* 移动端顶部条 */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/5 bg-void/80 px-4 py-3 backdrop-blur-md md:hidden">
        <span className="font-mono text-xs tracking-widest text-acid">{t('brand.mono')}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex h-9 items-center justify-center rounded-md border border-white/10 px-3 font-mono text-xs text-zinc-300"
          >
            {t('lang.switch')}
          </button>
          <button
            aria-label="Toggle menu"
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
      </div>

      {/* 抽屉 / 桌面常驻侧栏 */}
      <motion.aside
        className={`fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-white/5 bg-[#08080c] px-5 py-6 transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        initial={false}
      >
        {/* 品牌 */}
        <div className="hidden md:block">
          <div className="font-mono text-[10px] tracking-[0.3em] text-acid/70">{t('brand.mono')}</div>
          <div className="mt-1 font-display text-2xl font-bold leading-none">
            {t('brand.name')}
            <span className="text-acid">{t('brand.accent')}</span>
          </div>
          <div className="mt-2 text-[11px] leading-relaxed text-zinc-500">
            {t('brand.tagline')} <span className="text-zinc-300">{t('brand.hl')}</span> {t('brand.taglineEnd')}
            <br />
            {t('brand.serious')}
          </div>
        </div>

        {/* 分类列表 */}
        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto">
          <div className="mb-3 font-mono text-[10px] tracking-widest text-zinc-600">
            {t('sidebar.categories')}
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
                  <span className="font-display text-[15px] font-medium">{t(`cats.${c.id}.name`)}</span>
                  <span className="font-mono text-[9px] tracking-wider text-zinc-600">{c.code}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-zinc-500 group-hover:text-zinc-400">
                  {t(`cats.${c.id}.desc`)}
                </div>
              </NavLink>
            ) : (
              <div key={c.id} className="block cursor-not-allowed rounded-lg px-3 py-2.5 opacity-40">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[15px] font-medium">{t(`cats.${c.id}.name`)}</span>
                  <span className="font-mono text-[9px] tracking-wider text-zinc-600">{t('sidebar.soon')}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-zinc-600">{t(`cats.${c.id}.desc`)}</div>
              </div>
            )
          )}
        </nav>

        {/* 页脚 + 语言切换 */}
        <div className="mt-4 border-t border-white/5 pt-4">
          <button
            onClick={toggle}
            className="mb-3 flex w-full items-center justify-between rounded-md border border-white/10 px-3 py-2 font-mono text-[11px] tracking-widest text-zinc-300 transition hover:border-acid/50 hover:text-acid"
          >
            <span>LANG</span>
            <span className="text-acid">{lang === 'zh' ? '中文' : 'EN'} ⇄ {t('lang.switch')}</span>
          </button>
          <div className="font-mono text-[10px] leading-relaxed text-zinc-600">
            {t('sidebar.version')}
            <br />
            <span className="text-zinc-700">{t('sidebar.footer')}</span>
          </div>
        </div>
      </motion.aside>

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
