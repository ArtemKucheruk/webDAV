import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Void } from '@/components/Void'
import { Hero } from '@/pages/Hero'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { AUTH_DUR } from '@/scene'
import type { StageName } from '@/scene'
import { useAnimatedFavicon } from './hooks/useAnimatedFav'

/** the url is the source of truth for where the logo sits */
function stageFor(pathname: string): StageName {
  return pathname === '/' ? 'hero' : 'auth'
}

function App() {
  useAnimatedFavicon()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [docked, setDocked] = useState(false)
  const [leaving, setLeaving] = useState(false)

  /* going out, the url leads and the scene follows. coming home the scene
     leads, so the form is still mounted to fade out with it */
  const stage = leaving ? 'hero' : stageFor(pathname)

  useEffect(() => {
    if (!leaving) return
    const id = setTimeout(() => {
      navigate('/')
      setLeaving(false)
    }, AUTH_DUR)
    return () => clearTimeout(id)
  }, [leaving, navigate])

  /* any other navigation wins, otherwise a sign in clicked mid return would be
     undone when the pending navigate fires */
  useEffect(() => setLeaving(false), [pathname])

  const leave = useCallback(() => setLeaving(true), [])

  /* a direct load of an auth url never flies home, so it never docks, and the
     return flight must not take the chrome with it before it does */
  const chrome = docked || leaving || stage === 'auth'

  return (
    <>
      {/* all three sit outside routes, a route change must not remount them */}
      <Void stage={stage} onDock={() => setDocked(true)} />
      {chrome && <Navbar atAuth={stage === 'auth'} onLeave={leave} />}
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
