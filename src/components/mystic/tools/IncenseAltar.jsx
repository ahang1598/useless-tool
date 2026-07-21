// 🕯️ 电子香火祈福台 —— 赛博功德 +1（仅本网页生效，佛祖在线营业）
// 上香点焰 / 祈福爆光 / 求签摇命，主打一个仪式感拉满、价值为 0
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

// 求签权重：中签最多，极品最少（不然人人上上签，佛祖 KPI 失真）
const TIER_WEIGHTS = [
  ['top', 0.1],
  ['good', 0.22],
  ['mid', 0.36],
  ['bad', 0.22],
  ['worst', 0.1],
]
const TIER_COLOR = {
  top: '#ffc857',
  good: '#d4ff3a',
  mid: '#7afcff',
  bad: '#ff2d75',
  worst: '#ff2d75',
}
const pickTier = () => {
  const r = Math.random()
  let acc = 0
  for (const [k, w] of TIER_WEIGHTS) {
    acc += w
    if (r <= acc) return k
  }
  return 'mid'
}

// 三柱香的水平定位（与香枝渲染共用，确保烟雾从香顶冒出）
const STICK_LEFT = ['30%', '50%', '70%']

const T = {
  zh: {
    mono: 'E_INCENSE // ONLINE',
    karmaLabel: '赛博功德',
    karmaHint: '刷新清零，更赛博一点',
    censerLabel: '香炉 · CENSER v2.0',
    litHint: '香火鼎盛 · 持续燃烧中',
    unlitHint: '点击「上香」点燃电子香',
    light: '上香',
    pray: '祈福',
    draw: '求签',
    wishPlaceholder: '输入心愿（例：今晚不加班）',
    wishEmpty: '心不诚则不灵，先写点啥吧',
    floatText: (n) => `赛博功德 +${n}`,
    danmakuMe: (n) => `功德+${n}`,
    drawing: '通灵摇签中',
    prayDanmaku: (wish, n) => `「${wish}」· 功德+${n}`,
    ambient: [
      '功德+1', '功德+1 · 赛博阿弥陀佛', '功德+1 · 佛祖已读',
      '功德+1 · 善念正在 Render', '功德+1 · 此功德不可提现',
      '功德+1 · 仅本页可见', '功德+1 · 已上链（假的）',
      '功德+1 · 服务器舍利子 +1', '功德+1 · 香火带宽已拉满',
    ],
    tiers: {
      top: { label: '上上签', verdict: '大吉', items: [
        '你今天的代码一次就能跑通——前提是你今天不写代码。',
        '今晚的 Bug 自动修复，因为它们也下班了。',
        '甲方突然说“就这版吧”，尾款秒到账。',
      ] },
      good: { label: '上签', verdict: '吉', items: [
        '宜摸鱼，忌加班。财神路过你家门口，然后走了。',
        '你的前任正在后悔，但跟你没关系。',
        '今天点外卖多送一包番茄酱，运气爆棚。',
      ] },
      mid: { label: '中签', verdict: '平', items: [
        '不好不坏，跟你的工资一样稳定。',
        '今天的你跟昨天一样，明天大概率也是。',
        '宇宙没有针对你，它只是没空理你。',
      ] },
      bad: { label: '下签', verdict: '凶', items: [
        '今日不宜照镜子，尤其秤上的那种。',
        '你刚发的消息会被已读不回，建议自欺欺人。',
        '宜断网，忌打开工作群。',
      ] },
      worst: { label: '下下签', verdict: '大凶', items: [
        '建议今天重启人生，或至少重启路由器。',
        '你的代码、爱情、头发，今日至少失去其一。',
        '建议立即关掉本网页并回头是岸。（但你不会的）',
      ] },
    },
    note: '* 本功德仅本网页生效，现实世界不予认可。心诚则灵（互联网限定版）。',
  },
  en: {
    mono: 'E_INCENSE // ONLINE',
    karmaLabel: 'CYBER KARMA',
    karmaHint: 'refresh = reset, more cyber',
    censerLabel: 'CENSER v2.0',
    litHint: 'incense burning · ritual live',
    unlitHint: 'tap “Light” to ignite the e-sticks',
    light: 'Light',
    pray: 'Pray',
    draw: 'Draw',
    wishPlaceholder: 'type a wish (e.g. no overtime tonight)',
    wishEmpty: 'empty wish = empty karma, type something',
    floatText: (n) => `Cyber Karma +${n}`,
    danmakuMe: (n) => `karma +${n}`,
    drawing: 'shaking the sticks',
    prayDanmaku: (wish, n) => `“${wish}” · karma +${n}`,
    ambient: [
      'karma +1', 'karma +1 · cyber amitabha', 'karma +1 · buddha read it',
      'karma +1 · rendering your good thought', 'karma +1 · non-refundable',
      'karma +1 · in-page only', 'karma +1 · on-chain (fake)',
      'karma +1 · server relic +1', 'karma +1 · incense bandwidth maxed',
    ],
    tiers: {
      top: { label: 'BEST LOT', verdict: 'GREAT', items: [
        'Today your code runs on the first try — provided you don’t write any today.',
        'Tonight’s bugs will self-fix, because they clocked out too.',
        'The client suddenly says “this version’s fine.” Invoice paid instantly.',
      ] },
      good: { label: 'GOOD LOT', verdict: 'GOOD', items: [
        'Do slack off; avoid overtime. The god of wealth walked past your door, then kept walking.',
        'Your ex is regretting it. Has nothing to do with you, though.',
        'Your takeout today arrives with an extra ketchup packet. Peak luck.',
      ] },
      mid: { label: 'MEH LOT', verdict: 'MEH', items: [
        'Neither good nor bad. As stable as your salary.',
        'Today’s you is yesterday’s you. Tomorrow’s, most likely.',
        'The universe isn’t out to get you. It just has no time for you.',
      ] },
      bad: { label: 'BAD LOT', verdict: 'BAD', items: [
        'Do not look in a mirror today, especially the one above the scale.',
        'Your message will be left on read. Consider gaslighting yourself.',
        'Disconnect the internet. Avoid the work group chat.',
      ] },
      worst: { label: 'WORST LOT', verdict: 'DOOMED', items: [
        'Recommend rebooting your life today. Or at least the router.',
        'Your code, your love, your hair — today you lose at least one.',
        'Close this page at once and turn back. (You won’t, though.)',
      ] },
    },
    note: '* This karma is valid only on this webpage. The real world does not recognize it. Sincerity works (internet edition).',
  },
}

export default function IncenseAltar({ onClose }) {
  const { lang } = useI18n()
  const txt = T[lang]

  const [merit, setMerit] = useState(0)
  const [lit, setLit] = useState(false)
  const [lightPulse, setLightPulse] = useState(0)
  const [particles, setParticles] = useState([])
  const [danmaku, setDanmaku] = useState([])
  const [floats, setFloats] = useState([])
  const [burstKey, setBurstKey] = useState(0)
  const [wish, setWish] = useState('')
  const [wishShake, setWishShake] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [lot, setLot] = useState(null)

  const pidRef = useRef(0)
  const didRef = useRef(0)
  const fidRef = useRef(0)

  // === 工具函数 ===
  const addDanmaku = (text, delay = 0) => {
    const item = { id: ++didRef.current, text, dur: 13 + Math.random() * 6 }
    if (delay) {
      setTimeout(() => setDanmaku((p) => [...p.slice(-9), item]), delay)
    } else {
      setDanmaku((p) => [...p.slice(-9), item])
    }
  }
  const removeDanmaku = (id) => setDanmaku((p) => p.filter((d) => d.id !== id))

  const addFloat = (text) => {
    const id = ++fidRef.current
    setFloats((p) => [...p, { id, text }])
    setTimeout(() => setFloats((p) => p.filter((f) => f.id !== id)), 1700)
  }

  const removeParticle = (id) => setParticles((p) => p.filter((x) => x.id !== id))

  // === 香火点燃后持续吐烟雾（限流防爆帧）===
  useEffect(() => {
    if (!lit) return
    const iv = setInterval(() => {
      setParticles((prev) => {
        if (prev.length >= 34) return prev
        const stick = Math.floor(Math.random() * 3)
        return [
          ...prev,
          {
            id: ++pidRef.current,
            x: STICK_LEFT[stick],
            drift: (Math.random() - 0.5) * 70,
            rise: 170 + Math.random() * 130,
            size: 7 + Math.random() * 9,
            dur: 2.6 + Math.random() * 1.8,
          },
        ]
      })
    }, 210)
    return () => clearInterval(iv)
  }, [lit])

  // === 底部弹幕自动供养，永不冷场 ===
  useEffect(() => {
    // 预填几条错峰登场
    for (let i = 0; i < 3; i++) {
      addDanmaku(txt.ambient[i % txt.ambient.length], 500 + i * 1300)
    }
    const seed = setInterval(() => {
      addDanmaku(txt.ambient[Math.floor(Math.random() * txt.ambient.length)])
    }, 2600)
    return () => clearInterval(seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // === 三大法事 ===
  const lightIncense = () => {
    setLit(true)
    setLightPulse((n) => n + 1)
    setMerit((m) => m + 1)
    addDanmaku(txt.danmakuMe(1))
  }

  const pray = () => {
    const w = wish.trim()
    if (!w) {
      setWishShake(true)
      setTimeout(() => setWishShake(false), 500)
      return
    }
    const gain = Math.min(9, 2 + Math.floor(Math.random() * 8))
    setMerit((m) => m + gain)
    setBurstKey((k) => k + 1)
    addFloat(txt.floatText(gain))
    addDanmaku(txt.prayDanmaku(w, gain))
    setWish('')
  }

  const drawLot = () => {
    if (drawing) return
    setDrawing(true)
    setLot(null)
    setTimeout(() => {
      const tier = pickTier()
      const td = txt.tiers[tier]
      const item = td.items[Math.floor(Math.random() * td.items.length)]
      setLot({ tier, label: td.label, verdict: td.verdict, item })
      setDrawing(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-[radial-gradient(ellipse_at_50%_28%,#1a1408_0%,#0a0a0f_62%)] text-zinc-200"
    >
      {/* 背景：缓缓上浮的金色香灰尘埃 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-aura/60"
            style={{ left: `${Math.random() * 100}%`, bottom: `-${Math.random() * 20}px` }}
            animate={{ y: [0, -(300 + Math.random() * 400)], opacity: [0, 0.8, 0] }}
            transition={{ duration: 8 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 6, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="relative flex min-h-full flex-col items-center px-5 pb-28 pt-16 md:pt-20">
        {/* 顶部：赛博功德计数 */}
        <div className="flex flex-col items-center">
          <div className="font-mono text-[10px] tracking-[0.4em] text-aura/60">{txt.mono}</div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-[11px] tracking-widest text-zinc-500">{txt.karmaLabel}</span>
            <motion.span
              key={merit}
              initial={{ scale: 1.4, color: '#fff6cc' }}
              animate={{ scale: 1, color: '#ffc857' }}
              transition={{ duration: 0.4 }}
              className="font-display text-4xl font-bold tabular-nums md:text-5xl"
              style={{ textShadow: '0 0 18px rgba(255,200,87,0.5)' }}
            >
              {merit}
            </motion.span>
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-widest text-zinc-600">{txt.karmaHint}</div>
        </div>

        {/* 中央：电子香炉（视觉锚点） */}
        <div className="relative mt-10 flex items-end justify-center md:mt-12">
          {/* 外圈仪式环 + 内环 + 光晕（DOM 先于香炉，自然垫底） */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-aura/15 animate-spin-slow" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-aura/10" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aura/20 blur-3xl animate-aura-pulse" />

          <motion.div
            animate={drawing ? { x: [0, -8, 8, -6, 6, -3, 3, 0], y: [0, 2, -2, 1, -1, 0] } : { x: 0, y: 0 }}
            transition={{ duration: 0.6, repeat: drawing ? Infinity : 0 }}
            className="relative"
            style={{ width: 256, height: 240 }}
          >
            {/* 香枝 + 烟雾 + 飘字层 */}
            <div className="absolute inset-x-0" style={{ bottom: 70, height: 140 }}>
              {STICK_LEFT.map((left, i) => (
                <div key={i} className="absolute" style={{ left, bottom: 0 }}>
                  <motion.div
                    className="relative w-[3px] rounded-t-full"
                    style={{
                      height: 130,
                      background: lit
                        ? 'linear-gradient(to top, #6b4f1a, #b8862e 40%, #ffc857 80%, #fff2c2)'
                        : 'linear-gradient(to top, #2a2620, #3a3528)',
                      boxShadow: lit ? '0 0 6px rgba(255,200,87,0.6)' : 'none',
                    }}
                    animate={lit ? { opacity: [0.85, 1, 0.9] } : {}}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {/* 顶端火光（呼吸）*/}
                    {lit && (
                      <motion.div
                        key={`${i}-${lightPulse}`}
                        className="absolute left-1/2 -translate-x-1/2 rounded-full"
                        style={{
                          top: -7,
                          width: 14,
                          height: 14,
                          background: 'radial-gradient(circle, #fff2c2 0%, #ffc857 40%, rgba(255,200,87,0) 70%)',
                          boxShadow: '0 0 14px 4px rgba(255,200,87,0.7)',
                        }}
                        initial={{ scale: 0.2, opacity: 0 }}
                        animate={{ scale: [1, 1.25, 0.95, 1.15, 1], opacity: [0.9, 1, 0.85, 1, 0.9] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </div>
              ))}

              {/* 烟雾粒子（从香顶上飘变淡）*/}
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    left: p.x,
                    bottom: 128,
                    width: p.size,
                    height: p.size,
                    background:
                      'radial-gradient(circle, rgba(255,242,194,0.55), rgba(255,200,87,0.2) 50%, rgba(255,200,87,0) 75%)',
                    filter: 'blur(2px)',
                  }}
                  initial={{ opacity: 0, y: 0, scale: 0.5, x: 0 }}
                  animate={{ opacity: [0, 0.55, 0], y: -p.rise, x: p.drift, scale: [0.5, 1.6, 2.6] }}
                  transition={{ duration: p.dur, ease: 'easeOut' }}
                  onAnimationComplete={() => removeParticle(p.id)}
                />
              ))}

              {/* 祈福飘字（中央向上浮起）*/}
              {floats.map((f) => (
                <motion.div
                  key={f.id}
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-xl font-bold text-aura md:text-2xl"
                  style={{ bottom: 150, textShadow: '0 0 16px rgba(255,200,87,0.8)' }}
                  initial={{ opacity: 0, y: 0, scale: 0.7 }}
                  animate={{ opacity: [0, 1, 0], y: -90, scale: [0.7, 1.1, 1] }}
                  transition={{ duration: 1.7, ease: 'easeOut' }}
                >
                  {f.text}
                </motion.div>
              ))}
            </div>

            {/* 香炉本体（覆盖香枝根部，营造插在炉里的视觉）*/}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
              {/* 炉口金边 */}
              <div
                className="rounded-t-md"
                style={{
                  width: '78%',
                  height: 10,
                  background: 'linear-gradient(180deg, #ffe9a8, #b8862e)',
                  boxShadow: '0 0 18px rgba(255,200,87,0.4)',
                }}
              />
              {/* 炉身（梯形 + 通风格栅）*/}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: '72%',
                  height: 64,
                  marginTop: -2,
                  clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0 100%)',
                  background: 'linear-gradient(180deg, #2a2010 0%, #1a1408 60%, #100b04 100%)',
                  borderTop: '1px solid rgba(255,200,87,0.4)',
                }}
              >
                <div className="flex items-center gap-[6px] opacity-70">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="inline-block h-[14px] w-[2px] rounded bg-aura/40" />
                  ))}
                </div>
                <div className="absolute bottom-1 font-mono text-[8px] tracking-[0.25em] text-aura/50">
                  {txt.censerLabel}
                </div>
              </div>
              {/* 底座 + 三足 */}
              <div
                className="rounded-b-sm"
                style={{
                  width: '56%',
                  height: 10,
                  background: 'linear-gradient(180deg,#1a1408,#0a0a0f)',
                  borderTop: '1px solid rgba(255,200,87,0.2)',
                }}
              />
              <div className="mt-0 flex w-[48%] justify-between px-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className="h-[14px] w-[3px] rounded-b bg-gradient-to-b from-aura/50 to-aura/0" />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 香火状态提示 */}
        <div className={`mt-5 font-mono text-[11px] tracking-widest ${lit ? 'text-aura/70' : 'text-zinc-500'}`}>
          {lit ? txt.litHint : txt.unlitHint}
        </div>

        {/* 祈福输入 */}
        <motion.div
          animate={wishShake ? { x: [0, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="mt-6 flex w-full max-w-md items-center gap-2"
        >
          <input
            type="text"
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') pray() }}
            maxLength={40}
            placeholder={txt.wishPlaceholder}
            className="min-w-0 flex-1 rounded-full border border-aura/30 bg-black/40 px-4 py-2.5 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 outline-none backdrop-blur-sm transition focus:border-aura/70 focus:bg-black/60"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={pray}
            className="shrink-0 rounded-full bg-aura px-5 py-2.5 font-display text-xs font-bold text-void transition"
          >
            {txt.pray}
          </motion.button>
        </motion.div>
        <AnimatePresence>
          {wishShake && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 font-mono text-[10px] tracking-widest text-plasma/80"
            >
              {txt.wishEmpty}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 上香 / 求签 */}
        <div className="mt-3 flex w-full max-w-md items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={lightIncense}
            className="flex-1 rounded-full bg-aura px-5 py-3 font-display text-sm font-bold text-void transition hover:brightness-110"
          >
            🔥 {txt.light}
          </motion.button>
          <motion.button
            whileHover={{ scale: drawing ? 1 : 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={drawLot}
            disabled={drawing}
            className={`flex-1 rounded-full border px-5 py-3 font-display text-sm font-bold transition ${
              drawing
                ? 'cursor-not-allowed border-zinc-600 text-zinc-500'
                : 'border-aura/50 bg-aura/10 text-aura hover:bg-aura/20'
            }`}
          >
            🎋 {drawing ? `${txt.drawing}…` : txt.draw}
          </motion.button>
        </div>

        {/* 求签结果 */}
        <AnimatePresence mode="wait">
          {lot && (
            <motion.div
              key={lot.label + lot.item}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="mt-6 w-full max-w-md rounded-2xl border p-5 backdrop-blur-md"
              style={{
                borderColor: TIER_COLOR[lot.tier] + '66',
                background: 'linear-gradient(180deg, rgba(255,200,87,0.06), rgba(0,0,0,0.4))',
                boxShadow: `0 0 30px ${TIER_COLOR[lot.tier]}22`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold" style={{ color: TIER_COLOR[lot.tier] }}>
                  {lot.label}
                </span>
                <span
                  className="rounded-full px-3 py-1 font-mono text-[10px] tracking-widest"
                  style={{ color: TIER_COLOR[lot.tier], border: `1px solid ${TIER_COLOR[lot.tier]}55` }}
                >
                  {lot.verdict}
                </span>
              </div>
              <div className="mt-3 font-mono text-xs leading-relaxed text-zinc-300">{lot.item}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 补刀小字 */}
        <div className="mt-8 max-w-md text-center font-mono text-[10px] leading-relaxed tracking-wide text-zinc-600">
          {txt.note}
        </div>
      </div>

      {/* 祈福金光爆发层（径向扩散）*/}
      {burstKey > 0 && (
        <motion.div
          key={burstKey}
          className="pointer-events-none fixed inset-0 z-[65] flex items-center justify-center"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: 120,
              height: 120,
              background:
                'radial-gradient(circle, rgba(255,242,194,0.9) 0%, rgba(255,200,87,0.5) 30%, rgba(255,200,87,0) 70%)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 14 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </motion.div>
      )}

      {/* 底部「功德+1」电子弹幕（持续横向滚动）*/}
      <div
        className="fixed inset-x-0 bottom-0 z-[68] h-10 overflow-hidden border-t border-aura/15 bg-black/50 backdrop-blur-sm"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
        }}
      >
        {danmaku.map((d) => (
          <div
            key={d.id}
            className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[11px] tracking-wide text-aura/85"
            style={{ animation: `incense-dm ${d.dur}s linear forwards`, willChange: 'transform' }}
            onAnimationEnd={() => removeDanmaku(d.id)}
          >
            {d.text}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes incense-dm {
          from { transform: translateX(100vw); }
          to   { transform: translateX(-100%); }
        }
      `}</style>
    </motion.div>
  )
}
