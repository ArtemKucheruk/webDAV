import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { me } from '@/lib/api'
import type { User } from '@/lib/api'

export interface AuthContext {
  user: User
}

/** outlet context only reaches one level down, the account page nests deeper */
const Ctx = createContext<AuthContext | null>(null)

type Status = 'checking' | 'in' | 'out'

/** the session cookie is httponly, so only the server can say whether it is still good */
export function RequireAuth() {
  const location = useLocation()
  const [status, setStatus] = useState<Status>('checking')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let alive = true
    me()
      .then((u) => {
        if (!alive) return
        setUser(u)
        setStatus('in')
      })
      // a dead session and a dead server both mean the page cannot be trusted to render
      .catch(() => {
        if (alive) setStatus('out')
      })
    return () => {
      alive = false
    }
  }, [])

  // nothing paints while the answer is in flight, a flash of the page would leak it
  if (status === 'checking') return null

  if (status === 'out' || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <Ctx.Provider value={{ user }}>
      <Outlet />
    </Ctx.Provider>
  )
}

/** every guarded page reads the user from here, the fetch happens once */
export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth is only valid under RequireAuth')
  return ctx
}
