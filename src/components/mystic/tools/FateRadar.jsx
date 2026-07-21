// 🛰️ 缘分匹配雷达系统 —— 军用级扫描，缘分纯随机（Math.random 独家冠名）
import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

const LOCAL = {
  zh: {
    codename: 'FATE_RADAR //',
    title: '缘分匹配雷达',
    subtitle: 'DEEP FATE SCAN · 跨星系缘分探测',
    inputA: '你的代号',
    inputB: 'TA 的代号',
    start: '开始匹配',
    scanning: '正在匹配',
    rescan: '换一对重测',
    statusIdle: '雷达待机中 · 等待目标输入',
    statusScanning: '正在搜索宇宙缘分磁场...',
    statusResult: '匹配完成 · 结果仅供参考（也别参考）',
    logHeader: '// SCAN LOG',
    scoreLabel: '缘分指数',
    footnote: '* 缘分指数由 Math.random() 独家冠名播出，与月老无关。',
    scanningLogs: [
      '初始化缘分探测核心...',
      '扫描第一象限…',
      '扫描第七象限…',
      '检测到微弱信号',
      '同步月老服务器（连接失败）',
      '调取前世记忆数据库…',
      '校准心动频率',
      '量子纠缠态分析中',
      '比对鹊桥坐标',
      '红丝线信号强度: ⚠ 弱',
      '缘分云图渲染中',
      '神经网络打了个喷嚏',
      '塔罗牌已洗好',
      '正在向丘比特请求授权…',
      '占卜缓存命中（已过期）',
      '最终计算：摇骰子决定',
    ],
    verdicts: {
      '90-99': [
        '宇宙说你们挺配，但本雷达不算数，请以现实为准。',
        '指数爆表。建议立刻领证，或者立刻关掉本页面冷静一下。',
      ],
      '70-89': [
        '缘分浓度很高，建议珍惜，或者建议买彩票（同样随机）。',
        '非常合适——本雷达愿意为此负 0% 的责任。',
      ],
      '50-69': [
        '不近不远，刚好是点赞之交的安全距离。',
        '中等缘分。够发朋友圈，不够过年一起回家。',
      ],
      '30-49': [
        '处于认识和不熟的尴尬区间，寒暄都会卡壳的那种。',
        '缘分像会议室的 Wi-Fi：能连上，但啥也打不开。',
      ],
      '10-29': [
        '建议保持社交距离，物理距离也建议保持。',
        '本雷达建议：把对方设为「仅聊天」，且别主动发起。',
      ],
      '0-9': [
        '缘分指数过低，月老看了都想删好友。',
        '本雷达从未见过如此干净的缘分——干净到不存在。',
      ],
    },
    compass: { n: '桃花北', e: '心动东', s: '分手南', w: '冷战西' },
  },
  en: {
    codename: 'FATE_RADAR //',
    title: 'Fate Matching Radar',
    subtitle: 'DEEP FATE SCAN · intergalactic affinity detection',
    inputA: 'Your codename',
    inputB: 'Their codename',
    start: 'Start Match',
    scanning: 'Matching',
    rescan: 'New Pair',
    statusIdle: 'Radar standby · awaiting targets',
    statusScanning: 'Searching cosmic fate magnetic field...',
    statusResult: 'Match complete · for reference only (do not reference)',
    logHeader: '// SCAN LOG',
    scoreLabel: 'FATE INDEX',
    footnote: '* Fate index is sponsored solely by Math.random(). The matchmaker is not involved.',
    scanningLogs: [
      'Initializing fate-detection core...',
      'Scanning sector 1…',
      'Scanning sector 7…',
      'Faint signal detected',
      'Syncing with Cupid server (failed)',
      'Querying past-life database…',
      'Calibrating heartbeat frequency',
      'Quantum entanglement analysis',
      'Cross-checking magpie-bridge coords',
      'Red-thread signal: ⚠ weak',
      'Rendering fate cloud',
      'Neural network sneezed',
      'Tarot deck shuffled',
      'Requesting Cupid authorization…',
      'Divination cache hit (expired)',
      'Final calc: rolling dice',
    ],
    verdicts: {
      '90-99': [
        'The universe says you two match. Radar not admissible in reality, though.',
        'Index off the charts. Get married now, or close the tab and calm down.',
      ],
      '70-89': [
        'High fate concentration. Cherish it, or buy a lottery ticket (same RNG).',
        'Very compatible — radar assumes 0% liability for this claim.',
      ],
      '50-69': [
        'Not too close, not too far: a safe like-and-move-on distance.',
        'Medium fate. Enough to post, not enough to bring home for holidays.',
      ],
      '30-49': [
        'The awkward zone between acquaintances and strangers. Small talk will lag.',
        'Fate like conference Wi-Fi: connects, but nothing loads.',
      ],
      '10-29': [
        'Keep social distance. Physical distance also recommended.',
        'Radar advice: set them to "messages only", and never initiate.',
      ],
      '0-9': [
        'Fate index critically low. The matchmaker wants to unfriend you both.',
        'Radar has never seen such clean fate — so clean it does not exist.',
      ],
    },
    compass: { n: 'FLIRT-N', e: 'CRUSH-E', s: 'GHOST-S', w: 'COLD-W' },
  },
}

export default function FateRadar({ onClose }) {
  const { lang } = useI18n()
  const T = LOCAL[lang]

  const [phase, setPhase] = useState('idle') // idle | scanning | result
  const [nameA, setNameA] = useState('')
  const [nameB, setNameB] = useState('')
  const [score, setScore] = useState(0)
  const [displayScore, setDisplayScore] = useState(0)
  const [logs, setLogs] = useState([])
  const [verdict, setVerdict] = useState('')

  // 匹配倒计时 ref：ESC 中途退出时清理，避免 setState 打到已卸载组件
  const matchTimeoutRef = useRef(null)

  // 雷达上的信号光点（一次性生成，避免每帧抖动）
  const contacts = useMemo(
    () =>
      Array.from({ length: 9 }).map(() => {
        const angle = Math.random() * Math.PI * 2
        const radius = 0.2 + Math.random() * 0.75
        return {
          x: 50 + Math.cos(angle) * radius * 42,
          y: 50 + Math.sin(angle) * radius * 42,
          delay: Math.random() * 1.8,
          duration: 0.9 + Math.random() * 1.3,
          size: 3 + Math.random() * 4,
        }
      }),
    []
  )

  // 扫描日志：随机洗牌后逐条推送
  useEffect(() => {
    if (phase !== 'scanning') return
    const pool = [...T.scanningLogs].sort(() => Math.random() - 0.5)
    setLogs([])
    let i = 0
    const id = window.setInterval(() => {
      if (i >= pool.length) {
        window.clearInterval(id)
        return
      }
      setLogs((prev) => [...prev, pool[i]].slice(-5))
      i++
    }, 270)
    return () => window.clearInterval(id)
  }, [phase, lang])

  // ESC 中途退出时清理匹配 setTimeout
  useEffect(() => {
    return () => {
      if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current)
    }
  }, [])

  const startMatch = () => {
    if (!nameA.trim() || !nameB.trim() || phase === 'scanning') return
    setPhase('scanning')
    // 缘分指数：100% 由 Math.random() 独家出品，仪式感拉满，结果全靠运气
    const target = Math.floor(Math.random() * 100)
    matchTimeoutRef.current = window.setTimeout(() => {
      setScore(target)
      setPhase('result')
    }, 3500)
  }

  // 按区间随机抽一条 verdict
  useEffect(() => {
    if (phase !== 'result') return
    const bucket =
      score >= 90 ? '90-99'
      : score >= 70 ? '70-89'
      : score >= 50 ? '50-69'
      : score >= 30 ? '30-49'
      : score >= 10 ? '10-29'
      : '0-9'
    const pool = T.verdicts[bucket]
    setVerdict(pool[Math.floor(Math.random() * pool.length)])
  }, [phase, score, lang])

  // 老虎机式滚动：0 → target，三次方缓出
  useEffect(() => {
    if (phase !== 'result') return
    let raf = 0
    const startTs = performance.now()
    const dur = 1700
    const tick = (now) => {
      const t = Math.min(1, (now - startTs) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayScore(Math.round(score * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, score])

  const reset = () => {
    if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current)
    setPhase('idle')
    setNameA('')
    setNameB('')
    setScore(0)
    setDisplayScore(0)
    setLogs([])
    setVerdict('')
  }

  const canStart = Boolean(nameA.trim()) && Boolean(nameB.trim()) && phase !== 'scanning'
  const btnDisabled = phase === 'scanning' || (!canStart && phase !== 'result')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-void"
    >
      <style>{`
        @keyframes fate-ping {
          0%   { transform: translate(-50%, -50%) scale(0.35); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(2.2);  opacity: 0; }
        }
        .fate-scanline {
          background: conic-gradient(from 0deg,
            transparent 0deg,
            transparent 268deg,
            rgba(122,252,255,0.04) 280deg,
            rgba(122,252,255,0.18) 320deg,
            rgba(122,252,255,0.42) 350deg,
            rgba(122,252,255,0.6)  360deg);
        }
      `}</style>

      <div className="relative min-h-full px-5 pb-16 pt-16 md:px-8 md:pt-20">
        {/* 背景光晕 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[34%] h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-frost/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto flex max-w-2xl flex-col items-center">
          {/* 顶部 label */}
          <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.3em] text-frost/70">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-frost shadow-[0_0_8px_rgba(122,252,255,0.8)]" />
            <span>{T.codename}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500">DIVINE//FROST</span>
          </div>

          <h1 className="mt-3 text-center font-display text-3xl font-bold text-zinc-100 md:text-4xl">
            {T.title}
          </h1>
          <div className="mt-2 text-center font-mono text-[10px] tracking-[0.2em] text-frost/60 md:text-[11px]">
            {T.subtitle}
          </div>

          {/* ============ 雷达主体 ============ */}
          <div className="relative mt-8 aspect-square w-full max-w-[420px]">
            {/* 外围 36 格刻度环 */}
            <div className="absolute inset-0">
              {Array.from({ length: 36 }).map((_, i) => {
                const isMajor = i % 9 === 0
                return (
                  <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 10}deg)` }}>
                    <div
                      className="absolute left-1/2 top-0 -translate-x-1/2 bg-frost"
                      style={{ width: 1, height: isMajor ? 10 : 5, opacity: isMajor ? 0.6 : 0.25 }}
                    />
                  </div>
                )
              })}
            </div>

            {/* 外圈 */}
            <div className="absolute inset-[2%] rounded-full border border-frost/25" />

            {/* 雷达屏（同心圆 + 十字 + 斜线 + 扫描线 + 光点 + 方向标） */}
            <div
              className="absolute inset-[6%] overflow-hidden rounded-full border border-frost/30"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(122,252,255,0.08), rgba(10,10,15,0.95) 70%, rgba(10,10,15,1))',
                boxShadow:
                  '0 0 60px rgba(122,252,255,0.15), inset 0 0 60px rgba(122,252,255,0.08)',
              }}
            >
              {/* 同心圆（4 圈） */}
              {[0.78, 0.58, 0.38, 0.18].map((s) => (
                <div
                  key={s}
                  className="absolute rounded-full border border-frost/15"
                  style={{
                    left: `${(1 - s) * 50}%`,
                    top: `${(1 - s) * 50}%`,
                    width: `${s * 100}%`,
                    height: `${s * 100}%`,
                  }}
                />
              ))}

              {/* 十字准线 */}
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-frost/15" />
              <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-frost/15" />
              {/* 斜线（X 对角） */}
              <div
                className="absolute left-1/2 top-1/2 h-full w-px bg-frost/10"
                style={{ transform: 'translate(-50%, -50%) rotate(45deg)' }}
              />
              <div
                className="absolute left-1/2 top-1/2 h-full w-px bg-frost/10"
                style={{ transform: 'translate(-50%, -50%) rotate(-45deg)' }}
              />

              {/* 扫描扇区 + 前缘亮线（匀速旋转，扫描时加速） */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: phase === 'scanning' ? 1.1 : 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <div className="absolute inset-0 fate-scanline" />
                <div
                  className="absolute left-1/2 top-0 h-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-frost via-frost/60 to-transparent"
                  style={{ boxShadow: '0 0 10px rgba(122,252,255,0.9)' }}
                />
              </motion.div>

              {/* 信号光点（扫描时变亮+脉冲加快） */}
              {contacts.map((c, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-frost"
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    width: c.size,
                    height: c.size,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 8px rgba(122,252,255,0.9)',
                  }}
                  animate={{
                    opacity: phase === 'scanning' ? [0.2, 1, 0.2] : [0.3, 0.75, 0.3],
                    scale: phase === 'scanning' ? [1, 1.5, 1] : [1, 1.1, 1],
                  }}
                  transition={{
                    duration: phase === 'scanning' ? c.duration * 0.45 : c.duration,
                    repeat: Infinity,
                    delay: c.delay,
                  }}
                />
              ))}

              {/* 四向标签 */}
              <div className="absolute left-1/2 top-1.5 -translate-x-1/2 font-mono text-[8px] tracking-widest text-frost/50">
                {T.compass.n}
              </div>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-[8px] tracking-widest text-frost/50">
                {T.compass.e}
              </div>
              <div className="absolute left-1/2 bottom-1.5 -translate-x-1/2 font-mono text-[8px] tracking-widest text-frost/50">
                {T.compass.s}
              </div>
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-[8px] tracking-widest text-frost/50">
                {T.compass.w}
              </div>

              {/* 中心核心：idle/scanning 显示旋转的 🛰️；result 显示缘分大数字 + 命中波纹 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <AnimatePresence mode="wait">
                  {phase === 'result' ? (
                    <motion.div
                      key="score"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                      className="relative flex flex-col items-center"
                    >
                      <span
                        className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 rounded-full border border-frost/60"
                        style={{ animation: 'fate-ping 1.8s ease-out infinite' }}
                      />
                      <span
                        className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 rounded-full border border-frost/40"
                        style={{ animation: 'fate-ping 1.8s ease-out infinite 0.6s' }}
                      />
                      <div
                        className="relative font-display text-6xl font-bold leading-none text-frost md:text-7xl"
                        style={{ textShadow: '0 0 28px rgba(122,252,255,0.7)' }}
                      >
                        {displayScore}
                      </div>
                      <div className="relative mt-0.5 font-mono text-[10px] tracking-widest text-frost/70">%</div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, rotate: phase === 'scanning' ? 360 : 0 }}
                      transition={{
                        scale: { type: 'spring', stiffness: 200 },
                        rotate: {
                          duration: phase === 'scanning' ? 0.9 : 0.6,
                          repeat: phase === 'scanning' ? Infinity : 0,
                          ease: 'linear',
                        },
                      }}
                      className="text-3xl md:text-4xl"
                    >
                      🛰️
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 四角科技感 corner brackets */}
            <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-frost/60" />
            <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-frost/60" />
            <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-frost/60" />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-frost/60" />
          </div>

          {/* 状态文字 */}
          <div className="mt-6 flex h-5 items-center font-mono text-[11px] tracking-widest text-frost/70">
            {phase === 'idle' && (
              <>
                <span className="mr-2 text-frost/40">●</span>
                {T.statusIdle}
              </>
            )}
            {phase === 'scanning' && (
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
            )}
            {phase === 'result' && (
              <>
                <span className="mr-2 text-frost">●</span>
                {T.statusResult}
              </>
            )}
          </div>

          {/* 上下文面板：扫描时是日志，结果时是 verdict，idle 时为空 */}
          <AnimatePresence mode="wait">
            {phase === 'scanning' && (
              <motion.div
                key="log"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md self-stretch overflow-hidden"
              >
                <div className="mt-4 rounded-lg border border-frost/20 bg-black/50 backdrop-blur">
                  <div className="flex items-center justify-between border-b border-frost/10 px-3 py-1.5">
                    <span className="font-mono text-[9px] tracking-widest text-frost/50">{T.logHeader}</span>
                    <span className="font-mono text-[9px] tracking-widest text-plasma/70">REC●</span>
                  </div>
                  <div className="h-[104px] overflow-hidden px-3 py-2">
                    <AnimatePresence initial={false}>
                      {logs.map((line, i) => (
                        <motion.div
                          key={`${logs.length}-${i}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-mono text-[10px] leading-relaxed text-frost/70"
                        >
                          <span className="text-frost/40">{'>'} </span>
                          {line}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
            {phase === 'result' && verdict && (
              <motion.div
                key="verdict"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-5 max-w-md px-2 text-center"
              >
                <div className="font-mono text-[10px] tracking-[0.25em] text-frost/50">
                  {T.scoreLabel} · {nameA} × {nameB}
                </div>
                <div className="mt-2 font-display text-base leading-relaxed text-zinc-100 md:text-lg">
                  {verdict}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 名字输入（扫描/结果时锁定） */}
          <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              disabled={phase !== 'idle'}
              placeholder={T.inputA}
              maxLength={20}
              className="flex-1 rounded-lg border border-frost/25 bg-black/40 px-4 py-3 text-center font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-frost/70 focus:bg-black/60 focus:shadow-[0_0_0_3px_rgba(122,252,255,0.1)] disabled:opacity-60"
            />
            <div className="flex items-center justify-center font-mono text-lg text-frost/70">
              <motion.span
                animate={{ opacity: phase === 'scanning' ? [0.4, 1, 0.4] : 1 }}
                transition={{ duration: 0.6, repeat: phase === 'scanning' ? Infinity : 0 }}
              >
                ⌁
              </motion.span>
            </div>
            <input
              type="text"
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              disabled={phase !== 'idle'}
              placeholder={T.inputB}
              maxLength={20}
              className="flex-1 rounded-lg border border-frost/25 bg-black/40 px-4 py-3 text-center font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-frost/70 focus:bg-black/60 focus:shadow-[0_0_0_3px_rgba(122,252,255,0.1)] disabled:opacity-60"
            />
          </div>

          {/* 主按钮 */}
          <motion.button
            onClick={phase === 'result' ? reset : startMatch}
            disabled={btnDisabled}
            whileHover={{ scale: btnDisabled ? 1 : 1.04 }}
            whileTap={{ scale: btnDisabled ? 1 : 0.96 }}
            className={`mt-6 rounded-full px-10 py-3.5 font-display text-base font-bold tracking-wide transition ${
              btnDisabled
                ? 'cursor-not-allowed bg-white/10 text-zinc-500'
                : 'bg-frost text-void shadow-[0_0_30px_rgba(122,252,255,0.4)] hover:shadow-[0_0_50px_rgba(122,252,255,0.6)]'
            }`}
          >
            {phase === 'scanning'
              ? `${T.scanning}…`
              : phase === 'result'
              ? `↻ ${T.rescan}`
              : T.start}
          </motion.button>

          {/* 补刀小字 */}
          <div className="mt-12 max-w-md px-6 text-center font-mono text-[10px] leading-relaxed text-zinc-500">
            {T.footnote}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
