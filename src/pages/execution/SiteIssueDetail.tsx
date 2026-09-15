import { useState, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Timeline, type TimelineStep } from '../../components/ui/Timeline'
import { ApprovalActionBar } from '../../components/ui/ApprovalActionBar'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtDate, isOverdue } from '../../lib/utils'

export default function SiteIssueDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const users = useStore(s => s.users)
  const issue = useStore(s => s.siteIssues.find(i => i.id === id))
  const resolveSiteIssue = useStore(s => s.resolveSiteIssue)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolution, setResolution] = useState('')

  if (!issue) return <EmptyState message="Site issue not found." />

  function userName(uid?: string) { return users.find(u => u.id === uid)?.name ?? uid ?? '-' }
  const canResolve = issue.status === 'OPEN' || issue.status === 'IN_PROGRESS'
  const overdue = canResolve && isOverdue(issue.dueDate)

  const timelineSteps: TimelineStep[] = [
    { id: 'raised', title: `Raised by ${userName(issue.raisedBy)}`, timestamp: issue.createdAt, tone: 'info' },
    ...(issue.status === 'RESOLVED' || issue.status === 'CLOSED' ? [{ id: 'resolved', title: 'Resolved', subtitle: issue.resolution, tone: 'success' as const }] : []),
  ]

  const tabs: TabItem[] = [
    {
      key: 'overview', label: 'Overview', content: (
        <div className="space-y-4">
          {overdue && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
              This issue is overdue (due {fmtDate(issue.dueDate)}).
            </div>
          )}
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border border-ink-200 bg-white p-4 sm:grid-cols-2">
            <Def label="Title" value={issue.title} full />
            <Def label="Description" value={issue.description || '-'} full />
            <Def label="Category" value={issue.category} />
            <Def label="Severity" value={<StatusBadge status={issue.severity} />} />
            <Def label="Status" value={<StatusBadge status={issue.status} />} />
            <Def label="Raised By" value={userName(issue.raisedBy)} />
            <Def label="Assigned To" value={userName(issue.assignedTo)} />
            <Def label="Due Date" value={fmtDate(issue.dueDate)} />
            <Def label="Created" value={fmtDate(issue.createdAt)} />
            {issue.resolution && <Def label="Resolution" value={issue.resolution} full />}
          </dl>
        </div>
      ),
    },
    { key: 'workflow', label: 'Workflow Status', content: <Timeline steps={timelineSteps} /> },
    { key: 'approvals', label: 'Approval History', content: <ApprovalActionBar recordId={issue.id} /> },
    { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="SiteIssue" recordId={issue.id} /> },
    { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="SiteIssue" recordId={issue.id} /> },
  ]

  return (
    <div>
      <PageHeader
        title={issue.issueNumber}
        subtitle={issue.title}
        breadcrumb={[{ label: 'Site Issues', to: '/site-issues' }, { label: issue.issueNumber }]}
        actions={<>
          <StatusBadge status={issue.status} />
          {canResolve && <Button variant="success" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setResolveOpen(true)}>Resolve</Button>}
          <Button variant="secondary" onClick={() => navigate('/site-issues')}>Back to list</Button>
        </>}
      />
      <Tabs tabs={tabs} />

      <Modal
        open={resolveOpen}
        onClose={() => { setResolveOpen(false); setResolution('') }}
        title={`Resolve ${issue.issueNumber}`}
        footer={<>
          <Button variant="secondary" onClick={() => { setResolveOpen(false); setResolution('') }}>Cancel</Button>
          <Button variant="success" disabled={!resolution.trim()} onClick={() => { resolveSiteIssue(issue.id, resolution.trim()); setResolveOpen(false); setResolution('') }}>Mark Resolved</Button>
        </>}
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Resolution notes (required)</label>
        <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Describe how this was resolved..." />
      </Modal>
    </div>
  )
}

function Def({ label, value, full }: { label: string; value: ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink-800">{value}</dd>
    </div>
  )
}
