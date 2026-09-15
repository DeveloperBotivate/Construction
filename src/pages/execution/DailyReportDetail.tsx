import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RefreshCw, Send } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Timeline, approvalStepTone, type TimelineStep } from '../../components/ui/Timeline'
import { ApprovalActionBar } from '../../components/ui/ApprovalActionBar'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { getBoqProgressPct } from '../../store/selectors'
import { fmtDate } from '../../lib/utils'

export default function DailyReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const dpr = useStore(s => s.dailyReports.find(d => d.id === id))
  const boqItem = useStore(s => s.boqItems.find(b => b.id === dpr?.boqItemId))
  const state = useStore(s => s)
  const submitDPR = useStore(s => s.submitDPR)
  const resubmitDPR = useStore(s => s.resubmitDPR)

  if (!dpr) return <EmptyState message="Daily Progress Report not found." />

  const isPreparer = dpr.preparedBy === user.id
  const boqProgressPct = boqItem ? getBoqProgressPct(state, boqItem.id) : 0

  const timelineSteps: TimelineStep[] = [
    { id: 'created', title: 'Created (Draft)', timestamp: dpr.date, tone: 'neutral' },
    ...dpr.approvalHistory.map(step => ({
      id: step.id,
      title: `${step.approverName ?? step.approverRole} - ${step.action.replace('_', ' ')}`,
      subtitle: step.comment,
      timestamp: step.timestamp,
      tone: approvalStepTone(step.action),
    })),
  ]

  const tabs: TabItem[] = [
    {
      key: 'overview', label: 'Overview', content: (
        <div className="space-y-5">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border border-ink-200 bg-white p-4 sm:grid-cols-2">
            <Def label="Date" value={fmtDate(dpr.date)} />
            <Def label="Shift" value={dpr.shift} />
            <Def label="Weather" value={dpr.weather || '-'} />
            <Def label="Work Area" value={dpr.workArea || '-'} />
            <Def label="BOQ Item" value={boqItem ? `${boqItem.boqNumber} - ${boqItem.description}` : dpr.boqItemId} />
            <Def label="Activity" value={dpr.activity} />
            <Def label="Planned / Today Qty" value={`${dpr.plannedQty} / ${dpr.todayQty} ${boqItem?.unit ?? ''}`} />
            <Def label="Cumulative Qty" value={`${dpr.cumulativeQty} ${boqItem?.unit ?? ''}`} />
            <Def label="Labour Count" value={String(dpr.labourCount)} />
            <Def label="Equipment Used" value={dpr.equipmentUsed.length ? dpr.equipmentUsed.join(', ') : '-'} />
            <Def label="Drawing Ref" value={dpr.drawingRef || '-'} />
            <Def label="Status" value={<StatusBadge status={dpr.status} />} />
            <Def label="Safety Issues" value={dpr.safetyIssues || '-'} full />
            <Def label="Site Issues" value={dpr.siteIssues || '-'} full />
            <Def label="Delay Reason" value={dpr.delayReason || '-'} full />
            <Def label="Remarks" value={dpr.remarks || '-'} full />
          </dl>

          <div className="rounded-lg border border-ink-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-ink-800">Cumulative Progress against BOQ Item</p>
            <ProgressBar pct={boqProgressPct} />
            <p className="mt-1.5 text-xs text-ink-500">{dpr.cumulativeQty} of {boqItem?.revisedQty ?? 0} {boqItem?.unit} consumed ({boqProgressPct}%)</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink-800">Materials Used</p>
            {dpr.materialsUsed.length === 0 ? (
              <EmptyState message="No materials recorded for this report." />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-ink-200">
                <table className="min-w-full divide-y divide-ink-200 text-sm">
                  <thead className="bg-ink-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Material</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Qty</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 bg-white">
                    {dpr.materialsUsed.map((m, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-ink-700">{m.materialName}</td>
                        <td className="px-3 py-2 text-ink-700">{m.qty}</td>
                        <td className="px-3 py-2 text-ink-500">{m.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink-800">Photos</p>
            {dpr.photos.length === 0 ? (
              <p className="text-sm text-ink-400 italic">No photos attached (prototype - filenames only).</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dpr.photos.map((p, i) => (
                  <span key={i} className="rounded-md bg-ink-100 px-2.5 py-1 text-xs text-ink-600">{p}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
    { key: 'workflow', label: 'Workflow Status', content: <Timeline steps={timelineSteps} /> },
    { key: 'approvals', label: 'Approval History', content: <ApprovalActionBar recordId={dpr.id} /> },
    { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="DailyReport" recordId={dpr.id} /> },
    { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="DailyReport" recordId={dpr.id} /> },
  ]

  return (
    <div>
      <PageHeader
        title={dpr.dprNumber}
        subtitle={dpr.activity}
        breadcrumb={[{ label: 'Daily Reports', to: '/dpr' }, { label: dpr.dprNumber }]}
        actions={<>
          <StatusBadge status={dpr.status} />
          {dpr.status === 'DRAFT' && (
            <Button variant="primary" icon={<Send className="h-4 w-4" />} disabled={!isPreparer} title={isPreparer ? undefined : 'Only the preparer can submit this DPR'} onClick={() => submitDPR(dpr.id)}>Submit</Button>
          )}
          {dpr.status === 'CORRECTION_REQUIRED' && (
            <Button variant="primary" icon={<RefreshCw className="h-4 w-4" />} disabled={!isPreparer} title={isPreparer ? undefined : 'Only the preparer can resubmit this DPR'} onClick={() => resubmitDPR(dpr.id)}>Resubmit</Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/dpr')}>Back to list</Button>
        </>}
      />
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
