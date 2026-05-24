import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import {
  currentMonth,
  formatDate,
  formatMoney,
  formatMonthLabel,
  monthFromDate,
  toInputDate,
} from '../lib/format'
import { PAYMENT_METHODS } from '../lib/constants'
import type { Contribution } from '../types'
import { useAuth } from '../context/AuthContext'
import { MonthPicker } from '../components/MonthPicker'
import { Modal } from '../components/Modal'

const emptyForm = {
  contributor_name: '',
  amount: '',
  contribution_date: new Date().toISOString().slice(0, 10),
  month: currentMonth(),
  payment_method: '',
  notes: '',
}

export function ContributionsPage() {
  const { isAdmin } = useAuth()
  const [month, setMonth] = useState(currentMonth)
  const [list, setList] = useState<Contribution[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Contribution | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .getContributions(month)
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [month])

  const filtered = list.filter((c) =>
    c.contributor_name.toLowerCase().includes(search.toLowerCase()),
  )

  const total = filtered.reduce((s, c) => s + c.amount, 0)

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, month })
    setError('')
    setModalOpen(true)
  }

  function openEdit(c: Contribution) {
    setEditing(c)
    setForm({
      contributor_name: c.contributor_name,
      amount: String(c.amount),
      contribution_date: toInputDate(c.contribution_date),
      month: c.month,
      payment_method: c.payment_method,
      notes: c.notes,
    })
    setError('')
    setModalOpen(true)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this contribution?')) return
    try {
      await api.deleteContribution(id)
      load()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Delete failed')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      contributor_name: form.contributor_name.trim(),
      amount: parseFloat(form.amount),
      contribution_date: new Date(form.contribution_date).toISOString(),
      month: form.month || monthFromDate(form.contribution_date),
      payment_method: form.payment_method,
      notes: form.notes,
    }
    try {
      if (editing) {
        await api.updateContribution(editing.id, payload)
      } else {
        await api.createContribution(payload)
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
          <h1 className="font-display text-3xl sm:text-4xl">Contributions</h1>
          <p className="mt-1 text-muted">
            {formatMonthLabel(month)} · {formatMoney(total)} collected
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
              Add contribution
            </button>
          )}
        </div>
      </header>

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-elevated py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
        {loading ? (
          <p className="p-8 text-center text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-muted">No contributions for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-border/20 text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-medium">Contributor</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-border/10">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.contributor_name}</p>
                      {c.notes && <p className="text-xs text-muted">{c.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(c.contribution_date)}</td>
                    <td className="px-4 py-3 text-muted">{c.payment_method || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-positive">
                      {formatMoney(c.amount)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="rounded-lg p-2 text-muted hover:bg-border/50 hover:text-foreground"
                            aria-label="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
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
        title={editing ? 'Edit contribution' : 'Add contribution'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-negative/10 px-3 py-2 text-sm text-negative">{error}</p>
          )}
          <Field label="Contributor name" required>
            <input
              required
              value={form.contributor_name}
              onChange={(e) => setForm({ ...form, contributor_name: e.target.value })}
              className="field-input"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount" required>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="field-input"
              />
            </Field>
            <Field label="Date" required>
              <input
                type="date"
                required
                value={form.contribution_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contribution_date: e.target.value,
                    month: monthFromDate(e.target.value),
                  })
                }
                className="field-input"
              />
            </Field>
          </div>
          <Field label="Payment method">
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="field-input"
            >
              <option value="">—</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="field-input resize-none"
            />
          </Field>
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

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
        {required && ' *'}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
