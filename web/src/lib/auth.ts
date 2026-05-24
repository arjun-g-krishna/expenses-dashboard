import { jwtDecode } from 'jwt-decode'
import type { JwtClaims } from '../types'
import { ADMIN_ROLE } from './constants'

const TOKEN_KEY = 'ect_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function decodeToken(token: string): JwtClaims | null {
  try {
    return jwtDecode<JwtClaims>(token)
  } catch {
    return null
  }
}

export function getClaims(): JwtClaims | null {
  const token = getToken()
  if (!token) return null
  const claims = decodeToken(token)
  if (!claims) return null
  if (claims.exp * 1000 < Date.now()) {
    clearToken()
    return null
  }
  return claims
}

export function isAdminRole(role: string): boolean {
  return role === ADMIN_ROLE
}
