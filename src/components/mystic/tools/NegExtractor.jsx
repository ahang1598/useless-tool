// 🧪 负能量提取装置 —— 工业管道把你的 emo 抽进网页服务器，仪式感拉满，本人零变化
// 阀门输入口 → 加压管道 → 透明储存罐；力度三档决定抽取量与流速，价值为 0
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

// 三档提取力度：min/max 决定 ml 随机区间，dur 控制总时长，flow 控制粒子流速，rate 是实时速率抖动范围
const LEVELS = [
  { min: 120, max: 330, dur: 5.0, flow: 1.15, rate: [16, 34], bubbleEvery: 620 },   // 轻柔
  { min: 380, max: 720, dur: 4.0, flow: 0.78, rate: [55, 110], bubbleEvery: 430 },  // 标准
  { min: 720, max: 1280, dur: 3.0, flow: 0.45, rate: [130, 230], bubbleEvery: 280 },// 猛烈
]
// 偶发的「梗值」ml，命中率 ~18%，专门用来制造笑点（666 / 1024 / 237 ...）
const MEME_ML = [237, 666, 888, 1024]
const TANK_CAP = 1500 // 储存罐满刻度 ml，仅用于换算液位百分比

// 组件内文案字典（不碰共享 i18n，避免冲突）
const T = {
  zh: {
    mono: 'NEG_DRAIN // ONLINE',
    panel: '能量疗愈系 · 工业提取台',
    title: '负能量提取装置',
    sub: 'NEGATIVE ENERGY EXTRACTOR · 把 emo 抽进服务器',
    intakeLabel: '负能量输入口',
    intakeMono: 'INTAKE // 今日烦心事',
    intakePh: '输入今日烦心事（例：周一 / DDL / 改需求），可不填',
    intakeHint: '可选 · 不填就抽取通用负能量',
    levelLabel: '提取力度',
    levelMono: 'INTENSITY',
    levels: ['轻柔', '标准', '猛烈'],
    levelDesc: [
      '温和吸取，全程无痛（和"再想想"一样温柔）',
      '标准工业流程，稳定地抽走你的笑容',
      '猛烈开闸，连昨天的尴尬都不放过',
    ],
    portLabel: 'INPUT',
    tankLabel: 'STORAGE TANK',
    start: '启动提取',
    extracting: '提取中…',
    again: '再抽一次',
    status: '正在抽取 · 管道加压中',
    rateLabel: '实时抽取速率',
    progressLabel: '液位',
    done: '提取完成',
    resultMono: 'EXTRACTION//LOG',
    stored: '已存入本网页服务器',
    capacity: '服务器容量 ∞ · 可用情绪余额 0',
    punchline: '负能量已全部储存在本网页服务器，您本人没有任何变化，该 emo 还是 emo。',
    footer: '* 本装置 0 医疗 / 心理疗效。负能量不会凭空消失，只是搬了个家。',
    unit: 'ml',
    perSec: 'ml/s',
  },
  en: {
    mono: 'NEG_DRAIN // ONLINE',
    panel: 'HEAL DECK · INDUSTRIAL RIG',
    title: 'Negative Energy Extractor',
    sub: 'NEGATIVE ENERGY EXTRACTOR · pump your emo into the server',
    intakeLabel: 'NEG INTAKE',
    intakeMono: 'INTAKE // today',
    intakePh: "type today's annoyance (e.g. Monday / DDL / scope creep), optional",
    intakeHint: 'optional · leave empty to pump generic negativity',
    levelLabel: 'Intensity',
    levelMono: 'INTENSITY',
    levels: ['Gentle', 'Standard', 'Violent'],
    levelDesc: [
      'soft suction, painless (as gentle as "let\'s revisit this")',
      'standard industrial flow, steadily draining your smile',
      'full throttle, scoops up yesterday\'s cringe too',
    ],
    portLabel: 'INPUT',
    tankLabel: 'STORAGE TANK',
    start: 'Start Extraction',
    extracting: 'Extracting…',
    again: 'Run Again',
    status: 'pumping · pressurizing pipes',
    rateLabel: 'live rate',
    progressLabel: 'level',
    done: 'Extraction Complete',
    resultMono: 'EXTRACTION//LOG',
    stored: 'stored on this webpage server',
    capacity: 'server capacity ∞ · emotional balance available 0',
    punchline: 'All negativity has been stored on this webpage\'s server. You yourself have changed in no way. Still emo? Still emo.',
    footer: '* Zero medical / psychological effect. Negativity doesn\'t vanish — it just moved house.',
    unit: 'ml',
    perSec: 'ml/s',
  },
}

// 把输入的烦心事切成可飘成气泡的小片段（按常见分隔符，兜底按字符块）
const toFragments = (text) => {
  const t = (text || '').trim()
  if (!t) return []
  const parts = t.split(/[\s/、，,;;；]+/).map((s) => s.trim()).filter(Boolean)
  if (parts.length) return parts.slice(0, 6)
  const chunks = []
  for (let i = 0; i < t.length && chunks.length < 6; i += 2) chunks.push(t.slice(i, i + 2))
  return chunks
}

export default function NegExtractor({ onClose }) {
  const { lang } = useI18n()
  const txt = T[lang]

  const [phase, setPhase] = useState('idle') // idle | extracting | done
  const [levelIdx, setLevelIdx] = useState(1)
  const [stress, setStress] = useState('')
  const [progress, setProgress] = useState(0)
  const [rate, setRate] = useState(0)
  const [result, setResult] = useState(null) // { ml }
  const [bubbles, setBubbles] = useState([])

  const bidRef = useRef(0)
  const startRef = useRef(0)
  const targetRef = useRef(null) // { ml, fill }

  const busy = phase === 'extracting'

  // 主流程驱动：基于时间戳计算进度 + 抖动实时速率，到 100% 落定
  useEffect(() => {
    if (phase !== 'extracting') return
    const dur = LEVELS[levelIdx].dur * 1000
    const iv = setInterval(() => {
      const el = Date.now() - startRef.current
      const p = Math.min(100, (el / dur) * 100)
      setProgress(p)
      const [r0, r1] = LEVELS[levelIdx].rate
      setRate(Math.round(r0 + Math.random() * (r1 - r0)))
      if (p >= 100) {
        clearInterval(iv)
        const tg = targetRef.current
        setResult({ ml: tg.ml })
        setPhase('done')
      }
    }, 80)
    return () => clearInterval(iv)
  }, [phase, levelIdx])

  // 气泡发生器：提取中持续吐泡，气泡可能携带烦心事片段
  useEffect(() => {
    if (phase !== 'extracting') return
    const fr = toFragments(stress)
    const every = LEVELS[levelIdx].bubbleEvery
    const id = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= 9) return prev
        const useText = fr.length > 0 && Math.random() < 0.55
        const text = useText ? fr[Math.floor(Math.random() * fr.length)] : ''
        return [
          ...prev,
          {
            id: ++bidRef.current,
            x: 10 + Math.random() * 80,
            size: 6 + Math.random() * 8,
            rise: 150 + Math.random() * 90,
            dur: 1.8 + Math.random() * 1.6,
            text,
          },
        ]
      })
    }, every)
    return () => clearInterval(id)
  }, [phase, levelIdx, stress])

  const startExtraction = () => {
    if (busy) return
    const lvl = LEVELS[levelIdx]
    let ml = Math.round(lvl.min + Math.random() * (lvl.max - lvl.min))
    if (Math.random() < 0.18) ml = MEME_ML[Math.floor(Math.random() * MEME_ML.length)]
    targetRef.current = { ml, fill: Math.min(95, (ml / TANK_CAP) * 95) }
    setResult(null)
    setBubbles([])
    setProgress(0)
    setRate(lvl.rate[0])
    startRef.current = Date.now()
    setPhase('extracting')
  }

  const reset = () => {
    setPhase('idle')
    setProgress(0)
    setResult(null)
    setBubbles([])
    targetRef.current = null
  }

  const removeBubble = (id) => setBubbles((p) => p.filter((b) => b.id !== id))

  // 液位百分比：idle 归零、extracting 随进度爬升、done 锁定到目标
  const fillPct =
    phase === 'idle'
      ? 0
      : phase === 'extracting'
      ? targetRef.current
        ? (progress / 100) * targetRef.current.fill
        : 0
      : result
      ? Math.min(95, (result.ml / TANK_CAP) * 95)
      : 0

  const lvl = LEVELS[levelIdx]
  const marks = [0, 500, 1000, 1500]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-[radial-gradient(ellipse_at_50%_28%,#0e1605_0%,#0a0a0f_62%)] text-zinc-200"
    >
      <style>{`
        @keyframes neg-flow {
          0%   { transform: translateX(-30%); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateX(130%); opacity: 0; }
        }
        @keyframes neg-shimmer {
          from { background-position: -40% 0; }
          to   { background-position: 140% 0; }
        }
        @keyframes neg-wobble {
          0%, 100% { transform: translateX(-3%) scaleX(1);    border-radius: 50% 50% 50% 50%; }
          50%      { transform: translateX(3%)  scaleX(1.07); border-radius: 45% 55% 50% 50%; }
        }
        .neg-particle {
          position: absolute;
          top: 50%;
          left: 0;
          width: 9px;
          height: 9px;
          margin-top: -4.5px;
          border-radius: 999px;
          background: radial-gradient(circle, #eaff7a 0%, #d4ff3a 45%, rgba(212,255,58,0) 75%);
          box-shadow: 0 0 8px 2px rgba(212,255,58,0.65);
          animation: neg-flow linear infinite;
        }
        .neg-surface {
          position: absolute;
          left: -5%;
          top: -6px;
          width: 110%;
          height: 12px;
          background: linear-gradient(180deg, #eaff7a, #9ee600);
          border-radius: 50%;
          box-shadow: 0 0 14px rgba(212,255,58,0.7);
          animation: neg-wobble 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* 氛围层：网格 + 顶部酸绿辉光 + 漂浮微尘 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(212,255,58,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,255,58,0.4) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="absolute left-1/2 top-0 h-72 w-[42rem] max-w-[92vw] -translate-x-1/2 rounded-full bg-acid/10 blur-[120px]" />
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-acid/60"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 1.5, height: 1.5 }}
            animate={{ opacity: [0.1, 0.7, 0.1], y: [0, -14, 0] }}
            transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 4, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col items-center px-5 pb-28 pt-16 md:pt-20">
        {/* 头部 */}
        <div className="text-center">
          <div className="font-mono text-[11px] tracking-[0.4em] text-acid/70">{txt.mono} · {txt.panel}</div>
          <h1
            className="mt-2 font-display text-3xl font-bold text-acid sm:text-4xl"
            style={{ textShadow: '0 0 24px rgba(212,255,58,0.45)' }}
          >
            {txt.title}
          </h1>
          <div className="mt-1 font-mono text-[10px] tracking-widest text-zinc-500">{txt.sub}</div>
        </div>

        {/* === 核心视觉锚点：工业提取台 === */}
        <div className="mt-9 flex w-full items-center justify-center gap-1 sm:mt-12 sm:gap-3">
          {/* 左：阀门输入口 */}
          <div className="flex w-[32vw] min-w-[128px] max-w-[180px] flex-col items-center sm:w-[170px]">
            {/* 阀门手轮（提取中加速旋转 + 发光）*/}
            <motion.div
              className="relative h-16 w-16 rounded-full border-2 border-acid/40 sm:h-[72px] sm:w-[72px]"
              style={{ boxShadow: busy ? '0 0 22px rgba(212,255,58,0.55)' : '0 0 10px rgba(212,255,58,0.18)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: busy ? 1.1 : 9, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-2 rounded-full border border-dashed border-acid/30" />
              <div className="absolute left-1/2 top-1/2 h-[2px] w-[58%] -translate-x-1/2 -translate-y-1/2 bg-acid/55" />
              <div className="absolute left-1/2 top-1/2 h-[58%] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-acid/55" />
              <div className="absolute left-1/2 top-1/2 h-[2px] w-[58%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-acid/40" />
              <div className="absolute left-1/2 top-1/2 h-[2px] w-[58%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-acid/40" />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid" style={{ boxShadow: '0 0 10px rgba(212,255,58,0.9)' }} />
            </motion.div>
            {/* 进料口本体 */}
            <div
              className="relative mt-[-4px] w-full"
              style={{
                clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)',
                background: 'linear-gradient(180deg, #16240a 0%, #0c1406 70%, #080d04 100%)',
                borderTop: '1px solid rgba(212,255,58,0.45)',
                padding: '14px 6px 16px',
              }}
            >
              <motion.div
                className="mx-auto h-1.5 w-1.5 rounded-full bg-acid"
                animate={{ opacity: busy ? [0.4, 1, 0.4] : 0.7 }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ boxShadow: '0 0 8px rgba(212,255,58,0.9)' }}
              />
              <div className="mt-2 text-center font-mono text-[9px] tracking-[0.25em] text-acid/60">{txt.portLabel}</div>
            </div>
          </div>

          {/* 中：连接管道（提取中粒子流动 + 高光扫光）*/}
          <div className="relative h-4 flex-1 min-w-[36px] self-center sm:h-5">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #1a2a0c, #0a1206 50%, #1a2a0c)',
                boxShadow: busy ? 'inset 0 0 8px rgba(212,255,58,0.4), 0 0 10px rgba(212,255,58,0.25)' : 'inset 0 0 6px rgba(0,0,0,0.6)',
                border: '1px solid rgba(212,255,58,0.25)',
              }}
            />
            {/* 扫光 */}
            {busy && (
              <div
                className="pointer-events-none absolute inset-0 rounded-full opacity-70"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(212,255,58,0.55), transparent)',
                  backgroundSize: '38% 100%',
                  animation: 'neg-shimmer 1s linear infinite',
                }}
              />
            )}
            {/* 流动粒子（仅提取中）*/}
            {busy &&
              Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={i}
                  className="neg-particle"
                  style={{ animationDuration: `${lvl.flow}s`, animationDelay: `-${i * lvl.flow * 0.14}s` }}
                />
              ))}
            {/* 管道接口环 */}
            <div className="absolute -left-px top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-acid/30" />
            <div className="absolute -right-px top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-acid/30" />
          </div>

          {/* 右：透明储存罐 */}
          <div className="flex w-[28vw] min-w-[104px] max-w-[140px] flex-col items-center sm:w-[132px]">
            {/* 罐顶盖 */}
            <div className="h-2.5 w-[70%] rounded-t-md" style={{ background: 'linear-gradient(180deg,#2a3a14,#16210a)', borderTop: '1px solid rgba(212,255,58,0.4)' }} />
            {/* 罐体（玻璃） */}
            <div
              className="relative w-full overflow-hidden border-x border-b border-acid/30"
              style={{
                height: '210px',
                background: 'linear-gradient(180deg, rgba(212,255,58,0.04), rgba(10,10,15,0.4))',
                borderBottomLeftRadius: 14,
                borderBottomRightRadius: 14,
                boxShadow: busy ? '0 0 22px rgba(212,255,58,0.18)' : 'none',
              }}
            >
              {/* 刻度 */}
              {marks.map((m) => {
                const bottom = Math.min(95, (m / TANK_CAP) * 95)
                return (
                  <div key={m} className="absolute right-0 flex items-center gap-1" style={{ bottom: `${bottom}%` }}>
                    <span className="h-px w-2.5 bg-acid/30" />
                    <span className="font-mono text-[8px] leading-none text-acid/45">{m}</span>
                  </div>
                )
              })}
              {/* 玻璃高光 */}
              <div className="pointer-events-none absolute left-1 top-2 h-[80%] w-1.5 rounded-full bg-white/10" />

              {/* 液体 */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: `${fillPct}%`,
                  transition: phase === 'idle' && fillPct === 0 ? 'height .6s ease' : 'height .12s linear',
                  background: 'linear-gradient(to top, #0d1a05 0%, #2a4d0a 32%, #6fbb16 68%, #b6f030 100%)',
                  boxShadow: 'inset 0 6px 14px rgba(212,255,58,0.4)',
                }}
              >
                {/* 液面波动 + 内部流光 */}
                {fillPct > 2 && <span className="neg-surface" />}
                <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', backgroundSize: '50% 100%', animation: busy ? 'neg-shimmer 2.4s linear infinite' : 'none' }} />
              </div>

              {/* 气泡（可能携带烦心事片段） */}
              {bubbles.map((b) => (
                <motion.span
                  key={b.id}
                  className="pointer-events-none absolute flex items-center justify-center rounded-full"
                  style={{
                    left: `${b.x}%`,
                    bottom: 4,
                    width: b.size + (b.text ? b.text.length * 4 : 0),
                    height: b.size + 6,
                    background: 'radial-gradient(circle, rgba(212,255,58,0.55), rgba(212,255,58,0.12) 60%, transparent 72%)',
                  }}
                  initial={{ opacity: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 0.95, 0], y: -b.rise, scale: [0.6, 1, 1.15] }}
                  transition={{ duration: b.dur, ease: 'easeOut' }}
                  onAnimationComplete={() => removeBubble(b.id)}
                >
                  {b.text && <span className="px-1 font-mono text-[8px] leading-none text-acid/90">{b.text}</span>}
                </motion.span>
              ))}
            </div>
            {/* 罐底支座 */}
            <div className="mt-0 h-2 w-[58%] rounded-b-sm" style={{ background: 'linear-gradient(180deg,#16210a,#0a0a0f)' }} />
            <div className="mt-1 font-mono text-[9px] tracking-[0.25em] text-acid/55">{txt.tankLabel}</div>
          </div>
        </div>

        {/* === 负能量输入口（实际输入区，阀门造型）=== */}
        <div className="mt-9 w-full max-w-md">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-widest">
            <span className="text-acid/70">⿓ {txt.intakeLabel} · <span className="text-zinc-500">{txt.intakeMono}</span></span>
            <span className="text-zinc-600">{txt.intakeHint}</span>
          </div>
          <div
            className={`relative flex items-center gap-2 rounded-2xl border bg-black/40 px-3 py-2 backdrop-blur-sm transition ${
              busy ? 'border-acid/20 opacity-60' : 'border-acid/40 focus-within:border-acid/80 focus-within:bg-black/60'
            }`}
          >
            <motion.span
              className="shrink-0 text-base"
              animate={{ rotate: busy ? 360 : 0 }}
              transition={{ duration: 2, repeat: busy ? Infinity : 0, ease: 'linear' }}
            >
              ⚙️
            </motion.span>
            <input
              type="text"
              value={stress}
              onChange={(e) => setStress(e.target.value)}
              maxLength={40}
              disabled={busy}
              placeholder={txt.intakePh}
              className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-200 placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* === 提取力度滑块（三档）=== */}
        <div className="mt-6 w-full max-w-md">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-widest">
            <span className="text-acid/70">{txt.levelLabel} · <span className="text-zinc-500">{txt.levelMono}</span></span>
            <span className="font-display text-xs font-bold text-acid">{txt.levels[levelIdx]}</span>
          </div>
          <div className="relative">
            {/* 自定义轨道 + 已选填充 */}
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/[0.07]" />
            <div
              className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-acid/60 transition-all duration-200"
              style={{ width: `${(levelIdx / 2) * 100}%`, boxShadow: '0 0 10px rgba(212,255,58,0.5)' }}
            />
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={levelIdx}
              disabled={busy}
              onChange={(e) => setLevelIdx(Number(e.target.value))}
              className={`relative w-full ${busy ? 'cursor-not-allowed opacity-50' : ''}`}
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] tracking-wide">
              {txt.levels.map((l, i) => (
                <button
                  key={l}
                  type="button"
                  disabled={busy}
                  onClick={() => setLevelIdx(i)}
                  className={`transition ${busy ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                    i === levelIdx ? 'font-bold text-acid' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-1.5 text-center font-mono text-[10px] leading-relaxed tracking-wide text-zinc-500">{txt.levelDesc[levelIdx]}</div>
        </div>

        {/* === 状态行（提取中显示实时速率 + 液位进度）=== */}
        <AnimatePresence>
          {busy && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-6 w-full max-w-md rounded-xl border border-acid/25 bg-acid/[0.05] px-4 py-3"
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="tracking-widest text-acid/80">{txt.status}</span>
                <span className="text-acid">
                  {rate} <span className="text-zinc-500">{txt.perSec}</span>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="w-16 font-mono text-[9px] tracking-wider text-zinc-500">{txt.progressLabel}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div className="h-full rounded-full bg-acid" style={{ boxShadow: '0 0 8px rgba(212,255,58,0.6)' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1, ease: 'linear' }} />
                </div>
                <span className="w-9 text-right font-mono text-[10px] tabular-nums text-acid">{Math.round(progress)}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === 主按钮 === */}
        <motion.button
          onClick={busy ? undefined : phase === 'done' ? reset : startExtraction}
          disabled={busy}
          whileHover={{ scale: busy ? 1 : 1.05 }}
          whileTap={{ scale: busy ? 1 : 0.95 }}
          className={`mt-6 rounded-full px-12 py-4 font-display text-base font-bold tracking-wider transition ${
            busy
              ? 'cursor-not-allowed bg-white/10 text-zinc-500'
              : 'bg-acid text-void shadow-[0_0_30px_rgba(212,255,58,0.4)] hover:brightness-110'
          }`}
        >
          {busy ? `${txt.extracting}` : phase === 'done' ? `↻ ${txt.again}` : `🧪 ${txt.start}`}
        </motion.button>

        {/* === 提取结果 + 补刀 === */}
        <AnimatePresence>
          {phase === 'done' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className="mt-7 w-full max-w-md overflow-hidden rounded-2xl border border-acid/30 bg-[#0b1406]/85 p-5 backdrop-blur-sm sm:p-6"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-acid to-transparent" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-acid/70">{txt.resultMono}</div>
                  <div className="mt-1 font-mono text-[10px] tracking-widest text-zinc-500">{txt.done}</div>
                </div>
                <span className="rounded-full border border-acid/50 px-3 py-1 font-mono text-[10px] tracking-widest text-acid/80">{txt.levels[levelIdx]}</span>
              </div>

              {/* 本次提取量（大数字） */}
              <div className="mt-4 flex items-end gap-2">
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
                  className="font-display text-5xl font-bold tabular-nums text-acid sm:text-6xl"
                  style={{ textShadow: '0 0 26px rgba(212,255,58,0.55)' }}
                >
                  {result.ml}
                </motion.span>
                <span className="mb-2 font-mono text-sm text-zinc-400">{txt.unit}</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-zinc-500">
                <span>🗄️</span> {txt.stored} · <span className="text-zinc-600">{txt.capacity}</span>
              </div>

              {/* 核心补刀 */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-4 rounded-r-lg border-l-2 border-plasma bg-plasma/[0.07] p-3 font-display text-sm leading-relaxed text-zinc-100"
              >
                {txt.punchline}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 补刀小字 */}
        <div className="mt-10 max-w-md text-center font-mono text-[10px] leading-relaxed tracking-wide text-zinc-600">
          {txt.footer}
        </div>
      </div>
    </motion.div>
  )
}
