import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileCheck2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency } from '../../lib/utils'
import type { RABill } from '../../types'

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  )
}

export default function RABillsList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const raBills = useStore(s => s.raBills)
  const contracts = useStore(s => s.contracts)
  const projects = useStore(s => s.projects)
  const measurements = useStore(s => s.measurements)
  const createRABill = useStore(s => s.createRABill)

  const [open, setOpen] = useState(false)
  const [contractId, setContractId] = useState('')
  const [selectedMeasIds, setSelectedMeasIds] = useState<string[]>([])

  const canCreate = user.role === 'BILLING' || user.role === 'MD'
  const contract = useMemo(() => contracts.find(c => c.id === contractId), [contracts, contractId])

  function projectName(id: string) { return projects.find(p => p.id === id)?.name ?? '-' }

  const eligibleMeasurements = useMemo(() => {
    if (!contract) return []
    return measurements.filter(m => m.projectId === contract.projectId && m.status === 'APPROVED' && !raBills.some(b => b.measurementIds.includes(m.id)))
  }, [measurements, contract, raBills])

  const billedAmount = useMemo(() => measurements.filter(m => selectedMeasIds.includes(m.id)).reduce((sum, m) => sum + m.amount, 0), [measurements, selectedMeasIds])

  function reset() { setContractId(''); setSelectedMeasIds([]) }

  function submit() {
    if (!contract || selectedMeasIds.length === 0) return
    const bill = createRABill({ projectId: contract.projectId, contractId: contract.id, measurementIds: selectedMeasIds, billedAmount })
    reset()
    setOpen(false)
    navigate(`/ra-bills/${bill.id}`)
  }

  const columns: Column<RABill>[] = [
    { key: 'raNumber', header: 'RA Number', render: r => <span className="font-medium text-ink-800">{r.raNumber}</span>, sortValue: r => r.raNumber },
    { key: 'project', header: 'Project', render: r => projectName(r.projectId) },
    { key: 'billedAmount', header: 'Billed', render: r => fmtCurrency(r.billedAmount), sortValue: r => r.billedAmount },
    { key: 'certifiedAmount', header: 'Certified', render: r => fmtCurrency(r.certifiedAmount), sortValue: r => r.certifiedAmount, hideBelow: 'sm' },
    { key: 'netAmount', header: 'Net', render: r => fmtCurrency(r.netAmount), sortValue: r => r.netAmount, hideBelow: 'md' },
    { key: 'receivedAmount', header: 'Received', render: r => fmtCurrency(r.receivedAmount), sortValue: r => r.receivedAmount, hideBelow: 'md' },
    { key: 'outstanding', header: 'Outstanding', render: r => fmtCurrency(r.netAmount - r.receivedAmount), sortValue: r => r.netAmount - r.receivedAmount },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="RA Bills"
        subtitle="Running account bills raised to the client against certified work."
        actions={
          <Button
            variant="primary" icon={<Plus className="h-4 w-4" />}
            disabled={!canCreate}
            title={!canCreate ? 'Only Billing & Liaison or MD can create an RA bill' : undefined}
            onClick={() => setOpen(true)}
          >
            Create RA Bill
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={raBills}
        keyField={r => r.id}
        onRowClick={r => navigate(`/ra-bills/${r.id}`)}
        searchable
        searchPlaceholder="Search RA bills..."
        searchFields={r => `${r.raNumber} ${projectName(r.projectId)}`}
        emptyMessage="No RA bills raised yet."
        emptyIcon={<FileCheck2 className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); reset() }}
        title="Create RA Bill"
        subtitle="Bill the client against approved, unbilled measurements for the contract's project."
        width="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button variant="primary" disabled={!contract || selectedMeasIds.length === 0} onClick={submit}>Save RA Bill</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Contract" required>
            <select value={contractId} onChange={e => { setContractId(e.target.value); setSelectedMeasIds([]) }} className={inputCls}>
              <option value="">Select contract...</option>
              {contracts.map(c => <option key={c.id} value={c.id}>{c.contractNumber} - {projectName(c.projectId)}</option>)}
            </select>
          </Field>

          <Field label="Approved Measurements (not yet billed)" required>
            {!contract ? (
              <p className="text-xs text-ink-500">Select a contract first.</p>
            ) : eligibleMeasurements.length === 0 ? (
              <p className="text-xs text-amber-600">No approved, unbilled measurements available for this project.</p>
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
              <span className="text-ink-500">Billed Amount: </span>
              <span className="font-semibold text-ink-800">{fmtCurrency(billedAmount)}</span>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}
