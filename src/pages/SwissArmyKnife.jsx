// === 赛博武器库 · 终端命令面板 ===
// 进来直接看到所有武器（命令列表），顶部一段启动日志作为氛围装饰
// 交互：↑↓ 导航 / Enter 触发 / 打字筛选 / Esc 退出 overlay，移动端触摸点击
// 触发态：交给 ToolOverlay 全屏接管
import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/index.jsx'
import { TOOLS, CATEGORY } from '../components/swiss/TOOLS_CONFIG.js'
import ToolOverlay from '../components/swiss/ToolOverlay.jsx'

export default function SwissArmyKnife() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [activeId, setActiveId] = useState(null)

  return (
    <div className="relative flex min-h-[100svh] flex-col px-3 pb-6 pt-[4.5rem] md:px-14 md:pb-8 md:pt-14">
      <BackgroundFX />

      {/* 顶部栏 */}
      <div className="relative z-20 mb-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="font-mono text-[11px] tracking-widest text-zinc-500 transition hover:text-zinc-200"
        >
          {t('swiss.back')}
        </button>
        <span className="font-mono text-[11px] tracking-[0.3em] text-acid">{t('swiss.mono')}</span>
      </div>

      {/* 主舞台：终端窗口居中，直接展开列表 */}
      <div className="relative z-10 flex flex-1 items-center justify-center py-2 md:py-4">
        <Terminal setActiveId={setActiveId} />
      </div>

      <ToolOverlay activeId={activeId} onClose={() => setActiveId(null)} />
    </div>
  )
}

// === 终端主组件 ===
function Terminal({ setActiveId }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  // 筛选：支持 codename / id / 中文名 / 中文 tip 模糊匹配
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return TOOLS
    return TOOLS.filter((tool) => {
      const name = String(t(`swiss.tools.${tool.id}.name`)).toLowerCase()
      const tip = String(t(`swiss.tools.${tool.id}.tip`)).toLowerCase()
      return (
        tool.codename.toLowerCase().includes(q) ||
        tool.id.includes(q) ||
        name.includes(q) ||
        tip.includes(q)
      )
    })
  }, [query, t])

  // 筛选结果变化时，选中索引归零兜底
  useEffect(() => {
    setSelected((s) => (s >= filtered.length ? 0 : s))
  }, [filtered.length])

  // 进入即聚焦输入框，方便直接打字筛选
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 400)
    return () => clearTimeout(id)
  }, [])

  // 全局键盘导航：↑↓ 移动 / Enter 触发
  useEffect(() => {
    const onKey = (e) => {
      // overlay 打开时让 ToolOverlay 自己处理 Esc
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selected]) setActiveId(filtered[selected].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtered, selected, setActiveId])

  // 选中项滚入视口
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selected}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 26 }}
      className="relative w-full max-w-3xl"
    >
      <div className="terminal-frame relative overflow-hidden rounded-xl border bg-[#080c08]/95 backdrop-blur-sm">
        {/* 标题栏：macOS 三灯 + 标题 + REC 指示 */}
        <div className="flex items-center gap-2 border-b border-acid/15 bg-[#0c120c] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex-1 truncate text-center font-mono text-[10px] tracking-widest text-zinc-500 md:text-[11px]">
            useless@cyber: ~/arsenal — zsh
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] tracking-wider text-plasma/70 md:text-[10px]">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="inline-block h-1.5 w-1.5 rounded-full bg-plasma"
            />
            REC
          </span>
        </div>

        {/* CRT 扫描线 + 渐晕 */}
        <div className="pointer-events-none absolute inset-0 z-30 crt-effects" />

        {/* 内容区 */}
        <div className="relative z-20 font-mono text-[12px] leading-relaxed md:text-[13px]">
          {/* 启动日志：作为顶部氛围装饰，不再是 gate */}
          <BootLog />

          {/* 状态栏 */}
          <div className="flex items-center justify-between border-y border-acid/10 bg-[#0c120c] px-4 py-2 text-[10px] tracking-widest text-zinc-500 md:text-[11px]">
            <span>ARSENAL // {TOOLS.length} WEAPONS LOADED</span>
            <span className="hidden text-zinc-600 md:inline">SYS_STATUS: <span className="text-acid">ARMED</span></span>
            <span>CONFIDENCE: <span className="text-plasma">0%</span></span>
          </div>

          {/* 筛选输入框 */}
          <div className="flex items-center gap-2 border-b border-acid/10 px-4 py-3">
            <span className="text-acid">{'>'}</span>
            <span className="text-zinc-500">search:</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent text-zinc-100 caret-acid outline-none placeholder:text-zinc-700"
            />
            <span className="cursor-blink text-acid">▊</span>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-[10px] tracking-widest text-zinc-600 transition hover:text-plasma"
              >
                ✕ CLEAR
              </button>
            )}
          </div>

          {/* 命令列表：可滚动 */}
          <div ref={listRef} className="max-h-[52vh] overflow-y-auto px-2 py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-600">
                <div className="text-[11px] tracking-widest">[NO MATCH]</div>
                <div className="mt-2 text-[10px]">query "{query}" returned 0 useless results</div>
              </div>
            ) : (
              filtered.map((tool, i) => (
                <CommandRow
                  key={tool.id}
                  tool={tool}
                  index={i}
                  isSelected={i === selected}
                  onSelect={() => setSelected(i)}
                  onTrigger={() => setActiveId(tool.id)}
                  name={t(`swiss.tools.${tool.id}.name`)}
                  tip={t(`swiss.tools.${tool.id}.tip`)}
                />
              ))
            )}
          </div>

          {/* 底部快捷键提示 */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-acid/10 bg-[#0c120c] px-4 py-2 text-[9px] tracking-widest text-zinc-600 md:text-[10px]">
            <span className="flex flex-wrap gap-3">
              <span><kbd className="text-acid">↑↓</kbd> NAVIGATE</span>
              <span><kbd className="text-acid">ENTER</kbd> FIRE</span>
              <span><kbd className="text-acid">TYPE</kbd> FILTER</span>
            </span>
            <span>{filtered.length}/{TOOLS.length}</span>
          </div>
        </div>
      </div>

      <style>{`
        .terminal-frame {
          border-color: rgba(212,255,58,0.28);
          box-shadow:
            0 0 60px -10px rgba(212,255,58,0.30),
            0 30px 80px -20px rgba(0,0,0,0.9),
            inset 0 0 40px rgba(0,0,0,0.4);
        }
        .crt-effects {
          background:
            repeating-linear-gradient(
              to bottom,
              transparent 0,
              transparent 2px,
              rgba(0,0,0,0.18) 2px,
              rgba(0,0,0,0.18) 3px
            );
          opacity: 0.45;
        }
        .crt-effects::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }
        @keyframes glitch-skew {
          0%, 100% { transform: skewX(0); }
          92% { transform: skewX(0); }
          94% { transform: skewX(-1.5deg); }
          96% { transform: skewX(1deg); }
          98% { transform: skewX(0); }
        }
        .terminal-frame { animation: glitch-skew 6s infinite; }
      `}</style>
    </motion.div>
  )
}

// === 启动日志（顶部氛围装饰） ===
function BootLog() {
  const { t } = useI18n()
  const lines = [
    { tag: 'OK', color: 'text-acid', text: 'booting useless-arsenal v0.0.1' },
    { tag: 'OK', color: 'text-acid', text: `loading ${TOOLS.length} weapons ........... armed` },
    { tag: 'WARN', color: 'text-yellow-400', text: 'productivity_module: not found, skipping' },
    { tag: 'OK', color: 'text-acid', text: 'useless_core: READY' },
  ]
  return (
    <div className="px-4 pt-4 pb-3 md:px-6">
      {lines.map((ln, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.12 }}
          className="flex gap-2"
        >
          <span className="text-zinc-600">[{formatLogTime(i)}]</span>
          <span className={ln.color}>[{ln.tag}]</span>
          <span className="text-zinc-300">{ln.text}</span>
        </motion.div>
      ))}
      {/* 命令行欢迎语 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 + lines.length * 0.12 + 0.1 }}
        className="mt-3 flex flex-wrap items-center gap-2"
      >
        <span className="text-acid">user@cyber</span>
        <span className="text-zinc-500">:</span>
        <span className="text-frost">~/arsenal</span>
        <span className="text-zinc-500">$</span>
        <span className="text-zinc-300">list-weapons --all</span>
        <span className="cursor-blink text-acid">▊</span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 + lines.length * 0.12 + 0.3 }}
        className="mt-3 text-[10px] leading-relaxed text-zinc-600 md:text-[11px]"
      >
        * {t('swiss.note').replace(/^\*\s*/, '')}
      </motion.p>
    </div>
  )
}

// === 单条命令行 ===
function CommandRow({ tool, index, isSelected, onSelect, onTrigger, name, tip }) {
  const cat = CATEGORY[tool.cat]
  return (
    <motion.button
      data-idx={index}
      onClick={onTrigger}
      onMouseEnter={onSelect}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.025 }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.995 }}
      className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition ${
        isSelected ? 'bg-acid/[0.08]' : 'hover:bg-white/[0.02]'
      }`}
      style={isSelected ? { boxShadow: `inset 2px 0 0 ${cat.hex}` } : undefined}
    >
      {/* 选中光标 */}
      <span
        className={`w-3 shrink-0 text-center font-bold transition ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ color: cat.hex }}
      >
        ▌
      </span>

      {/* 图标 */}
      <span className="shrink-0 text-base md:text-lg">{tool.icon}</span>

      {/* 命令名 .exe */}
      <span
        className={`shrink-0 font-bold transition md:text-[13px] ${
          isSelected ? 'text-acid' : 'text-zinc-300 group-hover:text-zinc-100'
        }`}
      >
        {tool.id}.exe
      </span>

      {/* codename 军事化标签 */}
      <span
        className="hidden shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest md:inline-block md:text-[10px]"
        style={{
          color: cat.hex,
          border: `1px solid ${cat.hex}40`,
          background: `${cat.hex}10`,
        }}
      >
        {tool.codename}
      </span>

      <span className="flex-1" />

      {/* 中文名 + tip */}
      <span className="hidden shrink-0 text-[11px] text-zinc-500 md:inline md:text-[12px]">{name}</span>
      <span className="shrink-0 text-[10px] text-zinc-600 md:text-[11px]">·</span>
      <span className="hidden shrink-0 text-[10px] text-zinc-600 md:inline md:text-[11px]">{tip}</span>

      {/* 移动端：只显示中文名 */}
      <span className="shrink-0 text-[11px] text-zinc-400 md:hidden">{name}</span>
    </motion.button>
  )
}

// 背景光晕 + 网格
function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,255,58,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,255,58,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid/[0.08] blur-[140px]" />
      <div className="absolute left-[10%] top-[15%] h-64 w-64 rounded-full bg-frost/[0.05] blur-[120px]" />
      <div className="absolute bottom-[10%] right-[12%] h-64 w-64 rounded-full bg-plasma/[0.05] blur-[120px]" />
    </div>
  )
}

// 启动日志的伪时间戳
function formatLogTime(i) {
  const base = new Date()
  base.setSeconds(base.getSeconds() - (4 - i))
  return base.toLocaleTimeString('en-US', { hour12: false })
}
