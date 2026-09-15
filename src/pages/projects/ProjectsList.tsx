import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { Project } from '../../types'

export default function ProjectsListPage() {
  const navigate = useNavigate()
  const projects = useStore(s => s.projects)
  const users = useStore(s => s.users)
  const createProject = useStore(s => s.createProject)
  const user = useStore(s => s.currentUser!)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', client: '', contractValue: 0, budget: 0, startDate: '', endDate: '', location: '', description: '', pmId: '' })

  const canCreate = user.role === 'MD' || user.role === 'PM'

  const columns: Column<Project>[] = [
    { key: 'code', header: 'Code', render: p => <span className="font-medium text-ink-800">{p.code}</span>, sortValue: p => p.code },
    { key: 'name', header: 'Project', render: p => <div><p className="font-medium text-ink-800">{p.name}</p><p className="text-xs text-ink-500">{p.client}</p></div> },
    { key: 'pm', header: 'PM', render: p => users.find(u => u.id === p.pmId)?.name ?? '-', hideBelow: 'md' },
    { key: 'value', header: 'Contract Value', render: p => fmtCurrency(p.contractValue), sortValue: p => p.contractValue, hideBelow: 'md' },
    { key: 'progress', header: 'Progress', render: p => <div className="w-32"><ProgressBar pct={p.progressPct} /><span className="text-xs text-ink-500">{p.progressPct}%</span></div> },
    { key: 'status', header: 'Status', render: p => <StatusBadge status={p.status} /> },
    { key: 'end', header: 'End Date', render: p => fmtDate(p.endDate), hideBelow: 'lg' },
  ]

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="All active and past construction projects"
        actions={canCreate && <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Create Project</Button>}
      />
      <DataTable
        columns={columns}
        data={projects}
        keyField={p => p.id}
        searchable
        searchPlaceholder="Search by code, name, client..."
        searchFields={p => `${p.code} ${p.name} ${p.client}`}
        onRowClick={p => navigate(`/projects/${p.id}`)}
        emptyIcon={<Building2 className="h-8 w-8" />}
        emptyMessage="No projects yet."
      />

      <Drawer open={open} onClose={() => setOpen(false)} title="Create Project" footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={!form.code || !form.name} onClick={() => {
            const p = createProject({ ...form, pmId: form.pmId || user.id })
            setOpen(false)
            navigate(`/projects/${p.id}`)
          }}>Create</Button>
        </>
      }>
        <div className="space-y-3">
          <Field label="Project Code"><input className="input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="PRJ-002" /></Field>
          <Field label="Project Name"><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Client"><input className="input" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contract Value (₹)"><input type="number" className="input" value={form.contractValue} onChange={e => setForm({ ...form, contractValue: Number(e.target.value) })} /></Field>
            <Field label="Budget (₹)"><input type="number" className="input" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><input type="date" className="input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></Field>
            <Field label="End Date"><input type="date" className="input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></Field>
          </div>
          <Field label="Location"><input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Project Manager">
            <select className="input" value={form.pmId} onChange={e => setForm({ ...form, pmId: e.target.value })}>
              <option value="">-- Select PM --</option>
              {users.filter(u => u.role === 'PM').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Description"><textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
        </div>
      </Drawer>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-600">{label}</span>
      {children}
    </label>
  )
}
