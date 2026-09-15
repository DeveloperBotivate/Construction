import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { HandCoins } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fmtCurrency, daysBetween } from '../../lib/utils'
import type { RABill } from '../../types'

export default function Receivables() {
  const navigate = useNavigate()
  const raBills = useStore(s => s.raBills)
  const projects = useStore(s => s.projects)

  function projectName(id: string) { return projects.find(p => p.id === id)?.name ?? '-' }

  const outstandingBills = useMemo(
    () => raBills
      .map(b => ({ ...b, outstanding: b.netAmount - b.receivedAmount }))
      .filter(b => b.outstanding > 0)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [raBills]
  )

  const totalOutstanding = outstandingBills.reduce((sum, b) => sum + b.outstanding, 0)

  const aging = useMemo(() => {
    const buckets = { d30: 0, d60: 0, d60plus: 0 }
    for (const b of outstandingBills) {
      const age = daysBetween(b.createdAt, new Date().toISOString())
      if (age <= 30) buckets.d30 += b.outstanding
      else if (age <= 60) buckets.d60 += b.outstanding
      else buckets.d60plus += b.outstanding
    }
    return buckets
  }, [outstandingBills])

  const columns: Column<RABill & { outstanding: number }>[] = [
    { key: 'raNumber', header: 'RA Bill', render: r => <span className="font-medium text-ink-800">{r.raNumber}</span>, sortValue: r => r.raNumber },
    { key: 'project', header: 'Project', render: r => projectName(r.projectId) },
    { key: 'netAmount', header: 'Net Amount', render: r => fmtCurrency(r.netAmount), sortValue: r => r.netAmount, hideBelow: 'sm' },
    { key: 'receivedAmount', header: 'Received', render: r => fmtCurrency(r.receivedAmount), sortValue: r => r.receivedAmount, hideBelow: 'sm' },
    { key: 'outstanding', header: 'Outstanding', render: r => <span className="font-semibold text-red-600">{fmtCurrency(r.outstanding)}</span>, sortValue: r => r.outstanding },
    { key: 'age', header: 'Age (days)', render: r => daysBetween(r.createdAt, new Date().toISOString()), sortValue: r => daysBetween(r.createdAt, new Date().toISOString()) },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader title="Receivables" subtitle="Outstanding client receivables across all RA bills." />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Outstanding" value={fmtCurrency(totalOutstanding)} tone="danger" icon={<HandCoins className="h-4 w-4" />} />
        <KpiCard label="0-30 Days" value={fmtCurrency(aging.d30)} />
        <KpiCard label="31-60 Days" value={fmtCurrency(aging.d60)} tone="warning" />
        <KpiCard label="60+ Days" value={fmtCurrency(aging.d60plus)} tone="danger" />
      </div>

      <SectionCard title={`Outstanding RA Bills (${outstandingBills.length})`}>
        <DataTable
          columns={columns}
          data={outstandingBills}
          keyField={r => r.id}
          onRowClick={r => navigate(`/ra-bills/${r.id}`)}
          emptyMessage="No outstanding receivables. All RA bills are fully collected."
          emptyIcon={<HandCoins className="h-8 w-8" />}
        />
      </SectionCard>
    </div>
  )
}
