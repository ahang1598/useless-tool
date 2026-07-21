// 🚦 今日气运检测仪 —— 跑车级玄学仪表，指针飙到飞起，结果全靠 Math.random
// 内核：仪式感拉满的汽车仪表盘，扫出一个 0 科学依据的当日气运
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

// 四个分项：财运/桃花运/摸鱼运/干饭运，各配一个区分色（frost 是身份色，留给了干饭运）
const SUBS = [
  { key: 'wealth', icon: '💰', hex: '#ffc857' }, // aura 金
  { key: 'love',   icon: '💘', hex: '#ff2d75' }, // plasma 品红
  { key: 'slack',  icon: '🐟', hex: '#d4ff3a' }, // acid 绿
  { key: 'eat',    icon: '🍚', hex: '#7afcff' }, // frost 冰蓝
]

// 评级 → 色值（S金/A绿/B冰蓝/C黄/D品红），C 的黄现场拉一个，token 里没有
const GRADE_HEX = { S: '#ffc857', A: '#d4ff3a', B: '#7afcff', C: '#ffe23f', D: '#ff2d75' }
const gradeOf = (v) => (v >= 90 ? 'S' : v >= 75 ? 'A' : v >= 55 ? 'B' : v >= 35 ? 'C' : 'D')

// ===== 仪表盘几何（SVG viewBox 0 0 240 140，圆心 120,120，弧半径 96，半圆）=====
const CX = 120, CY = 120, R = 96
const ptAt = (v) => {
  const th = (Math.PI * v) / 100
  return [CX - R * Math.cos(th), CY - R * Math.sin(th)]
}
const arc = (v1, v2) => {
  const [x1, y1] = ptAt(v1)
  const [x2, y2] = ptAt(v2)
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}
// 段化刻度环：低运品红 / 中段冰蓝 / 良好酸绿 / 满级金，色阶本身就是评级预告
const ARC_SEGMENTS = [
  { d: arc(0, 35),  hex: '#ff2d75' },
  { d: arc(35, 75), hex: '#7afcff' },
  { d: arc(75, 90), hex: '#d4ff3a' },
  { d: arc(90, 100), hex: '#ffc857' },
]
// 刻度 + 数字标签（每 5°一根，每 10 加粗，每 20 标数字）
const TICKS = (() => {
  const arr = []
  for (let v = 0; v <= 100; v += 5) {
    const major = v % 10 === 0
    const th = (Math.PI * v) / 100
    const rIn = major ? 80 : 85
    const rOut = major ? 95 : 91
    const lblR = 108
    arr.push({
      x1: CX - rIn * Math.cos(th), y1: CY - rIn * Math.sin(th),
      x2: CX - rOut * Math.cos(th), y2: CY - rOut * Math.sin(th),
      major,
      labeled: v % 20 === 0,
      lx: CX - lblR * Math.cos(th), ly: CY - lblR * Math.sin(th) + 2.5,
    })
  }
  return arr
})()

// 漂浮粒子（氛围层，模块级常量避免重渲染重算）
const PARTICLES = Array.from({ length: 22 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 1 + Math.random() * 2,
  delay: Math.random() * 3,
  dur: 3 + Math.random() * 4,
}))

// 组件内文案字典（不碰共享 i18n，避免冲突）
const LOCAL = {
  zh: {
    codename: 'LUCK_GAUGE //',
    title: '今日气运检测仪',
    subtitle: 'DAILY LUCK SCAN · 跑车级玄学仪表',
    startBtn: '检测今日气运',
    scanningBtn: '气运校准中…',
    rescanBtn: '再测一次',
    statusIdle: '仪表待机 · 踩下油门开始检测',
    statusScanning: '气运校准中 · 仪表正在狂飙',
    statusResult: '检测完成 · 结果仅供娱乐（也别当真）',
    calibrating: '气运校准中',
    indexLabel: 'FORTUNE INDEX',
    gradeLabel: '今日评级',
    adviceLabel: '// 当日建议',
    subs: { wealth: '财运', love: '桃花运', slack: '摸鱼运', eat: '干饭运' },
    footnote: '* 本气运 24 小时后自动作废，且与现实运势无任何相关性。',
    advice: {
      S: [
        '气运拉满，建议赶紧截图留念，因为明天就没了。',
        '今日你的运势已超出仪表量程，建议趁热打铁——比如趁热把饭打了。',
        'S 级气运：适合买彩票、表白、做梦，三选一，且大概率都白搭。',
      ],
      A: [
        '桃花运不错，前提是你今天能见到活人。',
        '综合运势良好，建议今日做点重要的决定，前提是它足够无足轻重。',
        '今日气运在线，但你的钱包和发际线依然不在线。',
      ],
      B: [
        '干饭运满分，财运欠费；建议好好吃饭，别想发财。',
        '中规中矩的一天，适合做点不需要动脑的事，比如发呆。',
        '评级 B：刚刚好够用的运气，像周一早上的你，勉强能开机。',
      ],
      C: [
        '平平无奇的一天，跟你的工资一样稳定。',
        '评级 C：运气一般，建议降低期待，收获惊喜（或没有）。',
        '今日运势如温水，不凉不烫，适合泡面。',
      ],
      D: [
        '今日宜躺平，忌出门见人。摸鱼运倒是 S 级。',
        '评级 D：运气欠费，建议今日不要做任何决定，包括本条建议。',
        '今日运势触底，好消息是触底之后只有反弹，坏消息是可能反弹失败。',
      ],
    },
  },
  en: {
    codename: 'LUCK_GAUGE //',
    title: 'Daily Fortune Gauge',
    subtitle: 'DAILY LUCK SCAN · supercar-grade mystic gauge',
    startBtn: "Scan Today's Luck",
    scanningBtn: 'Calibrating…',
    rescanBtn: 'Scan Again',
    statusIdle: 'Gauge standby · step on it to scan',
    statusScanning: 'Calibrating · gauge is redlining',
    statusResult: 'Scan complete · for entertainment only (seriously)',
    calibrating: 'CALIBRATING',
    indexLabel: 'FORTUNE INDEX',
    gradeLabel: 'TODAY GRADE',
    adviceLabel: '// DAILY ADVICE',
    subs: { wealth: 'WEALTH', love: 'ROMANCE', slack: 'SLACKING', eat: 'EATING' },
    footnote: '* This fortune auto-expires in 24h and has zero correlation with your actual luck.',
    advice: {
      S: [
        "Luck maxed out. Screenshot it now — it'll be gone tomorrow.",
        'Your fortune has redlined the gauge. Strike while it\'s hot — like your takeout.',
        'S-tier luck: perfect for the lottery, confessing, or daydreaming. Pick one. Probably useless.',
      ],
      A: [
        'Decent romance luck, provided you cross paths with an actual human today.',
        "Solid overall fortune. Make an important decision today, as long as it's completely trivial.",
        'Fortune is online. Your wallet and hairline, however, remain offline.',
      ],
      B: [
        'Eating luck maxed, wealth luck overdrawn. Eat well, skip the getting-rich part.',
        'An aggressively average day. Perfect for brainless tasks, like staring into space.',
        'Grade B: just-enough luck. Like you on Monday morning — barely boots up.',
      ],
      C: [
        'A stunningly average day — as stable as your salary.',
        'Grade C: mediocre luck. Lower your expectations for a surprise (or none).',
        'Fortune is lukewarm today. Neither cold nor hot. Perfect for instant noodles.',
      ],
      D: [
        'Today favors lying flat. Avoid eye contact with humans. Slacking luck is S-tier, though.',
        "Grade D: luck out of credit. Make zero decisions today, including following this advice.",
        'Fortune has hit rock bottom. Good news: only way is up. Bad news: the bounce might fail.',
      ],
    },
  },
}

const randPct = () => 3 + Math.floor(Math.random() * 95) // 3..97，避免太极端看着像 bug

export default function FortuneGauge({ onClose }) {
  const { lang } = useI18n()
  const T = LOCAL[lang]

  const [phase, setPhase] = useState('idle') // idle | scanning | result
  const [subs, setSubs] = useState({ wealth: 50, love: 50, slack: 50, eat: 50 })
  const [displayValue, setDisplayValue] = useState(0) // 主气运数字（结果态滚动）
  const [result, setResult] = useState(null) // { mainValue, grade, targetAngle, advice }

  const needleRef = useRef(null) // SVG 指针 <g>，直接写 transform 属性，绕开 framer-motion 的 SVG transform 坑
  const angleRef = useRef(-68)   // 当前指针角度（跨 effect 持续累积，避免扫描→定格跳变）

  // ===== 指针动画：idle 微晃 / scanning 360°狂飙 / result 正向追上目标 + 刹车抖动 =====
  useEffect(() => {
    let raf = 0
    const apply = (a) => {
      angleRef.current = a
      if (needleRef.current) needleRef.current.setAttribute('transform', `rotate(${a.toFixed(2)} ${CX} ${CY})`)
    }

    if (phase === 'scanning') {
      let last = performance.now()
      const tick = (now) => {
        const dt = (now - last) / 1000
        last = now
        apply(angleRef.current + 620 * dt) // 持续累加，永远向前甩
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    } else if (phase === 'result' && result) {
      // 算出"前方下一次落到目标角度"的位置，让指针继续向前扫一圈再刹车，避免倒转
      const target = result.targetAngle
      const k = Math.floor((angleRef.current - target) / 360) + 1
      const goal = target + 360 * k
      const start = angleRef.current
      const startTs = performance.now()
      const dur = 1500
      const tick = (now) => {
        const tt = Math.min(1, (now - startTs) / dur)
        const e = 1 - Math.pow(1 - tt, 3) // ease-out cubic：主减速曲线
        const wobble = Math.sin(tt * Math.PI * 5) * Math.pow(1 - tt, 2) * 12 // 末段阻尼摆动 = 仪表"刹车"感
        apply(start + (goal - start) * e + wobble)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    } else {
      // idle：低速游丝般的待机微晃，像发动机怠速
      const tick = (now) => {
        const t = now / 1000
        apply(-68 + Math.sin(t * 1.5) * 4)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(raf)
  }, [phase, result])

  // ===== 扫描期：分项条 90ms 狂跳 + 3s 后定格出结果 =====
  useEffect(() => {
    if (phase !== 'scanning') return
    const subId = window.setInterval(() => {
      setSubs({ wealth: randPct(), love: randPct(), slack: randPct(), eat: randPct() })
    }, 90)
    const done = window.setTimeout(() => {
      // 主气运 + 评级 + 四项，全部 Math.random 独家冠名
      const mainValue = Math.floor(Math.random() * 101) // 0..100
      const grade = gradeOf(mainValue)
      const targetAngle = (mainValue / 100) * 180 - 90 // 0→-90°(左) / 100→+90°(右)
      const pool = T.advice[grade]
      const advice = pool[Math.floor(Math.random() * pool.length)]
      setSubs({ wealth: randPct(), love: randPct(), slack: randPct(), eat: randPct() })
      setResult({ mainValue, grade, targetAngle, advice })
      setPhase('result')
    }, 3000)
    return () => {
      window.clearInterval(subId)
      window.clearTimeout(done)
    }
  }, [phase, lang])

  // ===== 结果态：主气运数字 0→mainValue 三次方缓出（老虎机式）=====
  useEffect(() => {
    if (phase !== 'result' || !result) return
    let raf = 0
    const startTs = performance.now()
    const dur = 1400
    const tick = (now) => {
      const tt = Math.min(1, (now - startTs) / dur)
      const e = 1 - Math.pow(1 - tt, 3)
      setDisplayValue(Math.round(result.mainValue * e))
      if (tt < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, result])

  const startScan = () => {
    if (phase === 'scanning') return
    setResult(null)
    setDisplayValue(0)
    setPhase('scanning')
  }

  const btnDisabled = phase === 'scanning'
  const gradeHex = result ? GRADE_HEX[result.grade] : '#7afcff'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-gradient-to-b from-[#061418] via-void to-void"
    >
      <style>{`
        @keyframes gauge-flicker { 0%,100%{opacity:.45} 50%{opacity:1} }
        .g-flicker { animation: gauge-flicker 1.1s ease-in-out infinite; }
      `}</style>

      {/* 氛围层：网格 + 顶部辉光（drift）+ 漂浮粒子 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(122,252,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(122,252,255,0.4) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
        <div className="absolute left-1/2 top-[18%] h-72 w-[44rem] max-w-[92vw] -translate-x-1/2 rounded-full bg-frost/10 blur-[110px] animate-drift" />
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-frost"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
            animate={{ opacity: [0.12, 0.7, 0.12] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-full max-w-xl flex-col items-center px-5 pb-20 pt-16 md:pt-20">
        {/* 顶部 label */}
        <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.3em] text-frost/70">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-frost shadow-[0_0_8px_rgba(122,252,255,0.8)]" />
          <span>{T.codename}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">DIVINE//FROST</span>
        </div>
        <h1
          className="mt-3 text-center font-display text-3xl font-bold text-frost md:text-4xl"
          style={{ textShadow: '0 0 24px rgba(122,252,255,0.45)' }}
        >
          {T.title}
        </h1>
        <div className="mt-1.5 text-center font-mono text-[10px] tracking-[0.2em] text-zinc-500">
          {T.subtitle}
        </div>

        {/* ============ 主仪表盘 ============ */}
        <div className="relative mt-8 w-full max-w-[440px]">
          <div className="relative aspect-[12/7] w-full">
            <svg viewBox="0 0 240 140" className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <radialGradient id="gaugeFace" cx="50%" cy="100%" r="80%">
                  <stop offset="0%" stopColor="rgba(122,252,255,0.10)" />
                  <stop offset="70%" stopColor="rgba(10,10,15,0.0)" />
                </radialGradient>
              </defs>
              {/* 表盘内 bowl 辉光 */}
              <path d={arc(0, 100)} fill="none" />
              <circle cx={CX} cy={CY} r={R} fill="url(#gaugeFace)" />

              {/* 底轨（暗） */}
              <path d={arc(0, 100)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={11} strokeLinecap="round" />
              {/* 分段色轨：低/中/良/满 */}
              {ARC_SEGMENTS.map((s, i) => (
                <path
                  key={i}
                  d={s.d}
                  fill="none"
                  stroke={s.hex}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={0.55}
                  style={{ filter: `drop-shadow(0 0 3px ${s.hex}88)` }}
                />
              ))}

              {/* 刻度 + 数字 */}
              {TICKS.map((tk, i) => (
                <g key={i}>
                  <line
                    x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
                    stroke="#7afcff"
                    strokeWidth={tk.major ? 1.6 : 1}
                    opacity={tk.major ? 0.7 : 0.3}
                  />
                  {tk.labeled && (
                <text
                  x={tk.lx} y={tk.ly}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={7}
                  fill="rgba(122,252,255,0.55)"
                >
                  {i * 5}
                </text>
              )}
                </g>
              ))}

              {/* 指针：idle/scanning/result 三态共用，transform 由 rAF 直写 */}
              <g
                ref={needleRef}
                transform={`rotate(-68 ${CX} ${CY})`}
                style={{ filter: 'drop-shadow(0 0 6px rgba(122,252,255,0.85))' }}
              >
                <line x1={CX} y1={CY} x2={CX} y2={36} stroke="#7afcff" strokeWidth={6} strokeLinecap="round" opacity={0.3} />
                <line x1={CX} y1={CY} x2={CX} y2={38} stroke="#eaffff" strokeWidth={2.4} strokeLinecap="round" />
                {/* 中心轴 */}
                <circle cx={CX} cy={CY} r={9} fill="#0a0a0f" stroke="#7afcff" strokeWidth={2} />
                <circle cx={CX} cy={CY} r={3} fill="#7afcff" />
              </g>
            </svg>

            {/* 四角取景框 */}
            <span className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-frost/60" />
            <span className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-frost/60" />
            <span className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-frost/60" />
            <span className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-frost/60" />
          </div>

          {/* 扫描进度条：3s 线性填满，强化"校准中" */}
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-frost"
              style={{ boxShadow: '0 0 8px rgba(122,252,255,0.8)' }}
              initial={{ width: '0%' }}
              animate={{ width: phase === 'scanning' ? '100%' : '0%' }}
              transition={{ duration: phase === 'scanning' ? 3 : 0.3, ease: 'linear' }}
            />
          </div>
        </div>

        {/* ============ 数字读数区 ============ */}
        <div className="mt-5 flex min-h-[92px] flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'result' && result ? (
              <motion.div
                key="readout"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center"
              >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 14 }}
                className="font-display text-6xl font-bold leading-none md:text-7xl"
                style={{ color: gradeHex, textShadow: `0 0 26px ${gradeHex}cc` }}
              >
                {result.grade}
              </motion.div>
              <div className="mt-2 flex items-baseline gap-1.5 font-mono">
                <span className="text-[10px] tracking-[0.25em] text-zinc-500">{T.indexLabel}</span>
                <span className="text-sm font-bold" style={{ color: gradeHex }}>{displayValue}</span>
                <span className="text-[11px] text-zinc-600">/100</span>
              </div>
              </motion.div>
            ) : phase === 'scanning' ? (
              <motion.div
                key="calib"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="g-flicker font-mono text-sm tracking-[0.3em] text-frost"
              >
                {T.calibrating}…
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[11px] tracking-[0.3em] text-zinc-500"
              >
                — STANDBY —
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============ 四项分仪表 ============ */}
        <div className="mt-3 grid w-full max-w-md grid-cols-2 gap-x-6 gap-y-4">
          {SUBS.map((s) => {
            const v = subs[s.key]
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-zinc-300">
                    <span className="text-sm">{s.icon}</span>
                    {T.subs[s.key]}
                  </span>
                  <span className="font-mono text-sm font-bold" style={{ color: s.hex }}>
                    {v}<span className="text-[10px] text-zinc-500">%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: s.hex, boxShadow: `0 0 8px ${s.hex}aa` }}
                    animate={{ width: `${v}%` }}
                    transition={{ duration: phase === 'scanning' ? 0.08 : 0.75, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* ============ 状态行 ============ */}
        <div className="mt-6 flex h-5 items-center font-mono text-[11px] tracking-widest text-frost/70">
          {phase === 'scanning' ? (
            <>
              <motion.span
                className="mr-2 inline-block text-frost"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                ●
              </motion.span>
              {T.statusScanning}
            </>
          ) : phase === 'result' ? (
            <>
              <span className="mr-2" style={{ color: gradeHex }}>●</span>
              {T.statusResult}
            </>
          ) : (
            <>
              <span className="mr-2 text-frost/40">●</span>
              {T.statusIdle}
            </>
          )}
        </div>

        {/* ============ 当日建议（结果态） ============ */}
        <AnimatePresence>
          {phase === 'result' && result && (
            <motion.div
              key="advice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-4 w-full max-w-md rounded-r-lg border-l-2 bg-white/[0.03] px-4 py-3"
              style={{ borderColor: gradeHex }}
            >
              <div className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">{T.adviceLabel}</div>
              <div className="mt-1.5 font-display text-sm leading-relaxed text-zinc-100">
                {result.advice}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ 主按钮 ============ */}
        <motion.button
          onClick={startScan}
          disabled={btnDisabled}
          whileHover={{ scale: btnDisabled ? 1 : 1.04 }}
          whileTap={{ scale: btnDisabled ? 1 : 0.96 }}
          className={`mt-7 rounded-full px-10 py-3.5 font-display text-base font-bold tracking-wide transition ${
            btnDisabled
              ? 'cursor-not-allowed bg-white/10 text-zinc-500'
              : 'bg-frost text-void shadow-[0_0_30px_rgba(122,252,255,0.4)] hover:shadow-[0_0_50px_rgba(122,252,255,0.6)]'
          }`}
        >
          {phase === 'scanning' ? T.scanningBtn : phase === 'result' ? `↻ ${T.rescanBtn}` : T.startBtn}
        </motion.button>

        {/* 补刀小字 */}
        <div className="mt-10 max-w-md px-4 text-center font-mono text-[10px] leading-relaxed text-zinc-600">
          {T.footnote}
        </div>
      </div>
    </motion.div>
  )
}
