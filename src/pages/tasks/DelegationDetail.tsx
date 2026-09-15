import { useState, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UserCheck, Send, ShieldCheck, CheckCircle2, TriangleAlert } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Timeline, type TimelineStep } from '../../components/ui/Timeline'
import { ApprovalActionBar } from '../../components/ui/ApprovalActionBar'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtDate, isOverdue } from '../../lib/utils'
import type { DelegationStatus } from '../../types'

const STATUS_ORDER: DelegationStatus[] = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'COMPLETED']
const OPEN_STATUSES: DelegationStatus[] = ['CREATED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED']

export default function DelegationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const delegation = useStore(s => s.delegations.find(d => d.id === id))
  const users = useStore(s => s.users)
  const acceptDelegation = useStore(s => s.acceptDelegation)
  const updateDelegationProgress = useStore(s => s.updateDelegationProgress)
  const submitDelegation = useStore(s => s.submitDelegation)
  const verifyDelegation = useStore(s => s.verifyDelegation)
  const completeDelegation = useStore(s => s.completeDelegation)

  const [progressDraft, setProgressDraft] = useState('0')

  if (!delegation) return <EmptyState message="Task not found." />

  function userName(uid: string) { return users.find(u => u.id === uid)?.name ?? uid }
  const isAssignee = delegation.assignedTo === user.id
  const isAssigner = delegation.assignedBy === user.id
  const overdue = OPEN_STATUSES.includes(delegation.status) && isOverdue(delegation.dueDate)

  const currentIdx = STATUS_ORDER.indexOf(delegation.status)
  const timelineSteps: TimelineStep[] = STATUS_ORDER.map((st, idx) => ({
    id: st,
    title: st.replace('_', ' '),
    tone: idx < currentIdx ? 'success' : idx === currentIdx ? 'info' : 'neutral',
  }))

  const tabs: TabItem[] = [
    {
      key: 'overview', label: 'Overview', content: (
        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border border-ink-200 bg-white p-4 sm:grid-cols-2">
            <Def label="Title" value={delegation.title} full />
            <Def label="Description" value={delegation.description || '-'} full />
            <Def label="Assigned By" value={userName(delegation.assignedBy)} />
            <Def label="Assigned To" value={userName(delegation.assignedTo)} />
            <Def label="Priority" value={<PriorityBadge priority={delegation.priority} />} />
            <Def label="Status" value={<StatusBadge status={delegation.status} />} />
            <Def label="Start Date" value={fmtDate(delegation.startDate)} />
            <Def label="Due Date" value={fmtDate(delegation.dueDate)} />
            <Def label="Related Module" value={delegation.relatedModule ?? '-'} />
            <Def label="Escalated" value={delegation.escalated ? 'Yes' : 'No'} />
          </dl>

          <div className="rounded-lg border border-ink-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-800">Progress</p>
              <span className="text-sm text-ink-600">{delegation.progressPct}%</span>
            </div>
            <ProgressBar pct={delegation.progressPct} tone={delegation.status === 'COMPLETED' ? 'success' : overdue ? 'danger' : 'brand'} />
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-200 bg-white p-4">
            {delegation.status === 'ASSIGNED' && (
              <Button variant="primary" icon={<UserCheck className="h-4 w-4" />} disabled={!isAssignee} title={isAssignee ? undefined : 'Only the assignee can accept this task'} onClick={() => acceptDelegation(delegation.id)}>Accept</Button>
            )}
            {(delegation.status === 'ACCEPTED' || delegation.status === 'IN_PROGRESS') && (
              <>
                <input
                  type="number" min={0} max={100} value={progressDraft} onChange={e => setProgressDraft(e.target.value)}
                  className="w-20 rounded-md border border-ink-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  disabled={!isAssignee}
                />
                <Button variant="secondary" disabled={!isAssignee} title={isAssignee ? undefined : 'Only the assignee can update progress'} onClick={() => updateDelegationProgress(delegation.id, Math.min(100, Math.max(0, Number(progressDraft) || 0)))}>Update Progress</Button>
                <Button variant="primary" icon={<Send className="h-4 w-4" />} disabled={!isAssignee} title={isAssignee ? undefined : 'Only the assignee can submit this task'} onClick={() => submitDelegation(delegation.id)}>Submit</Button>
              </>
            )}
            {delegation.status === 'SUBMITTED' && (
              <Button variant="primary" icon={<ShieldCheck className="h-4 w-4" />} disabled={!isAssigner} title={isAssigner ? undefined : 'Only the assigner can verify this task'} onClick={() => verifyDelegation(delegation.id)}>Verify</Button>
            )}
            {delegation.status === 'VERIFIED' && (
              <Button variant="success" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => completeDelegation(delegation.id)}>Mark Completed</Button>
            )}
            {delegation.status === 'COMPLETED' && <span className="text-sm text-ink-500">Task completed.</span>}
          </div>
        </div>
      ),
    },
    { key: 'workflow', label: 'Workflow Status', content: <Timeline steps={timelineSteps} /> },
    { key: 'approvals', label: 'Approval History', content: <ApprovalActionBar recordId={delegation.id} /> },
    { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="Delegation" recordId={delegation.id} /> },
    { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="Delegation" recordId={delegation.id} /> },
  ]

  return (
    <div>
      <PageHeader
        title={delegation.taskId}
        subtitle={delegation.title}
        breadcrumb={[{ label: 'Delegation', to: '/delegation' }, { label: delegation.taskId }]}
        actions={<>
          <StatusBadge status={delegation.status} />
          <Button variant="secondary" onClick={() => navigate('/delegation')}>Back to list</Button>
        </>}
      />
      {(delegation.escalated || overdue) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {delegation.escalated ? 'This task has been escalated.' : `This task is overdue (due ${fmtDate(delegation.dueDate)}).`}
        </div>
      )}
      <Tabs tabs={tabs} />
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
