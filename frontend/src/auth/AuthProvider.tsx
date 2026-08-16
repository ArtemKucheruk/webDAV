import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { me } from '@/lib/api'
import type { User } from '@/lib/api'
import { SessionCtx } from './session'
import type { SessionStatus } from './session'

/** one ask at startup, every page reads the answer from here */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<SessionStatus>('checking')

  const refresh = useCallback(async () => {
    try {
      setUser(await me())
      setStatus('in')
    } catch {
      // a dead session and a dead server both mean there is nobody to show
      setUser(null)
      setStatus('out')
    }
  }, [])

  /* the first ask is a subscription to the server, so the answer lands in a
     callback, never straight into the effect body */
  useEffect(() => {
    let alive = true
    me().then(
      (u) => {
        if (!alive) return
        setUser(u)
        setStatus('in')
      },
      () => {
        if (alive) setStatus('out')
      },
    )
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(() => ({ user, status, refresh }), [user, status, refresh])

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>
}
