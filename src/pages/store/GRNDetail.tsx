import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, X, Paperclip, ArrowLeft } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { fmtDate } from '../../lib/utils'
import { recordLink } from '../../lib/recordLinks'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { Timeline, type TimelineStep } from '../../components/ui/Timeline'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'

export default function GRNDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const grns = useStore(s => s.grns)
  const dispatches = useStore(s => s.dispatches)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const vendors = useStore(s => s.vendors)
  const projects = useStore(s => s.projects)
  const sites = useStore(s => s.sites)
  const debitNotes = useStore(s => s.debitNotes)
  const stockLedger = useStore(s => s.stockLedger)
  const auditLog = useStore(s => s.auditLog)
  const hodCheckGRN = useStore(s => s.hodCheckGRN)

  const [confirmDecision, setConfirmDecision] = useState<'ACCEPTED' | 'REJECTED' | null>(null)

  const grn = grns.find(g => g.id === id)

  if (!grn) {
    return (
      <div>
        <PageHeader title="GRN Not Found" />
        <EmptyState message="This GRN record could not be found." action={<Button variant="secondary" icon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={() => navigate('/grn')}>Back to GRN List</Button>} />
      </div>
    )
  }

  const po = purchaseOrders.find(p => p.id === grn.poId)
  const vendor = vendors.find(v => v.id === grn.vendorId)
  const project = projects.find(p => p.id === grn.projectId)
  const site = sites.find(s => s.id === grn.siteId)
  const isPE = user.role === 'PE'
  const canHodCheck = grn.status === 'HOD_CHECK'

  const totals = grn.items.reduce((acc, l) => ({
    ordered: acc.ordered + l.orderedQty, received: acc.received + l.receivedQty,
    accepted: acc.accepted + l.acceptedQty, rejected: acc.rejected + l.rejectedQty, damaged: acc.damaged + l.damagedQty,
  }), { ordered: 0, received: 0, accepted: 0, rejected: 0, damaged: 0 })

  const relatedDebitNotes = debitNotes.filter(d => d.grnId === grn.id)
  const relatedLedger = stockLedger.filter(e => e.refId === grn.id)

  const overviewTab = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-200 bg-white p-4 sm:grid-cols-4">
        <Field label="Vendor" value={vendor?.name ?? '-'} />
        <Field label="Project / Site" value={`${project?.code ?? '-'} / ${site?.name ?? '-'}`} />
        <Field label="Vehicle" value={grn.vehicle || '-'} />
        <Field label="Challan" value={grn.challan || '-'} />
        <Field label="Created By" value={user.id === grn.createdBy ? 'You' : grn.createdBy} />
        <Field label="Created On" value={fmtDate(grn.createdAt)} />
        <Field label="HOD Checked By" value={grn.hodCheckedBy ?? 'Pending'} />
        <Field label="Status" value={<StatusBadge status={grn.status} />} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink-800">Line Items</h3>
        <div className="overflow-x-auto rounded-lg border border-ink-200">
          <table className="min-w-full divide-y divide-ink-200 text-sm">
            <thead className="bg-ink-50">
              <tr>
                {['Material', 'Unit', 'Ordered', 'Received', 'Accepted', 'Rejected', 'Damaged', 'Batch', 'Location'].map(h => (
                  <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 bg-white">
              {grn.items.map((l, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-ink-800">{l.materialName}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-ink-600">{l.unit}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-ink-600">{l.orderedQty}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-ink-600">{l.receivedQty}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-emerald-700">{l.acceptedQty}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-red-700">{l.rejectedQty}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-amber-700">{l.damagedQty}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-ink-600">{l.batch || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-ink-600">{l.location || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-ink-50 font-medium">
              <tr>
                <td className="px-3 py-2 text-ink-700" colSpan={2}>Total</td>
                <td className="px-3 py-2 text-ink-700">{totals.ordered}</td>
                <td className="px-3 py-2 text-ink-700">{totals.received}</td>
                <td className="px-3 py-2 text-emerald-700">{totals.accepted}</td>
                <td className="px-3 py-2 text-red-700">{totals.rejected}</td>
                <td className="px-3 py-2 text-amber-700">{totals.damaged}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-ink-800">Inspection Notes</h3>
          <p className="rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm text-ink-600">{grn.inspection || 'No inspection notes recorded.'}</p>
        </div>
        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-ink-800">Remarks</h3>
          <p className="rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm text-ink-600">{grn.remarks || 'No remarks.'}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-ink-800">Photos</h3>
        {grn.photos.length === 0 ? (
          <p className="text-sm text-ink-400">No photos attached.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {grn.photos.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2.5 py-1 text-xs text-ink-600">
                <Paperclip className="h-3 w-3" /> {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const relatedTab = (
    <div className="space-y-4">
      <RelatedRow label="Purchase Order" value={po?.poNumber} status={po?.status} link={recordLink('PurchaseOrder', grn.poId)} />
      <RelatedRow label="Dispatch" value={dispatches.find(d => d.id === grn.dispatchId)?.dispatchNumber} status={dispatches.find(d => d.id === grn.dispatchId)?.status} link={recordLink('Dispatch', grn.dispatchId)} />
      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-ink-800">Debit Notes Raised</h3>
        {relatedDebitNotes.length === 0 ? (
          <p className="text-sm text-ink-400">No debit notes raised against this GRN.</p>
        ) : (
          <ul className="space-y-2">
            {relatedDebitNotes.map(dn => (
              <li key={dn.id} className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2">
                <div>
                  <button className="text-sm font-medium text-brand-700 hover:underline" onClick={() => { const l = recordLink('DebitNote', dn.id); if (l) navigate(l) }}>{dn.debitNoteNumber}</button>
                  <p className="text-xs text-ink-500">{dn.remarks}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink-800">₹{dn.amount.toLocaleString('en-IN')}</p>
                  <StatusBadge status={dn.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-ink-800">Resulting Stock Ledger Entries</h3>
        {relatedLedger.length === 0 ? (
          <p className="text-sm text-ink-400">No stock ledger entries posted yet &mdash; entries are posted once the GRN is accepted by the HOD.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ink-200">
            <table className="min-w-full divide-y divide-ink-200 text-sm">
              <thead className="bg-ink-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {relatedLedger.map(e => (
                  <tr key={e.id}>
                    <td className="px-3 py-2 text-ink-600">{fmtDate(e.date)}</td>
                    <td className="px-3 py-2"><StatusBadge status={e.txnType} /></td>
                    <td className="px-3 py-2 font-medium text-emerald-700">+{e.qty}</td>
                    <td className="px-3 py-2 text-ink-600">{e.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  const workflowSteps: TimelineStep[] = auditLog
    .filter(a => a.recordType === 'GRN' && a.recordId === grn.id)
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(a => ({
      id: a.id,
      title: a.action,
      subtitle: a.reason ?? (a.oldValue || a.newValue ? `${a.oldValue ?? '-'} → ${a.newValue ?? '-'}` : undefined),
      timestamp: a.timestamp,
      tone: a.action.includes('ACCEPTED') ? 'success' : a.action.includes('REJECTED') ? 'danger' : 'info',
    }))

  const tabs: TabItem[] = [
    { key: 'overview', label: 'Overview', content: overviewTab },
    { key: 'related', label: 'Related Records', content: relatedTab },
    { key: 'workflow', label: 'Workflow Status', content: <Timeline steps={workflowSteps} /> },
    { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="GRN" recordId={grn.id} /> },
    { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="GRN" recordId={grn.id} /> },
  ]

  return (
    <div>
      <PageHeader
        title={grn.grnNumber}
        subtitle={`GRN against ${po?.poNumber ?? 'Purchase Order'} — ${vendor?.name ?? ''}`}
        breadcrumb={[{ label: 'GRN / Store In', to: '/grn' }, { label: grn.grnNumber }]}
        actions={
          canHodCheck ? (
            <>
              <Button
                variant="success" icon={<Check className="h-4 w-4" />}
                disabled={!isPE}
                title={!isPE ? 'Only the Project Engineer (HOD) can check and accept a GRN.' : 'Accept this GRN'}
                onClick={() => setConfirmDecision('ACCEPTED')}
              >
                Accept (HOD Check)
              </Button>
              <Button
                variant="danger" icon={<X className="h-4 w-4" />}
                disabled={!isPE}
                title={!isPE ? 'Only the Project Engineer (HOD) can check and reject a GRN.' : 'Reject this GRN'}
                onClick={() => setConfirmDecision('REJECTED')}
              >
                Reject
              </Button>
            </>
          ) : undefined
        }
      />

      <Tabs tabs={tabs} />

      <Modal
        open={confirmDecision !== null}
        onClose={() => setConfirmDecision(null)}
        title={confirmDecision === 'ACCEPTED' ? 'Accept GRN' : 'Reject GRN'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDecision(null)}>Cancel</Button>
            <Button
              variant={confirmDecision === 'ACCEPTED' ? 'success' : 'danger'}
              onClick={() => { if (confirmDecision) { hodCheckGRN(grn.id, confirmDecision); setConfirmDecision(null) } }}
            >
              Confirm {confirmDecision === 'ACCEPTED' ? 'Accept' : 'Reject'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          {confirmDecision === 'ACCEPTED'
            ? 'Accepting will post accepted quantities to stock and auto-raise a debit note for any rejected quantity.'
            : 'Rejecting this GRN will close it without posting any quantity to stock. This action cannot be undone — a fresh GRN will be required if the material is re-inspected.'}
        </p>
      </Modal>
    </div>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span className="text-xs text-ink-500">{label}</span>
      <p className="font-medium text-ink-800">{value}</p>
    </div>
  )
}

function RelatedRow({ label, value, status, link }: { label: string; value?: string; status?: string; link: string | null }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2.5">
      <div>
        <span className="text-xs text-ink-500">{label}</span>
        <p className="font-medium text-ink-800">{value ?? 'Not available'}</p>
      </div>
      <div className="flex items-center gap-2">
        {status && <StatusBadge status={status} />}
        <Button size="sm" variant="secondary" disabled={!link} title={!link ? 'No detail page available for this record.' : undefined} onClick={() => link && navigate(link)}>View</Button>
      </div>
    </div>
  )
}
