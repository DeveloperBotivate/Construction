import { useNavigate } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fmtDate } from '../../lib/utils'
import type { Dispatch } from '../../types'

export default function DispatchList() {
  const navigate = useNavigate()
  const dispatches = useStore(s => s.dispatches)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const vendors = useStore(s => s.vendors)
  const materials = useStore(s => s.materials)

  const columns: Column<Dispatch>[] = [
    { key: 'dispatchNumber', header: 'Dispatch #', render: r => <span className="font-medium text-ink-800">{r.dispatchNumber}</span>, sortValue: r => r.dispatchNumber },
    { key: 'po', header: 'PO #', render: r => purchaseOrders.find(p => p.id === r.poId)?.poNumber ?? '-' },
    { key: 'vendor', header: 'Vendor', render: r => vendors.find(v => v.id === r.vendorId)?.name ?? '-' },
    { key: 'material', header: 'Material', render: r => materials.find(m => m.id === r.materialId)?.name ?? '-' },
    { key: 'qty', header: 'Qty', render: r => r.qty },
    { key: 'vehicle', header: 'Vehicle #', render: r => r.vehicleNumber || '-' },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'expectedArrival', header: 'Expected Arrival', render: r => fmtDate(r.expectedArrival), sortValue: r => r.expectedArrival },
  ]

  return (
    <div>
      <PageHeader title="Dispatch Tracking" subtitle="Track material dispatched by vendors from lifting through to site receipt." />
      <DataTable
        columns={columns}
        data={dispatches}
        keyField={r => r.id}
        onRowClick={r => navigate(`/dispatch/${r.id}`)}
        searchable
        searchPlaceholder="Search dispatches..."
        searchFields={r => `${r.dispatchNumber} ${r.vehicleNumber} ${purchaseOrders.find(p => p.id === r.poId)?.poNumber ?? ''}`}
        emptyMessage="No dispatches recorded yet."
        emptyIcon={<Truck className="h-8 w-8" />}
      />
    </div>
  )
}
