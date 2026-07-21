// 📷 假装拍照 —— 打开摄像头，永远"对焦中 99%"，快门按不下
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../../i18n/index.jsx'

export default function FakeCamera({ onClose }) {
  const { t } = useI18n()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [hasStream, setHasStream] = useState(false)
  const [focus, setFocus] = useState(0)

  useEffect(() => {
    let active = true
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((tk) => tk.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setHasStream(true)
      })
      .catch(() => setHasStream(false))

    const id = setInterval(() => {
      setFocus(96 + Math.random() * 3)
    }, 500)

    return () => {
      active = false
      clearInterval(id)
      streamRef.current?.getTracks().forEach((tk) => tk.stop())
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 对焦框 */}
      <motion.div
        animate={{
          width: ['60%', '55%', '62%', '58%'],
          height: ['60%', '55%', '62%', '58%'],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="pointer-events-none absolute border-2 border-acid"
      >
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos) => (
          <div key={pos} className={`absolute h-6 w-6 border-acid ${pos}`}>
            <div className={`absolute h-full w-0.5 bg-acid ${pos.includes('left') ? 'left-0' : 'right-0'}`} />
            <div className={`absolute h-0.5 w-full bg-acid ${pos.includes('top') ? 'top-0' : 'bottom-0'}`} />
          </div>
        ))}
      </motion.div>

      {/* 底部相机条 */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 to-transparent pb-10 pt-20">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 0.92, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80"
          >
            <div className="h-12 w-12 rounded-full bg-white/90" />
          </motion.div>

          <div className="mt-4 font-display text-xl font-bold text-white">
            {t('camera.focusing')} {focus.toFixed(1)}%
          </div>
          <div className="mt-2 max-w-xs px-6 text-center font-mono text-[11px] leading-relaxed text-zinc-400">
            {t('camera.tip')}
          </div>
          <div className="mt-2 font-mono text-[10px] tracking-widest text-zinc-500">
            {t('camera.hint')}
          </div>
        </div>
      </div>

      {!hasStream && (
        <div className="absolute left-4 top-4 z-10 rounded bg-black/60 px-3 py-1 font-mono text-[10px] text-zinc-500">
          NO CAMERA · SIMULATED
        </div>
      )}
    </motion.div>
  )
}
