import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Check, CheckCheck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency } from '../../lib/utils'
import type { DebitNote, DebitNoteReason } from '../../types'

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'
const REASONS: DebitNoteReason[] = ['REJECTED_MATERIAL', 'SHORTAGE', 'DAMAGE', 'PENALTY', 'RATE_DIFFERENCE', 'QUALITY_ISSUE']

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  )
}

export default function DebitNotesList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const debitNotes = useStore(s => s.debitNotes)
  const vendors = useStore(s => s.vendors)
  const grns = useStore(s => s.grns)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const createDebitNote = useStore(s => s.createDebitNote)
  const approveDebitNote = useStore(s => s.approveDebitNote)
  const closeDebitNote = useStore(s => s.closeDebitNote)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ vendorId: '', reason: 'QUALITY_ISSUE' as DebitNoteReason, amount: '', remarks: '', grnId: '', poId: '' })

  const canManage = user.role === 'ACCOUNTS' || user.role === 'MD'

  function vendorName(id: string) { return vendors.find(v => v.id === id)?.name ?? '-' }

  function reset() { setForm({ vendorId: '', reason: 'QUALITY_ISSUE', amount: '', remarks: '', grnId: '', poId: '' }) }

  function submit() {
    if (!form.vendorId || !form.amount) return
    createDebitNote({ vendorId: form.vendorId, reason: form.reason, amount: Number(form.amount) || 0, remarks: form.remarks, grnId: form.grnId || undefined, poId: form.poId || undefined })
    reset()
    setOpen(false)
  }

  const columns: Column<DebitNote>[] = [
    { key: 'debitNoteNumber', header: 'Debit Note #', render: r => <span className="font-medium text-ink-800">{r.debitNoteNumber}</span>, sortValue: r => r.debitNoteNumber },
    { key: 'vendor', header: 'Vendor', render: r => vendorName(r.vendorId) },
    { key: 'reason', header: 'Reason', render: r => <StatusBadge status={r.reason} /> },
    { key: 'amount', header: 'Amount', render: r => fmtCurrency(r.amount), sortValue: r => r.amount },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: 'Actions', render: r => (
        <div className="flex flex-wrap items-center gap-1.5" onClick={e => e.stopPropagation()}>
          {r.status === 'DRAFT' && (
            <Button variant="primary" size="sm" icon={<Check className="h-3.5 w-3.5" />} disabled={!canManage} title={!canManage ? 'Only Accounts or MD can approve' : undefined} onClick={() => approveDebitNote(r.id)}>Approve</Button>
          )}
          {['APPROVED', 'VENDOR_NOTIFIED', 'ADJUSTED'].includes(r.status) && (
            <Button variant="secondary" size="sm" icon={<CheckCheck className="h-3.5 w-3.5" />} disabled={!canManage} title={!canManage ? 'Only Accounts or MD can close' : undefined} onClick={() => closeDebitNote(r.id)}>Close</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Debit Notes"
        subtitle="Recoveries raised against vendors for rejected material, shortages or penalties."
        actions={
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} disabled={!canManage} title={!canManage ? 'Only Accounts or MD can create a debit note' : undefined} onClick={() => setOpen(true)}>
            Create Debit Note
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={debitNotes}
        keyField={r => r.id}
        onRowClick={r => navigate(`/debit-notes/${r.id}`)}
        searchable
        searchPlaceholder="Search debit notes..."
        searchFields={r => `${r.debitNoteNumber} ${vendorName(r.vendorId)} ${r.reason}`}
        emptyMessage="No debit notes raised yet."
        emptyIcon={<FileText className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); reset() }}
        title="Create Debit Note"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button variant="primary" disabled={!form.vendorId || !form.amount} onClick={submit}>Save Debit Note</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Vendor" required>
            <select value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))} className={inputCls}>
              <option value="">Select vendor...</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
          <Field label="Reason" required>
            <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value as DebitNoteReason }))} className={inputCls}>
              {REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </Field>
          <Field label="Amount (₹)" required>
            <input type="number" min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Related PO (optional)">
            <select value={form.poId} onChange={e => setForm(f => ({ ...f, poId: e.target.value }))} className={inputCls}>
              <option value="">None</option>
              {purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.poNumber}</option>)}
            </select>
          </Field>
          <Field label="Related GRN (optional)">
            <select value={form.grnId} onChange={e => setForm(f => ({ ...f, grnId: e.target.value }))} className={inputCls}>
              <option value="">None</option>
              {grns.map(g => <option key={g.id} value={g.id}>{g.grnNumber}</option>)}
            </select>
          </Field>
          <Field label="Remarks">
            <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} rows={3} className={inputCls} />
          </Field>
        </div>
      </Drawer>
    </div>
  )
}
