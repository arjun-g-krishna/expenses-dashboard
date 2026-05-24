import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import {
  currentMonth,
  formatDate,
  formatMoney,
  formatMonthLabel,
  toInputDate,
} from '../lib/format'
import { EXPENSE_CATEGORIES } from '../lib/constants'
import type { Expense } from '../types'
import { useAuth } from '../context/AuthContext'
import { MonthPicker } from '../components/MonthPicker'
import { Modal } from '../components/Modal'

type ExpenseForm = {
  title: string
  amount: string
  expense_date: string
  category: string
  notes: string
}

const emptyForm: ExpenseForm = {
  title: '',
  amount: '',
  expense_date: new Date().toISOString().slice(0, 10),
  category: EXPENSE_CATEGORIES[0],
  notes: '',
}

export function ExpensesPage() {
  const { isAdmin } = useAuth()
  const [month, setMonth] = useState(currentMonth)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [list, setList] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .getExpenses(month, categoryFilter || undefined)
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [month, categoryFilter])

  const total = list.reduce((s, e) => s + e.amount, 0)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(e: Expense) {
    setEditing(e)
    setForm({
      title: e.title,
      amount: String(e.amount),
      expense_date: toInputDate(e.expense_date),
      category: e.category,
      notes: e.notes,
    })
    setError('')
    setModalOpen(true)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this expense?')) return
    try {
      await api.deleteExpense(id)
      load()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Delete failed')
    }
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      expense_date: new Date(form.expense_date).toISOString(),
      category: form.category,
      notes: form.notes,
    }
    try {
      if (editing) {
        await api.updateExpense(editing.id, payload)
      } else {
        await api.createExpense(payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Expenses</h1>
          <p className="mt-1 text-muted">
            {formatMonthLabel(month)} · {formatMoney(total)} spent
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <MonthPicker value={month} onChange={setMonth} />
          {isAdmin && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Add expense
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Category
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
        {loading ? (
          <p className="p-8 text-center text-muted">Loading…</p>
        ) : list.length === 0 ? (
          <p className="p-8 text-center text-muted">No expenses for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-border/20 text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((e) => (
                  <tr key={e.id} className="hover:bg-border/10">
                    <td className="px-4 py-3">
                      <p className="font-medium">{e.title}</p>
                      {e.notes && <p className="text-xs text-muted">{e.notes}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-border/40 px-2.5 py-0.5 text-xs">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(e.expense_date)}</td>
                    <td className="px-4 py-3 text-right font-medium text-negative">
                      {formatMoney(e.amount)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(e)}
                            className="rounded-lg p-2 text-muted hover:bg-border/50 hover:text-foreground"
                            aria-label="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(e.id)}
                            className="rounded-lg p-2 text-muted hover:bg-negative/10 hover:text-negative"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        title={editing ? 'Edit expense' : 'Add expense'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-negative/10 px-3 py-2 text-sm text-negative">{error}</p>
          )}
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Title *
            </span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="field-input mt-1 w-full"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Amount *
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="field-input mt-1 w-full"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Date *
              </span>
              <input
                type="date"
                required
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                className="field-input mt-1 w-full"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Category *
            </span>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="field-input mt-1 w-full"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Notes</span>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="field-input mt-1 w-full resize-none"
            />
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
