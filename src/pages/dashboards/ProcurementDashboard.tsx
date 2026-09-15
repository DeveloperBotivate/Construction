import { useNavigate } from 'react-router-dom'
import { PackageSearch, FileSearch, BadgeCheck, ShieldCheck, FileSignature, Truck, TriangleAlert, Quote } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { deriveExceptions } from '../../store/selectors'
import { PageHeader } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { POStatus } from '../../types'

const PENDING_INDENT_STATUSES = ['PM_REVIEW', 'APPROVED', 'PROCUREMENT_PENDING']
const PO_STATUS_ORDER: POStatus[] = ['DRAFT', 'MGMT_APPROVAL_PENDING', 'APPROVED', 'ISSUED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED']

export default function ProcurementDashboard() {
  const navigate = useNavigate()
  const state = useStore(s => s)
  const { materialIndents, enquiries, vendorQuotations, purchaseOrders, dispatches, approvalTasks, materials, vendors } = state

  const pendingIndents = materialIndents.filter(i => PENDING_INDENT_STATUSES.includes(i.status))
  const openEnquiries = enquiries.filter(e => e.status !== 'CLOSED')
  const pendingQuotations = vendorQuotations.filter(q => q.technicalStatus === 'PENDING')
  const pendingPoTasks = approvalTasks.filter(t => t.module === 'po' && t.status === 'PENDING')
  const pendingPoRecordIds = Array.from(new Set(pendingPoTasks.map(t => t.recordId)))
  const activePOs = purchaseOrders.filter(po => po.status === 'ISSUED' || po.status === 'PARTIALLY_RECEIVED')
  const inTransitDispatches = dispatches.filter(d => d.status === 'IN_TRANSIT')
  const delayedExceptions = deriveExceptions(state).filter(e => e.type === 'DELAYED_DELIVERY' && e.status !== 'RESOLVED')

  const poByStatus = PO_STATUS_ORDER.map(status => ({ status, count: purchaseOrders.filter(po => po.status === status).length }))

  return (
    <div>
      <PageHeader title="Procurement Dashboard" subtitle="Indent-to-delivery pipeline: requirements, vendor sourcing, PO approvals and dispatch tracking." />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Pending Indents" value={pendingIndents.length} sub="PM review through procurement pending" icon={<PackageSearch className="h-4 w-4" />} tone={pendingIndents.length > 0 ? 'warning' : 'neutral'} />
        <KpiCard label="Open Enquiries" value={openEnquiries.length} sub="RFQs currently in progress" icon={<FileSearch className="h-4 w-4" />} />
        <KpiCard label="Awaiting Technical Review" value={pendingQuotations.length} sub="Vendor quotations pending review" icon={<BadgeCheck className="h-4 w-4" />} tone={pendingQuotations.length > 0 ? 'warning' : 'neutral'} />
        <KpiCard label="Management Approvals Pending" value={pendingPoRecordIds.length} sub="POs awaiting PM/Accounts/MD sign-off" icon={<ShieldCheck className="h-4 w-4" />} tone={pendingPoRecordIds.length > 0 ? 'warning' : 'neutral'} />
        <KpiCard label="Active POs" value={activePOs.length} sub="Issued or partially received" icon={<FileSignature className="h-4 w-4" />} tone="brand" />
        <KpiCard label="Dispatches In Transit" value={inTransitDispatches.length} sub="Material on the way to site" icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Delayed Procurement" value={delayedExceptions.length} sub="POs past expected delivery" icon={<TriangleAlert className="h-4 w-4" />} tone={delayedExceptions.length > 0 ? 'danger' : 'neutral'} />
        <KpiCard label="Quotations Received" value={vendorQuotations.length} sub="Across all enquiries" icon={<Quote className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Pending Indents" actions={<Button size="sm" variant="secondary" onClick={() => navigate('/indents')}>View All</Button>}>
          {pendingIndents.length === 0 ? <EmptyState message="No indents pending PM or procurement action." /> : (
            <ul className="divide-y divide-ink-100">
              {pendingIndents.slice(0, 6).map(i => (
                <li key={i.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <button className="text-left text-ink-800 hover:text-brand-600" onClick={() => navigate(`/indents/${i.id}`)}>
                    <span className="font-medium">{i.indentNumber}</span> &middot; {materials.find(m => m.id === i.materialId)?.name ?? '-'} ({i.requiredQty} {i.unit})
                  </button>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={i.priority} />
                    <StatusBadge status={i.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Technical Approvals Pending" actions={<Button size="sm" variant="secondary" onClick={() => navigate('/technical-approval')}>Review</Button>}>
          {pendingQuotations.length === 0 ? <EmptyState message="No vendor quotations awaiting technical review." /> : (
            <ul className="divide-y divide-ink-100">
              {pendingQuotations.slice(0, 6).map(q => {
                const rfq = enquiries.find(e => e.id === q.rfqId)
                return (
                  <li key={q.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <button className="text-left text-ink-800 hover:text-brand-600" onClick={() => navigate(`/enquiries/${q.rfqId}`)}>
                      <span className="font-medium">{rfq?.rfqNumber ?? q.rfqId}</span> &middot; {vendors.find(v => v.id === q.vendorId)?.name ?? '-'}
                    </button>
                    <span className="font-medium text-ink-700">{fmtCurrency(q.rate)}</span>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate('/vendor-comparison')}>Vendor Comparison</Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/management-approval')}>Management Approval</Button>
          </div>
        </SectionCard>

        <SectionCard title="PO Queue by Status" actions={<Button size="sm" variant="secondary" onClick={() => navigate('/po')}>View All</Button>}>
          <ul className="divide-y divide-ink-100">
            {poByStatus.map(row => (
              <li key={row.status} className="flex items-center justify-between py-2 text-sm">
                <StatusBadge status={row.status} />
                <span className="font-semibold text-ink-800">{row.count}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Delayed Procurement" actions={<Button size="sm" variant="secondary" onClick={() => navigate('/exceptions')}>View All</Button>}>
          {delayedExceptions.length === 0 ? <EmptyState message="No purchase orders are past their expected delivery date." /> : (
            <ul className="divide-y divide-ink-100">
              {delayedExceptions.slice(0, 6).map(ex => (
                <li key={ex.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <button className="text-left text-ink-800 hover:text-brand-600" onClick={() => ex.recordId && navigate(`/po/${ex.recordId}`)}>{ex.description}</button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Dispatches In Transit" actions={<Button size="sm" variant="secondary" onClick={() => navigate('/dispatch')}>View All</Button>}>
          {inTransitDispatches.length === 0 ? <EmptyState message="No dispatches currently in transit." /> : (
            <div className="overflow-x-auto rounded-lg border border-ink-200">
              <table className="min-w-full divide-y divide-ink-200 text-sm">
                <thead className="bg-ink-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Dispatch #</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">PO #</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Material</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Vehicle</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Expected Arrival</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 bg-white">
                  {inTransitDispatches.map(d => (
                    <tr key={d.id} className="cursor-pointer hover:bg-ink-50" onClick={() => navigate(`/dispatch/${d.id}`)}>
                      <td className="px-3 py-2 font-medium text-ink-800">{d.dispatchNumber}</td>
                      <td className="px-3 py-2 text-ink-600">{purchaseOrders.find(p => p.id === d.poId)?.poNumber ?? '-'}</td>
                      <td className="px-3 py-2 text-ink-600">{materials.find(m => m.id === d.materialId)?.name ?? '-'}</td>
                      <td className="px-3 py-2 text-ink-600">{d.vehicleNumber || '-'}</td>
                      <td className="px-3 py-2 text-ink-600">{fmtDate(d.expectedArrival)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
