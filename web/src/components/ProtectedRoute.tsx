import { Navigate, Outlet } from 'react-router-dom'
import { getClaims } from '../lib/auth'

export function ProtectedRoute() {
  const claims = getClaims()
  if (!claims) return <Navigate to="/login" replace />
  return <Outlet />
}
