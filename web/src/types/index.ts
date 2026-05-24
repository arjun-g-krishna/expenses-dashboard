export interface User {
  id: number
  username: string
  role: string
  created_at: string
}

export interface Contribution {
  id: number
  contributor_name: string
  amount: number
  contribution_date: string
  month: string
  payment_method: string
  notes: string
  created_at: string
}

export interface Expense {
  id: number
  title: string
  amount: number
  category: string
  expense_date: string
  notes: string
  created_at: string
}

export interface DashboardSummary {
  total_contributions: number
  total_expenses: number
  remaining_budget: number
  contributions_count: number
  expenses_count: number
  average_contribution: number
}

export interface MonthlyTrend {
  month: string
  contributions: number
  expenses: number
  balance: number
}

export interface CategoryBreakdown {
  category: string
  total: number
}

export interface JwtClaims {
  user_id: number
  username: string
  role: string
  exp: number
}
