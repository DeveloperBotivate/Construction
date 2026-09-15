import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, cls } from '../../lib/utils'
import type { AttendanceRecord } from '../../types'

function laborCost(a: AttendanceRecord): number {
  const overtime = a.overtimeHours > 0 ? (a.wageRate / 8) * a.overtimeHours * 1.5 : 0
  return a.wageRate + overtime
}

export default function Labour() {
  const user = useStore(s => s.currentUser!)
  const attendance = useStore(s => s.attendance)
  const selectedProjectId = useStore(s => s.selectedProjectId)

  const scoped = useMemo(() => {
    if (user.role === 'MD') return attendance
    return attendance.filter(a => a.projectId === selectedProjectId)
  }, [attendance, selectedProjectId, user.role])

  const allDates = useMemo(() => Array.from(new Set(scoped.map(a => a.date.slice(0, 10)))).sort(), [scoped])
  const [from, setFrom] = useState(allDates[0] ?? '')
  const [to, setTo] = useState(allDates[allDates.length - 1] ?? '')

  const inRange = useMemo(() => scoped.filter(a => {
    const d = a.date.slice(0, 10)
    return (!from || d >= from) && (!to || d <= to)
  }), [scoped, from, to])

  const rollup = useMemo(() => {
    const map = new Map<string, { category: string; headcount: number; cost: number }>()
    for (const a of inRange) {
      const entry = map.get(a.category) ?? { category: a.category, headcount: 0, cost: 0 }
      entry.headcount += 1
      entry.cost += laborCost(a)
      map.set(a.category, entry)
    }
    return Array.from(map.values()).sort((a, b) => b.cost - a.cost)
  }, [inRange])

  const totalCost = rollup.reduce((s, r) => s + r.cost, 0)
  const totalHeadcount = rollup.reduce((s, r) => s + r.headcount, 0)
  const maxCost = Math.max(1, ...rollup.map(r => r.cost))

  return (
    <div>
      <PageHeader title="Labour Cost Rollup" subtitle="Headcount and wage cost by category across a date range." />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-md border border-ink-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-md border border-ink-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Total</p>
          <p className="text-lg font-semibold text-ink-900">{fmtCurrency(totalCost)} <span className="text-sm font-normal text-ink-500">/ {totalHeadcount} man-days</span></p>
        </div>
      </div>

      {rollup.length === 0 ? (
        <EmptyState message="No attendance records in this date range." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="By Category">
            <div className="overflow-x-auto rounded-lg border border-ink-200">
              <table className="min-w-full divide-y divide-ink-200 text-sm">
                <thead className="bg-ink-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Headcount</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 bg-white">
                  {rollup.map(r => (
                    <tr key={r.category}>
                      <td className="px-3 py-2 font-medium text-ink-800">{r.category}</td>
                      <td className="px-3 py-2 text-ink-600">{r.headcount}</td>
                      <td className="px-3 py-2 text-ink-600">{fmtCurrency(r.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Cost Breakdown">
            <div className="space-y-3">
              {rollup.map(r => (
                <div key={r.category}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-ink-700">{r.category}</span>
                    <span className="text-ink-500">{fmtCurrency(r.cost)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                    <div className={cls('h-full rounded-full bg-brand-600')} style={{ width: `${Math.max(2, (r.cost / maxCost) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}
