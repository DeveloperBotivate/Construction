import { Link, useParams } from 'react-router-dom'
import { PackageCheck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { Tabs } from '../../components/ui/Tabs'
import type { TabItem } from '../../components/ui/Tabs'
import { recordLink } from '../../lib/recordLinks'
import { fmtDate } from '../../lib/utils'

export default function DispatchDetail() {
  const { id } = useParams<{ id: string }>()
  const user = useStore(s => s.currentUser!)
  const state = useStore(s => s)
  const markDispatchAtSite = useStore(s => s.markDispatchAtSite)

  const dispatch = state.dispatches.find(d => d.id === id)

  if (!dispatch) {
    return (
      <div>
        <PageHeader title="Dispatch not found" breadcrumb={[{ label: 'Dispatch Tracking', to: '/dispatch' }, { label: 'Not found' }]} />
        <EmptyState message="This dispatch record does not exist or has been removed." />
      </div>
    )
  }

  const po = state.purchaseOrders.find(p => p.id === dispatch.poId)
  const vendor = state.vendors.find(v => v.id === dispatch.vendorId)
  const material = state.materials.find(m => m.id === dispatch.materialId)
  const grn = state.grns.find(g => g.dispatchId === dispatch.id)
  const grnLink = grn ? recordLink('GRN', grn.id) : null
  const poLink = po ? recordLink('PurchaseOrder', po.id) : null

  const canMarkAtSite = user.role === 'STORE' && dispatch.status === 'IN_TRANSIT'

  const overviewTab = (
    <div className="space-y-4">
      <Card>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><dt className="text-xs uppercase text-ink-500">Purchase Order</dt><dd className="font-medium text-ink-800">{poLink ? <Link to={poLink} className="text-brand-600 hover:underline">{po?.poNumber}</Link> : '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Vendor</dt><dd className="font-medium text-ink-800">{vendor?.name ?? '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Material</dt><dd className="font-medium text-ink-800">{material?.name ?? '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Qty</dt><dd className="font-medium text-ink-800">{dispatch.qty}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Status</dt><dd><StatusBadge status={dispatch.status} /></dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Vehicle Number</dt><dd className="font-medium text-ink-800">{dispatch.vehicleNumber || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Driver</dt><dd className="font-medium text-ink-800">{dispatch.driver || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Transporter</dt><dd className="font-medium text-ink-800">{dispatch.transporter || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Challan Number</dt><dd className="font-medium text-ink-800">{dispatch.challanNumber || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">LR Number</dt><dd className="font-medium text-ink-800">{dispatch.lrNumber || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Dispatch Date</dt><dd className="font-medium text-ink-800">{fmtDate(dispatch.dispatchDate)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Expected Arrival</dt><dd className="font-medium text-ink-800">{fmtDate(dispatch.expectedArrival)}</dd></div>
        </dl>
      </Card>

      <SectionCard title="Goods Receipt">
        {grn ? (
          <p className="text-sm text-ink-700">
            Received against {grnLink ? <Link to={grnLink} className="text-brand-600 hover:underline">{grn.grnNumber}</Link> : grn.grnNumber} &mdash; <StatusBadge status={grn.status} />
          </p>
        ) : (
          <p className="text-sm text-ink-400">No GRN has been raised for this dispatch yet. GRN creation happens in the Store module once material physically arrives and is inspected.</p>
        )}
      </SectionCard>
    </div>
  )

  const tabs: TabItem[] = [
    { key: 'overview', label: 'Overview', content: overviewTab },
    { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="Dispatch" recordId={dispatch.id} /> },
    { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="Dispatch" recordId={dispatch.id} /> },
  ]

  return (
    <div>
      <PageHeader
        title={dispatch.dispatchNumber}
        subtitle={`${material?.name ?? ''} - ${dispatch.qty} units via ${dispatch.vehicleNumber || 'unspecified vehicle'}`}
        breadcrumb={[{ label: 'Dispatch Tracking', to: '/dispatch' }, { label: dispatch.dispatchNumber }]}
        actions={dispatch.status === 'IN_TRANSIT' ? (
          <Button variant="primary" icon={<PackageCheck className="h-4 w-4" />} disabled={!canMarkAtSite} title={!canMarkAtSite ? 'Only Store staff can mark a dispatch as arrived at site.' : undefined} onClick={() => markDispatchAtSite(dispatch.id)}>
            Mark At Site
          </Button>
        ) : undefined}
      />
      <Tabs tabs={tabs} />
    </div>
  )
}
