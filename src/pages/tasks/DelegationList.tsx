import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtDate, isOverdue, cls } from '../../lib/utils'
import type { Delegation, Priority } from '../../types'

const PRIORITIES: Priority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT']
const OPEN_STATUSES: Delegation['status'][] = ['CREATED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED']

export default function DelegationList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const delegations = useStore(s => s.delegations)
  const users = useStore(s => s.users)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const createDelegation = useStore(s => s.createDelegation)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const rows = useMemo(() => {
    if (user.role === 'MD') return delegations
    return delegations.filter(d => !d.projectId || d.projectId === selectedProjectId)
  }, [delegations, selectedProjectId, user.role])

  function userName(uid: string) { return users.find(u => u.id === uid)?.name ?? uid }

  const columns: Column<Delegation>[] = [
    { key: 'taskId', header: 'Task #', render: d => <span className="font-medium text-ink-800">{d.taskId}</span> },
    { key: 'title', header: 'Title', render: d => <span className="line-clamp-1 max-w-xs">{d.title}</span> },
    { key: 'assignedTo', header: 'Assigned To', render: d => userName(d.assignedTo) },
    { key: 'priority', header: 'Priority', render: d => <PriorityBadge priority={d.priority} /> },
    {
      key: 'due', header: 'Due Date', render: d => {
        const overdue = OPEN_STATUSES.includes(d.status) && isOverdue(d.dueDate)
        return <span className={cls(overdue && 'font-medium text-red-600')}>{fmtDate(d.dueDate)}{overdue ? ' (Overdue)' : ''}</span>
      }, sortValue: d => d.dueDate,
    },
    { key: 'status', header: 'Status', render: d => <StatusBadge status={d.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Delegation / Task Assignment"
        subtitle="Assign and track tasks delegated across the team."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>Create Task</Button>}
      />
      <DataTable
        columns={columns}
        data={rows}
        keyField={d => d.id}
        searchable
        searchPlaceholder="Search task title..."
        searchFields={d => `${d.taskId} ${d.title}`}
        onRowClick={d => navigate(`/delegation/${d.id}`)}
        emptyMessage="No tasks delegated yet."
      />

      <CreateTaskDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreate={data => {
          createDelegation({ ...data, projectId: selectedProjectId, siteId: selectedSiteId })
          setDrawerOpen(false)
        }}
      />
    </div>
  )
}

function CreateTaskDrawer({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (data: Partial<Delegation>) => void }) {
  const users = useStore(s => s.users)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [priority, setPriority] = useState<Priority>('NORMAL')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))
  const [relatedModule, setRelatedModule] = useState('')

  function reset() {
    setTitle(''); setDescription(''); setAssignedTo(''); setPriority('NORMAL')
    setStartDate(new Date().toISOString().slice(0, 10)); setDueDate(new Date().toISOString().slice(0, 10)); setRelatedModule('')
  }

  function submit() {
    if (!title.trim() || !assignedTo) return
    onCreate({
      title: title.trim(), description, assignedTo, priority,
      startDate: new Date(startDate).toISOString(), dueDate: new Date(dueDate).toISOString(),
      relatedModule: relatedModule.trim() || undefined,
    })
    reset()
  }

  return (
    <Drawer
      open={open}
      onClose={() => { onClose(); reset() }}
      title="Create Task"
      width="sm"
      footer={<>
        <Button variant="secondary" onClick={() => { onClose(); reset() }}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={!title.trim() || !assignedTo}>Create</Button>
      </>}
    >
      <div className="space-y-4">
        <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} /></Field>
        <Field label="Description"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputCls} /></Field>
        <Field label="Assign To">
          <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputCls}>
            <option value="">Select user...</option>
            {users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className={inputCls}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} /></Field>
          <Field label="Due Date"><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Related Module (optional)"><input value={relatedModule} onChange={e => setRelatedModule(e.target.value)} className={inputCls} placeholder="e.g. dpr, stockAudit" /></Field>
      </div>
    </Drawer>
  )
}

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}</label>
      {children}
    </div>
  )
}
