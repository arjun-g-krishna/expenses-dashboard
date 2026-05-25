import { clearToken, getToken } from './auth'
import type {
  CategoryBreakdown,
  Contribution,
  DashboardSummary,
  Expense,
  MonthlyTrend,
  User,
} from '../types'

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    if (path !== '/api/login' && path !== '/api/register') {
      window.location.href = '/login'
      throw new ApiError(401, 'Session expired')
    }
  }

  if (res.status === 204) return undefined as T

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (body as { error?: string }).error ?? res.statusText
    throw new ApiError(res.status, msg)
  }
  return body as T
}

export const api = {
  login(username: string, password: string) {
    return request<{ token: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  register(username: string, password: string) {
    return request<User>('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  getDashboard(month: string) {
    return request<DashboardSummary>(`/api/dashboard?month=${encodeURIComponent(month)}`)
  },

  getMonthlyTrend() {
    return request<MonthlyTrend[]>('/api/analytics/trend')
  },

  getCategoryBreakdown(month: string) {
    return request<CategoryBreakdown[]>(
      `/api/analytics/categories?month=${encodeURIComponent(month)}`,
    )
  },

  getContributions(month?: string) {
    const q = month ? `?month=${encodeURIComponent(month)}` : ''
    return request<Contribution[]>(`/api/contributions${q}`)
  },

  createContribution(data: Omit<Contribution, 'id' | 'created_at'>) {
    return request<Contribution>('/api/contributions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateContribution(id: number, data: Omit<Contribution, 'id' | 'created_at'>) {
    return request<Contribution>(`/api/contributions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteContribution(id: number) {
    return request<void>(`/api/contributions/${id}`, { method: 'DELETE' })
  },

  getExpenses(month?: string, category?: string) {
    const params = new URLSearchParams()
    if (month) params.set('month', month)
    if (category) params.set('category', category)
    const q = params.toString() ? `?${params}` : ''
    return request<Expense[]>(`/api/expenses${q}`)
  },

  createExpense(data: Omit<Expense, 'id' | 'created_at'>) {
    return request<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateExpense(id: number, data: Omit<Expense, 'id' | 'created_at'>) {
    return request<Expense>(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteExpense(id: number) {
    return request<void>(`/api/expenses/${id}`, { method: 'DELETE' })
  },
}

export { ApiError }
