import { useNavigate } from 'react-router-dom'
import { PackageCheck, ClipboardPlus, MapPinCheck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { fmtDate } from '../../lib/utils'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import type { Dispatch } from '../../types'

interface Row {
  dispatch: Dispatch
  poNumber: string
  vendorName: string
  materialName: string
  projectId?: string
}

export default function ExpectedDeliveries() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const dispatches = useStore(s => s.dispatches)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const vendors = useStore(s => s.vendors)
  const materials = useStore(s => s.materials)
  const grns = useStore(s => s.grns)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const markDispatchAtSite = useStore(s => s.markDispatchAtSite)

  const isStore = user.role === 'STORE'

  const rows: Row[] = dispatches
    .filter(d => d.status === 'IN_TRANSIT' || d.status === 'AT_SITE')
    .map(d => {
      const po = purchaseOrders.find(p => p.id === d.poId)
      const row: Row = {
        dispatch: d,
        poNumber: po?.poNumber ?? '-',
        vendorName: vendors.find(v => v.id === d.vendorId)?.name ?? '-',
        materialName: materials.find(m => m.id === d.materialId)?.name ?? '-',
        projectId: po?.projectId,
      }
      return row
    })
    .filter(r => !selectedProjectId || r.projectId === selectedProjectId)

  const columns: Column<Row>[] = [
    { key: 'dispatchNumber', header: 'Dispatch #', render: r => <span className="font-medium text-ink-800">{r.dispatch.dispatchNumber}</span>, sortValue: r => r.dispatch.dispatchNumber },
    { key: 'po', header: 'PO Number', render: r => r.poNumber },
    { key: 'vendor', header: 'Vendor', render: r => r.vendorName, hideBelow: 'md' },
    { key: 'material', header: 'Material', render: r => r.materialName },
    { key: 'qty', header: 'Qty', render: r => r.dispatch.qty, sortValue: r => r.dispatch.qty },
    { key: 'vehicle', header: 'Vehicle', render: r => r.dispatch.vehicleNumber, hideBelow: 'lg' },
    { key: 'expected', header: 'Expected Arrival', render: r => fmtDate(r.dispatch.expectedArrival), sortValue: r => r.dispatch.expectedArrival },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.dispatch.status} /> },
    {
      key: 'actions', header: 'Actions', render: r => {
        const hasGrn = grns.some(g => g.dispatchId === r.dispatch.id)
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {r.dispatch.status === 'IN_TRANSIT' && (
              <Button
                size="sm" variant="secondary" icon={<MapPinCheck className="h-3.5 w-3.5" />}
                disabled={!isStore}
                title={!isStore ? 'Only the Store Keeper can mark a dispatch as arrived at site.' : 'Mark this dispatch as arrived at site'}
                onClick={() => markDispatchAtSite(r.dispatch.id)}
              >
                Mark At Site
              </Button>
            )}
            <Button
              size="sm" variant="primary" icon={<ClipboardPlus className="h-3.5 w-3.5" />}
              disabled={!isStore || hasGrn}
              title={!isStore ? 'Only the Store Keeper can create a GRN.' : hasGrn ? 'A GRN has already been created for this dispatch.' : 'Create a Goods Receipt Note for this dispatch'}
              onClick={() => navigate('/grn', { state: { dispatchId: r.dispatch.id } })}
            >
              Create GRN
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Expected Deliveries" subtitle="Dispatches currently in transit or arrived at site, pending GRN creation." />
      <DataTable
        columns={columns}
        data={rows}
        keyField={r => r.dispatch.id}
        searchable
        searchPlaceholder="Search by dispatch, vendor or material..."
        searchFields={r => `${r.dispatch.dispatchNumber} ${r.vendorName} ${r.materialName} ${r.dispatch.vehicleNumber}`}
        emptyMessage="No dispatches currently in transit or at site."
        emptyIcon={<PackageCheck className="h-8 w-8" />}
      />
    </div>
  )
}
