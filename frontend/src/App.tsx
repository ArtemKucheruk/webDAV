import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
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
  const stage = stageFor(pathname)

  /* a direct load of an auth url never flies home, so it never docks */
  const chrome = docked || stage === 'auth'

  return (
    <>
      {/* all three sit outside routes, a route change must not remount them */}
      <Void stage={stage} onDock={() => setDocked(true)} />
      {chrome && <Navbar atAuth={stage === 'auth'} />}
      {chrome && <Hero />}

      <Routes>
        <Route path="/" element={null} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App
