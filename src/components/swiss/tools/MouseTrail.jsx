// 👻 鼠标残影 —— Canvas 拖出满屏彩色拖尾，显卡燃烧殆尽
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function MouseTrail({ onClose }) {
  const { t } = useI18n()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let particles = []
    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: mx,
          y: my,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          r: Math.random() * 5 + 2,
          life: 1,
          c: ['#d4ff3a', '#ff2d75', '#7afcff', '#ffffff'][Math.floor(Math.random() * 4)],
        })
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) onMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY })
    })

    const loop = () => {
      ctx.fillStyle = 'rgba(10,10,15,0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles = particles.filter((p) => p.life > 0)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.life -= 0.018
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.c
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
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

      <div className="pointer-events-none absolute inset-x-0 top-16 flex flex-col items-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[4rem] leading-none md:text-[6rem]"
        >
          👻
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center">
        <div className="font-display text-2xl font-bold text-white md:text-3xl">
          {t('trail.title')}
        </div>
        <div className="mt-2 max-w-xs px-6 text-center font-mono text-[11px] leading-relaxed text-zinc-400">
          {t('trail.tip')}
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-widest text-zinc-500">
          {t('trail.hint')}
        </div>
      </div>
    </motion.div>
  )
}
