import type { ReactNode } from 'react'
import { cls } from '../../lib/utils'

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return <div className={cls('rounded-xl border border-ink-200 bg-white shadow-sm', padded && 'p-5', className)}>{children}</div>
}

export function KpiCard({ label, value, sub, tone = 'neutral', icon }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'brand'; icon?: ReactNode }) {
  const toneCls: Record<string, string> = {
    neutral: 'text-ink-900', success: 'text-emerald-700', danger: 'text-red-700', warning: 'text-amber-700', brand: 'text-brand-700',
  }
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</span>
        {icon && <span className="text-ink-400">{icon}</span>}
      </div>
      <span className={cls('text-2xl font-semibold', toneCls[tone])}>{value}</span>
      {sub && <span className="text-xs text-ink-500">{sub}</span>}
    </Card>
  )
}

export function SectionCard({ title, actions, children, className }: { title: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
        {actions}
      </div>
      {children}
    </Card>
  )
}
