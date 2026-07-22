import { motion } from 'framer-motion'

// 点击瞬间的粒子爆裂 + 屏幕闪光。x/y 为爆心百分比坐标
export default function Burst({ x, y, onDone }) {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    const dist = 40 + Math.random() * 30
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: i % 2 === 0 ? '#d4ff3a' : '#7afcff',
      r: 2 + Math.random() * 2,
    }
  })

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      {/* 屏幕闪光 */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.25, times: [0, 0.3, 1] }}
      />
      {/* 爆裂粒子 */}
      <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute block rounded-full"
            style={{ width: p.r * 2, height: p.r * 2, background: p.color, boxShadow: `0 0 6px ${p.color}` }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={i === 0 ? onDone : undefined}
          />
        ))}
      </div>
    </div>
  )
}
