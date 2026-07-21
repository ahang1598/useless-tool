// === 赛博瑞士军刀 · 主舞台 ===
// 闭合态：一枚冷锻金属徽章，呼吸光晕，"点击展开"
// 展开态：20 片刀刃如折扇绽放，每片是一个整蛊玩具入口
// 触发态：交给 ToolOverlay 全屏接管
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/index.jsx'
import { TOOLS, CATEGORY } from '../components/swiss/TOOLS_CONFIG.js'
import ToolOverlay from '../components/swiss/ToolOverlay.jsx'

export default function SwissArmyKnife() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const [activeId, setActiveId] = useState(null)

  // 预计算每片刀刃的角度：20 片均匀分布全圆，每片 18°，首片朝上（-90° 偏移）
  const blades = useMemo(
    () =>
      TOOLS.map((tool, i) => ({
        ...tool,
        angle: i * (360 / TOOLS.length) - 90,
        cat: CATEGORY[tool.cat],
      })),
    []
  )

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden px-6 pb-8 pt-[4.5rem] md:px-14 md:pt-14">
      {/* 背景光晕：随展开状态变色 */}
      <BladeGlow expanded={expanded} />

      {/* 顶部栏 */}
      <div className="relative z-20 mb-2 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="font-mono text-[11px] tracking-widest text-zinc-500 transition hover:text-zinc-200"
        >
          {t('swiss.back')}
        </button>
        <span className="font-mono text-[11px] tracking-[0.3em] text-acid">{t('swiss.mono')}</span>
      </div>

      {/* 主舞台：军刀居中 */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="relative flex aspect-square w-[min(92vw,560px)] items-center justify-center">
          {/* === 辐射刀刃层 === */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {blades.map((b, i) => (
                  <Blade
                    key={b.id}
                    blade={b}
                    index={i}
                    label={t(`swiss.tools.${b.id}.name`)}
                    onTrigger={() => setActiveId(b.id)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* === 中央徽章（枢轴） === */}
          <HubBadge
            expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          />
        </div>
      </div>

      {/* 底部说明 */}
      <div className="relative z-10 mt-2 text-center">
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.div
              key="closed-hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <motion.button
                onClick={() => setExpanded(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="font-display text-sm font-bold tracking-wide text-acid md:text-base"
              >
                {t('swiss.expand')} →
              </motion.button>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-zinc-600">
                * {t('swiss.noteClosed').replace(/^\*\s*/, '')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="open-hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <div className="font-mono text-[10px] tracking-widest text-zinc-500">
                {t('swiss.bladeCount').replace('{n}', TOOLS.length)} · {t('swiss.pickHint')}
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="mt-2 font-mono text-[10px] tracking-widest text-zinc-600 underline-offset-4 transition hover:text-zinc-300 hover:underline"
              >
                {t('swiss.fold')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 触发态：全屏接管 */}
      <ToolOverlay activeId={activeId} onClose={() => setActiveId(null)} />
    </div>
  )
}

// === 中央徽章（枢轴） ===
// 闭合时大；展开时缩小为中心刻度盘，始终可点击折叠
function HubBadge({ expanded, onClick }) {
  const { t } = useI18n()
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: expanded ? 1.05 : 1.03 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: expanded ? 0.42 : 1,
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="group relative z-20 flex aspect-square w-[42%] items-center justify-center rounded-full"
      aria-label={expanded ? t('swiss.fold') : t('swiss.expand')}
    >
      {/* 呼吸光晕 */}
      <motion.div
        className="absolute inset-0 rounded-full bg-acid/25 blur-3xl"
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 金属盘体：径向渐变 + 多层描边模拟拉丝金属 */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,#3a3a48,#15151c_70%)] shadow-[inset_0_2px_8px_rgba(255,255,255,0.15),inset_0_-4px_12px_rgba(0,0,0,0.6),0_20px_60px_-10px_rgba(0,0,0,0.8)]" />
      {/* 外环刻度 */}
      <svg className="absolute inset-[6%] animate-spin-slow" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(212,255,58,0.18)" strokeWidth="1" />
        <circle
          cx="100"
          cy="100"
          r="94"
          fill="none"
          stroke="#d4ff3a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="10 580"
        />
        {Array.from({ length: 24 }).map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="6"
            x2="100"
            y2={i % 6 === 0 ? '20' : '14'}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
            transform={`rotate(${i * 15} 100 100)`}
          />
        ))}
      </svg>
      {/* 内环反刻 */}
      <svg className="absolute inset-[14%] animate-spin-rev" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(122,252,255,0.16)" strokeWidth="1" strokeDasharray="2 8" />
      </svg>

      {/* 中央十字铆钉 + 铭文 */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-acid/40 bg-acid/10 font-mono text-lg"
        >
          {expanded ? '✕' : '🪓'}
        </motion.div>
        {!expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-center"
          >
            <div className="font-mono text-[8px] tracking-[0.3em] text-acid/70">{t('swiss.mono')}</div>
            <div className="mt-1 font-mono text-[9px] tracking-widest text-zinc-500">
              {TOOLS.length} {t('swiss.bladesUnit')}
            </div>
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}

// === 单片刀刃 ===
// 从中心向外辐射，闭合时收拢成束（angle 统一归 0），展开时 stagger 绽放
function Blade({ blade, index, label, onTrigger }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 origin-bottom"
      style={{ width: '2px', height: '50%' }}
      initial={{ rotate: 0, opacity: 0 }}
      animate={{ rotate: blade.angle, opacity: 1 }}
      exit={{ rotate: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 18,
        delay: index * 0.022,
      }}
    >
      {/* 刀刃本体：金属条 */}
      <div
        className="absolute bottom-[18%] left-1/2 h-[1px] w-1 -translate-x-1/2 rounded-full"
        style={{
          height: '62%',
          width: hovered ? '4px' : '3px',
          background: hovered
            ? `linear-gradient(to top, ${blade.cat.hex}, rgba(255,255,255,0.4))`
            : 'linear-gradient(to top, rgba(60,60,75,0.95), rgba(180,180,200,0.6))',
          boxShadow: hovered ? `0 0 12px ${blade.cat.hex}80` : 'inset 0 1px 2px rgba(255,255,255,0.2)',
          transition: 'width 0.2s, background 0.2s, box-shadow 0.2s',
        }}
      />

      {/* 末端刀柄：工具图标按钮 */}
      <motion.button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onTrigger}
        whileHover={{ scale: 1.18 }}
        whileTap={{ scale: 0.9 }}
        className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        style={{ filter: hovered ? `drop-shadow(0 0 10px ${blade.cat.hex})` : 'none' }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full border text-xl backdrop-blur-sm transition md:h-12 md:w-12"
          style={{
            borderColor: hovered ? blade.cat.hex : 'rgba(255,255,255,0.18)',
            background: hovered ? `${blade.cat.hex}1f` : 'rgba(10,10,15,0.85)',
          }}
        >
          {blade.icon}
        </div>
        {/* 名字标签：hover 时才浮现，避免 20 个标签挤成一锅粥 */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full mt-1 whitespace-nowrap rounded-md border border-white/10 bg-black/80 px-2 py-1 font-mono text-[10px] tracking-wide text-zinc-200"
              style={{ color: blade.cat.hex }}
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}

// 背景光晕：闭合时 acid 主导，展开后三色交融
function BladeGlow({ expanded }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
        animate={{
          backgroundColor: expanded ? 'rgba(212,255,58,0.10)' : 'rgba(212,255,58,0.18)',
        }}
        transition={{ duration: 0.6 }}
      />
      {expanded && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-[20%] top-[30%] h-72 w-72 rounded-full bg-plasma/10 blur-[120px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-[15%] right-[18%] h-72 w-72 rounded-full bg-frost/10 blur-[120px]"
          />
        </>
      )}
    </div>
  )
}
