import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Receipt, Send } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { SubcontractorBill } from '../../types'

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  )
}

export default function SubcontractorBillsList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const bills = useStore(s => s.subcontractorBills)
  const workOrders = useStore(s => s.workOrders)
  const subcontractors = useStore(s => s.subcontractors)
  const measurements = useStore(s => s.measurements)
  const createSubcontractorBill = useStore(s => s.createSubcontractorBill)
  const submitSubcontractorBill = useStore(s => s.submitSubcontractorBill)

  const [open, setOpen] = useState(false)
  const [workOrderId, setWorkOrderId] = useState('')
  const [selectedMeasIds, setSelectedMeasIds] = useState<string[]>([])
  const [deductions, setDeductions] = useState({ retention: '0', advanceRecovery: '0', penalty: '0', otherDeduction: '0', tax: '0' })

  const canCreate = user.role === 'PM' || user.role === 'SUBCONTRACTOR' || user.role === 'MD'
  const canSubmit = user.role === 'SUBCONTRACTOR' || user.role === 'PM' || user.role === 'MD'

  function subName(id: string) {
    return subcontractors.find(s => s.id === id)?.name ?? '-'
  }
  function woNumber(id: string) {
    return workOrders.find(w => w.id === id)?.woNumber ?? '-'
  }

  const eligibleMeasurements = useMemo(
    () => measurements.filter(m => m.workOrderId === workOrderId && m.status === 'APPROVED' && !bills.some(b => b.measurementIds.includes(m.id))),
    [measurements, workOrderId, bills]
  )

  const grossAmount = useMemo(() => measurements.filter(m => selectedMeasIds.includes(m.id)).reduce((sum, m) => sum + m.amount, 0), [measurements, selectedMeasIds])

  function reset() {
    setWorkOrderId(''); setSelectedMeasIds([])
    setDeductions({ retention: '0', advanceRecovery: '0', penalty: '0', otherDeduction: '0', tax: '0' })
  }

  function submit() {
    if (!workOrderId || selectedMeasIds.length === 0) return
    const bill = createSubcontractorBill(workOrderId, selectedMeasIds, {
      retention: Number(deductions.retention) || 0,
      advanceRecovery: Number(deductions.advanceRecovery) || 0,
      penalty: Number(deductions.penalty) || 0,
      otherDeduction: Number(deductions.otherDeduction) || 0,
      tax: Number(deductions.tax) || 0,
    })
    reset()
    setOpen(false)
    navigate(`/subcontractor-bills/${bill.id}`)
  }

  const columns: Column<SubcontractorBill>[] = [
    { key: 'billNumber', header: 'Bill Number', render: r => <span className="font-medium text-ink-800">{r.billNumber}</span>, sortValue: r => r.billNumber },
    { key: 'sub', header: 'Subcontractor', render: r => subName(r.subcontractorId), sortValue: r => subName(r.subcontractorId) },
    { key: 'wo', header: 'Work Order', render: r => woNumber(r.workOrderId), hideBelow: 'md' },
    { key: 'netPayable', header: 'Net Payable', render: r => fmtCurrency(r.netPayable), sortValue: r => r.netPayable },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: 'Created', render: r => fmtDate(r.createdAt), sortValue: r => r.createdAt, hideBelow: 'md' },
    {
      key: 'actions', header: 'Actions', render: r => (
        r.status === 'DRAFT' ? (
          <Button
            variant="primary" size="sm" icon={<Send className="h-3.5 w-3.5" />}
            disabled={!canSubmit}
            title={!canSubmit ? 'Only the Subcontractor or PM can submit this bill' : undefined}
            onClick={e => { e.stopPropagation(); submitSubcontractorBill(r.id) }}
          >
            Submit
          </Button>
        ) : <span className="text-xs text-ink-400">-</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Subcontractor Bills"
        subtitle="Bills raised by subcontractors against approved measurements."
        actions={
          <Button
            variant="primary" icon={<Plus className="h-4 w-4" />}
            disabled={!canCreate}
            title={!canCreate ? 'Only the Subcontractor, PM or MD can create a bill' : undefined}
            onClick={() => setOpen(true)}
          >
            Create Bill
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={bills}
        keyField={r => r.id}
        onRowClick={r => navigate(`/subcontractor-bills/${r.id}`)}
        searchable
        searchPlaceholder="Search bills..."
        searchFields={r => `${r.billNumber} ${subName(r.subcontractorId)} ${woNumber(r.workOrderId)}`}
        emptyMessage="No subcontractor bills raised yet."
        emptyIcon={<Receipt className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); reset() }}
        title="Create Subcontractor Bill"
        subtitle="Bill against approved, unbilled measurements for a work order."
        width="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button variant="primary" disabled={!workOrderId || selectedMeasIds.length === 0} onClick={submit}>Save Bill</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Work Order" required>
            <select value={workOrderId} onChange={e => { setWorkOrderId(e.target.value); setSelectedMeasIds([]) }} className={inputCls}>
              <option value="">Select work order...</option>
              {workOrders.map(w => <option key={w.id} value={w.id}>{w.woNumber} - {w.workPackage} ({subName(w.subcontractorId)})</option>)}
            </select>
          </Field>

          <Field label="Approved Measurements (unbilled)" required>
            {!workOrderId ? (
              <p className="text-xs text-ink-500">Select a work order first.</p>
            ) : eligibleMeasurements.length === 0 ? (
              <p className="text-xs text-amber-600">No approved, unbilled measurements available for this work order.</p>
            ) : (
              <ul className="space-y-1.5 rounded-md border border-ink-200 p-2">
                {eligibleMeasurements.map(m => (
                  <li key={m.id} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-ink-50">
                    <label className="flex items-center gap-2 text-sm text-ink-700">
                      <input
                        type="checkbox"
                        checked={selectedMeasIds.includes(m.id)}
                        onChange={e => setSelectedMeasIds(ids => e.target.checked ? [...ids, m.id] : ids.filter(x => x !== m.id))}
                        className="rounded border-ink-300"
                      />
                      {m.measurementNumber} &middot; Qty {m.currentQty}
                    </label>
                    <span className="text-sm font-medium text-ink-800">{fmtCurrency(m.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          {selectedMeasIds.length > 0 && (
            <div className="rounded-md bg-ink-50 px-3 py-2 text-sm">
              <span className="text-ink-500">Gross Amount: </span>
              <span className="font-semibold text-ink-800">{fmtCurrency(grossAmount)}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Retention (₹)">
              <input type="number" min={0} value={deductions.retention} onChange={e => setDeductions(d => ({ ...d, retention: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Advance Recovery (₹)">
              <input type="number" min={0} value={deductions.advanceRecovery} onChange={e => setDeductions(d => ({ ...d, advanceRecovery: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Penalty (₹)">
              <input type="number" min={0} value={deductions.penalty} onChange={e => setDeductions(d => ({ ...d, penalty: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Other Deduction (₹)">
              <input type="number" min={0} value={deductions.otherDeduction} onChange={e => setDeductions(d => ({ ...d, otherDeduction: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Tax (₹, added)">
              <input type="number" min={0} value={deductions.tax} onChange={e => setDeductions(d => ({ ...d, tax: e.target.value }))} className={inputCls} />
            </Field>
          </div>
        </div>
      </Drawer>
    </div>
  )
}
