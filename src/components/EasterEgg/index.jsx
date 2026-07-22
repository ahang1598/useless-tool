import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Shard from './Shard.jsx'
import Burst from './Burst.jsx'
import Toast from './toast.jsx'
import ActiveEffect from './ActiveEffect.jsx'
import { randomEffect } from './effects.js'

// 可投放彩蛋的子页面（不含首页）
const TARGETS = ['/time-machine', '/discipline', '/swiss-army', '/mystic']
const KEY = 'ut-egg'

function rollEgg() {
  const target = TARGETS[Math.floor(Math.random() * TARGETS.length)]
  const x = 8 + Math.random() * 80 // 8%~88%
  const y = 18 + Math.random() * 60 // 18%~78%
  const effect = randomEffect()
  return { target, x, y, effectId: effect.id, duration: effect.duration, collected: false }
}

function readEgg() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeEgg(cfg) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(cfg))
  } catch {
    /* 隐私模式忽略 */
  }
}

export default function EasterEgg() {
  const location = useLocation()
  const [phase, setPhase] = useState('idle') // idle | arming | dropped | bursting | effect
  const [cfg, setCfg] = useState(null)
  const [activeEffect, setActiveEffect] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const armTimer = useRef(null)
  const effectTimer = useRef(null)

  // 路由监听：首页掷骰子，目标页进入 arming
  useEffect(() => {
    const path = location.pathname

    if (path === '/') {
      // 进入首页 → 掷骰子（每次访问首页都重置）
      const fresh = rollEgg()
      writeEgg(fresh)
      setCfg(fresh)
      setPhase('idle')
      setActiveEffect(null)
      setShowToast(false)
      return
    }

    // 首次加载（没经过首页直达子页）：补一次掷骰子
    let current = readEgg()
    if (!current) {
      current = rollEgg()
      writeEgg(current)
    }
    setCfg(current)

    if (path === current.target && !current.collected) {
      setPhase('arming')
    } else {
      setPhase('idle')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // arming 阶段：停留 1.5s 或滚动一次 → 掉落
  useEffect(() => {
    if (phase !== 'arming') return

    let triggered = false
    const arm = () => {
      if (triggered) return
      triggered = true
      cleanup()
      setPhase('dropped')
    }
    const cleanup = () => {
      clearTimeout(armTimer.current)
      window.removeEventListener('scroll', arm, { once: true })
      window.removeEventListener('touchmove', arm, { once: true })
    }

    armTimer.current = setTimeout(arm, 1500)
    window.addEventListener('scroll', arm, { once: true })
    window.addEventListener('touchmove', arm, { once: true })

    return cleanup
  }, [phase])

  // 收集碎片
  const collect = () => {
    if (!cfg) return
    const updated = { ...cfg, collected: true }
    writeEgg(updated)
    setCfg(updated)
    setPhase('bursting')
  }

  // 爆裂结束 → 启动特效 + toast
  const onBurstDone = () => {
    if (!cfg) return
    setActiveEffect(cfg.effectId)
    setShowToast(true)
    setPhase('effect')
    effectTimer.current = setTimeout(() => {
      setActiveEffect(null)
      setShowToast(false)
      setPhase('idle')
    }, cfg.duration || 4000)
  }

  // 卸载清 timer
  useEffect(() => () => {
    clearTimeout(armTimer.current)
    clearTimeout(effectTimer.current)
  }, [])

  const showShard = phase === 'dropped' && cfg

  return (
    <>
      {/* 碎片定位层 */}
      <AnimatePresence>
        {showShard && (
          <div
            className="pointer-events-none fixed z-[58]"
            style={{ left: `${cfg.x}%`, top: `${cfg.y}%` }}
          >
            <div className="pointer-events-auto">
              <Shard onCollect={collect} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 爆裂 */}
      {phase === 'bursting' && cfg && (
        <Burst x={cfg.x} y={cfg.y} onDone={onBurstDone} />
      )}

      {/* 临时特效 */}
      <ActiveEffect effectId={activeEffect} />

      {/* 提示卡 */}
      <AnimatePresence>
        {showToast && cfg && <Toast effectId={cfg.effectId} />}
      </AnimatePresence>
    </>
  )
}
