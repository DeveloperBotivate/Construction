import { useMemo } from 'react'
import { ClipboardList, Layers, Receipt, FolderKanban } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, fmtDate } from '../../lib/utils'

export default function SubcontractorDashboard() {
  const state = useStore()
  const user = state.currentUser!

  const subcontractor = useMemo(() => state.subcontractors.find(sc => user.designation.includes(sc.name)), [state.subcontractors, user.designation])

  const workOrders = useMemo(() => subcontractor ? state.workOrders.filter(w => w.subcontractorId === subcontractor.id) : state.workOrders, [state.workOrders, subcontractor])
  const measurements = useMemo(() => subcontractor ? state.measurements.filter(m => m.subcontractorId === subcontractor.id) : state.measurements.filter(m => !!m.subcontractorId), [state.measurements, subcontractor])
  const bills = useMemo(() => subcontractor ? state.subcontractorBills.filter(b => b.subcontractorId === subcontractor.id) : state.subcontractorBills, [state.subcontractorBills, subcontractor])
  const documents = useMemo(() => subcontractor ? state.documents.filter(d => d.subcontractorId === subcontractor.id) : state.documents.filter(d => !!d.subcontractorId), [state.documents, subcontractor])

  const woValue = workOrders.reduce((s, w) => s + w.value, 0)
  const billTotal = bills.reduce((s, b) => s + b.netPayable, 0)

  return (
    <div>
      <PageHeader
        title={subcontractor ? `${subcontractor.name} — Subcontractor Portal` : 'Subcontractor Portal'}
        subtitle={subcontractor ? `${subcontractor.trade} · ${subcontractor.contactPerson}` : 'Showing all subcontractor-facing records — no matching subcontractor profile found for your account.'}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Work Orders" value={workOrders.length} sub={fmtCurrency(woValue)} icon={<ClipboardList className="h-4 w-4" />} />
        <KpiCard label="Measurements" value={measurements.length} icon={<Layers className="h-4 w-4" />} />
        <KpiCard label="Bills" value={bills.length} sub={fmtCurrency(billTotal)} icon={<Receipt className="h-4 w-4" />} />
        <KpiCard label="Documents" value={documents.length} icon={<FolderKanban className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Work Orders">
          {workOrders.length === 0 ? <EmptyState message="No work orders issued yet." /> : (
            <ul className="space-y-2">
              {workOrders.map(w => (
                <li key={w.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{w.woNumber} &middot; {w.workPackage}</span>
                    <StatusBadge status={w.status} />
                  </div>
                  <p className="text-xs text-ink-500">{fmtCurrency(w.value)} &middot; {fmtDate(w.startDate)} &ndash; {fmtDate(w.endDate)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Measurements">
          {measurements.length === 0 ? <EmptyState message="No measurements recorded yet." /> : (
            <ul className="space-y-2">
              {measurements.map(m => (
                <li key={m.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{m.measurementNumber}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-xs text-ink-500">Current {m.currentQty} &middot; Cumulative {m.cumulativeQty} &middot; {fmtCurrency(m.amount)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Bills">
          {bills.length === 0 ? <EmptyState message="No bills submitted yet." /> : (
            <ul className="space-y-2">
              {bills.map(b => (
                <li key={b.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{b.billNumber}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-ink-500">Gross {fmtCurrency(b.grossAmount)} &middot; Net Payable {fmtCurrency(b.netPayable)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Documents">
          {documents.length === 0 ? <EmptyState message="No documents linked to your subcontractor profile." /> : (
            <ul className="space-y-2">
              {documents.map(d => (
                <li key={d.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{d.name}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-ink-500">{d.type} &middot; v{d.version}{d.expiryDate ? ` · Expires ${fmtDate(d.expiryDate)}` : ''}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
