import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send, BadgeCheck, HandCoins } from 'lucide-react'
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

export default function RABillDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const bill = useStore(s => s.raBills.find(b => b.id === id))
  const contract = useStore(s => s.contracts.find(c => c.id === bill?.contractId))
  const project = useStore(s => s.projects.find(p => p.id === bill?.projectId))
  const allMeasurements = useStore(s => s.measurements)
  const measurements = allMeasurements.filter(m => bill?.measurementIds.includes(m.id))
  const submitRABillToClient = useStore(s => s.submitRABillToClient)
  const certifyRABill = useStore(s => s.certifyRABill)
  const recordReceivable = useStore(s => s.recordReceivable)

  const [certifyOpen, setCertifyOpen] = useState(false)
  const [certifyAmount, setCertifyAmount] = useState('')
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [receiveAmount, setReceiveAmount] = useState('')

  if (!bill) return <EmptyState message="RA bill not found." />

  const canManage = user.role === 'BILLING' || user.role === 'MD'
  const canReceive = user.role === 'BILLING' || user.role === 'ACCOUNTS' || user.role === 'MD'
  const outstanding = bill.netAmount - bill.receivedAmount

  return (
    <div>
      <PageHeader
        title={bill.raNumber}
        subtitle={project?.name ?? ''}
        breadcrumb={[{ label: 'RA Bills', to: '/ra-bills' }, { label: bill.raNumber }]}
        actions={
          <>
            <StatusBadge status={bill.status} />
            {bill.status === 'DRAFT' && (
              <Button variant="primary" icon={<Send className="h-4 w-4" />} disabled={!canManage} title={!canManage ? 'Only Billing & Liaison or MD can submit to client' : undefined} onClick={() => submitRABillToClient(bill.id)}>
                Submit to Client
              </Button>
            )}
            {bill.status === 'SUBMITTED_TO_CLIENT' && (
              <Button variant="primary" icon={<BadgeCheck className="h-4 w-4" />} disabled={!canManage} title={!canManage ? 'Only Billing & Liaison or MD can record certification' : undefined} onClick={() => { setCertifyAmount(String(bill.billedAmount)); setCertifyOpen(true) }}>
                Record Certification
              </Button>
            )}
            {(bill.status === 'CERTIFIED' || bill.status === 'INVOICED' || bill.status === 'RECEIVED') && outstanding > 0 && (
              <Button variant="success" icon={<HandCoins className="h-4 w-4" />} disabled={!canReceive} title={!canReceive ? 'Only Billing & Liaison, Accounts or MD can record receipts' : undefined} onClick={() => { setReceiveAmount(''); setReceiveOpen(true) }}>
                Record Payment Received
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
                <h3 className="mb-3 text-sm font-semibold text-ink-800">Billing Breakdown</h3>
                <dl className="divide-y divide-ink-100 text-sm">
                  <Row label="Billed Amount" value={fmtCurrency(bill.billedAmount)} />
                  <Row label="Certified Amount" value={fmtCurrency(bill.certifiedAmount)} />
                  <Row label="Retention" value={`- ${fmtCurrency(bill.retention)}`} tone="danger" />
                  <Row label="Deductions" value={`- ${fmtCurrency(bill.deductions)}`} tone="danger" />
                  <Row label="Net Amount" value={fmtCurrency(bill.netAmount)} strong />
                  <Row label="Received Amount" value={fmtCurrency(bill.receivedAmount)} tone="success" />
                  <Row label="Outstanding" value={fmtCurrency(outstanding)} tone={outstanding > 0 ? 'danger' : 'success'} strong />
                  {bill.invoiceNumber && <Row label="Invoice Number" value={bill.invoiceNumber} />}
                </dl>
              </Card>
            ),
          },
          {
            key: 'related', label: 'Related Records', content: (
              <Card>
                <ul className="divide-y divide-ink-100">
                  <li className="py-2.5">
                    <p className="text-xs uppercase tracking-wide text-ink-500">Contract</p>
                    <p className="text-sm font-medium text-ink-800">{contract?.contractNumber ?? '-'}</p>
                  </li>
                  <li className="py-2.5">
                    <p className="text-xs uppercase tracking-wide text-ink-500">Project</p>
                    <p className="text-sm font-medium text-ink-800">{project?.name ?? '-'}</p>
                  </li>
                  <li className="py-2.5">
                    <p className="mb-2 text-xs uppercase tracking-wide text-ink-500">Measurements ({measurements.length})</p>
                    <ul className="space-y-1.5">
                      {measurements.map(m => (
                        <li key={m.id} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-ink-50 cursor-pointer" onClick={() => navigate(`/measurements/${m.id}`)}>
                          <span className="text-sm text-ink-700">{m.measurementNumber} &middot; Qty {m.currentQty}</span>
                          <span className="text-sm font-medium text-ink-800">{fmtCurrency(m.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </Card>
            ),
          },
          { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="RABill" recordId={bill.id} /> },
          { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="RABill" recordId={bill.id} /> },
        ]}
      />

      <Modal
        open={certifyOpen}
        onClose={() => setCertifyOpen(false)}
        title="Record Client Certification"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCertifyOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!certifyAmount || Number(certifyAmount) <= 0} onClick={() => { certifyRABill(bill.id, Number(certifyAmount)); setCertifyOpen(false) }}>Confirm Certification</Button>
          </>
        }
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Certified Amount (₹)</label>
        <input type="number" min={0} value={certifyAmount} onChange={e => setCertifyAmount(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        <p className="mt-2 text-xs text-ink-500">Billed amount was {fmtCurrency(bill.billedAmount)}. Retention will be computed automatically from the contract's retention %.</p>
      </Modal>

      <Modal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        title="Record Payment Received"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReceiveOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!receiveAmount || Number(receiveAmount) <= 0} onClick={() => { recordReceivable(bill.id, Number(receiveAmount)); setReceiveOpen(false) }}>Confirm Receipt</Button>
          </>
        }
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Amount Received (₹)</label>
        <input type="number" min={0} value={receiveAmount} onChange={e => setReceiveAmount(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        <p className="mt-2 text-xs text-ink-500">Outstanding balance is {fmtCurrency(outstanding)}. Partial receipts are supported &mdash; you can record multiple payments over time.</p>
      </Modal>
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
