import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRightCircle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { ApprovalActionBar } from '../../components/ui/ApprovalActionBar'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency } from '../../lib/utils'
import { recordLink } from '../../lib/recordLinks'

export default function SubcontractorBillDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const bill = useStore(s => s.subcontractorBills.find(b => b.id === id))
  const subcontractor = useStore(s => s.subcontractors.find(sc => sc.id === bill?.subcontractorId))
  const workOrder = useStore(s => s.workOrders.find(w => w.id === bill?.workOrderId))
  const allMeasurements = useStore(s => s.measurements)
  const measurements = allMeasurements.filter(m => bill?.measurementIds.includes(m.id))
  const hasPayment = useStore(s => s.payments.some(p => p.refBillId === id))
  const sendBillToPaymentQueue = useStore(s => s.sendBillToPaymentQueue)

  if (!bill) return <EmptyState message="Subcontractor bill not found." />

  const canSendToQueue = user.role === 'ACCOUNTS' || user.role === 'MD'

  function handleSendToQueue() {
    const payment = sendBillToPaymentQueue('SUBCONTRACTOR', bill!.id)
    navigate(`/payments/${payment.id}`)
  }

  return (
    <div>
      <PageHeader
        title={bill.billNumber}
        subtitle={`${subcontractor?.name ?? ''} · ${workOrder?.woNumber ?? ''}`}
        breadcrumb={[{ label: 'Bills & Payments', to: '/bills-payments' }, { label: bill.billNumber }]}
        actions={<StatusBadge status={bill.status} />}
      />

      {bill.status === 'ACCOUNTS_VERIFIED' && !hasPayment && (
        <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50/40">
          <div>
            <p className="text-sm font-semibold text-ink-800">Fully verified and ready for payment</p>
            <p className="text-xs text-ink-500">Send this bill to the payment queue for MD approval and disbursement.</p>
          </div>
          <Button
            variant="primary" icon={<ArrowRightCircle className="h-4 w-4" />}
            disabled={!canSendToQueue}
            title={!canSendToQueue ? 'Only Accounts or MD can send a bill to the payment queue' : undefined}
            onClick={handleSendToQueue}
          >
            Send to Payment Queue
          </Button>
        </Card>
      )}

      <Tabs
        tabs={[
          {
            key: 'overview', label: 'Overview', content: (
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-ink-800">Deduction Breakdown</h3>
                <dl className="divide-y divide-ink-100 text-sm">
                  <Row label="Gross Amount" value={fmtCurrency(bill.grossAmount)} />
                  <Row label="Retention" value={`- ${fmtCurrency(bill.retention)}`} tone="danger" />
                  <Row label="Advance Recovery" value={`- ${fmtCurrency(bill.advanceRecovery)}`} tone="danger" />
                  <Row label="Penalty" value={`- ${fmtCurrency(bill.penalty)}`} tone="danger" />
                  <Row label="Other Deduction" value={`- ${fmtCurrency(bill.otherDeduction)}`} tone="danger" />
                  <Row label="Tax" value={`+ ${fmtCurrency(bill.tax)}`} tone="success" />
                  <Row label="Net Payable" value={fmtCurrency(bill.netPayable)} strong />
                </dl>
              </Card>
            ),
          },
          { key: 'approvals', label: 'Approval History', content: <ApprovalActionBar recordId={bill.id} /> },
          {
            key: 'related', label: 'Related Records', content: (
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-ink-800">Measurements</h3>
                <ul className="divide-y divide-ink-100">
                  <li className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-ink-50" onClick={() => workOrder && navigate(recordLink('WorkOrder', workOrder.id)!)}>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink-500">Work Order</p>
                      <p className="text-sm font-medium text-ink-800">{workOrder?.woNumber ?? '-'}</p>
                    </div>
                  </li>
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
              </Card>
            ),
          },
          { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="SubcontractorBill" recordId={bill.id} /> },
          { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="SubcontractorBill" recordId={bill.id} /> },
        ]}
      />
    </div>
  )
}

function Row({ label, value, tone, strong }: { label: string; value: string; tone?: 'danger' | 'success'; strong?: boolean }) {
  const toneCls = tone === 'danger' ? 'text-red-600' : tone === 'success' ? 'text-emerald-600' : 'text-ink-800'
  return (
    <div className="flex items-center justify-between py-2">
      <dt className={strong ? 'font-semibold text-ink-800' : 'text-ink-500'}>{label}</dt>
      <dd className={strong ? 'text-base font-bold text-ink-900' : `font-medium ${toneCls}`}>{value}</dd>
    </div>
  )
}
