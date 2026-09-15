import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListChecks, Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getBoqConsumed, getBoqProgressPct } from '../../store/selectors'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Field } from '../projects/ProjectsList'
import { fmtCurrency, fmtNumber } from '../../lib/utils'
import type { BOQItem } from '../../types'

export default function BOQListPage() {
  const navigate = useNavigate()
  const state = useStore()
  const boqItems = useStore(s => s.boqItems)
  const projects = useStore(s => s.projects)
  const createBOQItem = useStore(s => s.createBOQItem)
  const user = useStore(s => s.currentUser!)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ projectId: selectedProjectId, section: '', itemCode: '', description: '', unit: '', contractQty: 0, rate: 0 })

  const canCreate = user.role === 'MD' || user.role === 'PM'

  const columns: Column<BOQItem>[] = [
    { key: 'no', header: 'BOQ No.', render: b => <span className="font-medium text-ink-800">{b.boqNumber}</span> },
    { key: 'desc', header: 'Description', render: b => <div><p className="font-medium text-ink-800">{b.description}</p><p className="text-xs text-ink-500">{b.section} · {b.itemCode}</p></div> },
    { key: 'project', header: 'Project', render: b => projects.find(p => p.id === b.projectId)?.code ?? '-', hideBelow: 'md' },
    { key: 'qty', header: 'Contract Qty', render: b => `${fmtNumber(b.contractQty)} ${b.unit}`, hideBelow: 'md' },
    { key: 'amount', header: 'Contract Amount', render: b => fmtCurrency(b.contractAmount), sortValue: b => b.contractAmount, hideBelow: 'lg' },
    { key: 'consumed', header: 'Consumed', render: b => `${fmtNumber(getBoqConsumed(state, b.id))} ${b.unit}` },
    { key: 'progress', header: 'Progress', render: b => <div className="w-28"><ProgressBar pct={getBoqProgressPct(state, b.id)} /><span className="text-xs text-ink-500">{getBoqProgressPct(state, b.id)}%</span></div> },
    { key: 'status', header: 'Status', render: b => <StatusBadge status={b.status} /> },
  ]

  return (
    <div>
      <PageHeader title="Bill of Quantities" subtitle="BOQ items across all projects with live consumption tracking" actions={canCreate && <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Add BOQ Item</Button>} />
      <DataTable columns={columns} data={boqItems} keyField={b => b.id} searchable searchFields={b => `${b.boqNumber} ${b.description} ${b.itemCode}`} onRowClick={b => navigate(`/boq/${b.id}`)} emptyIcon={<ListChecks className="h-8 w-8" />} emptyMessage="No BOQ items yet." />

      <Drawer open={open} onClose={() => setOpen(false)} title="Add BOQ Item" footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={!form.description || !form.unit} onClick={() => { createBOQItem(form); setOpen(false) }}>Add Item</Button>
        </>
      }>
        <div className="space-y-3">
          <Field label="Project">
            <select className="input" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
            </select>
          </Field>
          <Field label="Section"><input className="input" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} placeholder="Civil - Structure" /></Field>
          <Field label="Item Code"><input className="input" value={form.itemCode} onChange={e => setForm({ ...form, itemCode: e.target.value })} /></Field>
          <Field label="Description"><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Unit"><input className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="m3" /></Field>
            <Field label="Qty"><input type="number" className="input" value={form.contractQty} onChange={e => setForm({ ...form, contractQty: Number(e.target.value) })} /></Field>
            <Field label="Rate (₹)"><input type="number" className="input" value={form.rate} onChange={e => setForm({ ...form, rate: Number(e.target.value) })} /></Field>
          </div>
          <p className="text-sm text-ink-500">Contract Amount: <span className="font-medium text-ink-800">{fmtCurrency(form.contractQty * form.rate)}</span></p>
        </div>
      </Drawer>
    </div>
  )
}
