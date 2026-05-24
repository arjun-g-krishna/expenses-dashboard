import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../lib/api'
import { getClaims } from '../lib/auth'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  if (getClaims()) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (showRegister) {
        await api.register(username, password)
        await login(username, password)
      } else {
        await login(username, password)
      }
      navigate('/')
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : 'Something went wrong. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="grain" aria-hidden />
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl">Contribution Tracker</h1>
          <p className="mt-2 text-muted">
            Track group contributions, expenses, and remaining budget.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface-elevated p-8 shadow-lg"
        >
          <h2 className="font-display text-2xl">
            {showRegister ? 'Create account' : 'Sign in'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {showRegister
              ? 'Create a new viewer account.'
              : 'Use your dashboard credentials.'}
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-negative/10 px-3 py-2 text-sm text-negative" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Username
              </span>
              <input
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Password
              </span>
              <input
                type="password"
                autoComplete={showRegister ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : showRegister ? 'Register & sign in' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowRegister((s) => !s)
              setError('')
            }}
            className="mt-4 w-full text-center text-sm text-muted transition hover:text-accent"
          >
            {showRegister
              ? 'Already have an account? Sign in'
              : 'Need an account? Register'}
          </button>
        </form>
      </div>
    </div>
  )
}
