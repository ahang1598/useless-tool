// 🔋 耗电狂魔 —— Canvas 跑大量粒子，认真让设备发烫
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function PowerDrainer({ onClose }) {
  const { t } = useI18n()
  const canvasRef = useRef(null)
  const [fps, setFps] = useState(60)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let particles = []
    let lastTime = performance.now()
    let frameCount = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const MAX = 800
    const spawn = () => {
      particles = Array.from({ length: MAX }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        r: Math.random() * 3 + 1,
        c: ['#d4ff3a', '#ff2d75', '#7afcff'][Math.floor(Math.random() * 3)],
      }))
      setCount(MAX)
    }
    spawn()

    const loop = (now) => {
      frameCount++
      if (now - lastTime >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)))
        frameCount = 0
        lastTime = now
      }

      ctx.fillStyle = 'rgba(10,10,15,0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c
        ctx.fill()
      })

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] cursor-pointer overflow-hidden bg-void"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute left-4 top-4 z-10 font-mono text-[11px] leading-relaxed text-acid">
        <div>{t('drainer.fps')}: <span className="text-white">{fps}</span></div>
        <div>{t('drainer.particles')}: <span className="text-white">{count}</span></div>
      </div>

      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center">
        <div className="font-display text-2xl font-bold text-acid md:text-3xl">
          {t('drainer.title')}
        </div>
        <div className="mt-2 max-w-xs px-6 text-center font-mono text-[11px] leading-relaxed text-zinc-400">
          {t('drainer.tip')}
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-widest text-zinc-500">
          {t('drainer.hint')}
        </div>
      </div>
    </motion.div>
  )
}
