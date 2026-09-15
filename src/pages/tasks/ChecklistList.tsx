import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { fmtDate } from '../../lib/utils'
import type { ChecklistInstance } from '../../types'

export default function ChecklistList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const checklistInstances = useStore(s => s.checklistInstances)
  const checklistTemplates = useStore(s => s.checklistTemplates)
  const users = useStore(s => s.users)
  const sites = useStore(s => s.sites)
  const projects = useStore(s => s.projects)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const assignChecklist = useStore(s => s.assignChecklist)

  const [assignOpen, setAssignOpen] = useState(false)
  const [templateId, setTemplateId] = useState('')
  const [projectId, setProjectId] = useState(selectedProjectId)
  const [siteId, setSiteId] = useState(selectedSiteId)
  const [assignedTo, setAssignedTo] = useState('')

  const rows = useMemo(() => {
    if (user.role === 'MD') return checklistInstances
    return checklistInstances.filter(c => c.projectId === selectedProjectId)
  }, [checklistInstances, selectedProjectId, user.role])

  function userName(uid: string) { return users.find(u => u.id === uid)?.name ?? uid }

  const columns: Column<ChecklistInstance>[] = [
    { key: 'num', header: 'Checklist #', render: c => <span className="font-medium text-ink-800">{c.checklistNumber}</span> },
    { key: 'template', header: 'Template', render: c => c.templateName },
    { key: 'assignedTo', header: 'Assigned To', render: c => userName(c.assignedTo) },
    { key: 'status', header: 'Status', render: c => <StatusBadge status={c.status} /> },
    { key: 'summary', header: 'Pass / Fail', render: c => `${c.items.filter(i => i.result === 'PASS').length}/${c.items.length} passed`, hideBelow: 'sm' },
    { key: 'created', header: 'Created', render: c => fmtDate(c.createdAt), hideBelow: 'md', sortValue: c => c.createdAt },
  ]

  function resetForm() { setTemplateId(''); setProjectId(selectedProjectId); setSiteId(selectedSiteId); setAssignedTo('') }

  function submitAssign() {
    if (!templateId || !projectId || !siteId || !assignedTo) return
    assignChecklist(templateId, projectId, siteId, assignedTo)
    setAssignOpen(false)
    resetForm()
  }

  return (
    <div>
      <PageHeader
        title="Checklists"
        subtitle="Quality, safety and site checklist execution."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setAssignOpen(true)}>Assign Checklist</Button>}
      />
      <DataTable
        columns={columns}
        data={rows}
        keyField={c => c.id}
        searchable
        searchPlaceholder="Search checklist number, template..."
        searchFields={c => `${c.checklistNumber} ${c.templateName}`}
        onRowClick={c => navigate(`/checklist/${c.id}`)}
        emptyMessage="No checklists assigned yet."
      />

      <Modal
        open={assignOpen}
        onClose={() => { setAssignOpen(false); resetForm() }}
        title="Assign Checklist"
        footer={<>
          <Button variant="secondary" onClick={() => { setAssignOpen(false); resetForm() }}>Cancel</Button>
          <Button variant="primary" disabled={!templateId || !projectId || !siteId || !assignedTo} onClick={submitAssign}>Assign</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Template</label>
            <select value={templateId} onChange={e => setTemplateId(e.target.value)} className={inputCls}>
              <option value="">Select template...</option>
              {checklistTemplates.filter(t => t.active).map(t => <option key={t.id} value={t.id}>{t.name} ({t.category})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Project</label>
              <select value={projectId} onChange={e => setProjectId(e.target.value)} className={inputCls}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Site</label>
              <select value={siteId} onChange={e => setSiteId(e.target.value)} className={inputCls}>
                {sites.filter(s => s.projectId === projectId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Assign To</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputCls}>
              <option value="">Select user...</option>
              {users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'
