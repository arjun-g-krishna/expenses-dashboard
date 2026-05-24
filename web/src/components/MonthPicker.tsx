import { formatMonthLabel } from '../lib/format'

interface MonthPickerProps {
  value: string
  onChange: (month: string) => void
  className?: string
}

export function MonthPicker({ value, onChange, className = '' }: MonthPickerProps) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-wider text-muted">
        Period
      </span>
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        aria-label={`Selected month: ${formatMonthLabel(value)}`}
      />
    </label>
  )
}
