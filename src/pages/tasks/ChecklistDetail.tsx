import { useState, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, MinusCircle, ShieldCheck, Stamp } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Timeline, type TimelineStep } from '../../components/ui/Timeline'
import { ApprovalActionBar } from '../../components/ui/ApprovalActionBar'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { cls, fmtDate } from '../../lib/utils'
import type { ChecklistItemExecution, ChecklistItemResult } from '../../types'

export default function ChecklistDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const checklist = useStore(s => s.checklistInstances.find(c => c.id === id))
  const users = useStore(s => s.users)
  const updateChecklistItem = useStore(s => s.updateChecklistItem)
  const addCorrectiveAction = useStore(s => s.addCorrectiveAction)
  const recheckChecklistItem = useStore(s => s.recheckChecklistItem)
  const supervisorVerifyChecklist = useStore(s => s.supervisorVerifyChecklist)
  const peApproveChecklist = useStore(s => s.peApproveChecklist)

  const [comments, setComments] = useState<Record<string, string>>({})
  const [correctiveDrafts, setCorrectiveDrafts] = useState<Record<string, string>>({})

  if (!checklist) return <EmptyState message="Checklist not found." />

  function userName(uid?: string) { return users.find(u => u.id === uid)?.name ?? uid ?? '-' }

  const passed = checklist.items.filter(i => i.result === 'PASS').length
  const canSupervisorVerify = checklist.status === 'COMPLETED' && checklist.assignedTo !== user.id
  const canPeApprove = checklist.status === 'SUPERVISOR_VERIFIED' && user.role === 'PE'

  function commentFor(item: ChecklistItemExecution) { return comments[item.itemId] ?? item.comment ?? '' }

  const timelineSteps: TimelineStep[] = [
    { id: 'assigned', title: `Assigned to ${userName(checklist.assignedTo)}`, timestamp: checklist.createdAt, tone: 'info' },
    ...(checklist.supervisorVerifiedBy ? [{ id: 'sv', title: `Supervisor Verified by ${userName(checklist.supervisorVerifiedBy)}`, tone: 'success' as const }] : []),
    ...(checklist.peApprovedBy ? [{ id: 'pe', title: `PE Approved & Closed by ${userName(checklist.peApprovedBy)}`, tone: 'success' as const }] : []),
  ]

  const tabs: TabItem[] = [
    {
      key: 'items', label: 'Checklist Items', content: (
        <div className="space-y-3">
          {checklist.items.map(item => {
            const isFail = item.result === 'FAIL'
            const needsCorrectiveAction = isFail && !item.correctiveAction
            const needsRecheck = isFail && !!item.correctiveAction && !item.rechecked
            return (
              <div key={item.itemId} className={cls('rounded-lg border p-4', isFail && !item.rechecked ? 'border-red-200 bg-red-50/40' : 'border-ink-200 bg-white')}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink-800">
                    {item.question}
                    {item.required && <span className="ml-1.5 text-xs text-red-500">*required</span>}
                  </p>
                  <ResultBadge result={item.result} rechecked={item.rechecked} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ResultButton active={item.result === 'PASS'} tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => updateChecklistItem(checklist.id, item.itemId, 'PASS', commentFor(item))}>Pass</ResultButton>
                  <ResultButton active={item.result === 'FAIL'} tone="danger" icon={<XCircle className="h-3.5 w-3.5" />} onClick={() => updateChecklistItem(checklist.id, item.itemId, 'FAIL', commentFor(item))}>Fail</ResultButton>
                  <ResultButton active={item.result === 'NA'} tone="neutral" icon={<MinusCircle className="h-3.5 w-3.5" />} onClick={() => updateChecklistItem(checklist.id, item.itemId, 'NA', commentFor(item))}>N/A</ResultButton>
                  <input
                    value={commentFor(item)}
                    onChange={e => setComments(c => ({ ...c, [item.itemId]: e.target.value }))}
                    onBlur={() => { if (item.result !== 'PENDING') updateChecklistItem(checklist.id, item.itemId, item.result, commentFor(item)) }}
                    placeholder="Comment (optional)"
                    className="min-w-[10rem] flex-1 rounded-md border border-ink-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {needsCorrectiveAction && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-red-100 pt-3">
                    <input
                      value={correctiveDrafts[item.itemId] ?? ''}
                      onChange={e => setCorrectiveDrafts(d => ({ ...d, [item.itemId]: e.target.value }))}
                      placeholder="Describe corrective action taken..."
                      className="min-w-[14rem] flex-1 rounded-md border border-ink-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <Button
                      size="sm" variant="primary"
                      disabled={!(correctiveDrafts[item.itemId] ?? '').trim()}
                      onClick={() => { addCorrectiveAction(checklist.id, item.itemId, (correctiveDrafts[item.itemId] ?? '').trim()) }}
                    >
                      Add corrective action
                    </Button>
                  </div>
                )}

                {item.correctiveAction && (
                  <p className="mt-3 rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-600"><span className="font-medium text-ink-700">Corrective action:</span> {item.correctiveAction}</p>
                )}

                {needsRecheck && (
                  <div className="mt-3 flex items-center gap-2 border-t border-red-100 pt-3">
                    <span className="text-xs font-medium text-ink-600">Recheck:</span>
                    <Button size="sm" variant="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => recheckChecklistItem(checklist.id, item.itemId, 'PASS')}>Pass</Button>
                    <Button size="sm" variant="danger" icon={<XCircle className="h-3.5 w-3.5" />} onClick={() => recheckChecklistItem(checklist.id, item.itemId, 'FAIL')}>Still Fails</Button>
                  </div>
                )}
                {item.rechecked && <p className="mt-2 text-xs italic text-ink-500">Rechecked &rarr; {item.result}</p>}
              </div>
            )
          })}
        </div>
      ),
    },
    { key: 'workflow', label: 'Workflow Status', content: <Timeline steps={timelineSteps} /> },
    { key: 'approvals', label: 'Approval History', content: <ApprovalActionBar recordId={checklist.id} /> },
    { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="ChecklistInstance" recordId={checklist.id} /> },
    { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="ChecklistInstance" recordId={checklist.id} /> },
  ]

  return (
    <div>
      <PageHeader
        title={checklist.checklistNumber}
        subtitle={`${checklist.templateName} - assigned to ${userName(checklist.assignedTo)} - ${passed}/${checklist.items.length} passed`}
        breadcrumb={[{ label: 'Checklists', to: '/checklist' }, { label: checklist.checklistNumber }]}
        actions={<>
          <StatusBadge status={checklist.status} />
          {checklist.status === 'COMPLETED' && (
            <Button
              variant="primary" icon={<ShieldCheck className="h-4 w-4" />}
              disabled={!canSupervisorVerify}
              title={checklist.assignedTo === user.id ? 'You cannot verify a checklist you executed yourself' : undefined}
              onClick={() => supervisorVerifyChecklist(checklist.id)}
            >
              Supervisor Verify
            </Button>
          )}
          {checklist.status === 'SUPERVISOR_VERIFIED' && (
            <Button
              variant="primary" icon={<Stamp className="h-4 w-4" />}
              disabled={!canPeApprove}
              title={user.role !== 'PE' ? 'Only PE can approve and close this checklist' : undefined}
              onClick={() => peApproveChecklist(checklist.id)}
            >
              PE Approve &amp; Close
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/checklist')}>Back to list</Button>
        </>}
      />
      <p className="mb-4 text-xs text-ink-500">Created {fmtDate(checklist.createdAt)}</p>
      <Tabs tabs={tabs} />
    </div>
  )
}

function ResultBadge({ result, rechecked }: { result: ChecklistItemResult; rechecked?: boolean }) {
  if (result === 'PENDING') return <StatusBadge status="PENDING" />
  return <StatusBadge status={result} label={rechecked ? `${result} (rechecked)` : result} />
}

function ResultButton({ active, tone, icon, children, onClick }: { active: boolean; tone: 'success' | 'danger' | 'neutral'; icon: ReactNode; children: ReactNode; onClick: () => void }) {
  const activeCls = { success: 'bg-emerald-600 text-white', danger: 'bg-red-600 text-white', neutral: 'bg-ink-600 text-white' }[tone]
  return (
    <button
      onClick={onClick}
      className={cls('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors', active ? activeCls : 'bg-white text-ink-600 ring-1 ring-inset ring-ink-300 hover:bg-ink-50')}
    >
      {icon}{children}
    </button>
  )
}
