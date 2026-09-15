import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Field } from '../projects/ProjectsList'
import { fmtDate } from '../../lib/utils'
import type { Drawing } from '../../types'

export default function DrawingRegisterPage() {
  const navigate = useNavigate()
  const drawings = useStore(s => s.drawings)
  const projects = useStore(s => s.projects)
  const users = useStore(s => s.users)
  const createDrawing = useStore(s => s.createDrawing)
  const approveDrawing = useStore(s => s.approveDrawing)
  const user = useStore(s => s.currentUser!)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const [open, setOpen] = useState(false)
  const [latestOnly, setLatestOnly] = useState(user.role === 'PE')
  const [form, setForm] = useState({ projectId: selectedProjectId, drawingNumber: '', name: '', discipline: 'Structural', revision: 'Rev A' })

  const canApprove = user.role === 'PM' || user.role === 'MD'
  const visible = latestOnly ? drawings.filter(d => d.status !== 'SUPERSEDED') : drawings

  const columns: Column<Drawing>[] = [
    { key: 'no', header: 'Drawing No.', render: d => <span className="font-medium text-ink-800">{d.drawingNumber}</span> },
    { key: 'name', header: 'Name', render: d => <div><p className="font-medium text-ink-800">{d.name}</p><p className="text-xs text-ink-500">{d.discipline}</p></div> },
    { key: 'project', header: 'Project', render: d => projects.find(p => p.id === d.projectId)?.code ?? '-', hideBelow: 'md' },
    { key: 'rev', header: 'Revision', render: d => d.revision, hideBelow: 'md' },
    { key: 'issued', header: 'Issue Date', render: d => fmtDate(d.issueDate), hideBelow: 'lg' },
    { key: 'by', header: 'Uploaded By', render: d => users.find(u => u.id === d.uploadedBy)?.name ?? '-', hideBelow: 'lg' },
    { key: 'status', header: 'Status', render: d => <StatusBadge status={d.status} /> },
    { key: 'actions', header: 'Actions', render: d => (
      canApprove && (d.status === 'DRAFT' || d.status === 'UNDER_REVIEW') ? (
        <Button size="sm" variant="success" onClick={e => { e.stopPropagation(); approveDrawing(d.id) }}>Approve</Button>
      ) : <span className="text-xs text-ink-400">-</span>
    ) },
  ]

  return (
    <div>
      <PageHeader
        title="Drawing Register"
        subtitle="Revision-controlled drawing management"
        actions={<>
          <label className="flex items-center gap-1.5 text-sm text-ink-600">
            <input type="checkbox" checked={latestOnly} onChange={e => setLatestOnly(e.target.checked)} className="rounded border-ink-300" />
            Latest approved only
          </label>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Upload Drawing</Button>
        </>}
      />
      <DataTable columns={columns} data={visible} keyField={d => d.id} searchable searchFields={d => `${d.drawingNumber} ${d.name}`} onRowClick={d => navigate(`/drawings/${d.id}`)} emptyIcon={<FileText className="h-8 w-8" />} emptyMessage="No drawings yet." />

      <Drawer open={open} onClose={() => setOpen(false)} title="Upload Drawing" footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={!form.name} onClick={() => { createDrawing(form); setOpen(false) }}>Upload</Button>
        </>
      }>
        <div className="space-y-3">
          <Field label="Project">
            <select className="input" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
            </select>
          </Field>
          <Field label="Drawing Number"><input className="input" value={form.drawingNumber} onChange={e => setForm({ ...form, drawingNumber: e.target.value })} placeholder="DRG-STR-003" /></Field>
          <Field label="Drawing Name"><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Discipline">
            <select className="input" value={form.discipline} onChange={e => setForm({ ...form, discipline: e.target.value })}>
              <option>Structural</option><option>Architectural</option><option>Electrical</option><option>Plumbing</option><option>MEP</option>
            </select>
          </Field>
          <Field label="Revision"><input className="input" value={form.revision} onChange={e => setForm({ ...form, revision: e.target.value })} /></Field>
        </div>
      </Drawer>
    </div>
  )
}
