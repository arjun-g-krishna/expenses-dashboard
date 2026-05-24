import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { HandCoins, Receipt, Wallet, TrendingUp } from 'lucide-react'
import { api } from '../lib/api'
import { currentMonth, formatDate, formatMoney, formatMonthLabel } from '../lib/format'
import type {
  CategoryBreakdown,
  Contribution,
  DashboardSummary,
  Expense,
  MonthlyTrend,
} from '../types'
import { MonthPicker } from '../components/MonthPicker'
import { StatCard } from '../components/StatCard'

const CHART_COLORS = ['#0f766e', '#b45309', '#6366f1', '#be123c', '#7c3aed', '#0891b2']

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [trend, setTrend] = useState<MonthlyTrend[]>([])
  const [categories, setCategories] = useState<CategoryBreakdown[]>([])
  const [recentContributions, setRecentContributions] = useState<Contribution[]>([])
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([
      api.getDashboard(month),
      api.getMonthlyTrend(),
      api.getCategoryBreakdown(month),
      api.getContributions(month),
      api.getExpenses(month),
    ])
      .then(([dash, trendData, catData, contribs, expenses]) => {
        if (cancelled) return
        setSummary(dash)
        setTrend(trendData)
        setCategories(catData)
        setRecentContributions(contribs)
        setRecentExpenses(expenses)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [month])

  const contributorTotals = recentContributions.reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.contributor_name] = (acc[c.contributor_name] ?? 0) + c.amount
      return acc
    },
    {},
  )

  const contributorChart = Object.entries(contributorTotals).map(([name, total]) => ({
    name,
    total,
  }))

  const trendChart = trend.map((t) => ({
    ...t,
    label: formatMonthLabel(t.month).split(' ')[0],
  }))

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        Loading dashboard…
      </div>
    )
  }

  if (error || !summary) {
    return (
      <p className="rounded-xl border border-negative/30 bg-negative/10 px-4 py-3 text-negative">
        {error || 'Unable to load dashboard'}
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Overview</h1>
          <p className="mt-1 text-muted">{formatMonthLabel(month)}</p>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          className="animate-fade-up stagger-1"
          label="Total contributions"
          value={formatMoney(summary.total_contributions)}
          icon={<HandCoins size={18} />}
          tone="positive"
        />
        <StatCard
          className="animate-fade-up stagger-2"
          label="Total expenses"
          value={formatMoney(summary.total_expenses)}
          icon={<Receipt size={18} />}
          tone="negative"
        />
        <StatCard
          className="animate-fade-up stagger-3"
          label="Remaining budget"
          value={formatMoney(summary.remaining_budget)}
          icon={<Wallet size={18} />}
          tone={summary.remaining_budget >= 0 ? 'accent' : 'negative'}
        />
        <StatCard
          className="animate-fade-up stagger-4"
          label="Avg. contribution"
          value={formatMoney(summary.average_contribution)}
          hint={`${summary.contributions_count} contributions · ${summary.expenses_count} expenses`}
          icon={<TrendingUp size={18} />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Budget trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
                formatter={(v) => formatMoney(Number(v ?? 0))}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="contributions"
                name="Contributions"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expenses by category">
          {categories.length === 0 ? (
            <EmptyChart message="No expenses this month" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(props) => {
                    const name = String(props.name ?? '')
                    const pct = ((props.percent ?? 0) * 100).toFixed(0)
                    return `${name} ${pct}%`
                  }}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(Number(v ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {contributorChart.length > 0 && (
          <ChartCard title="Contributors this month" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={contributorChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                <Tooltip formatter={(v) => formatMoney(Number(v ?? 0))} />
                <Bar dataKey="total" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RecentTable
          title="Recent contributions"
          empty="No contributions yet"
          rows={recentContributions.slice(0, 5).map((c) => ({
            primary: c.contributor_name,
            secondary: formatDate(c.contribution_date),
            amount: c.amount,
          }))}
        />
        <RecentTable
          title="Recent expenses"
          empty="No expenses yet"
          rows={recentExpenses.slice(0, 5).map((e) => ({
            primary: e.title,
            secondary: e.category,
            amount: -e.amount,
          }))}
        />
      </section>
    </div>
  )
}

function ChartCard({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={`rounded-2xl border border-border bg-surface-elevated p-5 ${className}`}
    >
      <h2 className="mb-4 font-display text-xl">{title}</h2>
      {children}
    </article>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted">
      {message}
    </div>
  )
}

function RecentTable({
  title,
  rows,
  empty,
}: {
  title: string
  rows: { primary: string; secondary: string; amount: number }[]
  empty: string
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface-elevated p-5">
      <h2 className="mb-4 font-display text-xl">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row, i) => (
            <li key={i} className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <div className="min-w-0">
                <p className="truncate font-medium">{row.primary}</p>
                <p className="text-sm text-muted">{row.secondary}</p>
              </div>
              <p
                className={`shrink-0 font-medium ${
                  row.amount >= 0 ? 'text-positive' : 'text-negative'
                }`}
              >
                {row.amount >= 0 ? '+' : ''}
                {formatMoney(Math.abs(row.amount))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
