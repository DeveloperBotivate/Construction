import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, CornerUpLeft, Eye, Inbox } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { roleLabel } from '../../lib/permissions'
import { recordLink } from '../../lib/recordLinks'
import { fmtCurrency } from '../../lib/utils'
import type { ApprovalTask } from '../../types'

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export default function ApprovalCenter() {
  const user = useStore(s => s.currentUser!)
  const tasks = useStore(s => s.approvalTasks)
  const approveTask = useStore(s => s.approveTask)
  const rejectTask = useStore(s => s.rejectTask)
  const sendBackTask = useStore(s => s.sendBackTask)
  const navigate = useNavigate()

  const [reasonModal, setReasonModal] = useState<{ task: ApprovalTask; mode: 'REJECT' | 'SEND_BACK' } | null>(null)
  const [reason, setReason] = useState('')

  const myApprovals = useMemo(() => tasks.filter(t => t.status === 'PENDING' && t.currentApproverRole === user.role), [tasks, user.role])
  const allPending = useMemo(() => tasks.filter(t => t.status === 'PENDING').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [tasks])
  const history = useMemo(() => tasks.filter(t => t.status !== 'PENDING').sort((a, b) => new Date(b.resolvedAt ?? b.createdAt).getTime() - new Date(a.resolvedAt ?? a.createdAt).getTime()), [tasks])
  const rejected = useMemo(() => history.filter(t => t.status === 'REJECTED'), [history])
  const escalations = useMemo(() => allPending.filter(t => Date.now() - new Date(t.createdAt).getTime() > THREE_DAYS_MS), [allPending])

  function ageDays(createdAt: string): number {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
  }

  function buildColumns(showActions: boolean): Column<ApprovalTask>[] {
    const cols: Column<ApprovalTask>[] = [
      { key: 'module', header: 'Module', render: t => <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t.module}</span> },
      { key: 'docNumber', header: 'Doc #', render: t => <span className="font-medium text-ink-800">{t.docNumber}</span> },
      { key: 'title', header: 'Title', render: t => <span className="text-ink-700">{t.title}</span>, hideBelow: 'md' },
      { key: 'amount', header: 'Amount', render: t => t.amount ? fmtCurrency(t.amount) : <span className="text-ink-400">&mdash;</span>, hideBelow: 'md' },
      { key: 'requester', header: 'Requester', render: t => t.requesterName, hideBelow: 'lg' },
      { key: 'approver', header: 'Approver Role', render: t => roleLabel(t.currentApproverRole), hideBelow: 'lg' },
      { key: 'priority', header: 'Priority', render: t => <PriorityBadge priority={t.priority} /> },
      { key: 'age', header: 'Age', render: t => <span className={ageDays(t.createdAt) > 3 && t.status === 'PENDING' ? 'font-medium text-amber-600' : ''}>{ageDays(t.createdAt)}d</span>, sortValue: t => ageDays(t.createdAt) },
      { key: 'status', header: 'Status', render: t => <StatusBadge status={t.status} /> },
    ]
    cols.push({
      key: 'actions', header: 'Actions', render: t => {
        const link = recordLink(t.recordType, t.recordId)
        const pending = t.status === 'PENDING'
        const selfBlocked = pending && t.requesterId === user.id
        const mine = pending && !selfBlocked && t.currentApproverRole === user.role
        return (
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="secondary" icon={<Eye className="h-3.5 w-3.5" />} disabled={!link} title={link ? undefined : 'No detail view available for this record'} onClick={() => link && navigate(link)}>View</Button>
            {showActions && pending && (
              <>
                <Button
                  size="sm" variant="success" icon={<Check className="h-3.5 w-3.5" />} disabled={!mine}
                  title={selfBlocked ? 'You cannot approve your own submission' : !mine ? `Only ${roleLabel(t.currentApproverRole)} can act on this` : undefined}
                  onClick={() => approveTask(t.id)}
                >
                  Approve
                </Button>
                <Button
                  size="sm" variant="danger" icon={<X className="h-3.5 w-3.5" />} disabled={!mine}
                  title={selfBlocked ? 'You cannot reject your own submission' : !mine ? `Only ${roleLabel(t.currentApproverRole)} can act on this` : undefined}
                  onClick={() => setReasonModal({ task: t, mode: 'REJECT' })}
                >
                  Reject
                </Button>
                <Button
                  size="sm" variant="secondary" icon={<CornerUpLeft className="h-3.5 w-3.5" />} disabled={!mine}
                  title={selfBlocked ? 'You cannot send back your own submission' : !mine ? `Only ${roleLabel(t.currentApproverRole)} can act on this` : undefined}
                  onClick={() => setReasonModal({ task: t, mode: 'SEND_BACK' })}
                >
                  Send Back
                </Button>
              </>
            )}
          </div>
        )
      },
    })
    return cols
  }

  const actionCols = useMemo(() => buildColumns(true), [user, tasks])
  const readCols = useMemo(() => buildColumns(false), [user, tasks])

  const searchFields = (t: ApprovalTask) => `${t.module} ${t.docNumber} ${t.title} ${t.requesterName} ${t.currentApproverRole} ${t.status}`

  const tabs: TabItem[] = [
    { key: 'mine', label: 'My Approvals', badge: myApprovals.length, content: <DataTable columns={actionCols} data={myApprovals} keyField={t => t.id} searchable searchFields={searchFields} emptyIcon={<Inbox className="h-8 w-8" />} emptyMessage="No approvals are waiting on you." /> },
    { key: 'pending', label: 'Pending', badge: allPending.length, content: <DataTable columns={actionCols} data={allPending} keyField={t => t.id} searchable searchFields={searchFields} emptyMessage="No pending approvals system-wide." /> },
    { key: 'history', label: 'Approval History', content: <DataTable columns={readCols} data={history} keyField={t => t.id} searchable searchFields={searchFields} emptyMessage="No resolved approvals yet." /> },
    { key: 'rejected', label: 'Rejected', badge: rejected.length, content: <DataTable columns={readCols} data={rejected} keyField={t => t.id} searchable searchFields={searchFields} emptyMessage="No rejected approvals." /> },
    { key: 'escalations', label: 'Escalations', badge: escalations.length, content: <DataTable columns={actionCols} data={escalations} keyField={t => t.id} searchable searchFields={searchFields} emptyMessage="No approvals have escalated (pending more than 3 days)." /> },
  ]

  return (
    <div>
      <PageHeader title="Approval Center" subtitle="Universal hub for every workflow approval across the organization." />
      <Tabs tabs={tabs} />

      <Modal
        open={!!reasonModal}
        onClose={() => { setReasonModal(null); setReason('') }}
        title={reasonModal?.mode === 'REJECT' ? 'Reject with reason' : 'Send back for correction'}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setReasonModal(null); setReason('') }}>Cancel</Button>
            <Button
              variant="danger"
              disabled={!reason.trim()}
              onClick={() => {
                if (!reasonModal) return
                if (reasonModal.mode === 'REJECT') rejectTask(reasonModal.task.id, reason.trim())
                else sendBackTask(reasonModal.task.id, reason.trim())
                setReasonModal(null); setReason('')
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Reason (required)</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Explain why this is being rejected or sent back for correction..." />
      </Modal>
    </div>
  )
}
