import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpFromLine, Truck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency, fmtDate, nowIso } from '../../lib/utils'
import type { PurchaseOrder } from '../../types'

export default function Lifting() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const dispatches = useStore(s => s.dispatches)
  const vendors = useStore(s => s.vendors)
  const materials = useStore(s => s.materials)
  const createDispatch = useStore(s => s.createDispatch)

  const [activePO, setActivePO] = useState<PurchaseOrder | null>(null)
  const [materialId, setMaterialId] = useState('')
  const [qty, setQty] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [driver, setDriver] = useState('')
  const [transporter, setTransporter] = useState('')
  const [challanNumber, setChallanNumber] = useState('')
  const [lrNumber, setLrNumber] = useState('')
  const [expectedArrival, setExpectedArrival] = useState('')

  const pending = purchaseOrders.filter(po => po.status === 'ISSUED' && !dispatches.some(d => d.poId === po.id))
  const isVendor = user.role === 'VENDOR'

  function openDrawer(po: PurchaseOrder) {
    setActivePO(po)
    setMaterialId(po.items[0]?.materialId ?? '')
    setQty(String(po.items[0]?.qty ?? ''))
    setVehicleNumber(''); setDriver(''); setTransporter(''); setChallanNumber(''); setLrNumber(''); setExpectedArrival('')
  }

  function handleCreateDispatch() {
    if (!activePO || !materialId || !qty) return
    const dispatch = createDispatch({
      poId: activePO.id, vendorId: activePO.vendorId, materialId, qty: Number(qty) || 0,
      vehicleNumber, driver, transporter, challanNumber, lrNumber, expectedArrival: expectedArrival || nowIso(),
    })
    setActivePO(null)
    navigate(`/dispatch/${dispatch.id}`)
  }

  const columns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', header: 'PO #', render: r => <span className="font-medium text-ink-800">{r.poNumber}</span>, sortValue: r => r.poNumber },
    { key: 'vendor', header: 'Vendor', render: r => vendors.find(v => v.id === r.vendorId)?.name ?? '-' },
    { key: 'materials', header: 'Materials', render: r => r.items.map(i => i.materialName).join(', ') },
    { key: 'qty', header: 'Total Qty', render: r => r.items.reduce((sum, i) => sum + i.qty, 0) },
    { key: 'total', header: 'PO Value', render: r => fmtCurrency(r.total) },
    { key: 'expectedDelivery', header: 'Expected Delivery', render: r => fmtDate(r.expectedDelivery), sortValue: r => r.expectedDelivery },
    {
      key: 'actions', header: 'Actions', render: r => (
        <div onClick={e => e.stopPropagation()}>
          {isVendor ? (
            <Button size="sm" variant="primary" icon={<Truck className="h-3.5 w-3.5" />} onClick={() => openDrawer(r)}>Create Dispatch</Button>
          ) : (
            <span className="text-xs text-ink-400">Awaiting vendor lifting</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Lifting" subtitle="Purchase Orders issued to vendors and awaiting material lifting / dispatch." />
      <DataTable
        columns={columns}
        data={pending}
        keyField={r => r.id}
        searchable
        searchPlaceholder="Search issued POs..."
        searchFields={r => `${r.poNumber} ${vendors.find(v => v.id === r.vendorId)?.name ?? ''}`}
        emptyMessage="No issued Purchase Orders are awaiting lifting."
        emptyIcon={<ArrowUpFromLine className="h-8 w-8" />}
      />

      <Drawer
        open={!!activePO}
        onClose={() => setActivePO(null)}
        title="Create Dispatch"
        subtitle={activePO ? `Against ${activePO.poNumber} - ${vendors.find(v => v.id === activePO.vendorId)?.name ?? ''}` : undefined}
        footer={<>
          <Button variant="secondary" onClick={() => setActivePO(null)}>Cancel</Button>
          <Button variant="primary" disabled={!materialId || !qty} onClick={handleCreateDispatch}>Create Dispatch</Button>
        </>}
      >
        {activePO && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Material</label>
              <select value={materialId} onChange={e => setMaterialId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                {activePO.items.map(it => <option key={it.materialId} value={it.materialId}>{materials.find(m => m.id === it.materialId)?.name ?? it.materialName}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Qty</label>
              <input type="number" min="0" value={qty} onChange={e => setQty(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Vehicle Number</label>
                <input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Driver</label>
                <input value={driver} onChange={e => setDriver(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Transporter</label>
                <input value={transporter} onChange={e => setTransporter(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Expected Arrival</label>
                <input type="date" value={expectedArrival} onChange={e => setExpectedArrival(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Challan Number</label>
                <input value={challanNumber} onChange={e => setChallanNumber(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">LR Number</label>
                <input value={lrNumber} onChange={e => setLrNumber(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
