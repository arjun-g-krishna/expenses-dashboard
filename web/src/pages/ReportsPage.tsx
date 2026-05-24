import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { api } from '../lib/api'
import { downloadCsv } from '../lib/csv'
import {
  currentMonth,
  formatDate,
  formatMoney,
  formatMonthLabel,
} from '../lib/format'
import type { Contribution, DashboardSummary, Expense } from '../types'
import { MonthPicker } from '../components/MonthPicker'
import { StatCard } from '../components/StatCard'

export function ReportsPage() {
  const [month, setMonth] = useState(currentMonth)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getDashboard(month),
      api.getContributions(month),
      api.getExpenses(month),
    ])
      .then(([dash, contribs, exps]) => {
        setSummary(dash)
        setContributions(contribs)
        setExpenses(exps)
      })
      .finally(() => setLoading(false))
  }, [month])

  function exportContributions() {
    downloadCsv(`contributions-${month}.csv`, ['Name', 'Amount', 'Date', 'Payment', 'Notes'], [
      ...contributions.map((c) => [
        c.contributor_name,
        String(c.amount),
        formatDate(c.contribution_date),
        c.payment_method,
        c.notes,
      ]),
    ])
  }

  function exportExpenses() {
    downloadCsv(`expenses-${month}.csv`, ['Title', 'Amount', 'Category', 'Date', 'Notes'], [
      ...expenses.map((e) => [
        e.title,
        String(e.amount),
        e.category,
        formatDate(e.expense_date),
        e.notes,
      ]),
    ])
  }

  function exportSummary() {
    if (!summary) return
    downloadCsv(`report-${month}.csv`, ['Metric', 'Value'], [
      ['Month', formatMonthLabel(month)],
      ['Total contributions', String(summary.total_contributions)],
      ['Total expenses', String(summary.total_expenses)],
      ['Remaining budget', String(summary.remaining_budget)],
      ['Contributions count', String(summary.contributions_count)],
      ['Expenses count', String(summary.expenses_count)],
      ['Average contribution', String(summary.average_contribution)],
    ])
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Reports</h1>
          <p className="mt-1 text-muted">Export monthly financial data</p>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </header>

      {loading || !summary ? (
        <p className="text-muted">Loading report…</p>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Contributions"
              value={formatMoney(summary.total_contributions)}
              hint={`${summary.contributions_count} records`}
              tone="positive"
            />
            <StatCard
              label="Expenses"
              value={formatMoney(summary.total_expenses)}
              hint={`${summary.expenses_count} records`}
              tone="negative"
            />
            <StatCard
              label="Balance"
              value={formatMoney(summary.remaining_budget)}
              tone={summary.remaining_budget >= 0 ? 'accent' : 'negative'}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="Monthly summary"
              description="One-row overview with totals and counts"
              onExport={exportSummary}
            />
            <ExportCard
              title="Contribution history"
              description={`${contributions.length} rows for ${formatMonthLabel(month)}`}
              onExport={exportContributions}
              disabled={contributions.length === 0}
            />
            <ExportCard
              title="Expense history"
              description={`${expenses.length} rows for ${formatMonthLabel(month)}`}
              onExport={exportExpenses}
              disabled={expenses.length === 0}
            />
          </section>
        </>
      )}
    </div>
  )
}

function ExportCard({
  title,
  description,
  onExport,
  disabled,
}: {
  title: string
  description: string
  onExport: () => void
  disabled?: boolean
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface-elevated p-5">
      <h2 className="font-display text-xl">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-muted">{description}</p>
      <button
        type="button"
        onClick={onExport}
        disabled={disabled}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition hover:bg-border/30 disabled:opacity-50"
      >
        <Download size={16} />
        Download CSV
      </button>
    </article>
  )
}
