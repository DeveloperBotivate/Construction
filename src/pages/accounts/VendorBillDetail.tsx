import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Scale, ShieldCheck, TriangleAlert, PauseCircle, ArrowRightCircle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency } from '../../lib/utils'
import { recordLink } from '../../lib/recordLinks'

export default function VendorBillDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const bill = useStore(s => s.vendorBills.find(b => b.id === id))
  const vendor = useStore(s => s.vendors.find(v => v.id === bill?.vendorId))
  const po = useStore(s => s.purchaseOrders.find(p => p.id === bill?.poId))
  const grn = useStore(s => s.grns.find(g => g.id === bill?.grnId))
  const allDebitNotes = useStore(s => s.debitNotes)
  const debitNotes = allDebitNotes.filter(d => d.grnId === bill?.grnId)
  const hasPayment = useStore(s => s.payments.some(p => p.refBillId === id))
  const runThreeWayMatch = useStore(s => s.runThreeWayMatch)
  const verifyVendorBillAccounts = useStore(s => s.verifyVendorBillAccounts)
  const holdVendorBill = useStore(s => s.holdVendorBill)
  const sendBillToPaymentQueue = useStore(s => s.sendBillToPaymentQueue)

  const [exceptionOpen, setExceptionOpen] = useState(false)
  const [holdOpen, setHoldOpen] = useState(false)
  const [holdReason, setHoldReason] = useState('')

  if (!bill) return <EmptyState message="Vendor bill not found." />

  const canAct = user.role === 'ACCOUNTS' || user.role === 'MD'
  const diffFromGrn = bill.invoiceAmount - bill.grnAmount

  function handleSendToQueue() {
    const payment = sendBillToPaymentQueue('VENDOR', bill!.id)
    navigate(`/payments/${payment.id}`)
  }

  return (
    <div>
      <PageHeader
        title={bill.billNumber}
        subtitle={`${vendor?.name ?? ''} · Invoice ${bill.invoiceNumber}`}
        breadcrumb={[{ label: 'Vendor Bills', to: '/vendor-bills' }, { label: bill.billNumber }]}
        actions={
          <>
            <StatusBadge status={bill.matchStatus} />
            <StatusBadge status={bill.status} />
          </>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {bill.status === 'DOCUMENT_CHECK' && (
            <Button variant="secondary" icon={<Scale className="h-4 w-4" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD can run 3-way match' : undefined} onClick={() => runThreeWayMatch(bill.id)}>
              Run 3-Way Match
            </Button>
          )}
          {bill.status === 'THREE_WAY_MATCH' && bill.matchStatus === 'MATCHED' && (
            <Button variant="primary" icon={<ShieldCheck className="h-4 w-4" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD can verify' : undefined} onClick={() => verifyVendorBillAccounts(bill.id)}>
              Verify
            </Button>
          )}
          {bill.matchStatus === 'MISMATCH' && bill.status !== 'ACCOUNTS_VERIFIED' && bill.status !== 'PAID' && bill.status !== 'TALLY_POSTED' && bill.status !== 'CLOSED' && (
            <Button variant="danger" icon={<TriangleAlert className="h-4 w-4" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD can approve an exception' : undefined} onClick={() => setExceptionOpen(true)}>
              Approve as Exception
            </Button>
          )}
          {!['ACCOUNTS_VERIFIED', 'PAID', 'TALLY_POSTED', 'CLOSED', 'REJECTED'].includes(bill.status) && (
            <Button variant="secondary" icon={<PauseCircle className="h-4 w-4" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD can hold this bill' : undefined} onClick={() => setHoldOpen(true)}>
              Hold
            </Button>
          )}
          {bill.status === 'ACCOUNTS_VERIFIED' && !hasPayment && (
            <Button variant="success" icon={<ArrowRightCircle className="h-4 w-4" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD can send to payment queue' : undefined} onClick={handleSendToQueue}>
              Send to Payment Queue
            </Button>
          )}
        </div>
        {bill.mismatchReason && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
            <span className="font-medium">Mismatch: </span>{bill.mismatchReason}
          </div>
        )}
      </Card>

      <Tabs
        tabs={[
          {
            key: 'overview', label: 'Overview', content: (
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-ink-800">Invoice vs PO vs GRN</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <AmountBox label="Invoice Amount" value={bill.invoiceAmount} />
                  <AmountBox label="PO Amount" value={bill.poAmount} />
                  <AmountBox label="GRN-Accepted Amount" value={bill.grnAmount} danger={bill.matchStatus === 'MISMATCH'} />
                </div>
                <div className="mt-4 rounded-md bg-ink-50 px-3 py-2 text-sm">
                  <span className="text-ink-500">Invoice vs GRN Difference: </span>
                  <span className={`font-semibold ${Math.abs(diffFromGrn) > 1 ? 'text-red-600' : 'text-emerald-600'}`}>{fmtCurrency(diffFromGrn)}</span>
                </div>
              </Card>
            ),
          },
          {
            key: 'related', label: 'Related Records', content: (
              <Card>
                <ul className="divide-y divide-ink-100">
                  <li className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-ink-50" onClick={() => po && navigate(recordLink('PurchaseOrder', po.id)!)}>
                    <div><p className="text-xs uppercase tracking-wide text-ink-500">Purchase Order</p><p className="text-sm font-medium text-ink-800">{po?.poNumber ?? '-'}</p></div>
                  </li>
                  <li className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-ink-50" onClick={() => grn && navigate(recordLink('GRN', grn.id)!)}>
                    <div><p className="text-xs uppercase tracking-wide text-ink-500">GRN</p><p className="text-sm font-medium text-ink-800">{grn?.grnNumber ?? '-'}</p></div>
                  </li>
                  {debitNotes.map(dn => (
                    <li key={dn.id} className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-ink-50" onClick={() => navigate(`/debit-notes/${dn.id}`)}>
                      <div><p className="text-xs uppercase tracking-wide text-ink-500">Debit Note</p><p className="text-sm font-medium text-ink-800">{dn.debitNoteNumber} &middot; {fmtCurrency(dn.amount)}</p></div>
                      <StatusBadge status={dn.status} />
                    </li>
                  ))}
                </ul>
              </Card>
            ),
          },
          { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="VendorBill" recordId={bill.id} /> },
          { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="VendorBill" recordId={bill.id} /> },
        ]}
      />

      <Modal
        open={exceptionOpen}
        onClose={() => setExceptionOpen(false)}
        title="Approve as Exception"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExceptionOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { verifyVendorBillAccounts(bill.id, true); setExceptionOpen(false) }}>Confirm Override</Button>
          </>
        }
      >
        <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm text-amber-800 ring-1 ring-inset ring-amber-600/20">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>This bill failed the 3-way match check ({bill.mismatchReason}). Approving as an exception overrides the mismatch and moves the bill forward for payment. This action is logged in the audit trail.</span>
        </div>
      </Modal>

      <Modal
        open={holdOpen}
        onClose={() => setHoldOpen(false)}
        title="Hold Vendor Bill"
        footer={
          <>
            <Button variant="secondary" onClick={() => setHoldOpen(false)}>Cancel</Button>
            <Button variant="danger" disabled={!holdReason.trim()} onClick={() => { holdVendorBill(bill.id, holdReason.trim()); setHoldOpen(false); setHoldReason('') }}>Place on Hold</Button>
          </>
        }
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Reason (required)</label>
        <textarea value={holdReason} onChange={e => setHoldReason(e.target.value)} rows={3} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </Modal>
    </div>
  )
}

function AmountBox({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${danger ? 'border-red-200 bg-red-50' : 'border-ink-200 bg-ink-50'}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${danger ? 'text-red-700' : 'text-ink-800'}`}>{fmtCurrency(value)}</p>
    </div>
  )
}
