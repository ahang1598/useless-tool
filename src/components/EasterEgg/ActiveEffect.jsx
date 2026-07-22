import { useEffect, useState, useRef } from 'react'

// 全屏临时特效渲染层，按 effectId switch
// 作用域为 fixed 覆盖层 + 给 main 挂 class，不污染侧栏
export default function ActiveEffect({ effectId, onDone }) {
  useEffect(() => {
    if (!effectId) return
    const node = document.getElementById('egg-target')
    if (!node) return

    // 给 main 内容区挂 class（供 shake / tilt）
    const cls = `egg-fx-${effectId}`
    node.classList.add(cls)
    return () => node.classList.remove(cls)
  }, [effectId])

  if (!effectId) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      {effectId === 'rainbow-trail' && <RainbowTrail />}
      {effectId === 'color-noise' && <ColorNoise />}
      {effectId === 'bubble-pop' && <BubblePop />}
      {/* screen-shake / tilt-world 仅靠 main 上的 class 生效，无需覆盖层 */}
    </div>
  )
}

// 彩虹拖尾：mousemove 时留下彩色圆点
function RainbowTrail() {
  const [dots, setDots] = useState([])
  const idRef = useRef(0)
  const colors = ['#ff2d75', '#ff8c42', '#ffd23f', '#7afcff', '#d4ff3a', '#a78bfa']

  useEffect(() => {
    const handler = (e) => {
      const id = idRef.current++
      const color = colors[id % colors.length]
      setDots((prev) => [...prev.slice(-14), { id, x: e.clientX, y: e.clientY, color }])
      setTimeout(() => setDots((prev) => prev.filter((d) => d.id !== id)), 700)
    }
    window.addEventListener('mousemove', handler)
    window.addEventListener('touchmove', handler)
    return () => {
      window.removeEventListener('mousemove', handler)
      window.removeEventListener('touchmove', handler)
    }
  }, [])

  return (
    <>
      <style>{`
        .egg-fx-rainbow-trail { cursor: crosshair; }
        @keyframes trail-fade { from { opacity: 0.9; transform: scale(1); } to { opacity: 0; transform: scale(0.3); } }
      `}</style>
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute block rounded-full"
          style={{
            left: d.x,
            top: d.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            background: d.color,
            boxShadow: `0 0 8px ${d.color}`,
            animation: 'trail-fade 0.7s ease-out forwards',
          }}
        />
      ))}
    </>
  )
}

// 色彩噪点：全屏彩色噪点覆盖层闪烁
function ColorNoise() {
  return (
    <>
      <style>{`
        .egg-fx-color-noise { animation: chroma-flicker 0.15s steps(2) infinite; }
      `}</style>
      <div
        className="absolute inset-0 animate-chroma-flicker mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 0.4 0 0 0 0 1 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
        }}
      />
    </>
  )
}

// 边缘气泡：屏幕底边冒彩色泡泡上升
function BubblePop() {
  const colors = ['#ff2d75', '#7afcff', '#d4ff3a', '#ffc857', '#a78bfa']
  const bubbles = Array.from({ length: 14 }, (_, i) => ({
    left: Math.random() * 100,
    size: 12 + Math.random() * 28,
    delay: Math.random() * 3,
    dur: 3 + Math.random() * 2,
    color: colors[i % colors.length],
  }))
  return (
    <>
      <style>{`
        .egg-fx-bubble-pop { overflow: hidden; }
      `}</style>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            background: `${b.color}33`,
            border: `1.5px solid ${b.color}`,
            boxShadow: `0 0 8px ${b.color}66`,
            animation: `bubble-rise ${b.dur}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </>
  )
}
