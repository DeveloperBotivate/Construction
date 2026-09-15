import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Truck, ClipboardCheck, PackageMinus, PackageX, FileBarChart, AlertTriangle, Warehouse } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getStockBalance, deriveExceptions } from '../../store/selectors'
import { fmtDate } from '../../lib/utils'
import { PageHeader } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'

export default function StoreDashboardPage() {
  const state = useStore(s => s)
  const { selectedProjectId, selectedSiteId, materials, sites, purchaseOrders, vendors, dispatches, grns, storeIssues, storeReturns, stockAudits } = state
  const site = sites.find(s => s.id === selectedSiteId)

  const expectedDeliveries = dispatches
    .filter(d => d.status === 'IN_TRANSIT' || d.status === 'AT_SITE')
    .map(d => ({ dispatch: d, po: purchaseOrders.find(p => p.id === d.poId) }))
    .filter(x => !selectedProjectId || x.po?.projectId === selectedProjectId)

  const pendingGrns = grns.filter(g => g.status === 'HOD_CHECK' && g.siteId === selectedSiteId)

  const inventory = materials.map(m => ({ material: m, balance: getStockBalance(state, m.id, selectedSiteId) }))
  const lowStockRows = inventory.filter(i => i.balance < i.material.reorderLevel)

  const lowStockExceptions = deriveExceptions(state).filter(e => e.type === 'LOW_STOCK' && e.projectId === selectedProjectId)

  const siteIssuesList = storeIssues.filter(i => i.siteId === selectedSiteId)
  const openIssueCount = siteIssuesList.filter(i => i.status !== 'ISSUED').length
  const recentIssues = siteIssuesList.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  const siteReturns = storeReturns.filter(r => r.siteId === selectedSiteId)
  const pendingReturns = siteReturns.filter(r => r.status === 'REQUESTED')
  const recentReturns = siteReturns.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  const siteAudits = stockAudits.filter(a => a.siteId === selectedSiteId)
  const lastCompletedAudit = siteAudits.filter(a => a.status === 'COMPLETED').slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  const rejectedQtyTotal = grns.filter(g => g.siteId === selectedSiteId).reduce((sum, g) => sum + g.items.reduce((s, l) => s + l.rejectedQty, 0), 0)

  return (
    <div>
      <PageHeader
        title="Store Dashboard"
        subtitle={site ? `${site.name} — live inventory, deliveries and store transactions overview` : 'Store operations overview'}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Expected Deliveries" value={expectedDeliveries.length} sub="In transit / at site" icon={<Truck className="h-4 w-4" />} tone={expectedDeliveries.length > 0 ? 'brand' : 'neutral'} />
        <KpiCard label="Pending GRNs" value={pendingGrns.length} sub="Awaiting HOD check" icon={<ClipboardCheck className="h-4 w-4" />} tone={pendingGrns.length > 0 ? 'warning' : 'neutral'} />
        <KpiCard label="Low Stock Materials" value={lowStockExceptions.length} sub="Below reorder level" icon={<AlertTriangle className="h-4 w-4" />} tone={lowStockExceptions.length > 0 ? 'danger' : 'success'} />
        <KpiCard label="Open Store Issues" value={openIssueCount} sub={`${siteIssuesList.length} total requests`} icon={<PackageMinus className="h-4 w-4" />} tone={openIssueCount > 0 ? 'warning' : 'neutral'} />
        <KpiCard label="Pending Returns" value={pendingReturns.length} sub={`${siteReturns.length} total returns`} icon={<PackageX className="h-4 w-4" />} tone={pendingReturns.length > 0 ? 'warning' : 'neutral'} />
        <KpiCard label="Rejected Material Qty" value={rejectedQtyTotal} sub="Across all GRNs at this site" icon={<AlertTriangle className="h-4 w-4" />} tone={rejectedQtyTotal > 0 ? 'danger' : 'success'} />
        <KpiCard label="Last Stock Audit" value={lastCompletedAudit ? fmtDate(lastCompletedAudit.date) : 'None yet'} sub={lastCompletedAudit ? lastCompletedAudit.auditNumber : 'No completed audit'} icon={<FileBarChart className="h-4 w-4" />} />
        <KpiCard label="Materials Tracked" value={materials.length} sub="Master catalogue" icon={<Warehouse className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Expected Deliveries" actions={<Link to="/expected-deliveries" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>}>
          {expectedDeliveries.length === 0 ? (
            <EmptyState message="No dispatches currently in transit or at site." icon={<Truck className="h-7 w-7" />} />
          ) : (
            <MiniTable
              headers={['Dispatch', 'Material', 'Vendor', 'Vehicle', 'Expected', 'Status']}
              rows={expectedDeliveries.slice(0, 6).map(({ dispatch }) => [
                dispatch.dispatchNumber,
                materials.find(m => m.id === dispatch.materialId)?.name ?? '-',
                vendors.find(v => v.id === dispatch.vendorId)?.name ?? '-',
                dispatch.vehicleNumber,
                fmtDate(dispatch.expectedArrival),
                <StatusBadge key="s" status={dispatch.status} />,
              ])}
            />
          )}
        </SectionCard>

        <SectionCard title="Pending GRNs (HOD Check)" actions={<Link to="/grn" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>}>
          {pendingGrns.length === 0 ? (
            <EmptyState message="No GRNs awaiting HOD check." icon={<ClipboardCheck className="h-7 w-7" />} />
          ) : (
            <MiniTable
              headers={['GRN', 'Vendor', 'Materials', 'Received', 'Created']}
              rows={pendingGrns.slice(0, 6).map(g => [
                g.grnNumber,
                vendors.find(v => v.id === g.vendorId)?.name ?? '-',
                g.items.map(i => i.materialName).join(', '),
                g.items.reduce((s, i) => s + i.receivedQty, 0),
                fmtDate(g.createdAt),
              ])}
            />
          )}
        </SectionCard>

        <SectionCard title="Inventory Snapshot" actions={<Link to="/inventory" className="text-xs font-medium text-brand-600 hover:underline">Full inventory</Link>} className="lg:col-span-2">
          <MiniTable
            headers={['Material', 'Code', 'Balance', 'Reorder Level', 'Status']}
            rows={inventory.map(i => [
              i.material.name,
              i.material.code,
              `${i.balance} ${i.material.unit}`,
              `${i.material.reorderLevel} ${i.material.unit}`,
              <StatusBadge key="s" status={i.balance < i.material.reorderLevel ? 'WARNING' : 'ACTIVE'} label={i.balance < i.material.reorderLevel ? 'Low Stock' : 'Adequate'} />,
            ])}
          />
          {lowStockRows.length > 0 && (
            <p className="mt-3 text-xs text-amber-700">
              {lowStockRows.length} material(s) below reorder level: {lowStockRows.map(r => r.material.name).join(', ')}.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Recent Store Issues" actions={<Link to="/store-issue" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>}>
          {recentIssues.length === 0 ? (
            <EmptyState message="No store issue requests yet." icon={<PackageMinus className="h-7 w-7" />} />
          ) : (
            <MiniTable
              headers={['Issue No.', 'Material', 'Qty', 'Status']}
              rows={recentIssues.map(i => [
                i.issueNumber,
                materials.find(m => m.id === i.materialId)?.name ?? '-',
                i.qty,
                <StatusBadge key="s" status={i.status} />,
              ])}
            />
          )}
        </SectionCard>

        <SectionCard title="Recent Store Returns" actions={<Link to="/store-return" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>}>
          {recentReturns.length === 0 ? (
            <EmptyState message="No store returns recorded yet." icon={<PackageX className="h-7 w-7" />} />
          ) : (
            <MiniTable
              headers={['Return No.', 'Material', 'Qty', 'Condition', 'Status']}
              rows={recentReturns.map(r => [
                r.returnNumber,
                materials.find(m => m.id === r.materialId)?.name ?? '-',
                r.qty,
                <StatusBadge key="s" status={r.condition} />,
                <StatusBadge key="s2" status={r.status} />,
              ])}
            />
          )}
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard title="Stock Audit" actions={<Link to="/stock-audit"><Button size="sm" icon={<FileBarChart className="h-3.5 w-3.5" />}>Go to Stock Audits</Button></Link>}>
          <p className="text-sm text-ink-600">
            {lastCompletedAudit
              ? `Last completed physical audit: ${lastCompletedAudit.auditNumber} on ${fmtDate(lastCompletedAudit.date)}, ${lastCompletedAudit.lines.filter(l => l.variance !== 0).length} line(s) with variance.`
              : 'No completed stock audit found for this site yet.'}
          </p>
        </SectionCard>
      </div>
    </div>
  )
}

function MiniTable({ headers, rows }: { headers: string[]; rows: (string | number | ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ink-200">
      <table className="min-w-full divide-y divide-ink-200 text-sm">
        <thead className="bg-ink-50">
          <tr>
            {headers.map(h => <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 bg-white">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j} className="whitespace-nowrap px-3 py-2 text-ink-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
