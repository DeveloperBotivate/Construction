import { useState } from 'react'
import { Check, X, CornerUpLeft, Clock } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { canUserApprove } from '../../store/selectors'
import { roleLabel } from '../../lib/permissions'
import { fmtDateTime } from '../../lib/utils'
import { Button } from './Button'
import { Modal } from './Modal'
import { EmptyState } from './EmptyState'
import type { ApprovalTask } from '../../types'

export function ApprovalActionBar({ recordId }: { recordId: string }) {
  const currentUser = useStore(s => s.currentUser!)
  const allTasks = useStore(s => s.approvalTasks)
  const tasks = allTasks.filter(t => t.recordId === recordId)
  const approveTask = useStore(s => s.approveTask)
  const rejectTask = useStore(s => s.rejectTask)
  const sendBackTask = useStore(s => s.sendBackTask)
  const [reasonModal, setReasonModal] = useState<{ task: ApprovalTask; mode: 'REJECT' | 'SEND_BACK' } | null>(null)
  const [reason, setReason] = useState('')

  if (tasks.length === 0) return <EmptyState message="No approval action has been raised for this record yet." icon={<Clock className="h-8 w-8" />} />

  return (
    <div className="space-y-3">
      {tasks.slice().reverse().map(task => {
        const pending = task.status === 'PENDING'
        const mine = pending && canUserApprove(task, currentUser.id) && task.currentApproverRole === currentUser.role
        const selfBlocked = pending && task.requesterId === currentUser.id
        return (
          <div key={task.id} className="rounded-lg border border-ink-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-ink-800">{task.title}</p>
                <p className="text-xs text-ink-500">Requested by {task.requesterName} on {fmtDateTime(task.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {pending ? (
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">Awaiting {roleLabel(task.currentApproverRole)}</span>
                ) : (
                  <span className="rounded-md bg-ink-100 px-2 py-1 text-xs font-medium text-ink-600">{task.status.replace('_', ' ')}</span>
                )}
              </div>
            </div>

            {pending && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button variant="success" size="sm" icon={<Check className="h-3.5 w-3.5" />} disabled={!mine} title={selfBlocked ? 'You cannot approve your own submission' : !mine ? `Only ${roleLabel(task.currentApproverRole)} can act on this` : undefined} onClick={() => approveTask(task.id)}>
                  Approve
                </Button>
                <Button variant="danger" size="sm" icon={<X className="h-3.5 w-3.5" />} disabled={!mine} title={selfBlocked ? 'You cannot reject your own submission' : undefined} onClick={() => setReasonModal({ task, mode: 'REJECT' })}>
                  Reject
                </Button>
                <Button variant="secondary" size="sm" icon={<CornerUpLeft className="h-3.5 w-3.5" />} disabled={!mine} onClick={() => setReasonModal({ task, mode: 'SEND_BACK' })}>
                  Send Back
                </Button>
                {selfBlocked && <span className="text-xs italic text-ink-400">You raised this request &mdash; another authorized approver must act.</span>}
              </div>
            )}

            {task.history.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-ink-100 pt-2">
                {task.history.map(h => (
                  <li key={h.id} className="text-xs text-ink-500">
                    <span className="font-medium text-ink-700">{h.approverName}</span> {h.action.toLowerCase().replace('_', ' ')} &middot; {fmtDateTime(h.timestamp)}
                    {h.comment && <span className="italic"> &mdash; "{h.comment}"</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}

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
