/**
 * Re-exports sample data from the repo-level tests/fixtures directory.
 * Use for component tests, Storybook, or local UI development without the API.
 */
import contributions from '../../../tests/fixtures/contributions.json'
import expenses from '../../../tests/fixtures/expenses.json'
import users from '../../../tests/fixtures/users.json'
import dashboardByMonth from '../../../tests/fixtures/dashboard-summary.json'
import monthlyTrend from '../../../tests/fixtures/monthly-trend.json'
import categoryBreakdownByMonth from '../../../tests/fixtures/category-breakdown.json'

import type {
  CategoryBreakdown,
  Contribution,
  DashboardSummary,
  Expense,
  MonthlyTrend,
} from '../types'

export const sampleUsers = users
export const sampleContributions = contributions as Contribution[]
export const sampleExpenses = expenses as Expense[]
export const sampleMonthlyTrend = monthlyTrend as MonthlyTrend[]

export function sampleDashboard(month: string): DashboardSummary {
  const map = dashboardByMonth as Record<string, DashboardSummary>
  return map[month] ?? map['2026-05']
}

export function sampleCategories(month: string): CategoryBreakdown[] {
  const map = categoryBreakdownByMonth as Record<string, CategoryBreakdown[]>
  return map[month] ?? []
}
