import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// 状态：idle 设定 / traveling 穿越中 / success 成功
const PHASE = { IDLE: 'idle', TRAVELING: 'traveling', SUCCESS: 'success' }

// 时间预设：5秒 ~ 24小时
const PRESETS = [
  { label: '5 秒', ms: 5 * 1000 },
  { label: '30 秒', ms: 30 * 1000 },
  { label: '1 分钟', ms: 60 * 1000 },
  { label: '10 分钟', ms: 10 * 60 * 1000 },
  { label: '1 小时', ms: 60 * 60 * 1000 },
  { label: '24 小时', ms: 24 * 60 * 60 * 1000 },
]

const MIN_MS = 5 * 1000
const MAX_MS = 24 * 60 * 60 * 1000

// 穿越途中荒诞的"实时坐标"，每隔几秒换一句
const TRAVEL_LOGS = [
  '正在校准时空曲率……',
  '与第 4 维度握手成功',
  '注意：前方有蝴蝶效应',
  '正在绕开祖父悖论检查站',
  '检测到平行宇宙，已自动忽略',
  '与路过的光子打招呼',
  '提醒：穿越期间请勿改变历史',
  '时空隧道轻微拥堵，耐心等候',
  '正在给熵增充值',
  '检测到你刚才眨了一下眼，已记录',
  '快了。也可能没快。',
  '时间是个圈，圈，圈……',
]

// 成功后的"目的地" — 自嘲式
const SUCCESS_LINES = [
  '你确实穿越了。证据：你比刚才老了。',
  '恭喜，你已抵达「未来」。和五秒前没区别。',
  '时空管理局认证：穿越成功（虽然没人会查）',
  '你刚刚证明了相对论：等待会让你变老。',
  '别看了，你已经到未来了。没什么变化吧？',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 把毫秒格式化成中文可读
function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const parts = []
  if (h) parts.push(`${h} 小时`)
  if (m) parts.push(`${m} 分`)
  if (sec || (!h && !m)) parts.push(`${sec} 秒`)
  return parts.join(' ')
}

// 倒计时显示 mm:ss
function formatCountdown(ms) {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export default function TimeMachine() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState(PHASE.IDLE)
  const [duration, setDuration] = useState(30 * 1000) // 默认 30 秒
  const [remain, setRemain] = useState(0)
  const [logs, setLogs] = useState([])
  const [successLine, setSuccessLine] = useState('')
  const [departTime, setDepartTime] = useState(null)
  const timerRef = useRef(null)
  const logTimerRef = useRef(null)

  // 滑块：用对数刻度，让 5s ~ 24h 都能舒适拨动
  const minLog = Math.log(MIN_MS)
  const maxLog = Math.log(MAX_MS)
  const toSliderValue = (ms) => ((Math.log(ms) - minLog) / (maxLog - minLog)) * 1000
  const fromSliderValue = (v) => Math.exp(minLog + (v / 1000) * (maxLog - minLog))

  const startTravel = () => {
    setPhase(PHASE.TRAVELING)
    setRemain(duration)
    setDepartTime(new Date())
    setLogs([pick(TRAVEL_LOGS)])

    // 倒计时
    const startAt = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startAt
      const left = Math.max(0, duration - elapsed)
      setRemain(left)
      if (left <= 0) {
        clearInterval(timerRef.current)
        clearInterval(logTimerRef.current)
        setSuccessLine(pick(SUCCESS_LINES))
        setPhase(PHASE.SUCCESS)
      }
    }, 100)

    // 每 3.5 秒换一条荒诞日志
    logTimerRef.current = setInterval(() => {
      setLogs((prev) => [...prev.slice(-3), pick(TRAVEL_LOGS)])
    }, 3500)
  }

  // 中途取消（仅在穿越中）
  const abort = () => {
    clearInterval(timerRef.current)
    clearInterval(logTimerRef.current)
    setPhase(PHASE.IDLE)
    setLogs([])
  }

  const reset = () => {
    setPhase(PHASE.IDLE)
    setLogs([])
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(logTimerRef.current)
    }
  }, [])

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {/* === 设定阶段 === */}
        {phase === PHASE.IDLE && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative flex flex-1 flex-col px-6 pb-10 pt-24 md:justify-center md:px-14 md:pt-14"
          >
            {/* 顶部回返 + 标识 */}
            <div className="absolute left-6 top-24 z-10 flex items-center gap-3 md:static md:mb-0 md:top-0">
              <button
                onClick={() => navigate('/')}
                className="font-mono text-[11px] tracking-widest text-zinc-500 hover:text-zinc-200"
              >
                ← 返回
              </button>
              <span className="font-mono text-[11px] tracking-[0.3em] text-acid">
                TIME//MACHINE
              </span>
            </div>

            <div className="mx-auto w-full max-w-2xl">
              {/* 大标题 */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-[clamp(2.5rem,8vw,5rem)] font-bold leading-[0.92] tracking-tight"
              >
                设定
                <br />
                <span className="text-frost">穿越时长</span>
              </motion.h1>

              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-400">
                选择你想被偷走的时间。设定后我们将启动时空隧道，<span className="text-zinc-200">真的让你等这么久</span>，然后宣布你穿越成功。
              </p>

              {/* 当前时长大显示 */}
              <div className="mt-10 flex items-baseline gap-4">
                <motion.div
                  key={duration}
                  initial={{ opacity: 0.6, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-5xl font-bold text-acid md:text-6xl"
                >
                  {formatDuration(duration)}
                </motion.div>
                <span className="font-mono text-xs tracking-widest text-zinc-500">
                  目标等待
                </span>
              </div>

              {/* 对数滑块 */}
              <div className="mt-8">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={toSliderValue(duration)}
                  onChange={(e) => setDuration(Math.round(fromSliderValue(+e.target.value)))}
                  className="slider w-full"
                  style={sliderStyle}
                />
                <div className="mt-2 flex justify-between font-mono text-[10px] tracking-widest text-zinc-600">
                  <span>5 秒</span>
                  <span>24 小时</span>
                </div>
              </div>

              {/* 预设 */}
              <div className="mt-8 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setDuration(p.ms)}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                      duration === p.ms
                        ? 'border-acid bg-acid/10 text-acid'
                        : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-zinc-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* 启动按钮 */}
              <motion.button
                onClick={startTravel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group mt-12 flex w-full items-center justify-center gap-3 rounded-2xl bg-frost px-8 py-5 text-void md:w-auto"
              >
                <span className="font-display text-lg font-bold">确认穿越</span>
                <span className="font-mono text-xs tracking-widest text-void/60">
                  LAUNCH →
                </span>
              </motion.button>

              <p className="mt-4 font-mono text-[10px] leading-relaxed text-zinc-600">
                * 一旦启动无法退款。穿越期间请保持呼吸。
              </p>
            </div>
          </motion.div>
        )}

        {/* === 穿越中 === */}
        {phase === PHASE.TRAVELING && (
          <motion.div
            key="traveling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-black px-6"
          >
            {/* 虫洞：多层旋转环 + 星点 */}
            <Wormhole />

            {/* 中央信息 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-mono text-[11px] tracking-[0.4em] text-frost/80"
              >
                SPACETIME//TRAVELING
              </motion.div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 font-display text-[clamp(3rem,12vw,7rem)] font-bold leading-none text-white"
              >
                {formatCountdown(remain)}
              </motion.div>

              <div className="mt-2 font-mono text-xs tracking-widest text-zinc-500">
                剩余等待 · 距抵达
              </div>

              {/* 滚动日志 */}
              <div className="mt-10 h-24 w-full max-w-md overflow-hidden text-left">
                <AnimatePresence mode="popLayout">
                  {logs.slice(-3).map((log, i) => (
                    <motion.div
                      key={`${logs.length}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 py-1 font-mono text-[12px] text-zinc-300"
                    >
                      <span className="text-acid">{'>'}</span>
                      <span>{log}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* 进度条 */}
              <div className="mt-6 h-1 w-full max-w-md overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-frost to-acid"
                  animate={{
                    width: `${((duration - remain) / duration) * 100}%`,
                  }}
                  transition={{ ease: 'linear' }}
                />
              </div>

              {/* 中止按钮（藏得低调一点） */}
              <button
                onClick={abort}
                className="mt-10 font-mono text-[10px] tracking-widest text-zinc-600 underline-offset-4 hover:text-zinc-400 hover:underline"
              >
                中止穿越（懦夫选项）
              </button>
            </div>
          </motion.div>
        )}

        {/* === 成功 === */}
        {phase === PHASE.SUCCESS && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16"
          >
            {/* 彩带光晕 */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-acid/20" />
            </div>

            {/* 大对勾 */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-2 border-acid"
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <motion.path
                  d="M10 24 L20 34 L38 14"
                  stroke="#d4ff3a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 mt-8 text-center"
            >
              <div className="font-mono text-[11px] tracking-[0.4em] text-acid">
                ARRIVAL//CONFIRMED
              </div>
              <h2 className="mt-3 font-display text-[clamp(2.5rem,9vw,5rem)] font-bold leading-none">
                穿越<span className="text-acid">成功</span>
              </h2>

              <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-zinc-300">
                {successLine}
              </p>

              {/* 出发 / 抵达 时间戳 */}
              {departTime && (
                <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-4 border-t border-white/10 pt-6 text-left font-mono text-[11px]">
                  <div>
                    <div className="text-zinc-600">DEPARTURE</div>
                    <div className="mt-1 text-zinc-300">
                      {departTime.toLocaleTimeString('zh-CN')}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-600">ARRIVAL</div>
                    <div className="mt-1 text-frost">
                      {new Date().toLocaleTimeString('zh-CN')}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={reset}
                  className="rounded-full bg-acid px-6 py-3 font-display text-sm font-bold text-void"
                >
                  再穿越一次
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="rounded-full border border-white/20 px-6 py-3 font-mono text-xs tracking-widest text-zinc-300 hover:border-white/50"
                >
                  回到首页
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// === 虫洞视觉 ===
function Wormhole() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* 中心强光 */}
      <div className="absolute h-40 w-40 animate-pulse-glow rounded-full bg-frost/40 blur-3xl" />
      {/* 多层旋转环 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`absolute rounded-full border ${i % 2 === 0 ? 'animate-spin-slow' : 'animate-spin-rev'}`}
          style={{
            width: `${(i + 1) * 18}vmax`,
            height: `${(i + 1) * 18}vmax`,
            borderColor: i % 2 === 0 ? 'rgba(212,255,58,0.12)' : 'rgba(122,252,255,0.10)',
            borderTopColor: i % 2 === 0 ? 'rgba(212,255,58,0.5)' : 'rgba(122,252,255,0.5)',
            animationDuration: `${4 + i * 2}s`,
          }}
        />
      ))}
      {/* 星点 */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.r}px`,
            height: `${s.r}px`,
            opacity: s.o,
            animation: `twinkle ${s.d}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes twinkle {0%,100%{opacity:0.2} 50%{opacity:1}}`}</style>
    </div>
  )
}

const STARS = Array.from({ length: 40 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 2 + 0.5,
  o: Math.random() * 0.6 + 0.2,
  d: Math.random() * 3 + 2,
  delay: Math.random() * 3,
}))

// range 输入框样式
const sliderStyle = {
  height: '4px',
  background: 'linear-gradient(to right, #d4ff3a, #7afcff)',
  borderRadius: '999px',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
}
