import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Void } from '@/components/Void'
import { Hero } from '@/pages/Hero'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import type { StageName } from '@/scene'
import { useAnimatedFavicon } from './hooks/useAnimatedFav'

/** the url is the source of truth for where the logo sits */
function stageFor(pathname: string): StageName {
  return pathname === '/' ? 'hero' : 'auth'
}

function App() {
  useAnimatedFavicon()
  const { pathname } = useLocation()
  const [docked, setDocked] = useState(false)

  return (
    <>
      {/* outside routes on purpose, a route change must not remount the canvas */}
      <Void stage={stageFor(pathname)} onDock={() => setDocked(true)} />

      <Routes>
        <Route path="/" element={<Hero docked={docked} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App
