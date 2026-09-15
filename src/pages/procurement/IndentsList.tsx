import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Send, PackageSearch } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getStockBalance, getOpenPOQty } from '../../store/selectors'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtDate } from '../../lib/utils'
import type { MaterialIndent, Priority } from '../../types'

const PRIORITIES: Priority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT']

export default function IndentsList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const indents = useStore(s => s.materialIndents)
  const materials = useStore(s => s.materials)
  const boqItems = useStore(s => s.boqItems)
  const createIndent = useStore(s => s.createIndent)
  const submitIndent = useStore(s => s.submitIndent)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const state = useStore(s => s)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    boqItemId: '', materialId: '', requiredDate: '', requiredQty: '', priority: 'NORMAL' as Priority,
    purpose: '', workArea: '', drawingRef: '', remarks: '',
  })

  const canCreate = user.role === 'PE'
  const projectBoqItems = boqItems.filter(b => b.projectId === selectedProjectId)
  const selectedMaterial = materials.find(m => m.id === form.materialId)
  const qtyNum = Number(form.requiredQty) || 0
  const stockBal = form.materialId ? getStockBalance(state, form.materialId, selectedSiteId) : 0
  const openPO = form.materialId ? getOpenPOQty(state, form.materialId, selectedProjectId) : 0
  const netReq = Math.max(0, qtyNum - stockBal - openPO)

  function resetForm() {
    setForm({ boqItemId: '', materialId: '', requiredDate: '', requiredQty: '', priority: 'NORMAL', purpose: '', workArea: '', drawingRef: '', remarks: '' })
  }

  function handleCreate() {
    if (!form.boqItemId || !form.materialId || !form.requiredQty) return
    const indent = createIndent({
      projectId: selectedProjectId, siteId: selectedSiteId, boqItemId: form.boqItemId, materialId: form.materialId,
      requiredDate: form.requiredDate || new Date().toISOString(), requiredQty: qtyNum, unit: selectedMaterial?.unit ?? '',
      priority: form.priority, purpose: form.purpose, workArea: form.workArea, drawingRef: form.drawingRef, remarks: form.remarks,
    })
    setOpen(false)
    resetForm()
    navigate(`/indents/${indent.id}`)
  }

  const columns: Column<MaterialIndent>[] = [
    { key: 'indentNumber', header: 'Indent #', render: r => <span className="font-medium text-ink-800">{r.indentNumber}</span>, sortValue: r => r.indentNumber },
    { key: 'material', header: 'Material', render: r => materials.find(m => m.id === r.materialId)?.name ?? '-' },
    { key: 'qty', header: 'Required Qty', render: r => `${r.requiredQty} ${r.unit}` },
    { key: 'priority', header: 'Priority', render: r => <PriorityBadge priority={r.priority} /> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'requiredDate', header: 'Required By', render: r => fmtDate(r.requiredDate), sortValue: r => r.requiredDate },
    {
      key: 'actions', header: 'Actions', render: r => {
        if (r.status !== 'DRAFT') return <span className="text-xs text-ink-400">-</span>
        const canSubmitRow = user.role === 'PE' && r.createdBy === user.id
        return (
          <div onClick={e => e.stopPropagation()}>
            <Button
              size="sm" variant="primary" icon={<Send className="h-3.5 w-3.5" />}
              disabled={!canSubmitRow}
              title={!canSubmitRow ? 'Only the PE who created this indent can submit it.' : undefined}
              onClick={() => submitIndent(r.id)}
            >
              Submit
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Material Indents"
        subtitle="Raise and track material requirement requests through PM approval and procurement."
        actions={
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} disabled={!canCreate} title={!canCreate ? 'Only Project Engineers can raise material indents.' : undefined} onClick={() => setOpen(true)}>
            Create Indent
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={indents}
        keyField={r => r.id}
        onRowClick={r => navigate(`/indents/${r.id}`)}
        searchable
        searchPlaceholder="Search indents..."
        searchFields={r => `${r.indentNumber} ${materials.find(m => m.id === r.materialId)?.name ?? ''} ${r.status}`}
        emptyMessage="No material indents raised yet."
        emptyIcon={<PackageSearch className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); resetForm() }}
        title="Create Material Indent"
        subtitle="Raise a new material requirement for PM approval."
        footer={<>
          <Button variant="secondary" onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!form.boqItemId || !form.materialId || !form.requiredQty}>Create Indent (Draft)</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">BOQ Item</label>
            <select value={form.boqItemId} onChange={e => setForm(f => ({ ...f, boqItemId: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Select BOQ item...</option>
              {projectBoqItems.map(b => <option key={b.id} value={b.id}>{b.boqNumber} - {b.description}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Material</label>
            <select value={form.materialId} onChange={e => setForm(f => ({ ...f, materialId: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Select material...</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Required Qty</label>
              <input type="number" min="0" value={form.requiredQty} onChange={e => setForm(f => ({ ...f, requiredQty: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Unit</label>
              <input disabled value={selectedMaterial?.unit ?? '-'} className="w-full rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-500" />
            </div>
          </div>

          {form.materialId && form.requiredQty && (
            <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-3 text-xs">
              <p className="mb-1 font-semibold text-ink-700">Net Requirement Preview</p>
              <div className="flex justify-between text-ink-600"><span>Required Qty</span><span>{qtyNum}</span></div>
              <div className="flex justify-between text-ink-600"><span>Current Stock ({selectedMaterial?.unit})</span><span>-{stockBal}</span></div>
              <div className="flex justify-between text-ink-600"><span>Open PO Qty</span><span>-{openPO}</span></div>
              <div className="mt-1 flex justify-between border-t border-brand-200 pt-1 font-semibold text-brand-700"><span>Net Requirement to Procure</span><span>{netReq} {selectedMaterial?.unit}</span></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Required Date</label>
              <input type="date" value={form.requiredDate} onChange={e => setForm(f => ({ ...f, requiredDate: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Purpose</label>
            <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. Foundation concreting - Grid A1-A6" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Work Area</label>
              <input value={form.workArea} onChange={e => setForm(f => ({ ...f, workArea: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Drawing Ref</label>
              <input value={form.drawingRef} onChange={e => setForm(f => ({ ...f, drawingRef: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Remarks</label>
            <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} rows={2} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
