import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PageHeader({ title, subtitle, breadcrumb, actions }: { title: ReactNode; subtitle?: ReactNode; breadcrumb?: { label: string; to?: string }[]; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        {breadcrumb && (
          <div className="mb-1 flex items-center gap-1 text-xs text-ink-500">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {b.to ? <Link to={b.to} className="hover:text-brand-600">{b.label}</Link> : <span>{b.label}</span>}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function ProgressBar({ pct, tone = 'brand' }: { pct: number; tone?: 'brand' | 'success' | 'warning' | 'danger' }) {
  const cls = { brand: 'bg-brand-600', success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500' }[tone]
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
      <div className={`h-full rounded-full ${cls}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}
