// 🧠 赛博人格扫描分析仪 —— MRI 仪式感拉满，扫出一份极其专业的废话报告
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

// 待机/扫描时跳动的 5 条生理波形（顺序固定，左右分栏用）
const M_KEYS = ['anxiety', 'slacker', 'rage', 'hairline', 'emo']

// 评级 → 视觉色 / 填充条 / 百分比映射（S 最骚，D 最拉）
const GRADE_COLOR = { S: 'text-aura', A: 'text-acid', B: 'text-frost', C: 'text-zinc-300', D: 'text-plasma' }
const GRADE_BAR = { S: 'bg-aura', A: 'bg-acid', B: 'bg-frost', C: 'bg-zinc-400', D: 'bg-plasma' }
const GRADE_VAL = { S: 96, A: 83, B: 66, C: 46, D: 22 }

// 报告池：每套含 人格类型 + 5 项评级 + 一句精准废话点评（中英同步梗）
const REPORTS = [
  {
    zh: { type: '线上暴躁型社恐', comment: '现实唯唯诺诺，网上重拳出击；摸鱼天赋 S 级，干活积极性 D 级。' },
    en: { type: 'Online-Brawler Social Phobe', comment: 'Meek IRL, a keyboard warrior online. Slacking: S-tier. Work ethic: D-tier.' },
    grades: { anxiety: 'S', slacker: 'S', rage: 'S', hairline: 'B', emo: 'C' },
  },
  {
    zh: { type: '薛定谔的社牛', comment: '熟人是话痨，生人是哑巴，开不开口取决于对方是否先打招呼。' },
    en: { type: "Schrödinger's Extrovert", comment: 'Chatterbox with friends, mute with strangers — opens up only if they say hi first.' },
    grades: { anxiety: 'A', slacker: 'B', rage: 'C', hairline: 'B', emo: 'B' },
  },
  {
    zh: { type: '持续性摆烂型人格', comment: '干劲余额常年不足，充电两小时，通话五秒钟。' },
    en: { type: 'Chronic Slouch Personality', comment: 'Motivation balance permanently low. Charges two hours, runs for five seconds.' },
    grades: { anxiety: 'B', slacker: 'S', rage: 'C', hairline: 'C', emo: 'A' },
  },
  {
    zh: { type: '深夜 emo 综合征', comment: '白天哈哈哈，深夜想宇宙，建议早睡（你也不会听的）。' },
    en: { type: 'Late-Night Emo Syndrome', comment: 'LOL by day, pondering the cosmos by night. Prescription: sleep earlier (you won\'t).' },
    grades: { anxiety: 'B', slacker: 'A', rage: 'C', hairline: 'C', emo: 'S' },
  },
  {
    zh: { type: '社交能量守恒型', comment: '参加一次聚会需要独处三天回血，能量既不凭空产生也不无故消失。' },
    en: { type: 'Social-Energy Conservationist', comment: 'One party costs three days of alone-time to recharge. Energy is conserved.' },
    grades: { anxiety: 'A', slacker: 'B', rage: 'C', hairline: 'B', emo: 'B' },
  },
  {
    zh: { type: '选择困难晚期', comment: '点外卖能纠结半小时，做人生决定却只要三秒，且经常后悔。' },
    en: { type: 'Terminal Indecisiveness', comment: 'Spends 30 mins picking takeout, 3 seconds on life choices — and regrets both.' },
    grades: { anxiety: 'B', slacker: 'A', rage: 'A', hairline: 'C', emo: 'B' },
  },
  {
    zh: { type: '薛定谔的努力家', comment: '看起来很忙，实际上很盲，效率全靠咖啡因和 deadline 撑着。' },
    en: { type: "Schrödinger's Hustler", comment: 'Looks busy, actually blind. Productivity sustained purely by caffeine and deadlines.' },
    grades: { anxiety: 'C', slacker: 'B', rage: 'B', hairline: 'A', emo: 'A' },
  },
  {
    zh: { type: '佛系躺平尊者', comment: '凡事随缘，遇事呵呵，人生信条是「都行、可以、没关系」。' },
    en: { type: 'Zen Couch-Sage', comment: 'Goes with the flow, greets problems with "lol". Life motto: "whatever, sure, fine."' },
    grades: { anxiety: 'D', slacker: 'S', rage: 'D', hairline: 'S', emo: 'D' },
  },
]

// 漂浮粒子（氛围层，模块级常量避免重渲染重算）
const PARTICLES = Array.from({ length: 26 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 1 + Math.random() * 2,
  delay: Math.random() * 3,
  dur: 3 + Math.random() * 4,
}))

// 组件内文案字典（不碰共享 i18n，避免冲突）
const LOC = {
  zh: {
    mono: 'NEURAL//SCAN',
    panel: '人格神经诊断台',
    title: '赛博人格扫描仪',
    sub: 'CYBER PERSONA DIAGNOSTIC · MRI-GRADE BULLSHIT',
    idleHint: '请将大脑对准扫描框，保持静止，按下开始（眨眼不影响结果，但建议别眨）',
    start: '开始扫描',
    scanningBtn: '扫描中…',
    rescn: '重新扫描',
    scanningStatus: '扫描中请勿眨眼 · 正在读取神经突触',
    metrics: { anxiety: '社恐阈值', slacker: '摸鱼天赋', rage: '暴躁指数', hairline: '发际线危机', emo: '深夜emo值' },
    reportTitle: '专属人格报告',
    reportMono: 'DIAGNOSIS//REPORT',
    attrsMono: 'ATTRIBUTES · 属性评级',
    sampleNo: '样本编号',
    confidence: '置信度',
    date: '扫描日期',
    diagnosis: '诊断结论',
    signature: '赛博玄学馆 · 神经人格诊断中心',
    doctor: '主治算法 · NEURO-v4.2',
    stamp: 'CERTIFIED · 0 SCIENCE',
    footer: '* 本报告由赛博玄学算法生成，0 科学依据，请勿用于相亲 / 求职 / 自我认知。',
    scanLogs: ['校准皮层电极…', '读取多巴胺波形…', '分析摸鱼神经元…', '定位 emo 海马体…', '扫描发际线 retreat…', '生成废话结论…'],
    unit: '%',
  },
  en: {
    mono: 'NEURAL//SCAN',
    panel: 'PERSONA NEURAL DIAGNOSTIC',
    title: 'Cyber Persona Scanner',
    sub: 'CYBER PERSONA DIAGNOSTIC · MRI-GRADE BULLSHIT',
    idleHint: 'Aim your brain at the scan frame, hold still, press start (blinking won\'t affect results, but maybe don\'t)',
    start: 'Start Scan',
    scanningBtn: 'Scanning…',
    rescn: 'Rescan',
    scanningStatus: 'Scanning · do not blink · reading synapses',
    metrics: { anxiety: 'Social Anxiety', slacker: 'Slacking Talent', rage: 'Irritability', hairline: 'Hairline Crisis', emo: 'Late-night Emo' },
    reportTitle: 'Persona Report',
    reportMono: 'DIAGNOSIS//REPORT',
    attrsMono: 'ATTRIBUTES · graded',
    sampleNo: 'Sample No.',
    confidence: 'Confidence',
    date: 'Scan Date',
    diagnosis: 'Verdict',
    signature: 'Cyber Mystic Deck · Neural Persona Diagnostics',
    doctor: 'Attending Algo · NEURO-v4.2',
    stamp: 'CERTIFIED · 0 SCIENCE',
    footer: '* Generated by cyber-mystic algorithms. Zero scientific basis. Do not use for dating, hiring, or self-awareness.',
    scanLogs: ['Calibrating cortical electrodes…', 'Reading dopamine waveform…', 'Analyzing slacking neurons…', 'Locating emo hippocampus…', 'Scanning hairline retreat…', 'Composing BS verdict…'],
    unit: '%',
  },
}

const clamp = (v) => Math.max(2, Math.min(99, Math.round(v)))
const fmtDate = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

export default function PersonaScanner({ onClose }) {
  const { lang } = useI18n()
  const t = LOC[lang]

  // idle: 波形缓慢漂移 / scanning: 疯狂跳动 / done: 锁定到报告评级对应的值
  const [phase, setPhase] = useState('idle')
  const [metrics, setMetrics] = useState(() => Object.fromEntries(M_KEYS.map((k) => [k, 30 + Math.floor(Math.random() * 40)])))
  const [logIdx, setLogIdx] = useState(0)
  const [report, setReport] = useState(null)

  // 待机：每 1.5s 微调波形，营造心电监护待机感
  useEffect(() => {
    if (phase !== 'idle') return
    const id = setInterval(() => {
      setMetrics((prev) => {
        const next = {}
        for (const k of M_KEYS) next[k] = clamp(prev[k] + (Math.random() * 20 - 10))
        return next
      })
    }, 1500)
    return () => clearInterval(id)
  }, [phase])

  // 扫描：波形 90ms 狂跳 + 日志轮播 + 3s 后出报告
  useEffect(() => {
    if (phase !== 'scanning') return
    const mId = setInterval(() => {
      setMetrics(() => {
        const next = {}
        for (const k of M_KEYS) next[k] = Math.floor(Math.random() * 100)
        return next
      })
    }, 90)
    const lId = setInterval(() => setLogIdx((i) => (i + 1) % t.scanLogs.length), 480)
    const done = setTimeout(() => {
      const r = REPORTS[Math.floor(Math.random() * REPORTS.length)]
      const settle = {}
      for (const k of M_KEYS) settle[k] = clamp(GRADE_VAL[r.grades[k]] + Math.floor(Math.random() * 5 - 2))
      setMetrics(settle)
      setReport({
        ...r,
        sampleNo: `PSN-2026-${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
        confidence: (97 + Math.random() * 2.9).toFixed(1),
        date: fmtDate(new Date()),
      })
      setPhase('done')
    }, 3000)
    return () => {
      clearInterval(mId)
      clearInterval(lId)
      clearTimeout(done)
    }
  }, [phase, t.scanLogs.length])

  const startScan = () => {
    if (phase === 'scanning') return
    setReport(null)
    setLogIdx(0)
    setPhase('scanning')
  }

  // 单条波形数据条（待机/扫描/报告三态复用）
  const renderBar = (key) => {
    const v = metrics[key]
    return (
      <div key={key} className="w-full">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-wider">
          <span className="text-zinc-400">{t.metrics[key]}</span>
          <span className="text-frost">{v}{t.unit}</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-frost"
            style={{ boxShadow: '0 0 8px rgba(122,252,255,0.6)' }}
            animate={{ width: `${v}%` }}
            transition={{ duration: phase === 'scanning' ? 0.1 : 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    )
  }

  // 中央大脑扫描视窗（核心视觉锚点）
  const renderBrain = () => (
    <div className="relative h-[260px] w-[260px] sm:h-[320px] sm:w-[320px]">
      {/* 进度条：扫描时 3s 线性填满 */}
      <motion.div
        className="absolute left-0 top-0 z-20 h-[2px] bg-frost"
        style={{ boxShadow: '0 0 10px rgba(122,252,255,0.9)' }}
        initial={{ width: '0%' }}
        animate={{ width: phase === 'scanning' ? '100%' : '0%' }}
        transition={{ duration: phase === 'scanning' ? 3 : 0.3, ease: 'linear' }}
      />
      {/* 外环 / 虚线环：缓慢反向旋转 */}
      <div className="absolute inset-0 rounded-full border border-frost/15 animate-spin-slow" />
      <div className="absolute inset-5 rounded-full border border-dashed border-frost/25 animate-spin-rev" />
      {/* 中心辉光 */}
      <div className="absolute inset-8 rounded-full bg-frost/10 blur-2xl animate-pulse-glow" />
      {/* 四角取景框 */}
      <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-frost/70" />
      <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-frost/70" />
      <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-frost/70" />
      <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-frost/70" />
      {/* 大脑本体：扫描时轻微胀缩 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-[7rem] sm:text-[9rem]"
        animate={{ scale: phase === 'scanning' ? [1, 1.07, 1] : [1, 1.03, 1], filter: phase === 'scanning' ? ['brightness(1)', 'brightness(1.4)', 'brightness(1)'] : 'brightness(1)' }}
        transition={{ duration: phase === 'scanning' ? 0.45 : 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        🧠
      </motion.div>
      {/* 水平扫描亮线：上下来回扫 */}
      <motion.div
        className="absolute left-3 right-3 h-[2px] bg-frost"
        style={{ boxShadow: '0 0 14px 3px rgba(122,252,255,0.95)' }}
        animate={phase === 'scanning' ? { top: ['5%', '95%', '5%'] } : { top: '50%' }}
        transition={phase === 'scanning' ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      />
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-gradient-to-b from-[#061418] via-void to-void"
    >
      <style>{`
        @keyframes neural-flicker { 0%,100%{opacity:.5} 50%{opacity:1} }
        .nh-flicker { animation: neural-flicker 2.2s ease-in-out infinite; }
      `}</style>

      {/* 氛围层：网格 + 漂浮粒子 + 顶部辉光 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(122,252,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(122,252,255,0.4) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
        <div className="absolute left-1/2 top-0 h-72 w-[40rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-frost/10 blur-[110px]" />
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-frost"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
            animate={{ opacity: [0.15, 0.8, 0.15] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative mx-auto min-h-full max-w-5xl px-5 pb-24 pt-16 md:pt-20">
        {/* 头部 */}
        <div className="text-center">
          <div className="font-mono text-[11px] tracking-[0.4em] text-frost/70">{t.mono} · {t.panel}</div>
          <h1
            className="mt-2 font-display text-3xl font-bold text-frost sm:text-4xl"
            style={{ textShadow: '0 0 24px rgba(122,252,255,0.45)' }}
          >
            {t.title}
          </h1>
          <div className="mt-1 font-mono text-[10px] tracking-widest text-zinc-500">{t.sub}</div>
        </div>

        <AnimatePresence mode="wait">
          {phase !== 'done' ? (
            <motion.div
              key="scan-stage"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mt-10 flex flex-col items-center"
            >
              {/* 桌面：左右波形夹中央大脑；移动端：大脑在上，波形网格在下 */}
              <div className="hidden lg:grid lg:grid-cols-[13rem_auto_13rem] lg:items-center lg:gap-10">
                <div className="flex flex-col gap-6">{['anxiety', 'rage', 'emo'].map(renderBar)}</div>
                {renderBrain()}
                <div className="flex flex-col gap-6">{['slacker', 'hairline'].map(renderBar)}</div>
              </div>
              <div className="flex flex-col items-center gap-7 lg:hidden">
                {renderBrain()}
                <div className="grid w-full max-w-md grid-cols-2 gap-4">{M_KEYS.map(renderBar)}</div>
              </div>

              {/* 状态行 */}
              <div className="mt-8 min-h-[2.5rem] text-center">
                {phase === 'scanning' ? (
                  <motion.div key="scan-log" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="font-mono text-[11px] tracking-widest text-frost nh-flicker">{t.scanningStatus}</div>
                    <div className="mt-1 font-mono text-[10px] tracking-wider text-zinc-500">{t.scanLogs[logIdx]}</div>
                  </motion.div>
                ) : (
                  <div className="font-mono text-[11px] tracking-wider text-zinc-400">{t.idleHint}</div>
                )}
              </div>

              {/* 主按钮 */}
              <motion.button
                onClick={startScan}
                disabled={phase === 'scanning'}
                whileHover={{ scale: phase === 'scanning' ? 1 : 1.05 }}
                whileTap={{ scale: phase === 'scanning' ? 1 : 0.95 }}
                className={`mt-2 rounded-full px-12 py-4 font-display text-base font-bold tracking-wider transition ${
                  phase === 'scanning'
                    ? 'cursor-not-allowed bg-white/10 text-zinc-500'
                    : 'bg-frost text-void shadow-[0_0_30px_rgba(122,252,255,0.4)]'
                }`}
              >
                {phase === 'scanning' ? t.scanningBtn : t.start}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="report-stage"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mt-10"
            >
              {/* 报告单：看起来极其专业，内容全是梗 */}
              <div className="relative overflow-hidden rounded-2xl border border-frost/30 bg-[#0b1418]/85 p-6 backdrop-blur-sm sm:p-8">
                {/* 顶部高光条 */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-frost to-transparent" />
                <div className="flex items-start justify-between gap-4 border-b border-frost/15 pb-5">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.3em] text-frost/70">{t.reportMono}</div>
                    <div className="mt-2 font-display text-2xl font-bold leading-tight text-frost sm:text-3xl" style={{ textShadow: '0 0 20px rgba(122,252,255,0.35)' }}>
                      {report[lang].type}
                    </div>
                  </div>
                  <motion.div
                    initial={{ rotate: -12, scale: 0.8, opacity: 0 }}
                    animate={{ rotate: -6, scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="shrink-0 rounded border-2 border-frost/50 px-2.5 py-1 font-mono text-[9px] tracking-widest text-frost/80"
                  >
                    {t.stamp}
                  </motion.div>
                </div>

                {/* 元数据：样本编号 / 置信度 / 扫描日期 */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { label: t.sampleNo, value: report.sampleNo, cls: 'text-zinc-200' },
                    { label: t.confidence, value: `${report.confidence}%`, cls: 'text-acid' },
                    { label: t.date, value: report.date, cls: 'text-zinc-200' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                      <div className="font-mono text-[9px] tracking-wider text-zinc-500">{m.label}</div>
                      <div className={`mt-1 font-mono text-xs ${m.cls}`}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* 属性评级：5 项 S/A/B/C/D */}
                <div className="mt-6">
                  <div className="font-mono text-[10px] tracking-widest text-zinc-500">{t.attrsMono}</div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {M_KEYS.map((k) => {
                      const g = report.grades[k]
                      return (
                        <div key={k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                          <div className="font-mono text-[9px] tracking-wider text-zinc-500">{t.metrics[k]}</div>
                          <motion.div
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                            className={`mt-1 font-display text-3xl font-bold ${GRADE_COLOR[g]}`}
                            style={{ textShadow: '0 0 12px currentColor' }}
                          >
                            {g}
                          </motion.div>
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                            <div className={`h-full ${GRADE_BAR[g]}`} style={{ width: `${GRADE_VAL[g]}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 诊断结论（精准废话） */}
                <div className="mt-6">
                  <div className="font-mono text-[10px] tracking-widest text-zinc-500">{t.diagnosis}</div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-2 rounded-r-lg border-l-2 border-frost bg-frost/[0.06] p-3 font-display text-sm leading-relaxed text-zinc-100"
                  >
                    {report[lang].comment}
                  </motion.div>
                </div>

                {/* 落款 */}
                <div className="mt-6 flex items-end justify-between border-t border-white/[0.06] pt-4 font-mono text-[10px] text-zinc-500">
                  <div>
                    <div className="text-zinc-300">{t.signature}</div>
                    <div className="mt-0.5">{t.doctor}</div>
                  </div>
                  <div className="text-2xl leading-none">🧠</div>
                </div>
              </div>

              {/* 重新扫描 */}
              <div className="mt-6 text-center">
                <motion.button
                  onClick={startScan}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-frost px-12 py-4 font-display text-base font-bold tracking-wider text-void shadow-[0_0_30px_rgba(122,252,255,0.4)]"
                >
                  {t.rescn}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 补刀小字 */}
        <div className="mt-12 text-center font-mono text-[10px] leading-relaxed tracking-wider text-zinc-600">
          {t.footer}
        </div>
      </div>
    </motion.div>
  )
}
