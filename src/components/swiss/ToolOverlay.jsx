// === 工具触发容器 ===
// 点刀刃后整屏接管，渲染对应工具组件，右上角浮动"收刀"按钮
// 所有工具组件统一接口：<Comp onClose={() => {}} />
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../i18n/index.jsx'
import { TOOLS, CATEGORY } from './TOOLS_CONFIG.js'

export default function ToolOverlay({ activeId, onClose }) {
  const { t } = useI18n()
  const tool = TOOLS.find((x) => x.id === activeId)
  const cat = tool ? CATEGORY[tool.cat] : null

  // Esc 一键收刀
  useEffect(() => {
    if (!activeId) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    // 触发时锁滚动，避免底层跟着滚
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [activeId, onClose])

  return (
    <AnimatePresence>
      {tool && (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60]"
        >
          {/* 工具效果层：每个工具自己负责填满全屏 */}
          <tool.Comp onClose={onClose} />

          {/* 收刀按钮：所有工具共享，永远在右上角 */}
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={onClose}
            className="fixed right-4 top-4 z-[70] flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2.5 font-mono text-[11px] tracking-widest text-zinc-200 backdrop-blur-md transition hover:border-white/40 hover:bg-black/60"
          >
            <span style={{ color: cat?.hex }} className="text-base leading-none">
              ✕
            </span>
            <span>{t('swiss.sheathe')}</span>
            <span className="text-zinc-600">ESC</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
