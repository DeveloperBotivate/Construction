import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardList, Send } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { WorkOrder } from '../../types'

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  )
}

export default function WorkOrdersList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const workOrders = useStore(s => s.workOrders)
  const subcontractors = useStore(s => s.subcontractors)
  const createWorkOrder = useStore(s => s.createWorkOrder)
  const issueWorkOrder = useStore(s => s.issueWorkOrder)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ subcontractorId: '', workPackage: '', scope: '', value: '', startDate: '', endDate: '' })

  const canCreate = user.role === 'PM' || user.role === 'MD'
  const canIssue = user.role === 'PM' || user.role === 'MD'

  function subName(id: string) {
    return subcontractors.find(s => s.id === id)?.name ?? '-'
  }

  function reset() {
    setForm({ subcontractorId: '', workPackage: '', scope: '', value: '', startDate: '', endDate: '' })
  }

  function submit() {
    if (!form.subcontractorId || !form.workPackage.trim() || !form.startDate || !form.endDate) return
    createWorkOrder({
      subcontractorId: form.subcontractorId,
      projectId: selectedProjectId,
      siteId: selectedSiteId,
      workPackage: form.workPackage,
      scope: form.scope,
      value: Number(form.value) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
    })
    reset()
    setOpen(false)
  }

  const columns: Column<WorkOrder>[] = [
    { key: 'woNumber', header: 'WO Number', render: r => <span className="font-medium text-ink-800">{r.woNumber}</span>, sortValue: r => r.woNumber },
    { key: 'sub', header: 'Subcontractor', render: r => subName(r.subcontractorId), sortValue: r => subName(r.subcontractorId) },
    { key: 'workPackage', header: 'Work Package', render: r => r.workPackage },
    { key: 'value', header: 'Value', render: r => fmtCurrency(r.value), sortValue: r => r.value },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'dates', header: 'Start / End', render: r => <span className="text-xs text-ink-500">{fmtDate(r.startDate)} &rarr; {fmtDate(r.endDate)}</span>, hideBelow: 'md' },
    {
      key: 'actions', header: 'Actions', render: r => (
        r.status === 'DRAFT' ? (
          <Button
            variant="primary" size="sm" icon={<Send className="h-3.5 w-3.5" />}
            disabled={!canIssue}
            title={!canIssue ? 'Only PM or MD can issue a work order' : undefined}
            onClick={e => { e.stopPropagation(); issueWorkOrder(r.id) }}
          >
            Issue
          </Button>
        ) : <span className="text-xs text-ink-400">-</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Work Orders"
        subtitle="Subcontractor work orders across the project."
        actions={
          <Button
            variant="primary" icon={<Plus className="h-4 w-4" />}
            disabled={!canCreate}
            title={!canCreate ? 'Only Project Manager or MD can create work orders' : undefined}
            onClick={() => setOpen(true)}
          >
            Create Work Order
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={workOrders}
        keyField={r => r.id}
        onRowClick={r => navigate(`/work-orders/${r.id}`)}
        searchable
        searchPlaceholder="Search work orders..."
        searchFields={r => `${r.woNumber} ${r.workPackage} ${subName(r.subcontractorId)}`}
        emptyMessage="No work orders created yet."
        emptyIcon={<ClipboardList className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); reset() }}
        title="Create Work Order"
        subtitle="Issue a scope of work to a subcontractor."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button variant="primary" disabled={!form.subcontractorId || !form.workPackage.trim() || !form.startDate || !form.endDate} onClick={submit}>Save Work Order</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Subcontractor" required>
            <select value={form.subcontractorId} onChange={e => setForm(f => ({ ...f, subcontractorId: e.target.value }))} className={inputCls}>
              <option value="">Select subcontractor...</option>
              {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name} ({s.trade})</option>)}
            </select>
          </Field>
          <Field label="Work Package" required>
            <input value={form.workPackage} onChange={e => setForm(f => ({ ...f, workPackage: e.target.value }))} className={inputCls} placeholder="e.g. Foundation & Civil Structure - Block B" />
          </Field>
          <Field label="Scope">
            <textarea value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} rows={3} className={inputCls} />
          </Field>
          <Field label="Value (₹)" required>
            <input type="number" min={0} value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" required>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="End Date" required>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className={inputCls} />
            </Field>
          </div>
        </div>
      </Drawer>
    </div>
  )
}
