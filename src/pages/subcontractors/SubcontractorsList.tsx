import { useState } from 'react'
import { Plus, HardHat } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import type { Subcontractor } from '../../types'

export default function SubcontractorsList() {
  const user = useStore(s => s.currentUser!)
  const subcontractors = useStore(s => s.subcontractors)
  const createSubcontractor = useStore(s => s.createSubcontractor)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', trade: '', contactPerson: '', phone: '', email: '' })

  const canCreate = user.role === 'PM' || user.role === 'MD'

  function reset() {
    setForm({ name: '', trade: '', contactPerson: '', phone: '', email: '' })
  }

  function submit() {
    if (!form.name.trim() || !form.trade.trim()) return
    createSubcontractor(form)
    reset()
    setOpen(false)
  }

  const columns: Column<Subcontractor>[] = [
    { key: 'name', header: 'Name', render: r => <span className="font-medium text-ink-800">{r.name}</span>, sortValue: r => r.name },
    { key: 'trade', header: 'Trade', render: r => r.trade, sortValue: r => r.trade },
    { key: 'contactPerson', header: 'Contact Person', render: r => r.contactPerson, hideBelow: 'md' },
    { key: 'phone', header: 'Phone', render: r => r.phone, hideBelow: 'md' },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Subcontractors"
        subtitle="Master list of subcontractors engaged across projects."
        actions={
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            disabled={!canCreate}
            title={!canCreate ? 'Only Project Manager or MD can add subcontractors' : undefined}
            onClick={() => setOpen(true)}
          >
            Add Subcontractor
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={subcontractors}
        keyField={r => r.id}
        searchable
        searchPlaceholder="Search subcontractors..."
        searchFields={r => `${r.name} ${r.trade} ${r.contactPerson}`}
        emptyMessage="No subcontractors added yet."
        emptyIcon={<HardHat className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); reset() }}
        title="Add Subcontractor"
        subtitle="Create a new subcontractor master record."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button variant="primary" disabled={!form.name.trim() || !form.trade.trim()} onClick={submit}>Save Subcontractor</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" required>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. ABC Civil Works" />
          </Field>
          <Field label="Trade" required>
            <input value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))} className={inputCls} placeholder="e.g. Civil & Structural" />
          </Field>
          <Field label="Contact Person">
            <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
          </Field>
        </div>
      </Drawer>
    </div>
  )
}

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
  )
}
