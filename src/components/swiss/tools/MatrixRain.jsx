// 💻 黑客帝国 —— 满屏绿色字符雨 Matrix，假装入侵五角大楼
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

const CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789ABCDEF<>*=|'

export default function MatrixRain({ onClose }) {
  const { t } = useI18n()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let drops = []
    const fontSize = 16

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const cols = Math.floor(canvas.width / fontSize)
      drops = Array.from({ length: cols }).map(() => ({
        y: Math.random() * canvas.height,
        speed: 2 + Math.random() * 4,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`

      drops.forEach((d, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * fontSize
        ctx.fillStyle = '#d4ff3a'
        ctx.fillText(ch, x, d.y)
        ctx.fillStyle = 'rgba(40,200,40,0.7)'
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, d.y - fontSize)

        d.y += d.speed * 4
        if (d.y > canvas.height && Math.random() > 0.97) d.y = 0
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
      className="fixed inset-0 z-[60] cursor-pointer overflow-hidden bg-black"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute left-4 top-16 z-10 font-mono text-[11px] leading-relaxed text-acid md:text-xs">
        <div>{'> breaching firewall...'}</div>
        <div>{'> bypassing ICE v4.2...'}</div>
        <div className="text-white">{'> ACCESS GRANTED'}</div>
      </div>

      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center">
        <div className="font-display text-3xl font-bold text-acid md:text-5xl" style={{ textShadow: '0 0 20px rgba(212,255,58,0.8)' }}>
          {t('matrix.title')}
        </div>
        <div className="mt-3 max-w-sm px-6 text-center font-mono text-[11px] leading-relaxed text-green-300/70">
          {t('matrix.tip')}
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-widest text-green-400/50">
          {t('matrix.hint')}
        </div>
      </div>
    </motion.div>
  )
}
