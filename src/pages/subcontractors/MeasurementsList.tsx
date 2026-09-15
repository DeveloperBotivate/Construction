import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Layers } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { Measurement } from '../../types'

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  )
}

export default function MeasurementsList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const measurements = useStore(s => s.measurements)
  const boqItems = useStore(s => s.boqItems)
  const subcontractors = useStore(s => s.subcontractors)
  const workOrders = useStore(s => s.workOrders)
  const createMeasurement = useStore(s => s.createMeasurement)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ boqItemId: '', subcontractorId: '', workOrderId: '', currentQty: '' })

  const canRecord = user.role === 'PE' || user.role === 'PM' || user.role === 'MD'

  function boqLabel(id: string) {
    const b = boqItems.find(x => x.id === id)
    return b ? `${b.boqNumber} - ${b.description}` : '-'
  }
  function subName(id?: string) {
    return subcontractors.find(s => s.id === id)?.name ?? '-'
  }

  const eligibleWorkOrders = useMemo(() => workOrders.filter(w => w.subcontractorId === form.subcontractorId), [workOrders, form.subcontractorId])

  function reset() {
    setForm({ boqItemId: '', subcontractorId: '', workOrderId: '', currentQty: '' })
  }

  function submit() {
    if (!form.boqItemId || !form.subcontractorId || !form.workOrderId || !form.currentQty) return
    createMeasurement({
      projectId: selectedProjectId,
      boqItemId: form.boqItemId,
      subcontractorId: form.subcontractorId,
      workOrderId: form.workOrderId,
      currentQty: Number(form.currentQty) || 0,
    })
    reset()
    setOpen(false)
  }

  const columns: Column<Measurement>[] = [
    { key: 'measurementNumber', header: 'Measurement #', render: r => <span className="font-medium text-ink-800">{r.measurementNumber}</span>, sortValue: r => r.measurementNumber },
    { key: 'boq', header: 'BOQ Item', render: r => boqLabel(r.boqItemId) },
    { key: 'sub', header: 'Subcontractor', render: r => subName(r.subcontractorId), hideBelow: 'md' },
    { key: 'currentQty', header: 'Current Qty', render: r => r.currentQty, sortValue: r => r.currentQty },
    { key: 'cumulativeQty', header: 'Cumulative Qty', render: r => r.cumulativeQty, sortValue: r => r.cumulativeQty, hideBelow: 'sm' },
    { key: 'amount', header: 'Amount', render: r => fmtCurrency(r.amount), sortValue: r => r.amount },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'date', header: 'Date', render: r => fmtDate(r.date), sortValue: r => r.date, hideBelow: 'md' },
  ]

  return (
    <div>
      <PageHeader
        title="Measurements"
        subtitle="Work measurement book entries against BOQ items."
        actions={
          <Button
            variant="primary" icon={<Plus className="h-4 w-4" />}
            disabled={!canRecord}
            title={!canRecord ? 'Only PE, PM or MD can record measurements' : undefined}
            onClick={() => setOpen(true)}
          >
            Record Measurement
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={measurements}
        keyField={r => r.id}
        onRowClick={r => navigate(`/measurements/${r.id}`)}
        searchable
        searchPlaceholder="Search measurements..."
        searchFields={r => `${r.measurementNumber} ${boqLabel(r.boqItemId)} ${subName(r.subcontractorId)}`}
        emptyMessage="No measurements recorded yet."
        emptyIcon={<Layers className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); reset() }}
        title="Record Measurement"
        subtitle="Previous, cumulative qty, rate and amount are computed automatically from the BOQ item."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button variant="primary" disabled={!form.boqItemId || !form.subcontractorId || !form.workOrderId || !form.currentQty} onClick={submit}>Save Measurement</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="BOQ Item" required>
            <select value={form.boqItemId} onChange={e => setForm(f => ({ ...f, boqItemId: e.target.value }))} className={inputCls}>
              <option value="">Select BOQ item...</option>
              {boqItems.map(b => <option key={b.id} value={b.id}>{b.boqNumber} - {b.description}</option>)}
            </select>
          </Field>
          <Field label="Subcontractor" required>
            <select value={form.subcontractorId} onChange={e => setForm(f => ({ ...f, subcontractorId: e.target.value, workOrderId: '' }))} className={inputCls}>
              <option value="">Select subcontractor...</option>
              {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Work Order" required>
            <select value={form.workOrderId} onChange={e => setForm(f => ({ ...f, workOrderId: e.target.value }))} className={inputCls} disabled={!form.subcontractorId}>
              <option value="">Select work order...</option>
              {eligibleWorkOrders.map(w => <option key={w.id} value={w.id}>{w.woNumber} - {w.workPackage}</option>)}
            </select>
            {form.subcontractorId && eligibleWorkOrders.length === 0 && <p className="mt-1 text-xs text-amber-600">This subcontractor has no work orders yet.</p>}
          </Field>
          <Field label="Current Qty" required>
            <input type="number" min={0} step="0.01" value={form.currentQty} onChange={e => setForm(f => ({ ...f, currentQty: e.target.value }))} className={inputCls} />
          </Field>
        </div>
      </Drawer>
    </div>
  )
}
