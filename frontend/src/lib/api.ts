const BASE = '/api'

  export interface User {
    user_id: number
    email: string
  }

export interface Credentials {
  email: string
  password: string
}

export interface AuthResult {
  id: number
}

/** echo reports a failure as { "message": ... } */
function messageOf(payload: unknown): string | null {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const { message } = payload as { message: unknown }
    if (typeof message === 'string') return message
  }
  return null
}

/** some endpoints answer with no body, and a dead proxy answers with html */
function parse(text: string): unknown {
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // the session comes back as a cookie, not in the body
    body: JSON.stringify(body),
  })

  const payload = parse(await res.text())
  if (!res.ok) throw new Error(messageOf(payload) ?? `request failed (${res.status})`)

  return payload as T
}

async function get<T>(path: string): Promise<T> {
    const res = await fetch(BASE + path, {
      credentials: 'include', // the session lives in the cookie
    })

    const payload = parse(await res.text())
    if (!res.ok) throw new Error(messageOf(payload) ?? `request failed (${res.status})`)

    return payload as T
  }

  export const me = () => get<User>('/user/me')

export const login = (credentials: Credentials) => post<AuthResult>('/user/login', credentials)

export const register = (credentials: Credentials) => post<AuthResult>('/user/create', credentials)
