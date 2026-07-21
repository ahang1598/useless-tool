// 🔋 精神电量充电站 —— 手机快充仪式感拉满，线上 100% 线下还是累
// 内核：100W 赛博快充 HUD，把精神电量从 20% 充到 100%，结果你还是要继续上班
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

const LOCAL = {
  zh: {
    codename: 'SOUL_CHARGE //',
    bureau: '赛博玄学馆 · 精神能量科',
    title: '精神电量充电站',
    subtitle: 'CYBER SOUL FAST-CHARGE · 100W 玄学快充协议',
    statusIdle: '待机中 · 精神电量严重偏低，建议立即接入',
    statusCharging: '快充进行中 · 正在注入赛博能量',
    statusDone: '充电完成 · 续航约 5 分钟（玄学计时）',
    plug: '插入精神充电线',
    charging: '充电中',
    chargingHint: '+ 充电中',
    recharge: '重新充电',
    plugIn: '⚡ SOUL-100W 已接入',
    lowWarn: '⚠ 精神电量过低，建议立即充电（虽然充了也没用）',
    cells: { joy: '快乐电量', drive: '干劲电量', sleep: '睡眠电量' },
    cellCodes: { joy: 'JOY_CELL', drive: 'DRV_CELL', sleep: 'SLP_CELL' },
    subHeader: 'SUB CELLS · 分项精神电芯',
    metrics: { volt: '电压', curr: '电流', pow: '功率', temp: '温度' },
    metricUnit: { volt: 'V', curr: 'A', pow: 'W', temp: '°C' },
    full: '精神电量已充满',
    fullHint: '请关闭网页，继续面对现实',
    footnote: '* 线上充电一秒满格，线下该累还是累，纯视觉自我安慰。',
    finalLine: '精神电量已充满 100%。',
  },
  en: {
    codename: 'SOUL_CHARGE //',
    bureau: 'CYBER MYSTIC · MENTAL ENERGY DIVISION',
    title: 'Mental Battery Charger',
    subtitle: 'CYBER SOUL FAST-CHARGE · 100W mystic protocol',
    statusIdle: 'Standby · mental battery critically low, plug in now',
    statusCharging: 'Fast-charging · injecting cyber energy',
    statusDone: 'Charge complete · approx. 5 min runtime (mystic)',
    plug: 'Plug in Soul Cable',
    charging: 'Charging',
    chargingHint: '+ CHARGING',
    recharge: 'Recharge',
    plugIn: '⚡ SOUL-100W connected',
    lowWarn: '⚠ Mental battery low. Plug in now (won’t help, but plug in).',
    cells: { joy: 'Joy Battery', drive: 'Drive Battery', sleep: 'Sleep Battery' },
    cellCodes: { joy: 'JOY_CELL', drive: 'DRV_CELL', sleep: 'SLP_CELL' },
    subHeader: 'SUB CELLS · mental cells',
    metrics: { volt: 'VOLT', curr: 'CURR', pow: 'POWER', temp: 'TEMP' },
    metricUnit: { volt: 'V', curr: 'A', pow: 'W', temp: '°C' },
    full: 'Mental Battery Full',
    fullHint: 'Close the tab. Face reality.',
    footnote: '* One second to full online; still tired offline. Pure visual placebo.',
    finalLine: 'Mental battery charged to 100%.',
  },
}

const SUB_KEYS = ['joy', 'drive', 'sleep']
const INITIAL_MAIN = 20
const INITIAL_SUB = { joy: 18, drive: 12, sleep: 8 }

// 背景能量尘埃（模块级常量，避免每帧重算）
const DUST = Array.from({ length: 18 }).map(() => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 1 + Math.random() * 1.5,
  delay: Math.random() * 4,
  dur: 3 + Math.random() * 4,
}))

export default function MentalCharger({ onClose }) {
  const { lang } = useI18n()
  const T = LOCAL[lang]

  // idle: 红色低电量待机 / charging: 4 秒快充 / done: 满格呼吸
  const [phase, setPhase] = useState('idle')
  const [mainPct, setMainPct] = useState(INITIAL_MAIN)
  const [subs, setSubs] = useState({ ...INITIAL_SUB })
  const [sparks, setSparks] = useState([])
  const [dingKey, setDingKey] = useState(0)

  const sparkIdRef = useRef(0)
  const subTargetsRef = useRef({ joy: 95, drive: 90, sleep: 98 })
  const chargeFromSubsRef = useRef({ ...INITIAL_SUB })

  // === 主充电循环：rAF 驱动 4 秒 20→100，子电池同步缓动到各自目标 ===
  useEffect(() => {
    if (phase !== 'charging') return
    const start = performance.now()
    const DURATION = 4000
    const mainFrom = INITIAL_MAIN
    const mainTo = 100
    const subFrom = chargeFromSubsRef.current
    const subTo = subTargetsRef.current
    let raf = 0

    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION)
      const eased = 1 - Math.pow(1 - t, 2) // easeOutQuad，前期快、临满放缓
      setMainPct(Math.round(mainFrom + (mainTo - mainFrom) * eased))
      setSubs({
        joy: Math.round(subFrom.joy + (subTo.joy - subFrom.joy) * eased),
        drive: Math.round(subFrom.drive + (subTo.drive - subFrom.drive) * eased),
        sleep: Math.round(subFrom.sleep + (subTo.sleep - subFrom.sleep) * eased),
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setMainPct(100)
        setSubs({ ...subTo })
        setDingKey((k) => k + 1)
        setPhase('done')
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  // === 充电中持续吐电火花（在填充顶线随机迸射，限流防爆帧） ===
  useEffect(() => {
    if (phase !== 'charging') return
    const iv = setInterval(() => {
      setSparks((prev) => {
        if (prev.length >= 26) return prev
        const id = ++sparkIdRef.current
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3
        const dist = 18 + Math.random() * 36
        return [
          ...prev,
          {
            id,
            dx: Math.cos(angle) * dist,
            dy: Math.sin(angle) * dist, // 负值，向上飞
            size: 2 + Math.random() * 2.5,
            dur: 0.45 + Math.random() * 0.5,
          },
        ]
      })
    }, 70)
    return () => clearInterval(iv)
  }, [phase])

  const startCharge = () => {
    if (phase === 'charging') return
    // 每次重新摇一个目标，玄学感拉满
    subTargetsRef.current = {
      joy: 88 + Math.floor(Math.random() * 12),
      drive: 82 + Math.floor(Math.random() * 16),
      sleep: 90 + Math.floor(Math.random() * 10),
    }
    chargeFromSubsRef.current = { ...INITIAL_SUB }
    setSparks([])
    setPhase('charging')
  }

  const recharge = () => {
    setMainPct(INITIAL_MAIN)
    setSubs({ ...INITIAL_SUB })
    setSparks([])
    setPhase('idle')
  }

  const removeSpark = (id) => setSparks((prev) => prev.filter((s) => s.id !== id))

  // === 配色与光晕（低电量红 / 充电中绿 / 满格呼吸光） ===
  const isLow = phase === 'idle' && mainPct < 25
  const mainHex = isLow ? '#ff2d75' : '#d4ff3a'
  const mainGlow =
    phase === 'done'
      ? '0 0 60px rgba(212,255,58,0.7), 0 0 120px rgba(212,255,58,0.35)'
      : phase === 'charging'
      ? '0 0 36px rgba(212,255,58,0.55)'
      : isLow
      ? '0 0 24px rgba(255,45,117,0.45)'
      : '0 0 20px rgba(212,255,58,0.3)'

  // === 仿真快充读数（充电时跳动，像极了真快充 HUD） ===
  const volt = phase === 'charging' ? (8 + Math.random() * 1.5).toFixed(1) : phase === 'done' ? '0.0' : '0.0'
  const curr = phase === 'charging' ? (9 + Math.random() * 2).toFixed(1) : phase === 'done' ? '0.0' : '0.0'
  const pow = phase === 'charging' ? Math.round(80 + Math.random() * 20) : 0
  const temp = phase === 'charging' ? Math.round(32 + Math.random() * 6) : 24

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-void"
      style={{ background: 'radial-gradient(ellipse at 50% 32%, rgba(212,255,58,0.08), transparent 60%), #0a0a0f' }}
    >
      <style>{`
        @keyframes soul-ding {
          0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(2.6);  opacity: 0; }
        }
        @keyframes soul-fill-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* 背景能量尘埃 + 中央辉光 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[35%] h-[55vmin] w-[55vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid/10 blur-[110px]" />
        {DUST.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-acid/60"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
            animate={{ opacity: [0.1, 0.7, 0.1], y: [0, -20, 0] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-full max-w-5xl flex-col items-center px-5 pb-20 pt-16 md:pt-20">
        {/* 头部 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2.5 font-mono text-[10px] tracking-[0.3em] text-acid/70">
            <motion.span
              className="inline-block h-2 w-2 rounded-full bg-acid"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ boxShadow: '0 0 8px #d4ff3a' }}
            />
            <span>{T.codename}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500">HEAL//ACID</span>
          </div>
          <h1
            className="mt-2 font-display text-3xl font-bold text-acid md:text-4xl"
            style={{ textShadow: '0 0 24px rgba(212,255,58,0.4)' }}
          >
            {T.title}
          </h1>
          <div className="mt-1 font-mono text-[10px] tracking-widest text-zinc-500">{T.subtitle}</div>
        </div>

        {/* 主体：桌面左右 / 移动上下 */}
        <div className="mt-8 flex w-full flex-col items-center gap-8 md:mt-10 md:flex-row md:items-center md:justify-center md:gap-14">
          {/* ===== 主电池（核心视觉锚点） ===== */}
          <div className="relative flex flex-col items-center">
            {/* 完成时光环扩散（"叮"视觉反馈，不响音频） */}
            {dingKey > 0 && (
              <>
                <span
                  key={`d1-${dingKey}`}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 rounded-full border-2 border-acid/60 md:h-72 md:w-72"
                  style={{ animation: 'soul-ding 1.6s ease-out' }}
                />
                <span
                  key={`d2-${dingKey}`}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 rounded-full border border-acid/40 md:h-72 md:w-72"
                  style={{ animation: 'soul-ding 1.6s ease-out 0.25s' }}
                />
              </>
            )}

            {/* 电池正极帽 */}
            <div
              className="relative z-10 h-3 w-12 rounded-t-sm border-x-2 border-t-2"
              style={{ borderColor: mainHex, background: 'rgba(212,255,58,0.04)' }}
            />
            {/* 电池外壳 */}
            <motion.div
              className="relative h-60 w-32 overflow-hidden rounded-2xl border-2 bg-black/60 md:h-72 md:w-40"
              style={{
                borderColor: mainHex,
                boxShadow: mainGlow,
                transition: 'box-shadow 0.4s, border-color 0.4s',
              }}
              animate={
                phase === 'done'
                  ? { boxShadow: [
                      '0 0 36px rgba(212,255,58,0.5)',
                      '0 0 80px rgba(212,255,58,0.8)',
                      '0 0 36px rgba(212,255,58,0.5)',
                    ] }
                  : {}
              }
              transition={phase === 'done' ? { duration: 2.4, repeat: Infinity } : {}}
            >
              {/* 内部填充（从底向上） */}
              <motion.div
                className="absolute inset-x-0 bottom-0"
                style={{
                  height: `${mainPct}%`,
                  background: isLow
                    ? 'linear-gradient(to top, rgba(255,45,117,0.95), rgba(255,45,117,0.5))'
                    : 'linear-gradient(to top, rgba(212,255,58,0.95), rgba(212,255,58,0.5))',
                }}
                transition={{ duration: 0.1, ease: 'linear' }}
              >
                {/* 填充顶部高光线 */}
                <div className="absolute inset-x-0 top-0 h-[3px] bg-white/70" style={{ filter: 'blur(0.5px)' }} />
                {/* 电流流光（充电中横向掠过） */}
                {phase === 'charging' && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)',
                      animation: 'soul-fill-shimmer 1.4s linear infinite',
                    }}
                  />
                )}
              </motion.div>

              {/* 5 段刻度装饰 */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-px w-full bg-white/[0.08]" />
                ))}
              </div>

              {/* 中心闪电 ⚡（充电中闪烁放大） */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-5xl md:text-6xl"
                animate={
                  phase === 'charging'
                    ? { opacity: [0.55, 1, 0.55], scale: [1, 1.18, 1] }
                    : { opacity: phase === 'done' ? 1 : 0.45 }
                }
                transition={phase === 'charging' ? { duration: 0.55, repeat: Infinity } : { duration: 0.4 }}
                style={{
                  filter: isLow
                    ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))'
                    : 'drop-shadow(0 0 12px rgba(212,255,58,0.9))',
                  mixBlendMode: 'screen',
                }}
              >
                ⚡
              </motion.div>

              {/* 大百分比数字（实时跳动） */}
              <div className="absolute inset-x-0 top-3 text-center">
                <span
                  className="font-display text-3xl font-bold tabular-nums text-white md:text-4xl"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}
                >
                  {mainPct}
                </span>
                <span className="ml-0.5 font-mono text-sm text-white/80">%</span>
              </div>

              {/* 电火花粒子（从填充顶线随机迸射） */}
              <div className="pointer-events-none absolute inset-x-0" style={{ bottom: `${mainPct}%` }}>
                {sparks.map((s) => (
                  <motion.span
                    key={s.id}
                    className="absolute left-1/2 top-0 rounded-full"
                    style={{
                      width: s.size,
                      height: s.size,
                      background: '#eaffaa',
                      boxShadow: '0 0 6px #d4ff3a',
                    }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: s.dx, y: s.dy, opacity: [1, 1, 0], scale: [1, 1, 0.3] }}
                    transition={{ duration: s.dur, ease: 'easeOut' }}
                    onAnimationComplete={() => removeSpark(s.id)}
                  />
                ))}
              </div>

              {/* 充满徽章（done 时显现） */}
              {phase === 'done' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}
                  className="absolute inset-x-0 bottom-2 text-center font-mono text-[10px] tracking-[0.25em] text-acid"
                  style={{ textShadow: '0 0 8px rgba(212,255,58,0.6)' }}
                >
                  FULL · 100%
                </motion.div>
              )}
            </motion.div>

            {/* 电池下方插头/电流指示 */}
            <AnimatePresence mode="wait">
              {phase === 'charging' ? (
                <motion.div
                  key="chg"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 font-mono text-[10px] tracking-widest text-acid"
                >
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  >
                    {T.chargingHint} · {T.plugIn}
                  </motion.span>
                </motion.div>
              ) : phase === 'done' ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 font-mono text-[10px] tracking-widest text-acid/80"
                >
                  ✓ {T.plugIn}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* ===== 右侧 HUD：快充读数 + 三个分项电芯 ===== */}
          <div className="flex w-full max-w-sm flex-col gap-4 md:w-72">
            {/* 快充读数面板（电压/电流/功率/温度） */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { k: 'volt', v: volt, color: 'text-acid' },
                { k: 'curr', v: curr, color: 'text-acid' },
                { k: 'pow', v: pow, color: 'text-acid' },
                { k: 'temp', v: temp, color: 'text-frost' },
              ].map((m) => (
                <div key={m.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <div className="font-mono text-[9px] tracking-widest text-zinc-500">{T.metrics[m.k]}</div>
                  <div className={`mt-0.5 font-mono text-sm tabular-nums ${m.color}`}>
                    {m.v}
                    <span className="ml-0.5 text-[9px] text-zinc-500">{T.metricUnit[m.k]}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 三个分项 mini 电池 */}
            <div className="flex flex-col gap-3 rounded-xl border border-acid/15 bg-black/30 p-3">
              <div className="font-mono text-[9px] tracking-widest text-acid/60">{T.subHeader}</div>
              {SUB_KEYS.map((k) => (
                <SubBattery
                  key={k}
                  label={T.cells[k]}
                  code={T.cellCodes[k]}
                  pct={subs[k]}
                  charging={phase === 'charging'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 状态行 */}
        <div className="mt-8 flex min-h-[1.5rem] items-center font-mono text-[11px] tracking-widest text-acid/70">
          {phase === 'idle' && (
            <>
              <span className="mr-2 text-plasma/80">●</span>
              {T.statusIdle}
            </>
          )}
          {phase === 'charging' && (
            <>
              <motion.span
                className="mr-2 inline-block text-acid"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                ●
              </motion.span>
              {T.statusCharging}
            </>
          )}
          {phase === 'done' && (
            <>
              <span className="mr-2 text-acid">●</span>
              {T.statusDone}
            </>
          )}
        </div>

        {/* 主按钮（充电中禁用） */}
        <motion.button
          onClick={phase === 'done' ? recharge : startCharge}
          disabled={phase === 'charging'}
          whileHover={{ scale: phase === 'charging' ? 1 : 1.04 }}
          whileTap={{ scale: phase === 'charging' ? 1 : 0.96 }}
          className={`mt-5 rounded-full px-10 py-3.5 font-display text-base font-bold tracking-wide transition ${
            phase === 'charging'
              ? 'cursor-not-allowed bg-white/10 text-zinc-500'
              : 'bg-acid text-void shadow-[0_0_30px_rgba(212,255,58,0.45)] hover:shadow-[0_0_50px_rgba(212,255,58,0.65)]'
          }`}
        >
          {phase === 'charging' ? `${T.charging}…` : phase === 'done' ? `↻ ${T.recharge}` : `🔌 ${T.plug}`}
        </motion.button>

        {/* 低电量警示（仅 idle 显示） */}
        <AnimatePresence>
          {phase === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 font-mono text-[10px] tracking-wider text-plasma/80"
            >
              {T.lowWarn}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 充满弹层（核心笑点 + 补刀） */}
        <AnimatePresence>
          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 240, damping: 18 }}
              className="mt-6 w-full max-w-md rounded-2xl border border-acid/40 bg-[#0e1408]/85 p-5 text-center backdrop-blur-md"
              style={{ boxShadow: '0 0 30px rgba(212,255,58,0.2)' }}
            >
              <motion.div
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.5 }}
                className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-acid/60 bg-acid/10 text-2xl"
                style={{ boxShadow: '0 0 18px rgba(212,255,58,0.4)' }}
              >
                🔋
              </motion.div>
              <div
                className="font-display text-lg font-bold text-acid md:text-xl"
                style={{ textShadow: '0 0 16px rgba(212,255,58,0.4)' }}
              >
                {T.finalLine}
              </div>
              <div className="mt-1 font-mono text-[11px] tracking-widest text-zinc-400">
                {T.fullHint}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 补刀小字（永远在底部） */}
        <div className="mt-10 max-w-md px-4 text-center font-mono text-[10px] leading-relaxed tracking-wide text-zinc-500">
          {T.footnote}
        </div>
      </div>
    </motion.div>
  )
}

// ===== 子电池：横向 mini 电池 + 流光 + 百分比 =====
function SubBattery({ label, code, pct, charging }) {
  const isLow = pct < 25
  const hex = isLow ? '#ff2d75' : '#d4ff3a'
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[10px] tracking-wider">
        <span className="text-zinc-300">{label}</span>
        <span className="tabular-nums text-acid">{pct}%</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        {/* 横向 mini 电池本体 */}
        <div
          className="relative h-3 flex-1 overflow-hidden rounded-sm border bg-black/50"
          style={{ borderColor: hex + '99' }}
        >
          <motion.div
            className="relative h-full"
            style={{
              width: `${pct}%`,
              background: isLow
                ? 'linear-gradient(90deg, rgba(255,45,117,0.9), rgba(255,45,117,0.5))'
                : 'linear-gradient(90deg, rgba(212,255,58,0.95), rgba(212,255,58,0.55))',
              boxShadow: charging && !isLow ? '0 0 8px rgba(212,255,58,0.6)' : 'none',
            }}
            transition={{ duration: 0.1, ease: 'linear' }}
          >
            {charging && !isLow && (
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'soul-fill-shimmer 1.2s linear infinite',
                }}
              />
            )}
          </motion.div>
        </div>
        {/* 正极小帽子 */}
        <div className="h-1.5 w-0.5 rounded-r-sm" style={{ background: hex + '99' }} />
      </div>
      <div className="mt-0.5 font-mono text-[8px] tracking-widest text-zinc-600">{code}</div>
    </div>
  )
}
