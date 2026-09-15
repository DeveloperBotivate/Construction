import { useState } from 'react'
import { PackageX, Plus, PackageCheck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { fmtDate } from '../../lib/utils'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import type { StoreReturn } from '../../types'

interface Row {
  ret: StoreReturn
  materialName: string
}

export default function StoreReturnList() {
  const user = useStore(s => s.currentUser!)
  const storeReturns = useStore(s => s.storeReturns)
  const materials = useStore(s => s.materials)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const createStoreReturn = useStore(s => s.createStoreReturn)
  const receiveStoreReturn = useStore(s => s.receiveStoreReturn)

  const isStore = user.role === 'STORE'

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [materialId, setMaterialId] = useState('')
  const [qty, setQty] = useState(0)
  const [condition, setCondition] = useState<'GOOD' | 'DAMAGED'>('GOOD')
  const [reason, setReason] = useState('')

  function resetForm() {
    setMaterialId(''); setQty(0); setCondition('GOOD'); setReason('')
  }

  const canSubmit = !!materialId && qty > 0 && reason.trim() !== ''

  function handleSubmit() {
    if (!canSubmit) return
    createStoreReturn({ projectId: selectedProjectId, siteId: selectedSiteId, materialId, qty, condition, reason })
    setDrawerOpen(false)
    resetForm()
  }

  const rows: Row[] = storeReturns
    .filter(r => !selectedProjectId || r.projectId === selectedProjectId)
    .map(r => ({ ret: r, materialName: materials.find(m => m.id === r.materialId)?.name ?? '-' }))
    .sort((a, b) => new Date(b.ret.date).getTime() - new Date(a.ret.date).getTime())

  const columns: Column<Row>[] = [
    { key: 'returnNumber', header: 'Return #', render: r => <span className="font-medium text-ink-800">{r.ret.returnNumber}</span>, sortValue: r => r.ret.returnNumber },
    { key: 'material', header: 'Material', render: r => r.materialName },
    { key: 'qty', header: 'Qty', render: r => r.ret.qty, sortValue: r => r.ret.qty },
    { key: 'condition', header: 'Condition', render: r => <StatusBadge status={r.ret.condition} /> },
    { key: 'reason', header: 'Reason', render: r => <span className="line-clamp-1 max-w-xs text-ink-600">{r.ret.reason}</span>, hideBelow: 'md' },
    { key: 'date', header: 'Date', render: r => fmtDate(r.ret.date), sortValue: r => r.ret.date },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.ret.status} /> },
    {
      key: 'actions', header: 'Actions', render: r => r.ret.status === 'REQUESTED' ? (
        <Button
          size="sm" variant="success" icon={<PackageCheck className="h-3.5 w-3.5" />}
          disabled={!isStore}
          title={!isStore ? 'Only the Store Keeper can receive a return.' : 'Receive this returned material into stock'}
          onClick={() => receiveStoreReturn(r.ret.id)}
        >
          Receive
        </Button>
      ) : <span className="text-xs text-ink-400">No action required</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Store Return"
        subtitle="Material returned from site back into store stock."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { resetForm(); setDrawerOpen(true) }}>Request Return</Button>}
      />

      <DataTable
        columns={columns}
        data={rows}
        keyField={r => r.ret.id}
        searchable
        searchPlaceholder="Search by return number or material..."
        searchFields={r => `${r.ret.returnNumber} ${r.materialName} ${r.ret.reason}`}
        emptyMessage="No store returns recorded yet."
        emptyIcon={<PackageX className="h-8 w-8" />}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); resetForm() }}
        title="Request Store Return"
        subtitle="Return unused or damaged material to store."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setDrawerOpen(false); resetForm() }}>Cancel</Button>
            <Button variant="primary" disabled={!canSubmit} title={!canSubmit ? 'Fill in all required fields.' : undefined} onClick={handleSubmit}>Submit Request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Material *</label>
            <select value={materialId} onChange={e => setMaterialId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Select material...</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Quantity *</label>
            <input type="number" min={0} value={qty} onChange={e => setQty(Math.max(0, Number(e.target.value)))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Condition *</label>
            <select value={condition} onChange={e => setCondition(e.target.value as 'GOOD' | 'DAMAGED')} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="GOOD">Good</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Reason *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
