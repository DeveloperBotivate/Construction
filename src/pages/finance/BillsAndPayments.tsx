import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Receipt, Send, Scale } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { cls, fmtCurrency, fmtDate } from '../../lib/utils'

const BILL_TYPES = ['Subcontractor Bill', 'RA Bill', 'Vendor Bill', 'Payment'] as const
type BillType = typeof BILL_TYPES[number]
type CreatableType = Exclude<BillType, 'Payment'>

interface BillRow {
  id: string
  entityId: string
  type: BillType
  number: string
  party: string
  reference: string
  amount: number
  status: string
  date: string
  detailPath: string
}

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

const TYPE_CLS: Record<BillType, string> = {
  'Subcontractor Bill': 'bg-purple-50 text-purple-700 ring-purple-600/20',
  'RA Bill': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'Vendor Bill': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'Payment': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

function TypeBadge({ type }: { type: BillType }) {
  return (
    <span className={cls('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', TYPE_CLS[type])}>
      {type}
    </span>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  )
}

export default function BillsAndPayments() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)

  const subcontractorBills = useStore(s => s.subcontractorBills)
  const raBills = useStore(s => s.raBills)
  const vendorBills = useStore(s => s.vendorBills)
  const payments = useStore(s => s.payments)

  const workOrders = useStore(s => s.workOrders)
  const subcontractors = useStore(s => s.subcontractors)
  const measurements = useStore(s => s.measurements)
  const contracts = useStore(s => s.contracts)
  const projects = useStore(s => s.projects)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const grns = useStore(s => s.grns)
  const vendors = useStore(s => s.vendors)

  const createSubcontractorBill = useStore(s => s.createSubcontractorBill)
  const submitSubcontractorBill = useStore(s => s.submitSubcontractorBill)
  const createRABill = useStore(s => s.createRABill)
  const createVendorBill = useStore(s => s.createVendorBill)
  const runThreeWayMatch = useStore(s => s.runThreeWayMatch)

  function subName(id: string) { return subcontractors.find(s => s.id === id)?.name ?? '-' }
  function woNumber(id: string) { return workOrders.find(w => w.id === id)?.woNumber ?? '-' }
  function projectName(id: string) { return projects.find(p => p.id === id)?.name ?? '-' }
  function vendorName(id: string) { return vendors.find(v => v.id === id)?.name ?? '-' }

  const canSubmitSubBill = user.role === 'SUBCONTRACTOR' || user.role === 'PM' || user.role === 'MD'
  const canRunMatch = user.role === 'ACCOUNTS' || user.role === 'MD'

  const canCreate: Record<CreatableType, boolean> = {
    'Subcontractor Bill': user.role === 'PM' || user.role === 'SUBCONTRACTOR' || user.role === 'MD',
    'RA Bill': user.role === 'BILLING' || user.role === 'MD',
    'Vendor Bill': user.role === 'ACCOUNTS' || user.role === 'MD',
  }
  const creatableTypes = (['Subcontractor Bill', 'RA Bill', 'Vendor Bill'] as CreatableType[]).filter(t => canCreate[t])

  const [typeFilter, setTypeFilter] = useState<BillType | 'All'>('All')

  const rows = useMemo<BillRow[]>(() => {
    const subBillRows: BillRow[] = subcontractorBills.map(b => ({
      id: `scb-${b.id}`, entityId: b.id, type: 'Subcontractor Bill',
      number: b.billNumber, party: subName(b.subcontractorId), reference: woNumber(b.workOrderId),
      amount: b.netPayable, status: b.status, date: b.createdAt, detailPath: `/subcontractor-bills/${b.id}`,
    }))
    const raBillRows: BillRow[] = raBills.map(b => ({
      id: `ra-${b.id}`, entityId: b.id, type: 'RA Bill',
      number: b.raNumber, party: projectName(b.projectId), reference: b.invoiceNumber ? `Invoice ${b.invoiceNumber}` : '-',
      amount: b.netAmount, status: b.status, date: b.createdAt, detailPath: `/ra-bills/${b.id}`,
    }))
    const vendorBillRows: BillRow[] = vendorBills.map(b => ({
      id: `vb-${b.id}`, entityId: b.id, type: 'Vendor Bill',
      number: b.billNumber, party: vendorName(b.vendorId), reference: b.invoiceNumber,
      amount: b.invoiceAmount, status: b.status, date: b.createdAt, detailPath: `/vendor-bills/${b.id}`,
    }))
    const paymentRows: BillRow[] = payments.map(p => ({
      id: `pmt-${p.id}`, entityId: p.id, type: 'Payment',
      number: p.paymentNumber, party: p.payeeName, reference: p.paymentRef ?? '-',
      amount: p.amount, status: p.status, date: p.paymentDate ?? p.createdAt, detailPath: `/payments/${p.id}`,
    }))
    return [...subBillRows, ...raBillRows, ...vendorBillRows, ...paymentRows]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcontractorBills, raBills, vendorBills, payments, subcontractors, workOrders, projects, vendors])

  const filteredRows = useMemo(() => typeFilter === 'All' ? rows : rows.filter(r => r.type === typeFilter), [rows, typeFilter])

  const counts = useMemo(() => {
    const c: Record<BillType, number> = { 'Subcontractor Bill': 0, 'RA Bill': 0, 'Vendor Bill': 0, 'Payment': 0 }
    for (const r of rows) c[r.type]++
    return c
  }, [rows])

  // --- Create drawer state ---
  const [open, setOpen] = useState(false)
  const [billType, setBillType] = useState<CreatableType | ''>('')

  const [workOrderId, setWorkOrderId] = useState('')
  const [selectedMeasIds, setSelectedMeasIds] = useState<string[]>([])
  const [deductions, setDeductions] = useState({ retention: '0', advanceRecovery: '0', penalty: '0', otherDeduction: '0', tax: '0' })

  const [contractId, setContractId] = useState('')
  const [raSelectedMeasIds, setRaSelectedMeasIds] = useState<string[]>([])

  const [vendorForm, setVendorForm] = useState({ poId: '', invoiceNumber: '', invoiceAmount: '' })

  const eligibleWoMeasurements = useMemo(
    () => measurements.filter(m => m.workOrderId === workOrderId && m.status === 'APPROVED' && !subcontractorBills.some(b => b.measurementIds.includes(m.id))),
    [measurements, workOrderId, subcontractorBills]
  )
  const grossAmount = useMemo(() => measurements.filter(m => selectedMeasIds.includes(m.id)).reduce((sum, m) => sum + m.amount, 0), [measurements, selectedMeasIds])

  const contract = useMemo(() => contracts.find(c => c.id === contractId), [contracts, contractId])
  const eligibleContractMeasurements = useMemo(() => {
    if (!contract) return []
    return measurements.filter(m => m.projectId === contract.projectId && m.status === 'APPROVED' && !raBills.some(b => b.measurementIds.includes(m.id)))
  }, [measurements, contract, raBills])
  const billedAmount = useMemo(() => measurements.filter(m => raSelectedMeasIds.includes(m.id)).reduce((sum, m) => sum + m.amount, 0), [measurements, raSelectedMeasIds])

  const posWithGrn = useMemo(() => purchaseOrders.filter(po => grns.some(g => g.poId === po.id)), [purchaseOrders, grns])
  const grn = useMemo(() => grns.find(g => g.poId === vendorForm.poId), [grns, vendorForm.poId])

  function openDrawer() {
    setBillType(creatableTypes.length === 1 ? creatableTypes[0] : '')
    setOpen(true)
  }

  function resetAll() {
    setWorkOrderId(''); setSelectedMeasIds([])
    setDeductions({ retention: '0', advanceRecovery: '0', penalty: '0', otherDeduction: '0', tax: '0' })
    setContractId(''); setRaSelectedMeasIds([])
    setVendorForm({ poId: '', invoiceNumber: '', invoiceAmount: '' })
  }

  function closeDrawer() {
    setOpen(false)
    setBillType('')
    resetAll()
  }

  function submit() {
    if (billType === 'Subcontractor Bill') {
      if (!workOrderId || selectedMeasIds.length === 0) return
      const bill = createSubcontractorBill(workOrderId, selectedMeasIds, {
        retention: Number(deductions.retention) || 0,
        advanceRecovery: Number(deductions.advanceRecovery) || 0,
        penalty: Number(deductions.penalty) || 0,
        otherDeduction: Number(deductions.otherDeduction) || 0,
        tax: Number(deductions.tax) || 0,
      })
      closeDrawer()
      navigate(`/subcontractor-bills/${bill.id}`)
    } else if (billType === 'RA Bill') {
      if (!contract || raSelectedMeasIds.length === 0) return
      const bill = createRABill({ projectId: contract.projectId, contractId: contract.id, measurementIds: raSelectedMeasIds, billedAmount })
      closeDrawer()
      navigate(`/ra-bills/${bill.id}`)
    } else if (billType === 'Vendor Bill') {
      if (!vendorForm.poId || !grn || !vendorForm.invoiceNumber.trim() || !vendorForm.invoiceAmount) return
      createVendorBill({ poId: vendorForm.poId, grnId: grn.id, invoiceNumber: vendorForm.invoiceNumber, invoiceAmount: Number(vendorForm.invoiceAmount) || 0 })
      closeDrawer()
    }
  }

  const canSubmit =
    billType === 'Subcontractor Bill' ? (!!workOrderId && selectedMeasIds.length > 0) :
    billType === 'RA Bill' ? (!!contract && raSelectedMeasIds.length > 0) :
    billType === 'Vendor Bill' ? (!!vendorForm.poId && !!grn && !!vendorForm.invoiceNumber.trim() && !!vendorForm.invoiceAmount) :
    false

  const columns: Column<BillRow>[] = [
    { key: 'type', header: 'Type', render: r => <TypeBadge type={r.type} /> },
    { key: 'number', header: 'Number', render: r => <span className="font-medium text-ink-800">{r.number}</span>, sortValue: r => r.number },
    { key: 'party', header: 'Party', render: r => r.party, sortValue: r => r.party },
    { key: 'reference', header: 'Reference', render: r => r.reference, hideBelow: 'md' },
    { key: 'amount', header: 'Amount', render: r => fmtCurrency(r.amount), sortValue: r => r.amount },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'date', header: 'Date', render: r => fmtDate(r.date), sortValue: r => r.date, hideBelow: 'md' },
    {
      key: 'actions', header: 'Actions', render: r => {
        if (r.type === 'Subcontractor Bill' && r.status === 'DRAFT') {
          return (
            <Button
              variant="primary" size="sm" icon={<Send className="h-3.5 w-3.5" />}
              disabled={!canSubmitSubBill}
              title={!canSubmitSubBill ? 'Only the Subcontractor or PM can submit this bill' : undefined}
              onClick={e => { e.stopPropagation(); submitSubcontractorBill(r.entityId) }}
            >
              Submit
            </Button>
          )
        }
        if (r.type === 'Vendor Bill' && r.status === 'DOCUMENT_CHECK') {
          return (
            <Button
              variant="secondary" size="sm" icon={<Scale className="h-3.5 w-3.5" />}
              disabled={!canRunMatch}
              title={!canRunMatch ? 'Only Accounts or MD can run 3-way match' : undefined}
              onClick={e => { e.stopPropagation(); runThreeWayMatch(r.entityId) }}
            >
              Run 3-Way Match
            </Button>
          )
        }
        return <span className="text-xs text-ink-400">-</span>
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Bills & Payments"
        subtitle="Subcontractor bills, RA bills, vendor bills and payments in one place."
        actions={
          creatableTypes.length > 0 ? (
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openDrawer}>
              Create Bill
            </Button>
          ) : undefined
        }
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {(['All', ...BILL_TYPES] as const).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cls(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              typeFilter === t ? 'bg-brand-700 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            )}
          >
            {t}{t !== 'All' && ` (${counts[t]})`}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        keyField={r => r.id}
        onRowClick={r => navigate(r.detailPath)}
        searchable
        searchPlaceholder="Search bills & payments..."
        searchFields={r => `${r.number} ${r.party} ${r.reference} ${r.type}`}
        emptyMessage="No bills or payments found."
        emptyIcon={<Receipt className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={closeDrawer}
        title="Create Bill"
        subtitle="Raise a subcontractor bill, RA bill, or vendor bill."
        width="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeDrawer}>Cancel</Button>
            <Button variant="primary" disabled={!billType || !canSubmit} onClick={submit}>Save Bill</Button>
          </>
        }
      >
        <div className="space-y-4">
          {creatableTypes.length > 1 && (
            <Field label="Bill Type" required>
              <div className="flex flex-wrap gap-1.5">
                {creatableTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setBillType(t)}
                    className={cls(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      billType === t ? 'bg-brand-700 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {billType === 'Subcontractor Bill' && (
            <>
              <Field label="Work Order" required>
                <select value={workOrderId} onChange={e => { setWorkOrderId(e.target.value); setSelectedMeasIds([]) }} className={inputCls}>
                  <option value="">Select work order...</option>
                  {workOrders.map(w => <option key={w.id} value={w.id}>{w.woNumber} - {w.workPackage} ({subName(w.subcontractorId)})</option>)}
                </select>
              </Field>

              <Field label="Approved Measurements (unbilled)" required>
                {!workOrderId ? (
                  <p className="text-xs text-ink-500">Select a work order first.</p>
                ) : eligibleWoMeasurements.length === 0 ? (
                  <p className="text-xs text-amber-600">No approved, unbilled measurements available for this work order.</p>
                ) : (
                  <ul className="space-y-1.5 rounded-md border border-ink-200 p-2">
                    {eligibleWoMeasurements.map(m => (
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
            </>
          )}

          {billType === 'RA Bill' && (
            <>
              <Field label="Contract" required>
                <select value={contractId} onChange={e => { setContractId(e.target.value); setRaSelectedMeasIds([]) }} className={inputCls}>
                  <option value="">Select contract...</option>
                  {contracts.map(c => <option key={c.id} value={c.id}>{c.contractNumber} - {projectName(c.projectId)}</option>)}
                </select>
              </Field>

              <Field label="Approved Measurements (not yet billed)" required>
                {!contract ? (
                  <p className="text-xs text-ink-500">Select a contract first.</p>
                ) : eligibleContractMeasurements.length === 0 ? (
                  <p className="text-xs text-amber-600">No approved, unbilled measurements available for this project.</p>
                ) : (
                  <ul className="space-y-1.5 rounded-md border border-ink-200 p-2">
                    {eligibleContractMeasurements.map(m => (
                      <li key={m.id} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-ink-50">
                        <label className="flex items-center gap-2 text-sm text-ink-700">
                          <input
                            type="checkbox"
                            checked={raSelectedMeasIds.includes(m.id)}
                            onChange={e => setRaSelectedMeasIds(ids => e.target.checked ? [...ids, m.id] : ids.filter(x => x !== m.id))}
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

              {raSelectedMeasIds.length > 0 && (
                <div className="rounded-md bg-ink-50 px-3 py-2 text-sm">
                  <span className="text-ink-500">Billed Amount: </span>
                  <span className="font-semibold text-ink-800">{fmtCurrency(billedAmount)}</span>
                </div>
              )}
            </>
          )}

          {billType === 'Vendor Bill' && (
            <>
              <Field label="Purchase Order" required>
                <select value={vendorForm.poId} onChange={e => setVendorForm(f => ({ ...f, poId: e.target.value }))} className={inputCls}>
                  <option value="">Select PO...</option>
                  {posWithGrn.map(po => <option key={po.id} value={po.id}>{po.poNumber} - {vendorName(po.vendorId)} ({fmtCurrency(po.total)})</option>)}
                </select>
                {vendorForm.poId && !grn && <p className="mt-1 text-xs text-amber-600">No GRN found for this PO.</p>}
              </Field>
              {grn && (
                <div className="rounded-md bg-ink-50 px-3 py-2 text-sm">
                  <span className="text-ink-500">Linked GRN: </span>
                  <span className="font-medium text-ink-800">{grn.grnNumber}</span>
                </div>
              )}
              <Field label="Invoice Number" required>
                <input value={vendorForm.invoiceNumber} onChange={e => setVendorForm(f => ({ ...f, invoiceNumber: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Invoice Amount (₹)" required>
                <input type="number" min={0} value={vendorForm.invoiceAmount} onChange={e => setVendorForm(f => ({ ...f, invoiceAmount: e.target.value }))} className={inputCls} />
              </Field>
            </>
          )}
        </div>
      </Drawer>
    </div>
  )
}
