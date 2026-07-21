import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import TimeMachine from './pages/TimeMachine.jsx'
import DisciplineTimer from './pages/DisciplineTimer.jsx'
import SwissArmyKnife from './pages/SwissArmyKnife.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/time-machine" element={<TimeMachine />} />
        <Route path="/discipline" element={<DisciplineTimer />} />
        <Route path="/swiss-army" element={<SwissArmyKnife />} />
      </Route>
    </Routes>
  )
}
