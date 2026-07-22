import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import EasterEgg from './EasterEgg/index.jsx'

export default function Layout() {
  const location = useLocation()
  return (
    <div className="noise relative flex min-h-screen w-full bg-void text-zinc-100">
      <Sidebar />
      <main id="egg-target" className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {/* 时空碎片彩蛋：跨页面随机投放 */}
      <EasterEgg />
    </div>
  )
}
