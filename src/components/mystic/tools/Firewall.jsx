// 🛡️ 水逆退散防火墙 —— 企业级安全控制台 UI 包一个零作用玄学功能
// 拦截水逆信号 / 过滤倒霉磁场 / 隔离衰运数据包，仪式感拉满，仅本页面生效
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

// 六边形 clip-path（盾形：尖顶平底）
const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

// 组件内文案字典（不碰共享 i18n，避免冲突）
const LOCAL = {
  zh: {
    codename: 'RETRO_SHIELD //',
    title: '水逆退散防火墙',
    subtitle: 'MERCURY RETROGRADE FIREWALL · 企业级玄学安全控制台',
    bannerIdle: '防护未启动 · 水逆信号正在直连你的网卡',
    bannerActive: '水逆隔离屏障已构建 · 防护范围：仅本网页内有效',
    statusIdle: 'UNPROTECTED · 未防护',
    statusActive: 'PROTECTED · 防护中',
    countLabel: '已拦截水逆信号',
    countUnit: '个',
    start: '开启防护',
    stop: '关闭防护',
    logHeader: '// INTERCEPTION LOG · 实时拦截日志',
    logEmpty: '等待防护启动…',
    shutdownMsg: '防护已关闭 · 水逆正在重新连接',
    footnote: '* 本防火墙仅在本页面生效，一关网页立刻打回原形。典型的自欺欺人式玄学，精准戳中"水逆求安慰"心理。',
    // 威胁池（随机抽 + 编号递增）
    threats: [
      '水逆信号', '倒霉磁场', '衰运数据包', '周一综合症',
      '前任的念头', '水逆残波', '黑粉诅咒包', '水逆频段',
      '霉运负载', '感情劫持请求', 'EMO 载荷', '工作群未读',
      '运势雪崩', '坏心情数据报', '催婚信号', '社交恐惧波动',
      '加班诱惑', '脱发诅咒', '甲方恶意指令', '水逆回声',
    ],
    // 动作池 + 英文短代号（badge 用）
    actions: ['拦截', '过滤', '隔离', '阻断', '净化', '丢弃'],
    actionMono: { '拦截': 'BLOCK', '过滤': 'FILTER', '隔离': 'QUARANT', '阻断': 'DROP', '净化': 'PURGE', '丢弃': 'REJECT' },
    // 上下跑马灯文案
    marquee: [
      '拦截水逆信号', '屏蔽倒霉磁场', '过滤衰运数据包',
      '隔离周一综合症', '阻断前任的念头', '丢弃催婚请求', '净化 EMO 载荷',
    ],
    stats: [
      { label: 'CPU 占用', value: '13%' },
      { label: '防护规则', value: '8,192' },
      { label: '威胁库', value: 'v2.0.4' },
    ],
  },
  en: {
    codename: 'RETRO_SHIELD //',
    title: 'Mercury-Retrograde Firewall',
    subtitle: 'MERCURY RETROGRADE FIREWALL · enterprise-grade spiritual security',
    bannerIdle: 'Firewall offline · Mercury retrograde is handshaking your NIC',
    bannerActive: 'Mercury isolation barrier built · scope: this webpage only',
    statusIdle: 'UNPROTECTED · offline',
    statusActive: 'PROTECTED · live',
    countLabel: 'signals intercepted',
    countUnit: '',
    start: 'Enable Protection',
    stop: 'Disable Protection',
    logHeader: '// INTERCEPTION LOG · live feed',
    logEmpty: 'awaiting activation…',
    shutdownMsg: 'Protection disabled · Mercury is reconnecting',
    footnote: '* This firewall only works inside this tab. Close it and reality bites back. Classic self-delusion-grade mysticism.',
    threats: [
      'mercury signal', 'bad-luck field', 'misfortune packet', 'Monday syndrome',
      'thoughts of your ex', 'retrograde resonance', 'hater curse payload',
      'bad-mood datagram', 'romance hijack', 'emo payload', 'work-chat unread',
      'bad-hair-day curse', 'marriage-pressure ping', 'social-anxiety wave',
      'overtime lure', 'client malicious cmd', 'retrograde echo',
    ],
    actions: ['BLOCK', 'FILTER', 'QUARANTINE', 'DROP', 'PURGE', 'REJECT'],
    actionMono: {},
    marquee: [
      'BLOCKING mercury signals', 'FILTERING bad-luck fields',
      'QUARANTINE misfortune packets', 'ISOLATING Monday syndrome',
      'DROPPING ex thoughts', 'REJECTING marriage pressure', 'PURGING emo payloads',
    ],
    stats: [
      { label: 'CPU', value: '13%' },
      { label: 'RULES', value: '8,192' },
      { label: 'THREAT DB', value: 'v2.0.4' },
    ],
  },
}

export default function Firewall({ onClose }) {
  const { lang } = useI18n()
  const T = LOCAL[lang]
  const isZh = lang === 'zh'

  const [active, setActive] = useState(false)
  const [count, setCount] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)
  const [logs, setLogs] = useState([])
  const [shutdownFlash, setShutdownFlash] = useState('')

  const logIdRef = useRef(0)
  const seqRef = useRef(0)
  const timerRef = useRef(null)

  // 计数器数字递增动画：每次 count 变化时 tween displayCount 到目标值（三次方缓出）
  useEffect(() => {
    if (displayCount === count) return
    let raf = 0
    const start = displayCount
    const delta = count - start
    const dur = Math.min(550, 200 + Math.abs(delta) * 8)
    const t0 = performance.now()
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur)
      const eased = 1 - Math.pow(1 - k, 3)
      setDisplayCount(Math.round(start + delta * eased))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  // 拦截日志循环：active 时每 0.8-1.6s 推一条，最多保留 9 条
  useEffect(() => {
    if (!active) return
    const pushOne = () => {
      const action = T.actions[Math.floor(Math.random() * T.actions.length)]
      const threat = T.threats[Math.floor(Math.random() * T.threats.length)]
      seqRef.current += 1
      const id = ++logIdRef.current
      const ts = new Date()
      const time = `${String(ts.getHours()).padStart(2, '0')}:${String(ts.getMinutes()).padStart(2, '0')}:${String(ts.getSeconds()).padStart(2, '0')}`
      setLogs((prev) => [{ id, action, threat, seq: seqRef.current, time }, ...prev].slice(0, 9))
      setCount((c) => c + 1)
    }
    pushOne()
    const scheduleNext = () => {
      const delay = 800 + Math.random() * 800 // 0.8 - 1.6s 随机间隔
      timerRef.current = window.setTimeout(() => {
        pushOne()
        scheduleNext()
      }, delay)
    }
    scheduleNext()
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [active, lang])

  const toggle = () => {
    if (active) {
      setActive(false)
      if (timerRef.current) window.clearTimeout(timerRef.current)
      setShutdownFlash(T.shutdownMsg)
      window.setTimeout(() => setShutdownFlash(''), 2800)
    } else {
      setShutdownFlash('')
      setActive(true)
    }
  }

  // 跑马灯内容（每 span 内重复 3 次，两 span 并排，translateX(-50%) 无缝循环）
  const marqueeBase = T.marquee.join('  ◆  ') + '  ◆  '
  const marqueeContent = marqueeBase.repeat(3)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-void text-zinc-200"
    >
      <style>{`
        @keyframes fw-marquee-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fw-marquee-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .fw-marquee-l { animation: fw-marquee-l 24s linear infinite; }
        .fw-marquee-r { animation: fw-marquee-r 28s linear infinite; }
      `}</style>

      {/* 背景光晕（active 时呼吸更亮） */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-[36%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
          style={{ background: 'rgba(212,255,58,0.10)' }}
          animate={{ opacity: active ? [0.7, 1, 0.7] : [0.2, 0.35, 0.2] }}
          transition={{ duration: active ? 2.4 : 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-2xl flex-col items-center px-5 pb-16 pt-16 md:px-8 md:pt-20">
        {/* codename */}
        <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.3em] text-acid/80">
          <motion.span
            className="inline-block h-2 w-2 rounded-full bg-acid"
            animate={active ? { opacity: [1, 0.3, 1], scale: [1, 1.4, 1] } : { opacity: 0.4 }}
            transition={{ duration: 1.1, repeat: Infinity }}
            style={{ boxShadow: '0 0 8px rgba(212,255,58,0.8)' }}
          />
          <span>{T.codename}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">HEAL//ACID</span>
        </div>

        <h1 className="mt-3 text-center font-display text-3xl font-bold text-zinc-100 md:text-4xl">
          {T.title}
        </h1>
        <div className="mt-2 text-center font-mono text-[10px] tracking-[0.2em] text-acid/60 md:text-[11px]">
          {T.subtitle}
        </div>

        {/* 顶部状态 banner */}
        <div
          className={`mt-5 w-full rounded-lg border px-4 py-2.5 text-center font-mono text-[11px] tracking-wide backdrop-blur-sm transition-colors ${
            active
              ? 'border-acid/40 bg-acid/10 text-acid'
              : 'border-zinc-700/60 bg-black/40 text-zinc-400'
          }`}
        >
          <span className="mr-2 font-bold">{active ? '●' : '○'}</span>
          {active ? T.bannerActive : T.bannerIdle}
        </div>

        {/* 跑马灯（上，向左滚） */}
        <div className="mt-5 w-full overflow-hidden rounded-md border border-acid/15 bg-black/40 py-1.5">
          <div className="fw-marquee-l flex whitespace-nowrap font-mono text-[10px] tracking-[0.25em] text-acid/70">
            <span className="px-2">{marqueeContent}</span>
            <span className="px-2">{marqueeContent}</span>
          </div>
        </div>

        {/* ============ 中央：六边形防护盾（视觉锚点） ============ */}
        <div className="relative mt-6 aspect-square w-full max-w-[340px]">
          {/* corner brackets */}
          <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-acid/60" />
          <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-acid/60" />
          <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-acid/60" />
          <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-acid/60" />

          {/* 装饰环：外层虚线缓转 + 内层静态 */}
          <div className="pointer-events-none absolute inset-[8%] rounded-full border border-dashed border-acid/15 animate-spin-slow" />
          <div className="pointer-events-none absolute inset-[14%] rounded-full border border-acid/10" />

          {/* 六边形盾主体 */}
          <div className="absolute inset-[18%]">
            {/* 呼吸光晕（active 时酸绿脉冲扩散） */}
            <motion.div
              className="absolute inset-0"
              style={{
                clipPath: HEX,
                background: active
                  ? 'radial-gradient(circle, rgba(212,255,58,0.4) 0%, rgba(212,255,58,0.08) 55%, transparent 80%)'
                  : 'transparent',
                filter: 'blur(18px)',
              }}
              animate={active ? { opacity: [0.55, 1, 0.55], scale: [0.94, 1.05, 0.94] } : { opacity: 0.25 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* 盾面背景（active 时酸绿渐变 + 内外发光） */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: HEX,
                background: active
                  ? 'linear-gradient(160deg, rgba(212,255,58,0.18) 0%, rgba(20,40,8,0.85) 55%, rgba(8,12,4,0.95) 100%)'
                  : 'linear-gradient(160deg, rgba(40,42,30,0.5) 0%, rgba(15,16,12,0.9) 100%)',
                boxShadow: active
                  ? '0 0 50px rgba(212,255,58,0.35), inset 0 0 30px rgba(212,255,58,0.15)'
                  : 'inset 0 0 20px rgba(0,0,0,0.6)',
              }}
            />

            {/* 扫描扇区：active 时绕盾匀速旋转（径向亮扇区） */}
            {active && (
              <motion.div
                className="absolute inset-0"
                style={{ clipPath: HEX }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(212,255,58,0.06) 310deg, rgba(212,255,58,0.32) 350deg, rgba(212,255,58,0.6) 360deg)',
                  }}
                />
              </motion.div>
            )}

            {/* 六边形描边（SVG，active 时带 drop-shadow） */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <polygon
                points="50,2 96,26 96,74 50,98 4,74 4,26"
                fill="none"
                stroke={active ? '#d4ff3a' : '#3a3a2a'}
                strokeWidth={active ? 0.8 : 0.5}
                style={active ? { filter: 'drop-shadow(0 0 4px rgba(212,255,58,0.6))' } : {}}
              />
              <polygon
                points="50,10 89,30 89,70 50,90 11,70 11,30"
                fill="none"
                stroke={active ? 'rgba(212,255,58,0.3)' : 'rgba(80,80,60,0.3)'}
                strokeWidth="0.4"
              />
            </svg>

            {/* 中心：盾牌图标 + 状态文字 + 迷你扫描进度条 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-5xl md:text-6xl"
                animate={active ? { scale: [1, 1.08, 1] } : { scale: 1, opacity: 0.55 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                style={active ? { filter: 'drop-shadow(0 0 14px rgba(212,255,58,0.7))' } : {}}
              >
                🛡️
              </motion.div>
              <div className={`mt-2 font-mono text-[10px] tracking-[0.3em] ${active ? 'text-acid' : 'text-zinc-500'}`}>
                {active ? T.statusActive : T.statusIdle}
              </div>
              <div className="mt-2 h-[3px] w-20 overflow-hidden rounded-full bg-black/60">
                <motion.div
                  className="h-full bg-acid"
                  animate={active ? { x: ['-100%', '100%'] } : { x: '-100%' }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                  style={{ boxShadow: '0 0 6px rgba(212,255,58,0.8)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 跑马灯（下，反向滚） */}
        <div className="mt-6 w-full overflow-hidden rounded-md border border-acid/15 bg-black/40 py-1.5">
          <div className="fw-marquee-r flex whitespace-nowrap font-mono text-[10px] tracking-[0.25em] text-acid/70">
            <span className="px-2">{marqueeContent}</span>
            <span className="px-2">{marqueeContent}</span>
          </div>
        </div>

        {/* 已拦截计数器（数字递增动画） */}
        <div className="mt-7 flex flex-col items-center">
          <div className="font-mono text-[10px] tracking-[0.3em] text-acid/60">{T.countLabel.toUpperCase()}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <motion.span
              key={count}
              initial={{ scale: 1.18, color: '#f5ffb8' }}
              animate={{ scale: 1, color: '#d4ff3a' }}
              transition={{ duration: 0.28 }}
              className="font-display text-5xl font-bold tabular-nums md:text-6xl"
              style={{ textShadow: active ? '0 0 22px rgba(212,255,58,0.6)' : 'none' }}
            >
              {displayCount.toLocaleString()}
            </motion.span>
            {isZh && <span className="font-mono text-sm text-acid/70">{T.countUnit}</span>}
          </div>
        </div>

        {/* 拦截日志（实时滚动，新条目从顶部滑入并高亮淡出） */}
        <div className="mt-6 w-full rounded-lg border border-acid/20 bg-black/50 backdrop-blur">
          <div className="flex items-center justify-between border-b border-acid/10 px-3 py-1.5">
            <span className="font-mono text-[9px] tracking-widest text-acid/60">{T.logHeader}</span>
            <span className={`font-mono text-[9px] tracking-widest ${active ? 'text-plasma/70' : 'text-zinc-600'}`}>
              {active ? 'REC●' : 'IDLE●'}
            </span>
          </div>
          <div className="h-[180px] overflow-y-auto px-3 py-2 md:h-[200px]">
            {logs.length === 0 ? (
              <div className="flex h-full items-center justify-center font-mono text-[10px] tracking-widest text-zinc-600">
                {T.logEmpty}
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, y: -14, backgroundColor: 'rgba(212,255,58,0.18)' }}
                    animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(212,255,58,0)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    className="flex items-center gap-2 border-b border-acid/5 py-1.5 font-mono text-[11px] last:border-b-0"
                  >
                    <span className="text-zinc-600">{log.time}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${
                        active ? 'bg-acid/15 text-acid' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isZh ? T.actionMono[log.action] : log.action}
                    </span>
                    <span className="flex-1 truncate text-zinc-300">
                      {isZh ? `${log.action}：${log.threat}` : log.threat}
                    </span>
                    <span className="text-zinc-600">#{String(log.seq).padStart(4, '0')}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* 状态指标条（企业级控制台味儿） */}
        <div className="mt-4 grid w-full grid-cols-3 gap-2">
          {T.stats.map((s) => (
            <div key={s.label} className="rounded-md border border-zinc-700/50 bg-black/40 px-3 py-2 text-center">
              <div className="font-mono text-[9px] tracking-widest text-zinc-500">{s.label}</div>
              <div className={`mt-0.5 font-display text-sm font-bold ${active ? 'text-acid' : 'text-zinc-400'}`}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* 主按钮：未防护时酸绿启动 / 防护中变品红停止（危险色） */}
        <motion.button
          onClick={toggle}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={`mt-7 rounded-full px-10 py-3.5 font-display text-base font-bold tracking-wide transition ${
            active
              ? 'border border-plasma/50 bg-plasma/15 text-plasma hover:bg-plasma/25'
              : 'bg-acid text-void shadow-[0_0_30px_rgba(212,255,58,0.4)] hover:shadow-[0_0_50px_rgba(212,255,58,0.6)]'
          }`}
        >
          {active ? `■ ${T.stop}` : `▶ ${T.start}`}
        </motion.button>

        {/* 关闭防护后的自嘲 flash（plasma 品红警示） */}
        <AnimatePresence>
          {shutdownFlash && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 rounded-md border border-plasma/30 bg-plasma/10 px-4 py-2 font-mono text-[11px] tracking-wide text-plasma"
            >
              ⚠ {shutdownFlash}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 补刀小字（核心笑点） */}
        <div className="mt-10 max-w-md px-2 text-center font-mono text-[10px] leading-relaxed text-zinc-500">
          {T.footnote}
        </div>
      </div>
    </motion.div>
  )
}
