import { useNavigate } from 'react-router-dom'
import { Landmark, ScrollText, Layers, FileCheck2, Receipt, HandCoins } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getBoqProgressPct } from '../../store/selectors'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency } from '../../lib/utils'

export default function BillingDashboard() {
  const navigate = useNavigate()
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const clients = useStore(s => s.clients)
  const contracts = useStore(s => s.contracts)
  const allBoqItems = useStore(s => s.boqItems)
  const boqItems = allBoqItems.filter(b => b.projectId === selectedProjectId)
  const measurements = useStore(s => s.measurements)
  const raBills = useStore(s => s.raBills)
  const store = useStore(s => s)

  const pendingMeasurements = measurements.filter(m => m.status !== 'APPROVED')
  const recentMeasurements = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  const invoicedBills = raBills.filter(b => !!b.invoiceNumber)
  const outstandingBills = raBills.map(b => ({ ...b, outstanding: b.netAmount - b.receivedAmount })).filter(b => b.outstanding > 0)
  const totalOutstanding = outstandingBills.reduce((sum, b) => sum + b.outstanding, 0)

  const raStatusCounts: Record<string, number> = {}
  for (const b of raBills) raStatusCounts[b.status] = (raStatusCounts[b.status] ?? 0) + 1

  return (
    <div>
      <PageHeader title="Billing Dashboard" subtitle="Client billing, BOQ progress, RA bills and receivables." />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Clients" value={clients.length} icon={<Landmark className="h-4 w-4" />} />
        <KpiCard label="Contracts" value={contracts.length} icon={<ScrollText className="h-4 w-4" />} />
        <KpiCard label="Measurements Pending" value={pendingMeasurements.length} tone="warning" icon={<Layers className="h-4 w-4" />} />
        <KpiCard label="RA Bills" value={raBills.length} icon={<FileCheck2 className="h-4 w-4" />} />
        <KpiCard label="Client Invoices" value={invoicedBills.length} icon={<Receipt className="h-4 w-4" />} />
        <KpiCard label="Total Outstanding" value={fmtCurrency(totalOutstanding)} tone="danger" icon={<HandCoins className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="BOQ Progress" actions={<button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => navigate('/boq')}>View BOQ</button>}>
          {boqItems.length === 0 ? <EmptyState message="No BOQ items for this project." /> : (
            <ul className="space-y-3">
              {boqItems.map(b => {
                const pct = getBoqProgressPct(store, b.id)
                return (
                  <li key={b.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-ink-700">{b.description}</span>
                      <span className="font-medium text-ink-800">{pct}%</span>
                    </div>
                    <ProgressBar pct={pct} tone={pct >= 100 ? 'success' : pct >= 75 ? 'warning' : 'brand'} />
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="RA Bills by Status" actions={<button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => navigate('/bills-payments')}>View all</button>}>
          {Object.keys(raStatusCounts).length === 0 ? <EmptyState message="No RA bills yet." /> : (
            <ul className="divide-y divide-ink-100">
              {Object.entries(raStatusCounts).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between py-2.5">
                  <StatusBadge status={status} />
                  <span className="text-sm font-semibold text-ink-800">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Measurements" actions={<button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => navigate('/measurements')}>View all</button>}>
          {recentMeasurements.length === 0 ? <EmptyState message="No measurements recorded yet." /> : (
            <ul className="divide-y divide-ink-100">
              {recentMeasurements.map(m => (
                <li key={m.id} className="flex items-center justify-between cursor-pointer py-2.5 hover:bg-ink-50" onClick={() => navigate(`/measurements/${m.id}`)}>
                  <div>
                    <p className="text-sm font-medium text-ink-800">{m.measurementNumber}</p>
                    <p className="text-xs text-ink-500">Qty {m.currentQty} &middot; {fmtCurrency(m.amount)}</p>
                  </div>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Receivables" actions={<button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => navigate('/receivables')}>Open receivables</button>}>
          {outstandingBills.length === 0 ? <EmptyState message="No outstanding receivables." icon={<HandCoins className="h-8 w-8" />} /> : (
            <ul className="divide-y divide-ink-100">
              {outstandingBills.slice(0, 5).map(b => (
                <li key={b.id} className="flex items-center justify-between cursor-pointer py-2.5 hover:bg-ink-50" onClick={() => navigate(`/ra-bills/${b.id}`)}>
                  <span className="text-sm text-ink-700">{b.raNumber}</span>
                  <span className="text-sm font-semibold text-red-600">{fmtCurrency(b.outstanding)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
