import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { getBoqProgressPct } from '../../store/selectors'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ApprovalActionBar } from '../../components/ui/ApprovalActionBar'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, fmtDate, fmtNumber } from '../../lib/utils'
import { recordLink } from '../../lib/recordLinks'

export default function MeasurementDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const meas = useStore(s => s.measurements.find(m => m.id === id))
  const boq = useStore(s => s.boqItems.find(b => b.id === meas?.boqItemId))
  const subcontractor = useStore(s => s.subcontractors.find(sc => sc.id === meas?.subcontractorId))
  const workOrder = useStore(s => s.workOrders.find(w => w.id === meas?.workOrderId))
  const bill = useStore(s => s.subcontractorBills.find(b => b.measurementIds.includes(id)))
  const progressPct = useStore(s => meas ? getBoqProgressPct(s, meas.boqItemId) : 0)

  if (!meas) return <EmptyState message="Measurement not found." />

  return (
    <div>
      <PageHeader
        title={meas.measurementNumber}
        subtitle={boq ? `${boq.boqNumber} - ${boq.description}` : ''}
        breadcrumb={[{ label: 'Measurements', to: '/measurements' }, { label: meas.measurementNumber }]}
        actions={<StatusBadge status={meas.status} />}
      />

      <Tabs
        tabs={[
          {
            key: 'overview', label: 'Overview', content: (
              <div className="space-y-4">
                <Card>
                  <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Detail label="Previous Qty" value={fmtNumber(meas.previousQty)} />
                    <Detail label="Current Qty" value={fmtNumber(meas.currentQty)} />
                    <Detail label="Cumulative Qty" value={fmtNumber(meas.cumulativeQty)} />
                    <Detail label="Rate" value={fmtCurrency(meas.rate)} />
                    <Detail label="Amount" value={fmtCurrency(meas.amount)} />
                    <Detail label="Date" value={fmtDate(meas.date)} />
                    <Detail label="Subcontractor" value={subcontractor?.name ?? '-'} />
                    <Detail label="Work Order" value={workOrder?.woNumber ?? '-'} />
                  </dl>
                </Card>
                <Card>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink-800">BOQ Progress</h3>
                    <span className="text-sm font-medium text-ink-600">{progressPct}%</span>
                  </div>
                  <ProgressBar pct={progressPct} tone={progressPct >= 100 ? 'success' : progressPct >= 75 ? 'warning' : 'brand'} />
                  {boq && <p className="mt-2 text-xs text-ink-500">{fmtNumber(meas.cumulativeQty)} of {fmtNumber(boq.revisedQty)} {boq.unit} consumed on {boq.boqNumber}.</p>}
                </Card>
              </div>
            ),
          },
          { key: 'approvals', label: 'Approval History', content: <ApprovalActionBar recordId={meas.id} /> },
          {
            key: 'related', label: 'Related Records', content: (
              <Card>
                <ul className="divide-y divide-ink-100">
                  <RelatedRow label="BOQ Item" title={boq ? `${boq.boqNumber} - ${boq.description}` : 'Not found'} link={recordLink('BOQItem', boq?.id)} onNavigate={navigate} />
                  <RelatedRow label="Work Order" title={workOrder?.woNumber ?? 'Not found'} link={recordLink('WorkOrder', workOrder?.id)} onNavigate={navigate} />
                  <RelatedRow label="Subcontractor Bill" title={bill?.billNumber ?? 'Not yet billed'} link={bill ? recordLink('SubcontractorBill', bill.id) : null} onNavigate={navigate} />
                </ul>
              </Card>
            ),
          },
          { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="Measurement" recordId={meas.id} /> },
          { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="Measurement" recordId={meas.id} /> },
        ]}
      />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 text-sm text-ink-800">{value}</dd>
    </div>
  )
}

function RelatedRow({ label, title, link, onNavigate }: { label: string; title: string; link: string | null; onNavigate: (to: string) => void }) {
  return (
    <li className={`flex items-center justify-between py-2.5 ${link ? 'cursor-pointer hover:bg-ink-50' : ''}`} onClick={() => link && onNavigate(link)}>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
        <p className="text-sm font-medium text-ink-800">{title}</p>
      </div>
    </li>
  )
}
