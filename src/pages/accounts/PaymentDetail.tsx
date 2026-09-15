import { useNavigate, useParams } from 'react-router-dom'
import { Landmark, CheckCheck } from 'lucide-react'
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
import { fmtCurrency, fmtDate } from '../../lib/utils'
import { recordLink } from '../../lib/recordLinks'

export default function PaymentDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const payment = useStore(s => s.payments.find(p => p.id === id))
  const postPaymentToTally = useStore(s => s.postPaymentToTally)
  const closePayment = useStore(s => s.closePayment)

  if (!payment) return <EmptyState message="Payment not found." />

  const canAct = user.role === 'ACCOUNTS' || user.role === 'MD'
  const billRecordType = payment.type === 'VENDOR' ? 'VendorBill' : payment.type === 'SUBCONTRACTOR' ? 'SubcontractorBill' : null
  const billLink = billRecordType ? recordLink(billRecordType, payment.refBillId) : null

  return (
    <div>
      <PageHeader
        title={payment.paymentNumber}
        subtitle={`${payment.payeeName} · ${fmtCurrency(payment.amount)}`}
        breadcrumb={[{ label: 'Payments', to: '/payments' }, { label: payment.paymentNumber }]}
        actions={
          <>
            <StatusBadge status={payment.type} />
            <StatusBadge status={payment.status} />
            {payment.status === 'PAID' && (
              <Button variant="primary" icon={<Landmark className="h-4 w-4" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD can post to Tally' : undefined} onClick={() => postPaymentToTally(payment.id)}>
                Post to Tally
              </Button>
            )}
            {payment.status === 'TALLY_POSTED' && (
              <Button variant="success" icon={<CheckCheck className="h-4 w-4" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD can close' : undefined} onClick={() => closePayment(payment.id)}>
                Close
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
                  <Detail label="Type" value={<StatusBadge status={payment.type} />} />
                  <Detail label="Payee" value={payment.payeeName} />
                  <Detail label="Amount" value={fmtCurrency(payment.amount)} />
                  <Detail label="Status" value={<StatusBadge status={payment.status} />} />
                  <Detail label="Payment Date" value={fmtDate(payment.paymentDate)} />
                  <Detail label="Payment Ref" value={payment.paymentRef ?? '-'} />
                  <Detail label="Tally Voucher" value={payment.tallyVoucherNumber ?? '-'} />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Source Bill</dt>
                    <dd className="mt-1 text-sm">
                      {billLink ? (
                        <button className="font-medium text-brand-600 hover:underline" onClick={() => navigate(billLink)}>{payment.refBillId}</button>
                      ) : <span className="text-ink-800">{payment.refBillId}</span>}
                    </dd>
                  </div>
                </dl>
              </Card>
            ),
          },
          { key: 'approvals', label: 'Approval History', content: <ApprovalActionBar recordId={payment.id} /> },
          { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="Payment" recordId={payment.id} /> },
          { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="Payment" recordId={payment.id} /> },
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
