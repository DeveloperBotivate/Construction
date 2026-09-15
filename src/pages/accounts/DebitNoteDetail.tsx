import { useNavigate, useParams } from 'react-router-dom'
import { Check, CheckCheck } from 'lucide-react'
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

export default function DebitNoteDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const dn = useStore(s => s.debitNotes.find(d => d.id === id))
  const vendor = useStore(s => s.vendors.find(v => v.id === dn?.vendorId))
  const grn = useStore(s => s.grns.find(g => g.id === dn?.grnId))
  const po = useStore(s => s.purchaseOrders.find(p => p.id === dn?.poId))
  const approveDebitNote = useStore(s => s.approveDebitNote)
  const closeDebitNote = useStore(s => s.closeDebitNote)

  if (!dn) return <EmptyState message="Debit note not found." />

  const canManage = user.role === 'ACCOUNTS' || user.role === 'MD'

  return (
    <div>
      <PageHeader
        title={dn.debitNoteNumber}
        subtitle={vendor?.name ?? ''}
        breadcrumb={[{ label: 'Debit Notes', to: '/debit-notes' }, { label: dn.debitNoteNumber }]}
        actions={
          <>
            <StatusBadge status={dn.status} />
            {dn.status === 'DRAFT' && (
              <Button variant="primary" icon={<Check className="h-4 w-4" />} disabled={!canManage} title={!canManage ? 'Only Accounts or MD can approve' : undefined} onClick={() => approveDebitNote(dn.id)}>Approve</Button>
            )}
            {['APPROVED', 'VENDOR_NOTIFIED', 'ADJUSTED'].includes(dn.status) && (
              <Button variant="secondary" icon={<CheckCheck className="h-4 w-4" />} disabled={!canManage} title={!canManage ? 'Only Accounts or MD can close' : undefined} onClick={() => closeDebitNote(dn.id)}>Close</Button>
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
                  <Detail label="Vendor" value={vendor?.name ?? '-'} />
                  <Detail label="Reason" value={<StatusBadge status={dn.reason} />} />
                  <Detail label="Amount" value={fmtCurrency(dn.amount)} />
                  <Detail label="Created" value={fmtDate(dn.createdAt)} />
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Remarks</dt>
                    <dd className="mt-1 text-sm text-ink-800">{dn.remarks || '-'}</dd>
                  </div>
                </dl>
              </Card>
            ),
          },
          {
            key: 'related', label: 'Related Records', content: (
              <Card>
                <ul className="divide-y divide-ink-100">
                  <li className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-ink-50" onClick={() => po && navigate(recordLink('PurchaseOrder', po.id)!)}>
                    <div><p className="text-xs uppercase tracking-wide text-ink-500">Purchase Order</p><p className="text-sm font-medium text-ink-800">{po?.poNumber ?? 'Not linked'}</p></div>
                  </li>
                  <li className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-ink-50" onClick={() => grn && navigate(recordLink('GRN', grn.id)!)}>
                    <div><p className="text-xs uppercase tracking-wide text-ink-500">GRN</p><p className="text-sm font-medium text-ink-800">{grn?.grnNumber ?? 'Not linked'}</p></div>
                  </li>
                  <li className="py-2.5">
                    <p className="text-xs uppercase tracking-wide text-ink-500">Vendor</p>
                    <p className="text-sm font-medium text-ink-800">{vendor?.name ?? '-'}</p>
                  </li>
                </ul>
              </Card>
            ),
          },
          { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="DebitNote" recordId={dn.id} /> },
          { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="DebitNote" recordId={dn.id} /> },
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
