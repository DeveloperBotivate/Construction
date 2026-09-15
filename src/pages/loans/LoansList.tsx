import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Landmark } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency } from '../../lib/utils'
import type { Loan } from '../../types'

export default function LoansList() {
  const loans = useStore(s => s.loans)
  const createLoan = useStore(s => s.createLoan)
  const navigate = useNavigate()

  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', lender: '', principal: '', interestRate: '', startDate: '', tenureMonths: '', emiAmount: '' })

  const columns: Column<Loan>[] = useMemo(() => [
    { key: 'loanNumber', header: 'Loan #', render: l => <span className="font-medium text-ink-800">{l.loanNumber}</span>, sortValue: l => l.loanNumber },
    { key: 'name', header: 'Name', render: l => l.name },
    { key: 'lender', header: 'Lender', render: l => l.lender, hideBelow: 'md' },
    { key: 'principal', header: 'Principal', render: l => fmtCurrency(l.principal), sortValue: l => l.principal },
    { key: 'outstanding', header: 'Outstanding', render: l => fmtCurrency(l.outstanding), sortValue: l => l.outstanding },
    { key: 'emiAmount', header: 'EMI', render: l => fmtCurrency(l.emiAmount), hideBelow: 'lg' },
    { key: 'status', header: 'Status', render: l => <StatusBadge status={l.status} /> },
    { key: 'actions', header: 'Actions', render: l => <Button size="sm" variant="secondary" onClick={() => navigate(`/loans/${l.id}`)}>View</Button> },
  ], [navigate])

  return (
    <div>
      <PageHeader
        title="Loans"
        subtitle="Term loans and equipment financing with EMI schedules."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Add Loan</Button>}
      />

      <DataTable
        columns={columns}
        data={loans}
        keyField={l => l.id}
        onRowClick={l => navigate(`/loans/${l.id}`)}
        searchable
        searchPlaceholder="Search loans..."
        searchFields={l => `${l.loanNumber} ${l.name} ${l.lender} ${l.status}`}
        emptyIcon={<Landmark className="h-8 w-8" />}
        emptyMessage="No loans recorded yet."
      />

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Loan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!form.name.trim() || !form.lender.trim() || !form.principal}
              onClick={() => {
                createLoan({
                  name: form.name.trim(),
                  lender: form.lender.trim(),
                  principal: Number(form.principal) || 0,
                  interestRate: Number(form.interestRate) || 0,
                  startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
                  tenureMonths: Number(form.tenureMonths) || 12,
                  emiAmount: Number(form.emiAmount) || 0,
                })
                setForm({ name: '', lender: '', principal: '', interestRate: '', startDate: '', tenureMonths: '', emiAmount: '' })
                setAddOpen(false)
              }}
            >
              Add Loan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Loan Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. Site Office Vehicle Loan" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Lender</label>
            <input value={form.lender} onChange={e => setForm(f => ({ ...f, lender: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. HDFC Bank" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Principal (&#8377;)</label>
              <input type="number" value={form.principal} onChange={e => setForm(f => ({ ...f, principal: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Interest Rate (%)</label>
              <input type="number" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Tenure (months)</label>
              <input type="number" value={form.tenureMonths} onChange={e => setForm(f => ({ ...f, tenureMonths: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">EMI Amount (&#8377;)</label>
            <input type="number" value={form.emiAmount} onChange={e => setForm(f => ({ ...f, emiAmount: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <p className="text-xs text-ink-400">Note: this is a prototype — adding a loan here does not auto-generate its installment schedule.</p>
        </div>
      </Drawer>
    </div>
  )
}
