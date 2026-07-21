// 📡 宇宙愿望投递站 —— 把你的破愿望发射进太空，宇宙表示：已读，不回。
// 内核：航天发射级严肃传输仪式，结果却是一张极其敷衍的回执单。价值为 0，仪式感拉满。
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

// ============ 文案池（组件内 LOCAL，避免编辑共享 i18n） ============
const T = {
  zh: {
    title: '宇宙愿望投递站',
    subtitle: '深空专线 · 全天候无人值守',
    bureau: '宇宙总局 · 受理一处',
    inputLabel: '写下你想投递给宇宙的愿望',
    placeholder: '例如：让我明天不用上班…',
    send: '投递至宇宙',
    reset: '再投一个',
    status: {
      idle: '系统待机 · 等待订单',
      queuing: '正在接入星际网络…',
      transmitting: '正在向深空传输',
      delivered: '宇宙已接收',
    },
    metrics: { energy: '能量槽', speed: '传输速率', route: '路由', signal: '信号' },
    receipt: {
      title: '宇宙接收回执单',
      stamp: '宇宙签收',
      no: '回执编号',
      time: '受理时间',
      coord: '宇宙坐标',
      result: '处理结果',
      priority: '优先级',
      channel: '投递信道',
    },
    foot: 'AUTHORIZED · 本回执不构成任何承诺',
    replies: [
      '宇宙已签收，处理优先级：最低级。',
      '愿望过于离谱，已被原路退回。',
      '前方排队 73 亿个愿望，请耐心等待。',
      '宇宙受理中，预计回复时间：永远。',
      '该愿望违反宇宙基本法，已驳回。',
      '宇宙表示：？？？',
      '已转交平行宇宙处理，本宇宙概不负责。',
      '愿望已送达黑洞，无法读取。',
      '宇宙客服当前不在服务区（其实是去摸鱼了）。',
      '你的愿望已被外星人截获，他们笑得很大声。',
    ],
    priorities: ['最低级', '极低', '低', '随便', '佛系', '看心情', '下辈子'],
    channels: ['γ-7 / 仙女座专线', 'β-12 / 银河系支线', 'δ-3 / 室女座支线', 'α-1 / 本星系群主线'],
    hintEmpty: '请先写下愿望（宇宙不接受空白订单）',
    tip: '* 本回执仅在本网页具有仪式效力，宇宙并未真正参与。',
  },
  en: {
    title: 'Cosmic Wish Delivery',
    subtitle: 'Deep-Space Express · Unmanned, Always',
    bureau: 'UNIVERSE BUREAU · DESK 01',
    inputLabel: 'Write the wish you want to deliver to the universe',
    placeholder: 'e.g. let me never work again…',
    send: 'Deliver to Cosmos',
    reset: 'Send Another',
    status: {
      idle: 'System standby · awaiting order',
      queuing: 'Connecting to interstellar network…',
      transmitting: 'Transmitting to deep space',
      delivered: 'Universe received',
    },
    metrics: { energy: 'ENERGY', speed: 'TRANSFER', route: 'ROUTE', signal: 'SIGNAL' },
    receipt: {
      title: 'Cosmic Reception Receipt',
      stamp: 'COSMIC SEAL',
      no: 'Receipt No.',
      time: 'Accepted at',
      coord: 'Cosmic Coord.',
      result: 'Processing Result',
      priority: 'Priority',
      channel: 'Channel',
    },
    foot: 'AUTHORIZED · NOT A PROMISE OF ANYTHING',
    replies: [
      'Received by the universe. Priority: lowest possible.',
      'Wish deemed too absurd. Returned to sender.',
      '7.3 billion wishes are ahead of yours. Please hold.',
      'Under review. ETA: forever.',
      'Wish violates universal law. Rejected.',
      'The universe says: ???',
      'Forwarded to a parallel universe. This one is not liable.',
      'Wish delivered to a black hole. Unreadable.',
      'Cosmic customer service is out of range (probably slacking off).',
      'Wish intercepted by aliens. They are laughing very loudly.',
    ],
    priorities: ['lowest', 'minimal', 'low', 'meh', 'zen', 'whenever', 'next life'],
    channels: ['γ-7 / Andromeda Express', 'β-12 / Milky Way Branch', 'δ-3 / Virgo Line', 'α-1 / Local Group Main'],
    hintEmpty: 'Write a wish first (the universe rejects empty orders)',
    tip: '* This receipt has ceremonial validity only on this webpage. The universe was not actually involved.',
  },
}

// ============ 预生成稳定数据（避免每帧重新随机） ============
const STARS = Array.from({ length: 80 }).map(() => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 1.6 + 0.4,
  dur: 1.8 + Math.random() * 3.2,
  delay: Math.random() * 4,
  drift: (Math.random() - 0.5) * 30,
}))

const PARTICLES = Array.from({ length: 28 }).map((_, i) => ({
  id: i,
  dx: (Math.random() - 0.5) * 220,
  dy: -(160 + Math.random() * 260),
  dur: 1 + Math.random() * 1.4,
  delay: Math.random() * 0.5,
  size: Math.random() * 1.8 + 0.8,
}))

const BAR_WIDTHS = Array.from({ length: 38 }).map(() => (Math.random() > 0.75 ? 2 : 1))

// 生成一份敷衍回执
function genReceipt(lang) {
  const t = T[lang]
  const pad = (n) => String(n).padStart(2, '0')
  const now = new Date()
  const time = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const id = 'CB-WISH-' + now.getFullYear() + '-' + pad(Math.floor(Math.random() * 1000000))
  const ra = `${pad(Math.floor(Math.random() * 24))}h ${pad(Math.floor(Math.random() * 60))}m ${pad(Math.floor(Math.random() * 60))}s`
  const dec = `${Math.random() > 0.5 ? '+' : '-'}${pad(Math.floor(Math.random() * 90))}° ${pad(Math.floor(Math.random() * 60))}' ${pad(Math.floor(Math.random() * 60))}"`
  return {
    id,
    time,
    ra,
    dec,
    reply: t.replies[Math.floor(Math.random() * t.replies.length)],
    priority: t.priorities[Math.floor(Math.random() * t.priorities.length)],
    channel: t.channels[Math.floor(Math.random() * t.channels.length)],
  }
}

export default function WishDelivery({ onClose }) {
  const { lang } = useI18n()
  const txt = T[lang]
  const speedUnit = lang === 'zh' ? 'GB/光年' : 'GB/ly'

  // idle -> queuing -> transmitting -> done
  const [phase, setPhase] = useState('idle')
  const [wish, setWish] = useState('')
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [receipt, setReceipt] = useState(null)

  const busy = phase === 'queuing' || phase === 'transmitting'
  const canSend = wish.trim().length > 0 && !busy

  // 排队 900ms -> 进入传输
  useEffect(() => {
    if (phase !== 'queuing') return
    const id = setTimeout(() => setPhase('transmitting'), 900)
    return () => clearTimeout(id)
  }, [phase])

  // 传输推进约 5s
  useEffect(() => {
    if (phase !== 'transmitting') return
    const start = Date.now()
    const DURATION = 5000
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / DURATION) * 100)
      setProgress(pct)
      setSpeed(4 + Math.random() * 11) // 4.x ~ 15.x
      if (pct >= 100) {
        clearInterval(id)
        setReceipt(genReceipt(lang))
        setPhase('done')
      }
    }, 90)
    return () => clearInterval(id)
  }, [phase, lang])

  const send = () => {
    if (!canSend) return
    setProgress(0)
    setSpeed(0)
    setReceipt(null)
    setPhase('queuing')
  }

  const reset = () => {
    setPhase('idle')
    setWish('')
    setProgress(0)
    setSpeed(0)
    setReceipt(null)
  }

  const statusText =
    phase === 'queuing' ? txt.status.queuing : phase === 'transmitting' ? txt.status.transmitting : txt.status.idle

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-void pt-16 md:pt-20"
      style={{ background: 'radial-gradient(ellipse at 50% 25%, rgba(255,200,87,0.05), transparent 60%), #0a0a0f' }}
    >
      <style>{`
        @keyframes wish-scan { 0% { transform: translateY(-10vh); } 100% { transform: translateY(110vh); } }
      `}</style>

      {/* === 深空星空背景 === */}
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-aura/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-plasma/[0.08] blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        {STARS.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.15, 0.9, 0.15], x: [0, s.drift, 0] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
        {busy && (
          <div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-aura/60 to-transparent"
            style={{ animation: 'wish-scan 2.4s linear infinite' }}
          />
        )}
      </div>

      {/* === 主内容 === */}
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center px-5 pb-10 md:min-h-[calc(100vh-5rem)]">
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="font-mono text-[10px] tracking-[0.3em] text-aura/60">COSMIC_MAIL // DEEP SPACE DELIVERY</div>
          <h1
            className="mt-2 font-display text-2xl font-bold text-aura md:text-3xl"
            style={{ textShadow: '0 0 24px rgba(255,200,87,0.35)' }}
          >
            {txt.title}
          </h1>
          <div className="mt-1.5 font-mono text-[10px] tracking-widest text-zinc-500">{txt.subtitle}</div>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === 'done' && receipt ? (
            <ReceiptView key="receipt" receipt={receipt} txt={txt} lang={lang} onReset={reset} barWidths={BAR_WIDTHS} />
          ) : (
            <motion.div
              key="chamber"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex w-full flex-col items-center"
            >
              <DeliveryPod busy={busy} phase={phase} particles={PARTICLES} />

              <Dashboard txt={txt} speedUnit={speedUnit} progress={progress} speed={speed} busy={busy} />

              <AnimatePresence mode="wait">
                {busy ? (
                  <motion.div
                    key="status"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-5 flex items-center gap-2 font-mono text-[11px] tracking-widest text-aura"
                  >
                    <motion.span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-aura"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    {statusText}
                  </motion.div>
                ) : (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-6 w-full max-w-md"
                  >
                    <label className="block font-mono text-[10px] tracking-widest text-zinc-500">{txt.inputLabel}</label>
                    <textarea
                      value={wish}
                      onChange={(e) => setWish(e.target.value)}
                      placeholder={txt.placeholder}
                      rows={3}
                      className="mt-2 w-full resize-none rounded-xl border border-aura/20 bg-white/[0.03] p-3 font-display text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-aura/50 focus:outline-none focus:ring-1 focus:ring-aura/30"
                    />
                    <motion.button
                      onClick={send}
                      disabled={!canSend}
                      whileHover={canSend ? { scale: 1.02 } : {}}
                      whileTap={canSend ? { scale: 0.98 } : {}}
                      className={`mt-3 w-full rounded-xl py-3 font-display text-sm font-bold tracking-wide transition ${
                        canSend
                          ? 'bg-aura text-void shadow-[0_0_24px_rgba(255,200,87,0.4)]'
                          : 'cursor-not-allowed bg-white/8 text-zinc-600'
                      }`}
                    >
                      {txt.send} 📡
                    </motion.button>
                    {!canSend && wish.trim().length === 0 && (
                      <div className="mt-2 text-center font-mono text-[10px] tracking-wider text-zinc-600">
                        {txt.hintEmpty}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 补刀小字（永远在底部） */}
        <div className="mt-auto pt-8 text-center font-mono text-[10px] leading-relaxed tracking-wider text-zinc-600">
          {txt.tip}
        </div>
      </div>
    </motion.div>
  )
}

// ============ 星际投递舱（核心视觉锚点） ============
function DeliveryPod({ busy, phase, particles }) {
  return (
    <div className="relative h-52 w-32 md:h-60 md:w-36">
      {/* 呼吸光晕 */}
      <motion.div
        className="absolute -inset-8 rounded-full bg-aura/15 blur-3xl"
        animate={{ opacity: [0.4, 0.85, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 天线 + 信号灯 */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
        <div className="mx-auto h-5 w-px bg-gradient-to-t from-aura/60 to-transparent" />
        <motion.div
          className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-plasma"
          style={{ boxShadow: '0 0 10px #ff2d75' }}
          animate={{ opacity: [1, 0.2, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      </div>

      {/* 舱体外壳 */}
      <div className="absolute inset-0 overflow-hidden rounded-[50%] border border-aura/40 bg-gradient-to-b from-aura/15 via-[#15110a] to-aura/5 shadow-[0_0_40px_rgba(255,200,87,0.18)]">
        {/* 顶部尖锥 */}
        <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-aura/80" />

        {/* 观察窗 */}
        <motion.div
          className="absolute left-1/2 top-6 h-11 w-11 -translate-x-1/2 overflow-hidden rounded-full border border-aura/50 bg-aura/10"
          animate={busy ? { borderColor: ['rgba(255,200,87,0.4)', 'rgba(255,200,87,1)', 'rgba(255,200,87,0.4)'] } : {}}
          transition={{ duration: 1, repeat: busy ? Infinity : 0 }}
        >
          <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-frost/60" />
          <div className="absolute left-4 top-5 h-1 w-1 rounded-full bg-frost/40" />
        </motion.div>

        {/* 仪表分隔线 */}
        <div className="absolute left-3 right-3 top-[5.5rem] flex flex-col gap-1">
          <div className="h-px bg-aura/20" />
          <div className="h-px bg-aura/15" />
        </div>

        {/* LED 灯条 */}
        <div className="absolute inset-x-3 top-[7rem] flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-1 w-1 rounded-full bg-aura"
              animate={busy ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.3 }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>

        {/* 标识 */}
        <div className="absolute inset-x-0 bottom-4 text-center font-mono text-[8px] tracking-[0.25em] text-aura/60">
          CB-WISH · POD-07
        </div>
      </div>

      {/* 推进器火焰（传输中显现） */}
      <AnimatePresence>
        {busy && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="absolute -bottom-14 left-1/2 -translate-x-1/2 origin-top"
          >
            <motion.div
              className="h-0 w-0 border-x-[9px] border-t-[26px] border-x-transparent border-t-aura/70"
              animate={{ scaleY: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.25, repeat: Infinity }}
              style={{ filter: 'blur(0.5px)' }}
            />
            <div className="mx-auto -mt-1 h-8 w-0.5 bg-gradient-to-b from-aura/60 to-transparent blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 传输粒子（从舱体顶部向深空喷射） */}
      <AnimatePresence>
        {phase === 'transmitting' && (
          <div className="pointer-events-none absolute left-1/2 top-2">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-aura"
                style={{ width: p.size, height: p.size, boxShadow: '0 0 4px #ffc857' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: p.dx, y: p.dy, opacity: [1, 1, 0], scale: [1, 1, 0.3] }}
                transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============ 仪表盘（能量槽 + 速率 + 路由 + 信号） ============
function Dashboard({ txt, speedUnit, progress, speed, busy }) {
  const signalLevel = Math.floor((progress / 100) * 5)
  return (
    <div className="mt-6 w-full max-w-md">
      {/* 能量槽 */}
      <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-zinc-500">
        <span>{txt.metrics.energy}</span>
        <span className="text-aura">{progress.toFixed(1)}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full border border-aura/20 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-aura/70 to-aura"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
          style={{ boxShadow: busy ? '0 0 8px rgba(255,200,87,0.6)' : 'none' }}
        />
      </div>

      {/* 仪表三宫格 */}
      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px]">
        <div className="rounded border border-white/10 bg-white/[0.02] p-2">
          <div className="text-zinc-600">{txt.metrics.speed}</div>
          <div className="mt-1 text-aura">
            {busy ? speed.toFixed(1) : '——'}
            {busy && <span className="ml-1 text-[8px] text-zinc-500">{speedUnit}</span>}
          </div>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.02] p-2">
          <div className="text-zinc-600">{txt.metrics.route}</div>
          <div className="mt-1 text-zinc-300">γ-Δ-7 / M31</div>
        </div>
        <div className="rounded border border-white/10 bg-white/[0.02] p-2">
          <div className="text-zinc-600">{txt.metrics.signal}</div>
          <div className="mt-1 flex items-end gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 rounded-sm ${busy && i <= signalLevel ? 'bg-aura' : 'bg-white/15'}`}
                style={{ height: 4 + i * 2 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 宇宙接收回执单（极其正式，极其敷衍） ============
function ReceiptView({ receipt, txt, lang, onReset, barWidths }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative mt-8 w-full max-w-md"
    >
      {/* 背后光晕 */}
      <div className="absolute -inset-3 rounded-3xl bg-aura/10 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border-2 border-aura/40 bg-[#0e0c08]/95 p-5 md:p-6">
        {/* 四角装饰 */}
        <div className="absolute left-0 top-0 h-10 w-10 border-b-2 border-r-2 border-aura/40" />
        <div className="absolute right-0 top-0 h-10 w-10 border-b-2 border-l-2 border-aura/40" />
        <div className="absolute bottom-0 left-0 h-10 w-10 border-t-2 border-r-2 border-aura/40" />
        <div className="absolute bottom-0 right-0 h-10 w-10 border-t-2 border-l-2 border-aura/40" />

        {/* 巨型水印 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rotate-[-12deg] font-display text-6xl font-black tracking-widest text-aura/[0.04] md:text-7xl">
            COSMIC
          </div>
        </div>

        {/* 标题区 */}
        <div className="relative text-center">
          <div className="font-mono text-[9px] tracking-[0.3em] text-aura/60">{txt.bureau}</div>
          <div
            className="mt-1 font-display text-lg font-bold text-aura md:text-xl"
            style={{ textShadow: '0 0 16px rgba(255,200,87,0.4)' }}
          >
            {txt.receipt.title}
          </div>
          <div className="mx-auto mt-2 h-px w-2/3 bg-gradient-to-r from-transparent via-aura/50 to-transparent" />
        </div>

        {/* 回执编号 */}
        <div className="relative mt-4 text-center">
          <div className="font-mono text-[9px] tracking-widest text-zinc-500">{txt.receipt.no}</div>
          <div className="mt-1 font-mono text-sm tracking-wider text-aura">{receipt.id}</div>
        </div>

        {/* 元信息表 */}
        <div className="relative mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 border-y border-aura/15 py-3 font-mono text-[10px]">
          <div>
            <div className="text-zinc-600">{txt.receipt.time}</div>
            <div className="mt-0.5 text-zinc-300">{receipt.time}</div>
          </div>
          <div className="text-right">
            <div className="text-zinc-600">{txt.receipt.priority}</div>
            <div className="mt-0.5 text-aura">{receipt.priority}</div>
          </div>
          <div className="col-span-2">
            <div className="text-zinc-600">{txt.receipt.coord}</div>
            <div className="mt-0.5 text-zinc-300">
              RA {receipt.ra} · DEC {receipt.dec}
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-zinc-600">{txt.receipt.channel}</div>
            <div className="mt-0.5 text-zinc-300">{receipt.channel}</div>
          </div>
        </div>

        {/* 处理结果（核心笑点） */}
        <div className="relative mt-3 rounded-lg border border-aura/25 bg-aura/[0.04] p-3">
          <div className="font-mono text-[9px] tracking-widest text-aura/70">▶ {txt.receipt.result}</div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-1.5 font-display text-[15px] font-bold leading-snug text-zinc-100"
          >
            {receipt.reply}
          </motion.div>
        </div>

        {/* 条码装饰 */}
        <div className="relative mt-3 flex h-5 items-end gap-px">
          {barWidths.map((w, i) => (
            <div key={i} className="bg-aura/40" style={{ width: w, height: '100%' }} />
          ))}
        </div>

        {/* 签收章（旋转盖在右上） */}
        <motion.div
          initial={{ scale: 0, rotate: -40, opacity: 0 }}
          animate={{ scale: 1, rotate: -14, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 12 }}
          className="absolute right-1 top-12 flex h-14 w-14 items-center justify-center rounded-full border-2 border-plasma/60 bg-plasma/[0.06] md:right-3 md:top-14 md:h-16 md:w-16"
          style={{ boxShadow: 'inset 0 0 10px rgba(255,45,117,0.25)' }}
        >
          <div className="text-center font-mono text-[7px] leading-tight text-plasma">
            <div className="text-[10px]">★</div>
            <div className="mt-0.5 font-bold">{txt.receipt.stamp}</div>
            <div className="mt-0.5 text-[6px] opacity-70">UNIVERSE</div>
          </div>
        </motion.div>

        {/* 底部条款 */}
        <div className="relative mt-3 text-center font-mono text-[8px] leading-relaxed tracking-widest text-zinc-600">
          {txt.foot}
        </div>
      </div>

      {/* 再投一个 */}
      <motion.button
        onClick={onReset}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-5 w-full rounded-xl border border-aura/40 bg-aura/10 py-3 font-display text-sm font-bold tracking-wide text-aura transition hover:bg-aura/20"
      >
        ↻ {txt.reset}
      </motion.button>
    </motion.div>
  )
}
