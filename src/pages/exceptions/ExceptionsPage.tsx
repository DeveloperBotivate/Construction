import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TriangleAlert, Eye, CheckCircle2, RotateCcw } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { deriveExceptions } from '../../store/selectors'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { recordLink } from '../../lib/recordLinks'
import { roleLabel } from '../../lib/permissions'
import { fmtDate, cls } from '../../lib/utils'
import type { ExceptionRecord, Severity } from '../../types'

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const SEVERITY_CHIP: Record<Severity, string> = {
  CRITICAL: 'bg-red-50 text-red-700 ring-red-600/20',
  HIGH: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  MEDIUM: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  LOW: 'bg-ink-100 text-ink-600 ring-ink-500/20',
}

export default function ExceptionsPage() {
  const state = useStore(s => s)
  const exceptions = useMemo(() => deriveExceptions(state), [state])
  const resolveException = useStore(s => s.resolveException)
  const reopenException = useStore(s => s.reopenException)
  const navigate = useNavigate()

  const [severityFilter, setSeverityFilter] = useState<Severity | null>(null)
  const [resolveTarget, setResolveTarget] = useState<ExceptionRecord | null>(null)
  const [note, setNote] = useState('')

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    for (const e of exceptions) c[e.severity]++
    return c
  }, [exceptions])

  const filtered = useMemo(() => severityFilter ? exceptions.filter(e => e.severity === severityFilter) : exceptions, [exceptions, severityFilter])

  const columns: Column<ExceptionRecord>[] = [
    { key: 'severity', header: 'Severity', render: e => <span className={cls('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', SEVERITY_CHIP[e.severity])}>{e.severity}</span> },
    { key: 'type', header: 'Type', render: e => <span className="text-xs font-medium text-ink-700">{e.type.replace(/_/g, ' ')}</span> },
    { key: 'module', header: 'Module', render: e => e.module, hideBelow: 'md' },
    { key: 'description', header: 'Description', render: e => <span className="text-ink-700">{e.description}</span> },
    { key: 'owner', header: 'Owner', render: e => roleLabel(e.owner), hideBelow: 'lg' },
    { key: 'dueDate', header: 'Due', render: e => fmtDate(e.dueDate), hideBelow: 'lg' },
    { key: 'status', header: 'Status', render: e => <StatusBadge status={e.status} /> },
    {
      key: 'actions', header: 'Actions', render: e => {
        const link = e.recordType && e.recordId ? recordLink(e.recordType, e.recordId) : null
        return (
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="secondary" icon={<Eye className="h-3.5 w-3.5" />} disabled={!link} title={link ? undefined : 'No detail view available for this record'} onClick={() => link && navigate(link)}>View</Button>
            {(e.status === 'OPEN' || e.status === 'IN_PROGRESS') && (
              <Button size="sm" variant="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => { setResolveTarget(e); setNote('') }}>Resolve</Button>
            )}
            {e.status === 'RESOLVED' && (
              <Button size="sm" variant="secondary" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => reopenException(e.id)}>Reopen</Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Exceptions" subtitle="System-detected exceptions requiring attention, derived live from operational data." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSeverityFilter(null)}
          className={cls('rounded-md px-3 py-1.5 text-xs font-medium ring-1 ring-inset', severityFilter === null ? 'bg-ink-800 text-white ring-ink-800' : 'bg-white text-ink-600 ring-ink-300 hover:bg-ink-50')}
        >
          All ({exceptions.length})
        </button>
        {SEVERITIES.map(sev => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(f => f === sev ? null : sev)}
            className={cls('rounded-md px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors', severityFilter === sev ? SEVERITY_CHIP[sev].replace('ring-', 'ring-2 ring-') : cls(SEVERITY_CHIP[sev], 'opacity-70 hover:opacity-100'))}
          >
            {sev} ({counts[sev]})
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyField={e => e.id}
        searchable
        searchPlaceholder="Search exceptions..."
        searchFields={e => `${e.type} ${e.module} ${e.description} ${e.owner} ${e.status}`}
        emptyIcon={<TriangleAlert className="h-8 w-8" />}
        emptyMessage="No exceptions match this filter."
      />

      <Modal
        open={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        title="Resolve Exception"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolveTarget(null)}>Cancel</Button>
            <Button variant="success" disabled={!note.trim()} onClick={() => { if (resolveTarget && note.trim()) { resolveException(resolveTarget.id, note.trim()); setResolveTarget(null) } }}>
              Mark Resolved
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-ink-600">{resolveTarget?.description}</p>
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Resolution Note (required)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Describe how this exception was resolved..." />
      </Modal>
    </div>
  )
}
