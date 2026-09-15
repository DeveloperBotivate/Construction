import { useParams, useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import { recordLink } from '../../lib/recordLinks'

export default function WorkOrderDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const wo = useStore(s => s.workOrders.find(w => w.id === id))
  const subcontractor = useStore(s => s.subcontractors.find(sc => sc.id === wo?.subcontractorId))
  const allMeasurements = useStore(s => s.measurements)
  const measurements = allMeasurements.filter(m => m.workOrderId === id)
  const allBills = useStore(s => s.subcontractorBills)
  const bills = allBills.filter(b => b.workOrderId === id)
  const issueWorkOrder = useStore(s => s.issueWorkOrder)

  if (!wo) return <EmptyState message="Work order not found." />

  const canIssue = user.role === 'PM' || user.role === 'MD'

  return (
    <div>
      <PageHeader
        title={wo.woNumber}
        subtitle={wo.workPackage}
        breadcrumb={[{ label: 'Work Orders', to: '/work-orders' }, { label: wo.woNumber }]}
        actions={
          <>
            <StatusBadge status={wo.status} />
            {wo.status === 'DRAFT' && (
              <Button
                variant="primary" icon={<Send className="h-4 w-4" />}
                disabled={!canIssue}
                title={!canIssue ? 'Only PM or MD can issue a work order' : undefined}
                onClick={() => issueWorkOrder(wo.id)}
              >
                Issue to Subcontractor
              </Button>
            )}
          </>
        }
      />

      <Tabs
        tabs={[
          {
            key: 'overview', label: 'Overview', content: (
              <Card>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail label="Subcontractor" value={subcontractor?.name ?? '-'} />
                  <Detail label="Trade" value={subcontractor?.trade ?? '-'} />
                  <Detail label="Work Package" value={wo.workPackage} />
                  <Detail label="Value" value={fmtCurrency(wo.value)} />
                  <Detail label="Start Date" value={fmtDate(wo.startDate)} />
                  <Detail label="End Date" value={fmtDate(wo.endDate)} />
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Scope</dt>
                    <dd className="mt-1 text-sm text-ink-800">{wo.scope || '-'}</dd>
                  </div>
                </dl>
              </Card>
            ),
          },
          {
            key: 'related', label: 'Related Records', badge: measurements.length + bills.length, content: (
              <div className="space-y-4">
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-ink-800">Measurements ({measurements.length})</h3>
                  {measurements.length === 0 ? <EmptyState message="No measurements recorded against this work order yet." /> : (
                    <ul className="divide-y divide-ink-100">
                      {measurements.map(m => (
                        <li key={m.id} className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-ink-50" onClick={() => navigate(`/measurements/${m.id}`)}>
                          <div>
                            <p className="text-sm font-medium text-ink-800">{m.measurementNumber}</p>
                            <p className="text-xs text-ink-500">Qty {m.currentQty} &middot; {fmtCurrency(m.amount)}</p>
                          </div>
                          <StatusBadge status={m.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-ink-800">Subcontractor Bills ({bills.length})</h3>
                  {bills.length === 0 ? <EmptyState message="No bills raised against this work order yet." /> : (
                    <ul className="divide-y divide-ink-100">
                      {bills.map(b => (
                        <li key={b.id} className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-ink-50" onClick={() => navigate(recordLink('SubcontractorBill', b.id)!)}>
                          <div>
                            <p className="text-sm font-medium text-ink-800">{b.billNumber}</p>
                            <p className="text-xs text-ink-500">Net Payable {fmtCurrency(b.netPayable)}</p>
                          </div>
                          <StatusBadge status={b.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>
            ),
          },
          { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="WorkOrder" recordId={wo.id} /> },
          { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="WorkOrder" recordId={wo.id} /> },
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
