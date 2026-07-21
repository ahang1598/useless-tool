import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/index.jsx'

// 分类的固定英文代号 + 沙雕图标
const CATEGORIES = [
  { id: 'time-machine', code: 'Time Machine', to: '/time-machine', icon: '⏱', enabled: true },
  { id: 'discipline', code: 'Discipline', to: '/discipline', icon: '⚡', enabled: true },
  { id: 'swiss', code: 'Swiss Knife', to: '/swiss-army', icon: '🔧', enabled: true },
  { id: 'phantom', code: 'Schrödinger', icon: '🐱', enabled: false },
  { id: 'echo', code: 'Echo Wall', icon: '🔊', enabled: false },
  { id: 'void', code: 'Black Hole', icon: '🕳', enabled: false },
  { id: 'dice', code: 'Life Dice', icon: '🎲', enabled: false },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(true) // PC 端默认收起，给内容区让位
  const { t, lang, toggle } = useI18n()
  const expanded = !collapsed

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
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10"
          >
            <div className="space-y-1.5">
              <span className={`block h-px w-5 bg-zinc-100 transition ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
              <span className={`block h-px w-5 bg-zinc-100 transition ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-5 bg-zinc-100 transition ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* 侧栏主体：移动端 fixed overlay，PC 端为 flex 流内子项 */}
      <aside
        className={`
          fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-white/5 bg-[#08080c] py-4 transition-[width,transform] duration-300
          w-72 px-5
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:h-screen md:translate-x-0
          ${collapsed ? 'md:w-[68px] md:px-2.5' : 'md:w-72 md:px-5'}
        `}
      >
        {/* 品牌 + PC 折叠按钮 */}
        <div className="flex items-center justify-between">
          {/* 展开：完整品牌 */}
          <div className={`hidden md:block ${collapsed ? 'hidden' : 'block'}`}>
            <div className="font-mono text-[10px] tracking-[0.3em] text-acid/70">{t('brand.mono')}</div>
            <div className="mt-1 font-display text-2xl font-bold leading-none">
              {t('brand.name')}<span className="text-acid">{t('brand.accent')}</span>
            </div>
          </div>
          {/* 收起：首字母方块 */}
          <div className={`hidden md:flex h-10 w-10 items-center justify-center rounded-lg border border-acid/30 font-display text-lg font-bold text-acid ${collapsed ? 'flex' : 'hidden'}`}>
            U
          </div>
          {/* PC 端折叠按钮 */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle sidebar"
            className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 text-zinc-400 transition hover:border-acid/50 hover:text-acid"
          >
            <span className={`transition-transform ${collapsed ? '' : 'rotate-180'}`}>‹</span>
          </button>
        </div>

        {/* 展开态：品牌副标语 */}
        {expanded && (
          <div className="mt-2 hidden text-[11px] leading-relaxed text-zinc-500 md:block">
            {t('brand.tagline')} <span className="text-zinc-300">{t('brand.hl')}</span> {t('brand.taglineEnd')}
            <br />
            {t('brand.serious')}
          </div>
        )}

        {/* 分类列表 */}
        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto md:mt-8">
          <div className={`mb-3 font-mono text-[10px] tracking-widest text-zinc-600 ${collapsed ? 'hidden md:hidden' : 'hidden md:block'}`}>
            {t('sidebar.categories')}
          </div>
          {CATEGORIES.map((c) =>
            c.enabled ? (
              <NavLink
                key={c.id}
                to={c.to}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? t(`cats.${c.id}.name`) : undefined}
                className={({ isActive }) =>
                  `group flex items-center rounded-lg transition ${
                    collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-acid/10 text-acid'
                      : 'text-zinc-300 hover:bg-white/[0.03] hover:text-zinc-100'
                  }`
                }
              >
                {/* 图标 */}
                <span className={`shrink-0 font-mono text-base ${collapsed ? '' : ''}`}>{c.icon}</span>
                {/* 文字 */}
                {!collapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between">
                      <span className="font-display text-[15px] font-medium">{t(`cats.${c.id}.name`)}</span>
                      <span className="font-mono text-[9px] tracking-wider text-zinc-600">{c.code}</span>
                    </span>
                    <span className="mt-0.5 block text-[11px] text-zinc-500 group-hover:text-zinc-400">
                      {t(`cats.${c.id}.desc`)}
                    </span>
                  </span>
                )}
              </NavLink>
            ) : (
              <div
                key={c.id}
                title={collapsed ? t(`cats.${c.id}.name`) : undefined}
                className={`flex items-center rounded-lg opacity-40 ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'}`}
              >
                <span className="shrink-0 font-mono text-base">{c.icon}</span>
                {!collapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between">
                      <span className="font-display text-[15px] font-medium">{t(`cats.${c.id}.name`)}</span>
                      <span className="font-mono text-[9px] tracking-wider text-zinc-600">{t('sidebar.soon')}</span>
                    </span>
                    <span className="mt-0.5 block text-[11px] text-zinc-600">{t(`cats.${c.id}.desc`)}</span>
                  </span>
                )}
              </div>
            )
          )}
        </nav>

        {/* 页脚 */}
        <div className="mt-4 border-t border-white/5 pt-4">
          {/* 语言切换 */}
          <button
            onClick={toggle}
            title={collapsed ? (lang === 'zh' ? 'EN' : '中文') : undefined}
            className={`flex items-center rounded-md border border-white/10 font-mono text-zinc-300 transition hover:border-acid/50 hover:text-acid ${
              collapsed ? 'h-10 w-full justify-center px-0' : 'mb-3 w-full justify-between px-3 py-2 text-[11px] tracking-widest'
            }`}
          >
            {collapsed ? (
              <span className="text-sm font-bold text-acid">{t('lang.switch')}</span>
            ) : (
              <>
                <span>LANG</span>
                <span className="text-acid">{lang === 'zh' ? '中文' : 'EN'} ⇄ {t('lang.switch')}</span>
              </>
            )}
          </button>
          {/* 版本信息（仅展开态） */}
          {!collapsed && (
            <div className="font-mono text-[10px] leading-relaxed text-zinc-600">
              {t('sidebar.version')}
              <br />
              <span className="text-zinc-700">{t('sidebar.footer')}</span>
            </div>
          )}
        </div>
      </aside>

      {/* 移动端遮罩 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  )
}
