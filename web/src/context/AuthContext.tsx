import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../lib/api'
import {
  clearToken,
  decodeToken,
  getClaims,
  isAdminRole,
  setToken,
} from '../lib/auth'
import type { JwtClaims } from '../types'

interface AuthContextValue {
  claims: JwtClaims | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<JwtClaims | null>(() => getClaims())

  const login = useCallback(async (username: string, password: string) => {
    const { token } = await api.login(username, password)
    setToken(token)
    const decoded = decodeToken(token)
    if (!decoded) throw new Error('Invalid token received')
    setClaims(decoded)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setClaims(null)
  }, [])

  const value = useMemo(
    () => ({
      claims,
      isAuthenticated: Boolean(claims),
      isAdmin: claims ? isAdminRole(claims.role) : false,
      login,
      logout,
    }),
    [claims, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
