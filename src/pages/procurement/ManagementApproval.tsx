import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ApprovalActionBar } from '../../components/ui/ApprovalActionBar'
import { fmtCurrency, fmtDateTime, daysBetween, nowIso } from '../../lib/utils'
import { roleLabel } from '../../lib/permissions'

export default function ManagementApproval() {
  const navigate = useNavigate()
  const allTasks = useStore(s => s.approvalTasks)
  const tasks = allTasks.filter(t => t.module === 'po' && t.status === 'PENDING')
  const purchaseOrders = useStore(s => s.purchaseOrders)

  const recordIds = Array.from(new Set(tasks.map(t => t.recordId)))

  return (
    <div>
      <PageHeader title="Management Approval" subtitle="Purchase Orders awaiting PM / Accounts / MD approval based on value threshold." />

      {recordIds.length === 0 ? (
        <EmptyState message="No Purchase Orders are pending management approval." icon={<ShieldCheck className="h-8 w-8" />} />
      ) : (
        <div className="space-y-4">
          {recordIds.map(recordId => {
            const po = purchaseOrders.find(p => p.id === recordId)
            const relatedTasks = tasks.filter(t => t.recordId === recordId)
            const first = relatedTasks[0]
            const age = daysBetween(first.createdAt, nowIso())
            const approverRoles = Array.from(new Set(relatedTasks.map(t => roleLabel(t.currentApproverRole))))
            return (
              <Card key={recordId}>
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <button className="text-sm font-semibold text-ink-900 hover:underline" onClick={() => navigate(`/po/${recordId}`)}>
                      {po?.poNumber ?? first.docNumber}
                    </button>
                    <p className="text-xs text-ink-500">Requested by {first.requesterName} &middot; {fmtDateTime(first.createdAt)} &middot; {age} day(s) ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink-800">{fmtCurrency(first.amount ?? po?.total ?? 0)}</p>
                    <p className="text-xs text-ink-500">Awaiting: {approverRoles.join(', ')}</p>
                  </div>
                </div>
                <ApprovalActionBar recordId={recordId} />
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
