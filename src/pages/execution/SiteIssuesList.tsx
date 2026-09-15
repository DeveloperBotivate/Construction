import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button, IconButton } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import { fmtDate, isOverdue, cls } from '../../lib/utils'
import type { SiteIssue, Severity } from '../../types'

const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function SiteIssuesList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const siteIssues = useStore(s => s.siteIssues)
  const users = useStore(s => s.users)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const createSiteIssue = useStore(s => s.createSiteIssue)
  const resolveSiteIssue = useStore(s => s.resolveSiteIssue)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [resolveTarget, setResolveTarget] = useState<SiteIssue | null>(null)
  const [resolution, setResolution] = useState('')

  const rows = useMemo(() => {
    if (user.role === 'MD') return siteIssues
    return siteIssues.filter(i => i.projectId === selectedProjectId)
  }, [siteIssues, selectedProjectId, user.role])

  function userName(id?: string) { return users.find(u => u.id === id)?.name ?? id ?? '-' }

  const columns: Column<SiteIssue>[] = [
    { key: 'num', header: 'Issue #', render: i => <span className="font-medium text-ink-800">{i.issueNumber}</span> },
    { key: 'title', header: 'Title', render: i => <span className="line-clamp-1 max-w-xs">{i.title}</span> },
    { key: 'severity', header: 'Severity', render: i => <StatusBadge status={i.severity} /> },
    { key: 'status', header: 'Status', render: i => <StatusBadge status={i.status} /> },
    { key: 'raisedBy', header: 'Raised By', render: i => userName(i.raisedBy), hideBelow: 'md' },
    {
      key: 'due', header: 'Due Date', render: i => (
        <span className={cls((i.status === 'OPEN' || i.status === 'IN_PROGRESS') && isOverdue(i.dueDate) && 'font-medium text-red-600')}>
          {fmtDate(i.dueDate)}{(i.status === 'OPEN' || i.status === 'IN_PROGRESS') && isOverdue(i.dueDate) ? ' (Overdue)' : ''}
        </span>
      ), sortValue: i => i.dueDate,
    },
    {
      key: 'actions', header: 'Actions', render: i => (
        (i.status === 'OPEN' || i.status === 'IN_PROGRESS') ? (
          <IconButton icon={<CheckCircle2 className="h-4 w-4" />} title="Resolve issue" onClick={e => { e.stopPropagation(); setResolveTarget(i) }} />
        ) : <span className="text-xs text-ink-400">-</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Site Issues"
        subtitle="Track and resolve on-site operational issues."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>Raise Issue</Button>}
      />
      <DataTable
        columns={columns}
        data={rows}
        keyField={i => i.id}
        searchable
        searchPlaceholder="Search issue title, category..."
        searchFields={i => `${i.issueNumber} ${i.title} ${i.category}`}
        onRowClick={i => navigate(`/site-issues/${i.id}`)}
        emptyMessage="No site issues raised yet."
      />

      <RaiseIssueDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreate={data => {
          createSiteIssue({ ...data, projectId: selectedProjectId, siteId: selectedSiteId })
          setDrawerOpen(false)
        }}
      />

      <Modal
        open={!!resolveTarget}
        onClose={() => { setResolveTarget(null); setResolution('') }}
        title={`Resolve ${resolveTarget?.issueNumber ?? ''}`}
        footer={<>
          <Button variant="secondary" onClick={() => { setResolveTarget(null); setResolution('') }}>Cancel</Button>
          <Button variant="success" disabled={!resolution.trim()} onClick={() => { if (resolveTarget) resolveSiteIssue(resolveTarget.id, resolution.trim()); setResolveTarget(null); setResolution('') }}>Mark Resolved</Button>
        </>}
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Resolution notes (required)</label>
        <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Describe how this was resolved..." />
      </Modal>
    </div>
  )
}

function RaiseIssueDrawer({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (data: Partial<SiteIssue>) => void }) {
  const users = useStore(s => s.users)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [severity, setSeverity] = useState<Severity>('MEDIUM')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))

  function reset() {
    setTitle(''); setDescription(''); setCategory('General'); setSeverity('MEDIUM'); setAssignedTo(''); setDueDate(new Date().toISOString().slice(0, 10))
  }

  function submit() {
    if (!title.trim()) return
    onCreate({ title: title.trim(), description, category, severity, assignedTo: assignedTo || undefined, dueDate: new Date(dueDate).toISOString() })
    reset()
  }

  return (
    <Drawer
      open={open}
      onClose={() => { onClose(); reset() }}
      title="Raise Site Issue"
      width="sm"
      footer={<>
        <Button variant="secondary" onClick={() => { onClose(); reset() }}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={!title.trim()}>Raise Issue</Button>
      </>}
    >
      <div className="space-y-4">
        <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} /></Field>
        <Field label="Description"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputCls} /></Field>
        <Field label="Category"><input value={category} onChange={e => setCategory(e.target.value)} className={inputCls} placeholder="e.g. Equipment, Site Condition" /></Field>
        <Field label="Severity">
          <select value={severity} onChange={e => setSeverity(e.target.value as Severity)} className={inputCls}>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Assign To (optional)">
          <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputCls}>
            <option value="">Unassigned</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </Field>
        <Field label="Due Date"><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} /></Field>
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
