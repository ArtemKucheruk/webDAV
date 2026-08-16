import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthForm } from '@/components/AuthForm'
import { login } from '@/lib/api'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/account'

  return (
    <div className="auth-in relative z-10 flex min-h-svh justify-center px-pad pt-[20svh]">
      <AuthForm
        title="sign in"
        action="sign in"
        autoComplete="current-password"
        onSubmit={async (credentials) => {
          await login(credentials)
          navigate(from, { replace: true })
        }}
        footer={
          <>
            no account yet?{' '}
            <Link to="/register" className="text-ink transition-colors hover:text-ink-2">
              register
            </Link>
          </>
        }
      />
    </div>
  )
}
