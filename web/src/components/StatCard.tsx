import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'positive' | 'negative' | 'accent'
  className?: string
}

const toneClasses = {
  default: 'text-foreground',
  positive: 'text-positive',
  negative: 'text-negative',
  accent: 'text-accent',
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  className = '',
}: StatCardProps) {
  return (
    <article
      className={`rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
        {icon && (
          <span className="rounded-lg bg-accent-muted/60 p-2 text-accent">{icon}</span>
        )}
      </div>
      <p className={`mt-3 font-display text-3xl leading-none ${toneClasses[tone]}`}>
        {value}
      </p>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </article>
  )
}
