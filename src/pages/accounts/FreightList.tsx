import { useState } from 'react'
import { Plus, Truck, Check, Banknote } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency } from '../../lib/utils'
import type { Freight } from '../../types'

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  )
}

export default function FreightList() {
  const user = useStore(s => s.currentUser!)
  const freightRecords = useStore(s => s.freightRecords)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const createFreight = useStore(s => s.createFreight)
  const approveFreight = useStore(s => s.approveFreight)
  const payFreight = useStore(s => s.payFreight)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ poId: '', transporter: '', vehicle: '', distance: '', freightRate: '', amount: '', invoiceNumber: '' })

  const canManage = user.role === 'ACCOUNTS' || user.role === 'MD'

  function poNumber(id: string) { return purchaseOrders.find(p => p.id === id)?.poNumber ?? '-' }
  function poVendorId(id: string) { return purchaseOrders.find(p => p.id === id)?.vendorId ?? '' }

  function reset() { setForm({ poId: '', transporter: '', vehicle: '', distance: '', freightRate: '', amount: '', invoiceNumber: '' }) }

  function submit() {
    if (!form.poId || !form.transporter.trim() || !form.amount) return
    createFreight({
      poId: form.poId, vendorId: poVendorId(form.poId), transporter: form.transporter, vehicle: form.vehicle,
      distance: Number(form.distance) || 0, freightRate: Number(form.freightRate) || 0, amount: Number(form.amount) || 0, invoiceNumber: form.invoiceNumber,
    })
    reset()
    setOpen(false)
  }

  const columns: Column<Freight>[] = [
    { key: 'freightNumber', header: 'Freight #', render: r => <span className="font-medium text-ink-800">{r.freightNumber}</span>, sortValue: r => r.freightNumber },
    { key: 'po', header: 'PO', render: r => poNumber(r.poId) },
    { key: 'transporter', header: 'Transporter', render: r => r.transporter },
    { key: 'vehicle', header: 'Vehicle', render: r => r.vehicle, hideBelow: 'sm' },
    { key: 'amount', header: 'Amount', render: r => fmtCurrency(r.amount), sortValue: r => r.amount },
    { key: 'approvalStatus', header: 'Approval', render: r => <StatusBadge status={r.approvalStatus} /> },
    { key: 'paymentStatus', header: 'Payment', render: r => <StatusBadge status={r.paymentStatus} /> },
    {
      key: 'actions', header: 'Actions', render: r => (
        <div className="flex flex-wrap items-center gap-1.5">
          {r.approvalStatus === 'PENDING' && (
            <Button variant="primary" size="sm" icon={<Check className="h-3.5 w-3.5" />} disabled={!canManage} title={!canManage ? 'Only Accounts or MD can approve' : undefined} onClick={() => approveFreight(r.id)}>Approve</Button>
          )}
          {r.approvalStatus === 'APPROVED' && r.paymentStatus === 'PENDING' && (
            <Button variant="success" size="sm" icon={<Banknote className="h-3.5 w-3.5" />} disabled={!canManage} title={!canManage ? 'Only Accounts or MD can mark paid' : undefined} onClick={() => payFreight(r.id)}>Mark Paid</Button>
          )}
          {r.approvalStatus === 'APPROVED' && r.paymentStatus === 'PAID' && <span className="text-xs text-ink-400">-</span>}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Freight Charges"
        subtitle="Transportation charges linked to purchase orders."
        actions={
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} disabled={!canManage} title={!canManage ? 'Only Accounts or MD can add freight charges' : undefined} onClick={() => setOpen(true)}>
            Add Freight Charge
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={freightRecords}
        keyField={r => r.id}
        searchable
        searchPlaceholder="Search freight charges..."
        searchFields={r => `${r.freightNumber} ${r.transporter} ${poNumber(r.poId)}`}
        emptyMessage="No freight charges recorded yet."
        emptyIcon={<Truck className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); reset() }}
        title="Add Freight Charge"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button variant="primary" disabled={!form.poId || !form.transporter.trim() || !form.amount} onClick={submit}>Save Freight Charge</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Purchase Order" required>
            <select value={form.poId} onChange={e => setForm(f => ({ ...f, poId: e.target.value }))} className={inputCls}>
              <option value="">Select PO...</option>
              {purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.poNumber}</option>)}
            </select>
          </Field>
          <Field label="Transporter" required>
            <input value={form.transporter} onChange={e => setForm(f => ({ ...f, transporter: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Vehicle">
            <input value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Distance (km)">
              <input type="number" min={0} value={form.distance} onChange={e => setForm(f => ({ ...f, distance: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Freight Rate (₹/km)">
              <input type="number" min={0} value={form.freightRate} onChange={e => setForm(f => ({ ...f, freightRate: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <Field label="Amount (₹)" required>
            <input type="number" min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Invoice Number">
            <input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} className={inputCls} />
          </Field>
        </div>
      </Drawer>
    </div>
  )
}
