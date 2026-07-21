// === 赛博玄学馆 · 玄学调度台 ===
// 进来看到三大门派（祈福许愿 / 检测占卜 / 能量疗愈）共 8 件法器
// 交互：点击法器卡片 → ToolOverlay 全屏接管
// 内核：用最硬核的科幻 UI 做最没用的玄学功能
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n/index.jsx'
import { MYSTIC_TOOLS, MYSTIC_CAT, MYSTIC_CAT_ORDER } from '../components/mystic/TOOLS_CONFIG.js'
import ToolOverlay from '../components/mystic/ToolOverlay.jsx'

export default function Mystic() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [activeId, setActiveId] = useState(null)

  return (
    <div className="relative flex min-h-[100svh] flex-col px-3 pb-10 pt-[4.5rem] md:px-14 md:pb-14 md:pt-14">
      <BackgroundFX />

      {/* 顶部栏 */}
      <div className="relative z-20 mb-6 flex items-center gap-3 md:mb-8">
        <button
          onClick={() => navigate('/')}
          className="font-mono text-[11px] tracking-widest text-zinc-500 transition hover:text-zinc-200"
        >
          {t('mystic.back')}
        </button>
        <span className="font-mono text-[11px] tracking-[0.3em] text-aura">{t('mystic.mono')}</span>
      </div>

      {/* 标题区 */}
      <div className="relative z-10 mb-8 px-1 md:mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2.6rem,9vw,6rem)] font-bold leading-[0.9] tracking-tight"
        >
          {t('mystic.hubTitle1')}
          <br className="md:hidden" />
          <span className="text-aura md:ml-3">{t('mystic.hubTitle2')}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-4 max-w-xl text-[14px] leading-relaxed text-zinc-400 md:text-base"
        >
          {t('mystic.hubIntro')} <span className="text-aura">{t('mystic.hubIntroHl')}</span>
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600 md:text-[11px]"
        >
          {t('mystic.hubNote').replace(/^\*\s*/, '')}
        </motion.p>
      </div>

      {/* 法器分组 */}
      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-10 md:space-y-14">
        {MYSTIC_CAT_ORDER.map((catKey, ci) => {
          const cat = MYSTIC_CAT[catKey]
          const tools = MYSTIC_TOOLS.filter((x) => x.cat === catKey)
          const labelKey = catKey === 'bless' ? 'catBless' : catKey === 'divine' ? 'catDivine' : 'catHeal'
          const monoKey = `${labelKey}Mono`
          return (
            <section key={catKey}>
              {/* 门派标题 */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
                className="mb-4 flex items-center gap-3 md:mb-5"
              >
                <span
                  className="h-px w-8 md:w-12"
                  style={{ background: cat.hex }}
                />
                <span
                  className="font-mono text-[10px] tracking-[0.3em] md:text-[11px]"
                  style={{ color: cat.hex }}
                >
                  {t(`mystic.${monoKey}`)}
                </span>
                <h2 className="font-display text-lg font-bold text-zinc-100 md:text-xl">
                  {t(`mystic.${labelKey}`)}
                </h2>
              </motion.div>

              {/* 法器卡片网格 */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                {tools.map((tool, ti) => (
                  <ArtifactCard
                    key={tool.id}
                    tool={tool}
                    cat={cat}
                    delay={ci * 0.05 + ti * 0.06}
                    onTrigger={() => setActiveId(tool.id)}
                    name={t(`mystic.tools.${tool.id}.name`)}
                    tip={t(`mystic.tools.${tool.id}.tip`)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <ToolOverlay activeId={activeId} onClose={() => setActiveId(null)} />
    </div>
  )
}

// === 单件法器卡片 ===
function ArtifactCard({ tool, cat, delay, onTrigger, name, tip }) {
  return (
    <motion.button
      onClick={onTrigger}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left backdrop-blur-sm transition md:p-5"
      style={{ ['--cat']: cat.hex }}
    >
      {/* 悬停时左侧高亮条 + 背景晕染 */}
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
        style={{ background: cat.hex }}
      />
      <span
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ background: cat.hex }}
      />

      {/* 图标槽 */}
      <span
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-xl transition-colors duration-300 md:h-14 md:w-14 md:text-2xl"
        style={{ borderColor: `${cat.hex}40`, background: `${cat.hex}10` }}
      >
        {tool.icon}
      </span>

      {/* 文案 */}
      <span className="relative min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display text-[15px] font-bold text-zinc-100 transition-colors group-hover:text-white md:text-base">
            {name}
          </span>
        </span>
        <span className="mt-1 flex items-center gap-2 font-mono text-[10px] tracking-wider text-zinc-500 md:text-[11px]">
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest"
            style={{ color: cat.hex, border: `1px solid ${cat.hex}40` }}
          >
            {tool.codename}
          </span>
          <span className="truncate text-zinc-500">{tip}</span>
        </span>
      </span>

      {/* 进入箭头 */}
      <span
        className="relative shrink-0 font-mono text-sm opacity-40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
        style={{ color: cat.hex }}
      >
        →
      </span>
    </motion.button>
  )
}

// 背景：金色网格 + 光晕 + 飘浮的玄学符文粒子
function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,200,87,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,200,87,0.5) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />
      <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-aura/[0.07] blur-[150px]" />
      <div className="absolute left-[8%] top-[12%] h-56 w-56 rounded-full bg-frost/[0.04] blur-[120px]" />
      <div className="absolute bottom-[8%] right-[10%] h-56 w-56 rounded-full bg-acid/[0.04] blur-[120px]" />
      {/* 飘浮金粉 */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-aura/60"
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
          animate={{ opacity: [0.1, 0.7, 0.1], y: [0, -24, 0] }}
          transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
