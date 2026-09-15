import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Field } from './ProjectsList'
import type { Site } from '../../types'

export default function SitesListPage() {
  const navigate = useNavigate()
  const sites = useStore(s => s.sites)
  const projects = useStore(s => s.projects)
  const users = useStore(s => s.users)
  const createSite = useStore(s => s.createSite)
  const user = useStore(s => s.currentUser!)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ projectId: selectedProjectId, name: '', code: '', address: '', geoLocation: '', peId: '', storeKeeperId: '' })

  const canCreate = user.role === 'MD' || user.role === 'PM'

  const columns: Column<Site>[] = [
    { key: 'name', header: 'Site', render: s => <div><p className="font-medium text-ink-800">{s.name}</p><p className="text-xs text-ink-500">{s.code}</p></div> },
    { key: 'project', header: 'Project', render: s => projects.find(p => p.id === s.projectId)?.code ?? '-' },
    { key: 'pe', header: 'Project Engineer', render: s => users.find(u => u.id === s.peId)?.name ?? '-', hideBelow: 'md' },
    { key: 'store', header: 'Store Keeper', render: s => users.find(u => u.id === s.storeKeeperId)?.name ?? '-', hideBelow: 'lg' },
    { key: 'address', header: 'Address', render: s => <span className="text-ink-500">{s.address}</span>, hideBelow: 'md' },
    { key: 'status', header: 'Status', render: s => <StatusBadge status={s.status} /> },
  ]

  return (
    <div>
      <PageHeader title="Sites" subtitle="Construction sites across all projects" actions={canCreate && <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Create Site</Button>} />
      <DataTable columns={columns} data={sites} keyField={s => s.id} searchable searchFields={s => `${s.name} ${s.code} ${s.address}`} onRowClick={s => navigate(`/sites/${s.id}`)} emptyIcon={<MapPin className="h-8 w-8" />} emptyMessage="No sites yet." />

      <Drawer open={open} onClose={() => setOpen(false)} title="Create Site" footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={!form.name || !form.projectId} onClick={() => { createSite(form); setOpen(false) }}>Create</Button>
        </>
      }>
        <div className="space-y-3">
          <Field label="Project">
            <select className="input" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
            </select>
          </Field>
          <Field label="Site Name"><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Site Code"><input className="input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></Field>
          <Field label="Address"><input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="GPS / Geo Location"><input className="input" value={form.geoLocation} onChange={e => setForm({ ...form, geoLocation: e.target.value })} placeholder="21.25 N, 81.62 E" /></Field>
          <Field label="Project Engineer">
            <select className="input" value={form.peId} onChange={e => setForm({ ...form, peId: e.target.value })}>
              <option value="">-- Select PE --</option>
              {users.filter(u => u.role === 'PE').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Store Keeper">
            <select className="input" value={form.storeKeeperId} onChange={e => setForm({ ...form, storeKeeperId: e.target.value })}>
              <option value="">-- Select Store Keeper --</option>
              {users.filter(u => u.role === 'STORE').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
        </div>
      </Drawer>
    </div>
  )
}
