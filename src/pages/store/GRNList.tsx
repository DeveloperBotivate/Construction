import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ClipboardCheck, Plus, Eye } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { fmtDate } from '../../lib/utils'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import type { GRN, GRNLine } from '../../types'

interface Row {
  grn: GRN
  poNumber: string
  vendorName: string
  siteLabel: string
}

export default function GRNList() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useStore(s => s.currentUser!)
  const grns = useStore(s => s.grns)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const vendors = useStore(s => s.vendors)
  const sites = useStore(s => s.sites)
  const dispatches = useStore(s => s.dispatches)
  const materials = useStore(s => s.materials)
  const createGRN = useStore(s => s.createGRN)
  const selectedProjectId = useStore(s => s.selectedProjectId)

  const isStore = user.role === 'STORE'

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDispatchId, setSelectedDispatchId] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [challan, setChallan] = useState('')
  const [receivedQty, setReceivedQty] = useState(0)
  const [rejectedQty, setRejectedQty] = useState(0)
  const [damagedQty, setDamagedQty] = useState(0)
  const [batch, setBatch] = useState('')
  const [locationField, setLocationField] = useState('')
  const [inspection, setInspection] = useState('')
  const [remarks, setRemarks] = useState('')

  const eligibleDispatches = dispatches.filter(d => !grns.some(g => g.dispatchId === d.id))

  function resetForm() {
    setSelectedDispatchId('')
    setVehicle(''); setChallan(''); setReceivedQty(0); setRejectedQty(0); setDamagedQty(0)
    setBatch(''); setLocationField(''); setInspection(''); setRemarks('')
  }

  function openForDispatch(dispatchId: string) {
    const dispatch = dispatches.find(d => d.id === dispatchId)
    setSelectedDispatchId(dispatchId)
    setVehicle(dispatch?.vehicleNumber ?? '')
    setChallan(dispatch?.challanNumber ?? '')
    setReceivedQty(dispatch?.qty ?? 0)
    setRejectedQty(0)
    setDamagedQty(0)
    setBatch('')
    setLocationField('')
    setInspection('')
    setRemarks('')
    setDrawerOpen(true)
  }

  useEffect(() => {
    const state = location.state as { dispatchId?: string } | null
    const dispatchId = state?.dispatchId
    if (dispatchId && eligibleDispatches.some(d => d.id === dispatchId)) {
      openForDispatch(dispatchId)
      navigate(location.pathname, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedDispatch = dispatches.find(d => d.id === selectedDispatchId)
  const selectedPO = selectedDispatch ? purchaseOrders.find(p => p.id === selectedDispatch.poId) : undefined
  const selectedMaterial = selectedDispatch ? materials.find(m => m.id === selectedDispatch.materialId) : undefined
  const poLine = selectedPO && selectedDispatch ? selectedPO.items.find(i => i.materialId === selectedDispatch.materialId) : undefined

  const acceptedQty = Math.max(0, receivedQty - rejectedQty)
  const canSubmit = !!selectedDispatch && !!selectedPO && !!selectedMaterial && receivedQty > 0 && rejectedQty >= 0 && rejectedQty <= receivedQty && damagedQty <= rejectedQty

  function handleSubmit() {
    if (!selectedDispatch || !selectedPO || !selectedMaterial) return
    const line: GRNLine = {
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      unit: selectedMaterial.unit,
      orderedQty: poLine?.qty ?? selectedDispatch.qty,
      receivedQty,
      acceptedQty,
      rejectedQty,
      damagedQty,
      batch,
      location: locationField,
    }
    const grn = createGRN({
      poId: selectedPO.id,
      dispatchId: selectedDispatch.id,
      vendorId: selectedDispatch.vendorId,
      projectId: selectedPO.projectId,
      siteId: selectedPO.siteId,
      vehicle,
      challan,
      items: [line],
      inspection,
      remarks,
    })
    setDrawerOpen(false)
    resetForm()
    navigate(`/grn/${grn.id}`)
  }

  const rows: Row[] = grns
    .filter(g => !selectedProjectId || g.projectId === selectedProjectId)
    .map(g => ({
      grn: g,
      poNumber: purchaseOrders.find(p => p.id === g.poId)?.poNumber ?? '-',
      vendorName: vendors.find(v => v.id === g.vendorId)?.name ?? '-',
      siteLabel: sites.find(s => s.id === g.siteId)?.name ?? '-',
    }))
    .sort((a, b) => new Date(b.grn.createdAt).getTime() - new Date(a.grn.createdAt).getTime())

  const columns: Column<Row>[] = [
    { key: 'grnNumber', header: 'GRN #', render: r => <span className="font-medium text-ink-800">{r.grn.grnNumber}</span>, sortValue: r => r.grn.grnNumber },
    { key: 'po', header: 'PO Number', render: r => r.poNumber },
    { key: 'vendor', header: 'Vendor', render: r => r.vendorName, hideBelow: 'md' },
    { key: 'site', header: 'Site', render: r => r.siteLabel, hideBelow: 'lg' },
    { key: 'ordered', header: 'Ordered', render: r => r.grn.items.reduce((s, i) => s + i.orderedQty, 0) },
    { key: 'received', header: 'Received', render: r => r.grn.items.reduce((s, i) => s + i.receivedQty, 0) },
    { key: 'accepted', header: 'Accepted', render: r => r.grn.items.reduce((s, i) => s + i.acceptedQty, 0) },
    { key: 'rejected', header: 'Rejected', render: r => r.grn.items.reduce((s, i) => s + i.rejectedQty, 0) },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.grn.status} /> },
    { key: 'createdAt', header: 'Created', render: r => fmtDate(r.grn.createdAt), sortValue: r => r.grn.createdAt },
    {
      key: 'actions', header: 'Actions', render: r => (
        <Button size="sm" variant="secondary" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => navigate(`/grn/${r.grn.id}`)}>View</Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="GRN / Store In"
        subtitle="Goods Receipt Notes recorded against incoming dispatches."
        actions={
          <Button
            variant="primary" icon={<Plus className="h-4 w-4" />}
            disabled={!isStore || eligibleDispatches.length === 0}
            title={!isStore ? 'Only the Store Keeper can create a GRN.' : eligibleDispatches.length === 0 ? 'No dispatches are available to receive against — all current dispatches already have a GRN.' : 'Create a new GRN'}
            onClick={() => { resetForm(); setDrawerOpen(true) }}
          >
            Create GRN
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        keyField={r => r.grn.id}
        onRowClick={r => navigate(`/grn/${r.grn.id}`)}
        searchable
        searchPlaceholder="Search by GRN, PO or vendor..."
        searchFields={r => `${r.grn.grnNumber} ${r.poNumber} ${r.vendorName}`}
        emptyMessage="No GRNs recorded yet."
        emptyIcon={<ClipboardCheck className="h-8 w-8" />}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); resetForm() }}
        title="Create GRN"
        subtitle="Record inspection results for an incoming dispatch."
        width="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setDrawerOpen(false); resetForm() }}>Cancel</Button>
            <Button
              variant="primary" disabled={!canSubmit}
              title={!canSubmit ? 'Select a dispatch and enter a valid received quantity (rejected + damaged qty cannot exceed received qty).' : undefined}
              onClick={handleSubmit}
            >
              Create GRN
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Dispatch *</label>
            <select
              value={selectedDispatchId}
              onChange={e => openForDispatch(e.target.value)}
              className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select a dispatch...</option>
              {eligibleDispatches.map(d => {
                const mat = materials.find(m => m.id === d.materialId)
                return <option key={d.id} value={d.id}>{d.dispatchNumber} &mdash; {mat?.name ?? d.materialId} ({d.qty} {mat?.unit ?? ''}) &mdash; {d.vehicleNumber}</option>
              })}
            </select>
            {eligibleDispatches.length === 0 && <p className="mt-1 text-xs text-ink-400">No dispatches are currently pending a GRN.</p>}
          </div>

          {selectedDispatch && (
            <>
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm">
                <div><span className="text-xs text-ink-500">PO Number</span><p className="font-medium text-ink-800">{selectedPO?.poNumber ?? '-'}</p></div>
                <div><span className="text-xs text-ink-500">Vendor</span><p className="font-medium text-ink-800">{vendors.find(v => v.id === selectedDispatch.vendorId)?.name ?? '-'}</p></div>
                <div><span className="text-xs text-ink-500">Material</span><p className="font-medium text-ink-800">{selectedMaterial?.name ?? '-'}</p></div>
                <div><span className="text-xs text-ink-500">Ordered Qty</span><p className="font-medium text-ink-800">{poLine?.qty ?? selectedDispatch.qty} {selectedMaterial?.unit}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-600">Vehicle Number</label>
                  <input value={vehicle} onChange={e => setVehicle(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-600">Challan Number</label>
                  <input value={challan} onChange={e => setChallan(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>

              <div className="rounded-lg border border-ink-200 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Line Item &mdash; {selectedMaterial?.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-600">Received Qty *</label>
                    <input type="number" min={0} value={receivedQty} onChange={e => setReceivedQty(Math.max(0, Number(e.target.value)))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-600">Rejected Qty</label>
                    <input type="number" min={0} max={receivedQty} value={rejectedQty} onChange={e => setRejectedQty(Math.min(receivedQty, Math.max(0, Number(e.target.value))))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-600">Damaged Qty (subset of rejected)</label>
                    <input type="number" min={0} max={rejectedQty} value={damagedQty} onChange={e => setDamagedQty(Math.min(rejectedQty, Math.max(0, Number(e.target.value))))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-600">Accepted Qty (auto)</label>
                    <input type="number" disabled value={acceptedQty} className="w-full rounded-md border border-ink-200 bg-ink-100 px-3 py-2 text-sm text-ink-600" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-600">Batch</label>
                    <input value={batch} onChange={e => setBatch(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-600">Storage Location</label>
                    <input value={locationField} onChange={e => setLocationField(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Inspection Notes</label>
                <textarea value={inspection} onChange={e => setInspection(e.target.value)} rows={2} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Visual / moisture / quality check observations..." />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Remarks</label>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
            </>
          )}
        </div>
      </Drawer>
    </div>
  )
}
