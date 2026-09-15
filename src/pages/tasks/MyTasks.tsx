import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { canUserApprove } from '../../store/selectors'
import { PageHeader } from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/Card'
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { recordLink } from '../../lib/recordLinks'
import { fmtDate, isOverdue } from '../../lib/utils'
import type { Delegation, DelegationStatus } from '../../types'

const OPEN_STATUSES: DelegationStatus[] = ['CREATED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED']

export default function MyTasks() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const delegations = useStore(s => s.delegations)
  const checklistInstances = useStore(s => s.checklistInstances)
  const approvalTasks = useStore(s => s.approvalTasks)

  const myDelegations = useMemo(() => delegations.filter(d => d.assignedTo === user.id), [delegations, user.id])
  const overdueDelegations = myDelegations.filter(d => OPEN_STATUSES.includes(d.status) && isOverdue(d.dueDate))
  const activeDelegations = myDelegations.filter(d => !overdueDelegations.includes(d))

  const myChecklists = useMemo(() => checklistInstances.filter(c => c.assignedTo === user.id && c.status !== 'CLOSED'), [checklistInstances, user.id])

  const myApprovals = useMemo(
    () => approvalTasks.filter(t => t.currentApproverRole === user.role && t.status === 'PENDING'),
    [approvalTasks, user.role]
  )

  return (
    <div>
      <PageHeader title="My Tasks" subtitle="Everything assigned to you or waiting on your approval, in one place." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title={`Overdue Tasks (${overdueDelegations.length})`}>
          {overdueDelegations.length === 0 ? <EmptyState message="No overdue tasks. Nice work." icon={<AlertTriangle className="h-8 w-8" />} /> : (
            <ul className="space-y-2">
              {overdueDelegations.map(d => <DelegationRow key={d.id} d={d} onClick={() => navigate(`/delegation/${d.id}`)} danger />)}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={`My Delegations (${activeDelegations.length})`}>
          {activeDelegations.length === 0 ? <EmptyState message="No active delegated tasks." /> : (
            <ul className="space-y-2">
              {activeDelegations.map(d => <DelegationRow key={d.id} d={d} onClick={() => navigate(`/delegation/${d.id}`)} />)}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={`My Checklists (${myChecklists.length})`}>
          {myChecklists.length === 0 ? <EmptyState message="No open checklists assigned to you." /> : (
            <ul className="space-y-2">
              {myChecklists.map(c => (
                <li key={c.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 hover:bg-ink-50" onClick={() => navigate(`/checklist/${c.id}`)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink-800">{c.checklistNumber} - {c.templateName}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{c.items.filter(i => i.result === 'PASS').length}/{c.items.length} passed</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={`Pending Approvals - ${user.role} (${myApprovals.length})`}>
          {myApprovals.length === 0 ? <EmptyState message="No approvals waiting on your role." /> : (
            <ul className="space-y-2">
              {myApprovals.map(t => {
                const actionable = canUserApprove(t, user.id)
                const link = recordLink(t.recordType, t.recordId)
                return (
                  <li
                    key={t.id}
                    className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 hover:bg-ink-50"
                    onClick={() => link && navigate(link)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink-800">{t.title}</span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">Requested by {t.requesterName} on {fmtDate(t.createdAt)}{!actionable ? ' - raised by you' : ''}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

function DelegationRow({ d, onClick, danger }: { d: Delegation; onClick: () => void; danger?: boolean }) {
  return (
    <li className={`cursor-pointer rounded-md border px-3 py-2 hover:bg-ink-50 ${danger ? 'border-red-200 bg-red-50/40' : 'border-ink-200'}`} onClick={onClick}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink-800">{d.taskId} - {d.title}</span>
        <StatusBadge status={d.status} />
      </div>
      <p className="mt-0.5 text-xs text-ink-500">Due {fmtDate(d.dueDate)} - <PriorityBadge priority={d.priority} /></p>
    </li>
  )
}
