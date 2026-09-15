import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Send, PackageCheck, Ban } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs } from '../../components/ui/Tabs'
import type { TabItem } from '../../components/ui/Tabs'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { ApprovalActionBar } from '../../components/ui/ApprovalActionBar'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { recordLink } from '../../lib/recordLinks'
import { fmtCurrency, fmtDate } from '../../lib/utils'

export default function PODetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const state = useStore(s => s)
  const submitPO = useStore(s => s.submitPO)
  const issuePO = useStore(s => s.issuePO)
  const cancelPO = useStore(s => s.cancelPO)

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const po = state.purchaseOrders.find(p => p.id === id)

  if (!po) {
    return (
      <div>
        <PageHeader title="Purchase Order not found" breadcrumb={[{ label: 'Purchase Orders', to: '/po' }, { label: 'Not found' }]} />
        <EmptyState message="This purchase order does not exist or has been removed." />
      </div>
    )
  }

  const vendor = state.vendors.find(v => v.id === po.vendorId)
  const project = state.projects.find(p => p.id === po.projectId)
  const site = state.sites.find(s => s.id === po.siteId)
  const dispatches = state.dispatches.filter(d => d.poId === po.id)
  const grns = state.grns.filter(g => g.poId === po.id)

  const canManage = user.role === 'PROCUREMENT'
  const canCancel = canManage && (po.status === 'DRAFT' || po.status === 'MGMT_APPROVAL_PENDING')

  const overviewTab = (
    <div className="space-y-4">
      <Card>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><dt className="text-xs uppercase text-ink-500">Vendor</dt><dd className="font-medium text-ink-800">{vendor?.name ?? '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Project / Site</dt><dd className="font-medium text-ink-800">{project?.code ?? '-'} / {site?.name ?? '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Status</dt><dd><StatusBadge status={po.status} /></dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Total</dt><dd className="font-semibold text-ink-800">{fmtCurrency(po.total)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Freight</dt><dd className="font-medium text-ink-800">{fmtCurrency(po.freight)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Expected Delivery</dt><dd className="font-medium text-ink-800">{fmtDate(po.expectedDelivery)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Delivery Location</dt><dd className="font-medium text-ink-800">{po.deliveryLocation || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Payment Terms</dt><dd className="font-medium text-ink-800">{po.paymentTerms || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Warranty</dt><dd className="font-medium text-ink-800">{po.warranty || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Created</dt><dd className="font-medium text-ink-800">{fmtDate(po.createdAt)}</dd></div>
          <div className="col-span-2 sm:col-span-4"><dt className="text-xs uppercase text-ink-500">Terms & Conditions</dt><dd className="text-ink-700">{po.terms || '-'}</dd></div>
        </dl>
      </Card>

      <Card padded={false}>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full divide-y divide-ink-200 text-sm">
            <thead className="bg-ink-50">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-ink-500">Material</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-ink-500">Ordered Qty</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-ink-500">Rate</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-ink-500">Tax %</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-ink-500">Received Qty</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-ink-500">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 bg-white">
              {po.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2.5 font-medium text-ink-800">{it.materialName}</td>
                  <td className="px-3 py-2.5 text-ink-600">{it.qty} {it.unit}</td>
                  <td className="px-3 py-2.5 text-ink-600">{fmtCurrency(it.rate)}</td>
                  <td className="px-3 py-2.5 text-ink-600">{it.tax}%</td>
                  <td className="px-3 py-2.5 text-ink-600">{it.receivedQty} {it.unit}</td>
                  <td className="px-3 py-2.5 text-ink-600">{Math.max(0, it.qty - it.receivedQty)} {it.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  const enquiryLink = recordLink('Enquiry', po.rfqId)
  const indentLink = recordLink('MaterialIndent', po.indentId)

  const relatedTab = (
    <div className="space-y-3">
      <Card>
        <h4 className="mb-2 text-xs font-semibold uppercase text-ink-500">Originating Records</h4>
        <div className="flex flex-wrap gap-3 text-sm">
          {indentLink ? <Link to={indentLink} className="text-brand-600 hover:underline">Material Indent</Link> : <span className="text-ink-400">No linked indent</span>}
          {enquiryLink ? <Link to={enquiryLink} className="text-brand-600 hover:underline">Enquiry / RFQ</Link> : <span className="text-ink-400">No linked enquiry</span>}
        </div>
      </Card>
      <Card>
        <h4 className="mb-2 text-xs font-semibold uppercase text-ink-500">Dispatches</h4>
        {dispatches.length === 0 ? <p className="text-sm text-ink-400">No dispatch created against this PO yet.</p> : (
          <ul className="space-y-1 text-sm">
            {dispatches.map(d => (
              <li key={d.id}>
                <Link to={`/dispatch/${d.id}`} className="text-brand-600 hover:underline">{d.dispatchNumber}</Link>
                <span className="ml-2 text-ink-500">{d.qty} units - <StatusBadge status={d.status} /></span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <h4 className="mb-2 text-xs font-semibold uppercase text-ink-500">Goods Receipt Notes</h4>
        {grns.length === 0 ? <p className="text-sm text-ink-400">No GRN recorded against this PO yet.</p> : (
          <ul className="space-y-1 text-sm">
            {grns.map(g => {
              const link = recordLink('GRN', g.id)
              return (
                <li key={g.id}>
                  {link ? <Link to={link} className="text-brand-600 hover:underline">{g.grnNumber}</Link> : <span>{g.grnNumber}</span>}
                  <span className="ml-2 text-ink-500"><StatusBadge status={g.status} /></span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )

  const tabs: TabItem[] = [
    { key: 'overview', label: 'Overview', content: overviewTab },
    { key: 'approvals', label: 'Approval History', content: <ApprovalActionBar recordId={po.id} /> },
    { key: 'related', label: 'Related Records', content: relatedTab },
    { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="PurchaseOrder" recordId={po.id} /> },
    { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="PurchaseOrder" recordId={po.id} /> },
  ]

  return (
    <div>
      <PageHeader
        title={po.poNumber}
        subtitle={`${vendor?.name ?? ''} - ${fmtCurrency(po.total)}`}
        breadcrumb={[{ label: 'Purchase Orders', to: '/po' }, { label: po.poNumber }]}
        actions={<>
          {po.status === 'DRAFT' && (
            <Button variant="primary" icon={<Send className="h-4 w-4" />} disabled={!canManage} title={!canManage ? 'Only Procurement can submit this PO for approval.' : undefined} onClick={() => submitPO(po.id)}>
              Submit for Approval
            </Button>
          )}
          {po.status === 'APPROVED' && (
            <Button variant="success" icon={<PackageCheck className="h-4 w-4" />} disabled={!canManage} title={!canManage ? 'Only Procurement can issue this PO.' : undefined} onClick={() => issuePO(po.id)}>
              Issue to Vendor
            </Button>
          )}
          {(po.status === 'DRAFT' || po.status === 'MGMT_APPROVAL_PENDING') && (
            <Button variant="danger" icon={<Ban className="h-4 w-4" />} disabled={!canCancel} title={!canCancel ? 'Only Procurement can cancel this PO.' : undefined} onClick={() => setCancelOpen(true)}>
              Cancel
            </Button>
          )}
        </>}
      />
      <Tabs tabs={tabs} />

      <Modal
        open={cancelOpen}
        onClose={() => { setCancelOpen(false); setCancelReason('') }}
        title="Cancel Purchase Order"
        footer={<>
          <Button variant="secondary" onClick={() => { setCancelOpen(false); setCancelReason('') }}>Close</Button>
          <Button
            variant="danger"
            disabled={!cancelReason.trim()}
            onClick={() => { cancelPO(po.id, cancelReason.trim()); setCancelOpen(false); setCancelReason(''); navigate('/po') }}
          >
            Confirm Cancellation
          </Button>
        </>}
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Reason for cancellation (required)</label>
        <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Explain why this PO is being cancelled..." />
      </Modal>
    </div>
  )
}
