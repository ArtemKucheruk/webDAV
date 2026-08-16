import { createContext, useContext } from 'react'
import type { User } from '@/lib/api'

export interface AuthContext {
  user: User
}

/** outlet context only reaches one level down, the account page nests deeper */
export const Ctx = createContext<AuthContext | null>(null)

/** every guarded page reads the user from here, the fetch happens once */
export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth is only valid under RequireAuth')
  return ctx
}
