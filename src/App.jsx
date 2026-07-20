import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import TimeMachine from './pages/TimeMachine.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/time-machine" element={<TimeMachine />} />
      </Route>
    </Routes>
  )
}
