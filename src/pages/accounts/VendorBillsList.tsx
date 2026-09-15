import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Receipt, Scale } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency } from '../../lib/utils'
import type { VendorBill } from '../../types'

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  )
}

export default function VendorBillsList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const vendorBills = useStore(s => s.vendorBills)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const grns = useStore(s => s.grns)
  const vendors = useStore(s => s.vendors)
  const createVendorBill = useStore(s => s.createVendorBill)
  const runThreeWayMatch = useStore(s => s.runThreeWayMatch)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ poId: '', invoiceNumber: '', invoiceAmount: '' })

  const canCreate = user.role === 'ACCOUNTS' || user.role === 'MD'
  const canMatch = user.role === 'ACCOUNTS' || user.role === 'MD'

  function vendorName(id: string) { return vendors.find(v => v.id === id)?.name ?? '-' }
  const posWithGrn = useMemo(() => purchaseOrders.filter(po => grns.some(g => g.poId === po.id)), [purchaseOrders, grns])
  const grn = useMemo(() => grns.find(g => g.poId === form.poId), [grns, form.poId])

  function reset() { setForm({ poId: '', invoiceNumber: '', invoiceAmount: '' }) }

  function submit() {
    if (!form.poId || !grn || !form.invoiceNumber.trim() || !form.invoiceAmount) return
    createVendorBill({ poId: form.poId, grnId: grn.id, invoiceNumber: form.invoiceNumber, invoiceAmount: Number(form.invoiceAmount) || 0 })
    reset()
    setOpen(false)
  }

  const columns: Column<VendorBill>[] = [
    { key: 'billNumber', header: 'Bill #', render: r => <span className="font-medium text-ink-800">{r.billNumber}</span>, sortValue: r => r.billNumber },
    { key: 'vendor', header: 'Vendor', render: r => vendorName(r.vendorId), sortValue: r => vendorName(r.vendorId) },
    { key: 'invoiceNumber', header: 'Invoice #', render: r => r.invoiceNumber, hideBelow: 'sm' },
    { key: 'invoiceAmount', header: 'Invoice Amount', render: r => fmtCurrency(r.invoiceAmount), sortValue: r => r.invoiceAmount },
    { key: 'matchStatus', header: 'Match Status', render: r => <StatusBadge status={r.matchStatus} /> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: 'Actions', render: r => (
        r.status === 'DOCUMENT_CHECK' ? (
          <Button
            variant="secondary" size="sm" icon={<Scale className="h-3.5 w-3.5" />}
            disabled={!canMatch}
            title={!canMatch ? 'Only Accounts or MD can run 3-way match' : undefined}
            onClick={e => { e.stopPropagation(); runThreeWayMatch(r.id) }}
          >
            Run 3-Way Match
          </Button>
        ) : <span className="text-xs text-ink-400">-</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Vendor Bills"
        subtitle="Vendor invoices received against purchase orders, subject to 3-way matching."
        actions={
          <Button
            variant="primary" icon={<Plus className="h-4 w-4" />}
            disabled={!canCreate}
            title={!canCreate ? 'Only Accounts or MD can record a vendor invoice' : undefined}
            onClick={() => setOpen(true)}
          >
            Record Vendor Invoice
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={vendorBills}
        keyField={r => r.id}
        onRowClick={r => navigate(`/vendor-bills/${r.id}`)}
        searchable
        searchPlaceholder="Search vendor bills..."
        searchFields={r => `${r.billNumber} ${r.invoiceNumber} ${vendorName(r.vendorId)}`}
        emptyMessage="No vendor bills recorded yet."
        emptyIcon={<Receipt className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); reset() }}
        title="Record Vendor Invoice"
        subtitle="Only purchase orders with a linked GRN can be billed."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button variant="primary" disabled={!form.poId || !grn || !form.invoiceNumber.trim() || !form.invoiceAmount} onClick={submit}>Save Vendor Bill</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Purchase Order" required>
            <select value={form.poId} onChange={e => setForm(f => ({ ...f, poId: e.target.value }))} className={inputCls}>
              <option value="">Select PO...</option>
              {posWithGrn.map(po => <option key={po.id} value={po.id}>{po.poNumber} - {vendorName(po.vendorId)} ({fmtCurrency(po.total)})</option>)}
            </select>
            {form.poId && !grn && <p className="mt-1 text-xs text-amber-600">No GRN found for this PO.</p>}
          </Field>
          {grn && (
            <div className="rounded-md bg-ink-50 px-3 py-2 text-sm">
              <span className="text-ink-500">Linked GRN: </span>
              <span className="font-medium text-ink-800">{grn.grnNumber}</span>
            </div>
          )}
          <Field label="Invoice Number" required>
            <input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Invoice Amount (₹)" required>
            <input type="number" min={0} value={form.invoiceAmount} onChange={e => setForm(f => ({ ...f, invoiceAmount: e.target.value }))} className={inputCls} />
          </Field>
        </div>
      </Drawer>
    </div>
  )
}
